import { initInteractionHandler, command } from "discord-fp";
import { Client } from "discord.js";

// Create your discord.js client however you like
const client = new Client({ intents: [] });

client.once("ready", async () => {
  // Invoke `initInteractionHandler` only after your client has started to avoid race conditions
  await initInteractionHandler(client);
});

command(
  {
    name: "example-command",
    args: {
      "test-option": {
        description: "this is a type safe argument to the command!",
        type: "string",
        required: true,
      },
      "non-required-option": {
        description: "this is an argument that can also be undefined!",
        type: "string",
      },
    },
  },
  (interaction, args) => {}
);
