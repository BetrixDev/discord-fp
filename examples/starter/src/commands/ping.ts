import { command } from "discord-fp";

console.log("hello");

// Create a new command
command(
  // Command data goes here
  {
    name: "ping",
    description: "The hello world of discord commands",
  },
  // The function to run when the command is issued
  (interaction) => {
    interaction.reply("pong!");
  }
);
