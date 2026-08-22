import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from "./config";

/*
 * Registers the slash command with Discord.
 */
async function main() {
  const askCommand = new SlashCommandBuilder()
    .setName("magia")
    .setDescription(`Ask ${config.botName} anything about the game.`)
    .addStringOption((opt) =>
      opt
        .setName("question")
        .setDescription("Your question (English or Tagalog)")
        .setRequired(true),
    );

  const kbAdd = new SlashCommandBuilder()
    .setName("kb-add")
    .setDescription("Admin: add a Q/A entry to the knowledge base")
    .addStringOption((o) =>
      o.setName("question").setDescription("Question").setRequired(true),
    )
    .addStringOption((o) =>
      o.setName("answer").setDescription("Answer").setRequired(true),
    )
    .addStringOption((o) =>
      o
        .setName("category")
        .setDescription("Optional category")
        .setRequired(false),
    );

  const kbEdit = new SlashCommandBuilder()
    .setName("kb-edit")
    .setDescription("Admin: edit an existing knowledge base entry")
    .addIntegerOption((o) =>
      o.setName("id").setDescription("Entry ID").setRequired(true),
    )
    .addStringOption((o) =>
      o.setName("question").setDescription("New question").setRequired(false),
    )
    .addStringOption((o) =>
      o.setName("answer").setDescription("New answer").setRequired(false),
    )
    .addStringOption((o) =>
      o.setName("category").setDescription("New category").setRequired(false),
    );

  const kbDelete = new SlashCommandBuilder()
    .setName("kb-delete")
    .setDescription("Admin: delete a knowledge base entry")
    .addIntegerOption((o) =>
      o.setName("id").setDescription("Entry ID").setRequired(true),
    );

  const kbList = new SlashCommandBuilder()
    .setName("kb-list")
    .setDescription("Admin: list knowledge base entries");

  const body = [askCommand, kbAdd, kbEdit, kbDelete, kbList].map((c) =>
    c.toJSON(),
  );
  const rest = new REST({ version: "10" }).setToken(config.discordToken);

  const guildIds = config.guildId
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (guildIds.length > 0) {
    for (const guildId of guildIds) {
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, guildId),
        { body },
      );
      console.log(`Registered commands to guild ${guildId}.`);
    }
  } else {
    await rest.put(Routes.applicationCommands(config.clientId), { body });
    console.log("Registered commands globally (~1hr propagation).");
  }
}

main().catch((err) => {
  console.error("Failed to deploy commands:", err);
  process.exit(1);
});
