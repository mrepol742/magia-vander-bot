import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";
import { config } from "./config";
import { askAgent, ChatMessage } from "./openrouter";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// Lightweight per-channel rolling memory so the agent stays "in context"
// without needing a database. Capped so it stays cheap.
const HISTORY_LIMIT = 6;
const historyByChannel = new Map<string, ChatMessage[]>();

/*
 * Pushes a user message and bot reply to the channel's history.
 *
 * @param channelId The ID of the channel.
 * @param userMsg The user's message.
 * @param botMsg The bot's reply.
 */
function pushHistory(channelId: string, userMsg: string, botMsg: string) {
  const h = historyByChannel.get(channelId) || [];
  h.push(
    { role: "user", content: userMsg },
    { role: "assistant", content: botMsg },
  );
  while (h.length > HISTORY_LIMIT) h.shift();
  historyByChannel.set(channelId, h);
}

/**
 * Checks if a channel is allowed to be used with the bot.
 *
 * @param channelId The ID of the channel.
 * @returns True if the channel is allowed, false otherwise.
 */
function isChannelAllowed(channelId: string): boolean {
  if (config.allowedChannelIds.length === 0) return true;
  return config.allowedChannelIds.includes(channelId);
}

/*
 * Splits a text into chunks of a specified size.
 *
 * @param text The text to split.
 * @param size The size of each chunk.
 * @returns An array of text chunks.
 */
function chunk(text: string, size = 1900): string[] {
  const parts: string[] = [];
  for (let i = 0; i < text.length; i += size)
    parts.push(text.slice(i, i + size));
  return parts;
}

/*
 * Handles a user question by asking the agent and pushing the history.
 *
 * @param channelId The ID of the channel.
 * @param question The user's question.
 * @returns The agent's reply.
 */
async function handleQuestion(
  channelId: string,
  question: string,
): Promise<string> {
  const history = historyByChannel.get(channelId) || [];
  const reply = await askAgent(question, history);
  pushHistory(channelId, question, reply);
  return reply;
}

client.once(Events.ClientReady, async (c) => {
  console.log(`${config.botName} is online as ${c.user.tag}.`);
  console.log(`Slash command: /${config.commandName}`);
  if (config.enableTextPrefix) {
    console.log(`Text prefix enabled: "${config.textPrefix}"`);
  }

  if (config.syncDiscordUsername) {
    try {
      if (c.user.username !== config.botName) {
        await c.user.setUsername(config.botName);
        console.log(`Renamed Discord account to "${config.botName}".`);
      }
    } catch (err) {
      console.warn(
        "Could not sync Discord username (likely rate-limited to ~2 changes/hour):",
        err,
      );
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const ci = interaction as ChatInputCommandInteraction;
  if (ci.commandName !== config.commandName) return;

  if (!isChannelAllowed(ci.channelId)) {
    console.log(`Channel ${ci.channelId} is not allowed.`);
    return;
  }

  const question = ci.options.getString("question", true);
  await ci.deferReply();

  try {
    const reply = await handleQuestion(ci.channelId, question);
    const parts = chunk(reply);
    await ci.editReply(parts[0]);
    for (let i = 1; i < parts.length; i++) {
      await ci.followUp(parts[i]);
    }
  } catch (err) {
    console.error(err);
    await ci.editReply(
      "Hit a wall on my end. Try that again in a sec. Even I lose a round now and then. 🥊",
    );
  }
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (!config.enableTextPrefix) return;
  if (message.author.bot) return;
  if (!message.content.startsWith(config.textPrefix)) return;
  if (!isChannelAllowed(message.channelId)) return;

  const question = message.content.slice(config.textPrefix.length).trim();
  if (!question) return;

  try {
    if ("sendTyping" in message.channel) {
      await message.channel.sendTyping();
    }
    const reply = await handleQuestion(message.channelId, question);
    for (const part of chunk(reply)) {
      await message.reply(part);
    }
  } catch (err) {
    console.error(err);
    await message.reply(
      "Something broke on my end. Give me a second, I don't lose twice in a row. 🥊",
    );
  }
});

client.login(config.discordToken);
