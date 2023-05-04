// src/index.ts
import { isRegExp } from "util/types";
import { glob } from "glob";
import path from "path";
var client;
var commands = /* @__PURE__ */ new Map();
var buttons = [];
var selectMenus = [];
var modals = [];
function command(options, run) {
  commands.set(options.name, { commandOptions: options, commandFunc: run });
}
function on(eventName, run) {
  if (client) {
    client.on(eventName, run);
  } else {
    console.warn(
      `Unable to register client event ${eventName}, please call initInteractionHandler before calling this function`
    );
  }
}
function once(eventName, run) {
  if (client) {
    client.once(eventName, run);
  } else {
    console.warn(
      `Unable to register client event ${eventName}, please call initInteractionHandler before calling this function`
    );
  }
}
function button(options, run) {
  buttons.push({ id: options.id, run });
}
function selectMenu(options, run) {
  selectMenus.push({ id: options.id, run });
}
function modal(options, run) {
  modals.push({ id: options.id, run });
}
function middleware(run) {
  return run;
}
async function include(paths) {
  const imports = [];
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
function getComponentsArray(interaction) {
  if (interaction.isButton()) {
    return buttons;
  } else if (interaction.isAnySelectMenu()) {
    return selectMenus;
  } else {
    return modals;
  }
}
function getMatchingComponent(customId, components) {
  const matchingComponent = components.find((c) => {
    if (typeof c.id === "string") {
      return c.id === customId;
    } else if (isRegExp(c.id)) {
      const match = customId.match(c.id);
      return match?.length ?? 0 > 0;
    }
  });
  if (!matchingComponent) {
    throw new Error(
      `Unable to find a matching component function for component with id: ${customId}`
    );
  }
  return matchingComponent;
}
async function handleInteraction(interaction) {
  if (interaction.isMessageComponent()) {
    const customId = interaction.customId;
    const componentsArray = getComponentsArray(interaction);
    const matchingComponent = getMatchingComponent(customId, componentsArray);
    matchingComponent.run(interaction, client);
  } else if (interaction.isCommand()) {
    const commandName = interaction.commandName;
    const foundCommand = commands.get(commandName);
    if (!foundCommand) {
      throw new Error(
        `Command object not found for interaction of name ${commandName}`
      );
    }
    const inputtedValues = interaction.options.data;
    const convertedArgs = {};
    inputtedValues.forEach((val) => {
      const [valName, , valValue] = Object.values(val);
      convertedArgs[valName] = valValue;
    });
    foundCommand.commandFunc(interaction, convertedArgs, client);
  } else if (interaction.isAutocomplete()) {
    const commandName = interaction.commandName;
    const focusedArg = interaction.options.getFocused(true).name;
    const foundCommand = commands.get(commandName);
    if (!foundCommand) {
      throw new Error(
        `Command object not found for interaction of name ${commandName}`
      );
    }
    const commandArgs = foundCommand.commandOptions.args;
    if (!commandArgs) {
      throw new Error(
        `Unable to find command with valid args for ${commandName}`
      );
    }
    const arg = commandArgs[focusedArg];
    if (!arg) {
      throw new Error(
        `Unable to find arg ${focusedArg} within the command object for ${commandName}`
      );
    }
    if (arg.type === "string" || arg.type === "number" || arg.type === "integer") {
      const autocomplete = arg?.autocomplete;
      if (!autocomplete) {
        throw new Error(
          `No autocomplete function exists for command object with name ${commandName} and arg ${focusedArg}`
        );
      } else if (typeof autocomplete === "boolean") {
        interaction.respond([]);
      } else {
        autocomplete(interaction, client);
      }
    }
  }
}
async function initInteractionHandler(discordClient, options) {
  client = discordClient;
  const importPaths = options?.importPaths ?? "*";
  await include(Array.isArray(importPaths) ? importPaths : [importPaths]);
}
export {
  button,
  command,
  handleInteraction,
  initInteractionHandler,
  middleware,
  modal,
  on,
  once,
  selectMenu
};
