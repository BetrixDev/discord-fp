import { CommandInteraction, Client, ButtonInteraction, AnySelectMenuInteraction, StringSelectMenuInteraction, ChannelSelectMenuInteraction, MentionableSelectMenuInteraction, RoleSelectMenuInteraction, UserSelectMenuInteraction, ModalSubmitInteraction, Interaction, CommandInteractionOption, LocalizationMap, ChannelType, AutocompleteInteraction } from 'discord.js';
import { Promisable } from 'type-fest';

type ApplicationCommandOptionTypeString = "attachment" | "boolean" | "channel" | "integer" | "mentionable" | "number" | "user" | "string" | "subcommand" | "subcommandGroup";
type SelectMenuTypeString = "string" | "user" | "channel" | "role" | "mentionable";
type SlashAutoCompleteOption = undefined | boolean | ((interaction: AutocompleteInteraction, client: Client) => void | Promise<void>);
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
type SlashOptionOptions = SlashOptionBaseOptions | SlashOptionStringOptions | SlashOptionChannelOptions | SlashOptionNumberOptions;
type CommandArguments = Record<string, SlashOptionOptions>;
type CommandOptions<T> = {
    name: string;
    args?: T;
};
type ReturnTypeOfInteractionOption<T extends keyof CommandInteractionOption> = NonNullable<CommandInteractionOption[T]>;
type ReturnTypeOfType<T> = T extends "string" ? string : T extends "integer" | "number" ? number : T extends "attachment" ? ReturnTypeOfInteractionOption<"attachment"> : T extends "boolean" ? boolean : T extends "user" ? ReturnTypeOfInteractionOption<"user"> : T extends "channel" ? ReturnTypeOfInteractionOption<"channel"> : unknown;
type ComponentRunFunction<T extends Interaction = never> = (interaction: T, client: Client) => Promisable<void>;
interface DiscordFPHandlerOptions {
    importPaths?: string[] | string;
}
declare function command<T extends CommandArguments>(options: CommandOptions<T>, run: (interaction: CommandInteraction, args: {
    [K in keyof T]: T[K]["required"] extends true ? ReturnTypeOfType<T[K]["type"]> : ReturnTypeOfType<T[K]["type"]> | undefined;
}, client: Client) => Promisable<void>): void;
declare function button(options: {
    id: RegExp | string;
}, run: ComponentRunFunction<ButtonInteraction>): void;
declare function selectMenu<T extends SelectMenuTypeString>(options: {
    id: RegExp | string;
    type?: T;
}, run: ComponentRunFunction<T extends undefined ? AnySelectMenuInteraction : T extends "string" ? StringSelectMenuInteraction : T extends "channel" ? ChannelSelectMenuInteraction : T extends "mentionable" ? MentionableSelectMenuInteraction : T extends "role" ? RoleSelectMenuInteraction : T extends "user" ? UserSelectMenuInteraction : unknown>): void;
declare function modal(options: {
    id: RegExp | string;
}, run: (interaction: ModalSubmitInteraction, client: Client) => void | Promise<void>): void;
declare function handleInteraction(interaction: Interaction): Promise<void>;
declare function initInteractionHandler(discordClient: Client, options?: DiscordFPHandlerOptions): Promise<void>;

export { DiscordFPHandlerOptions, button, command, handleInteraction, initInteractionHandler, modal, selectMenu };
