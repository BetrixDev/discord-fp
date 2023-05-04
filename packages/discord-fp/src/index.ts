import {
  Client,
  CommandInteraction,
  LocalizationMap,
  ChannelType,
  AutocompleteInteraction,
  CommandInteractionOption,
  Interaction,
  ButtonInteraction,
  AnySelectMenuInteraction,
  StringSelectMenuInteraction,
  ChannelSelectMenuInteraction,
  MentionableSelectMenuInteraction,
  RoleSelectMenuInteraction,
  UserSelectMenuInteraction,
  ModalSubmitInteraction,
} from "discord.js";

import { glob } from "glob";
import path from "path";

import { Promisable } from "type-fest";

type ApplicationCommandOptionTypeString =
  | "attachment"
  | "boolean"
  | "channel"
  | "integer"
  | "mentionable"
  | "number"
  | "user"
  | "string"
  | "subcommand"
  | "subcommandGroup";

type SelectMenuTypeString =
  | "string"
  | "user"
  | "channel"
  | "role"
  | "mentionable";

type SlashAutoCompleteOption =
  | undefined
  | boolean
  | ((
      interaction: AutocompleteInteraction,
      client: Client
    ) => void | Promise<void>);

type SlashOptionBaseOptions = {
  description: string;
  descriptionLocalizations?: LocalizationMap;
  nameLocalizations?: LocalizationMap;
  required?: boolean;
  type: ApplicationCommandOptionTypeString;
};

type SlashOptionStringOptions = {
  type: "string";
  autocomplete?: SlashAutoCompleteOption;
  maxLength?: number;
  minLength?: number;
} & SlashOptionBaseOptions;

type SlashOptionChannelOptions = {
  type: "channel";
  channelTypes?: ChannelType[];
} & SlashOptionBaseOptions;

type SlashOptionNumberOptions = {
  type: "number" | "integer";
  autocomplete?: SlashAutoCompleteOption;
  maxValue?: number;
  minValue?: number;
} & SlashOptionBaseOptions;

type SlashOptionOptions =
  | SlashOptionBaseOptions
  | SlashOptionStringOptions
  | SlashOptionChannelOptions
  | SlashOptionNumberOptions;

type CommandArguments = Record<string, SlashOptionOptions>;

type CommandOptions<T> = {
  name: string;
  args?: T;
};

type ReturnTypeOfInteractionOption<T extends keyof CommandInteractionOption> =
  NonNullable<CommandInteractionOption[T]>;

type ReturnTypeOfType<T> = T extends "string"
  ? string
  : T extends "integer" | "number"
  ? number
  : T extends "attachment"
  ? ReturnTypeOfInteractionOption<"attachment">
  : T extends "boolean"
  ? boolean
  : T extends "user"
  ? ReturnTypeOfInteractionOption<"user">
  : T extends "channel"
  ? ReturnTypeOfInteractionOption<"channel">
  : unknown;

type CommandRunFunction = (
  interaction: CommandInteraction,
  args: any,
  client: Client
) => Promisable<void>;

type ComponentRunFunction<T extends Interaction = never> = (
  interaction: T,
  client: Client
) => Promisable<void>;

type StoredComponent = {
  id: RegExp | String;
  run: ComponentRunFunction;
};

type StoredCommand = {
  commandOptions: CommandOptions<CommandArguments>;
  commandFunc: CommandRunFunction;
};

export interface DiscordFPHandlerOptions {
  importPaths?: string[] | string;
}

let client: Client;
const commands = new Map<string, StoredCommand>();
const buttons: StoredComponent[] = [];
const selectMenus: StoredComponent[] = [];
const modals: StoredComponent[] = [];

export function command<T extends CommandArguments>(
  options: CommandOptions<T>,
  run: (
    interaction: CommandInteraction,
    args: {
      // TODO: Fix `CamelCase<K>` hiding type inference
      [K in keyof T]: T[K]["required"] extends true
        ? ReturnTypeOfType<T[K]["type"]>
        : ReturnTypeOfType<T[K]["type"]> | undefined;
    },
    client: Client
  ) => Promisable<void>
) {
  commands.set(options.name, { commandOptions: options, commandFunc: run });
}

export function button(
  options: { id: RegExp | string },
  run: ComponentRunFunction<ButtonInteraction>
) {
  buttons.push({ id: options.id, run });
}

export function selectMenu<T extends SelectMenuTypeString>(
  options: {
    id: RegExp | string;
    type?: T;
  },
  run: ComponentRunFunction<
    T extends undefined
      ? AnySelectMenuInteraction
      : T extends "string"
      ? StringSelectMenuInteraction
      : T extends "channel"
      ? ChannelSelectMenuInteraction
      : T extends "mentionable"
      ? MentionableSelectMenuInteraction
      : T extends "role"
      ? RoleSelectMenuInteraction
      : T extends "user"
      ? UserSelectMenuInteraction
      : unknown
  >
) {
  selectMenus.push({ id: options.id, run });
}

export function modal(
  options: { id: RegExp | string },
  run: (
    interaction: ModalSubmitInteraction,
    client: Client
  ) => void | Promise<void>
) {
  modals.push({ id: options.id, run });
}

async function include(paths: string[]) {
  const imports: string[] = [];

  await Promise.all(
    paths.map(async (ps) => {
      const files = await glob(ps.split(path.sep).join("/"));
      files.forEach((file) => {
        if (!imports.includes(file)) {
          imports.push(`file://${file}`);
        }
      });
    })
  );

  await Promise.all(imports.map((file) => import(file)));
}

export async function handleInteraction(interaction: Interaction) {
  // if (interaction.isCommand()) {
  //   const commandName = interaction.commandName;
  //   const foundCommand = this._commands.get(commandName);
  //   if (!foundCommand) {
  //     throw new Error(
  //       `Command not found for interaction of name ${commandName}`
  //     );
  //   }
  //   const inputtedValues = interaction.options.data;
  //   const convertedArgs: Record<string, any> = {};
  //   inputtedValues.forEach((val) => {
  //     const [valName, , valValue] = Object.values(val);
  //     // convertedArgs[toCamelCase(valName)] = valValue;
  //     convertedArgs[valName] = valValue;
  //   });
  //   foundCommand.commandFunc(interaction, convertedArgs, this._client);
  // }
}

export async function initInteractionHandler(
  discordClient: Client,
  options?: DiscordFPHandlerOptions
) {
  const app = discordClient.application;

  if (!app) {
    throw new Error(
      "Unable to load! Please wait for the client to be ready before calling initInteractionHandler"
    );
  }

  client = discordClient;

  const importPaths = options?.importPaths ?? "*";
  await include(Array.isArray(importPaths) ? importPaths : [importPaths]);
}
