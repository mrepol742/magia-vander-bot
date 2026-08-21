import "dotenv/config";

/*
 * Check required environment variables
 *
 * @param name The name of the environment variable to check
 */
function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export const config = {
  discordToken: required("DISCORD_TOKEN"),
  clientId: required("DISCORD_CLIENT_ID"),
  guildId: process.env.DISCORD_GUILD_ID || "",

  botName: process.env.BOT_NAME || "Agent",
  syncDiscordUsername:
    (process.env.SYNC_DISCORD_USERNAME || "false").toLowerCase() === "true",

  commandName: (process.env.COMMAND_NAME || "ask")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, ""),
  textPrefix: process.env.TEXT_PREFIX || "!",
  enableTextPrefix:
    (process.env.ENABLE_TEXT_PREFIX || "true").toLowerCase() === "true",

  allowedChannelIds: (process.env.ALLOWED_CHANNEL_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),

  openrouterApiKey: required("OPENROUTER_API_KEY"),
  openrouterModel: process.env.OPENROUTER_MODEL || "openrouter/auto",
  openrouterSiteUrl: process.env.OPENROUTER_SITE_URL || "",
  openrouterSiteName: process.env.OPENROUTER_SITE_NAME || "GameGuideBot",
};
