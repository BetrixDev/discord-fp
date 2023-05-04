"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  button: () => button,
  command: () => command,
  handleInteraction: () => handleInteraction,
  initInteractionHandler: () => initInteractionHandler,
  middleware: () => middleware,
  modal: () => modal,
  on: () => on,
  once: () => once,
  selectMenu: () => selectMenu
});
module.exports = __toCommonJS(src_exports);
var import_types = require("util/types");
var import_glob = require("glob");
var import_path = __toESM(require("path"), 1);
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
      const files = await (0, import_glob.glob)(ps.split(import_path.default.sep).join("/"));
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
    } else if ((0, import_types.isRegExp)(c.id)) {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  button,
  command,
  handleInteraction,
  initInteractionHandler,
  middleware,
  modal,
  on,
  once,
  selectMenu
});
