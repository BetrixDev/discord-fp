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
  modal: () => modal,
  selectMenu: () => selectMenu
});
module.exports = __toCommonJS(src_exports);
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
function button(options, run) {
  buttons.push({ id: options.id, run });
}
function selectMenu(options, run) {
  selectMenus.push({ id: options.id, run });
}
function modal(options, run) {
  modals.push({ id: options.id, run });
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
async function handleInteraction(interaction) {
}
async function initInteractionHandler(discordClient, options) {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  button,
  command,
  handleInteraction,
  initInteractionHandler,
  modal,
  selectMenu
});
