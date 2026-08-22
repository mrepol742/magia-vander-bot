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
  databaseUrl: required("DATABASE_URL"),

  discordToken: required("DISCORD_TOKEN"),
  clientId: required("DISCORD_CLIENT_ID"),
  guildId: process.env.DISCORD_GUILD_ID || "",

  botName: process.env.BOT_NAME || "Magia Vander Bot",
  syncDiscordUsername:
    (process.env.SYNC_DISCORD_USERNAME || "false").toLowerCase() === "true",

  textPrefix: process.env.TEXT_PREFIX || "!",
  enableTextPrefix:
    (process.env.ENABLE_TEXT_PREFIX || "true").toLowerCase() === "true",
  respondToQuestionMarks:
    (process.env.RESPOND_TO_QUESTION_MARKS || "false").toLowerCase() === "true",

  allowedChannelIds: (process.env.ALLOWED_CHANNEL_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),

  openrouterApiKey: required("OPENROUTER_API_KEY"),
  openrouterModel: process.env.OPENROUTER_MODEL || "openrouter/auto",
  openrouterEmbeddingModel:
    process.env.OPENROUTER_EMBEDDING_MODEL || "openai/text-embedding-3-small",
  ragTopK: parseInt(process.env.OPENROUTER_RAG_TOP_K || "4", 10),
  ragMinSimilarity: parseFloat(
    process.env.OPENROUTER_RAG_MIN_SIMILARITY || "0.72",
  ),

  openrouterSiteUrl: process.env.OPENROUTER_SITE_URL || "",
  openrouterSiteName: process.env.OPENROUTER_SITE_NAME || "Magia Vander Bot",

  adminUserIds: (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
};
