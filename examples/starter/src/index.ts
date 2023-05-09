import { Client } from "discord.js";
import {
  handleInteraction,
  initInteractionHandler,
  on,
  once,
  registerCommands,
} from "discord-fp";
import { normalize } from "path";
import { Glob } from "glob";

import dotenv from "dotenv";
dotenv.config();

const files = await new Glob("./commands/**/*.{ts,js}", {
  absolute: true,
  ignore: "node_modules/**",
}).walk();

console.log(files);

for (const file of files) {
  console.log(normalize(file));
  await import(`file://${normalize(file)}`);
}

// Create your discord.js client like normal
const client = new Client({ intents: [] });

// Link your discord.js client to discord-fp
await initInteractionHandler(client);

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN not specified in enviroment variables");
}

await client.login(process.env.BOT_TOKEN);

client.once("ready", () => {
  console.log("ready");
});

// Listen for when the bot is logged in
once("ready", async () => {
  // Register updated commands for your bot
  await registerCommands();

  console.log("Client ready!");
});

// Listen for any new interactions
on("interactionCreate", (interaction) => {
  // Handle interactions by calling handleInteraction() in the interactionCreate event listener
  try {
    handleInteraction(interaction);
  } catch (e) {
    // Handle any errors presented
    console.error(e);
  }
});
