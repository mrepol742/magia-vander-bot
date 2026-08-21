import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from "./config";

/*
 * Registers the slash command with Discord.
 */
async function main() {
  const command = new SlashCommandBuilder()
    .setName(config.commandName)
    .setDescription(`Ask ${config.botName} anything about the game.`)
    .addStringOption((opt) =>
      opt
        .setName("question")
        .setDescription("Your question (English or Tagalog)")
        .setRequired(true),
    );

  const rest = new REST({ version: "10" }).setToken(config.discordToken);
  const body = [command.toJSON()];

  if (config.guildId) {
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      {
        body,
      },
    );
    console.log(
      `Registered /${config.commandName} to guild ${config.guildId} (instant).`,
    );
  } else {
    await rest.put(Routes.applicationCommands(config.clientId), { body });
    console.log(
      `Registered /${config.commandName} globally (can take up to ~1hr to propagate).`,
    );
  }
}

main().catch((err) => {
  console.error("Failed to deploy commands:", err);
  process.exit(1);
});
