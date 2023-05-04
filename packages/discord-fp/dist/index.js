// src/index.ts
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
export {
  button,
  command,
  handleInteraction,
  initInteractionHandler,
  modal,
  selectMenu
};
