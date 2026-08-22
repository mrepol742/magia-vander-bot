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
import { getCached, setCached } from "./cache";
import { formatRetrievedContext, retrieveContext } from "./retrieval";
import { prisma } from "./db";
import { embed } from "./embeddings";

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

/**
 * Checks if a user is an admin.
 *
 * @param userId The ID of the user.
 * @returns True if the user is an admin, false otherwise.
 */
function isAdmin(userId: string): boolean {
  return config.adminUserIds.includes(userId);
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
  const cached = getCached(question);
  if (cached) return cached;

  const retrieved = await retrieveContext(question);
  const contextText = formatRetrievedContext(retrieved);

  const history = historyByChannel.get(channelId) || [];
  const reply = await askAgent(question, contextText, history);

  pushHistory(channelId, question, reply);
  setCached(question, reply);

  return reply;
}

client.once(Events.ClientReady, async (c) => {
  console.log(`${config.botName} is online as ${c.user.tag}.`);
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

  if (!isChannelAllowed(ci.channelId)) {
    console.log(`Channel ${ci.channelId} is not allowed.`);
    return;
  }

  console.log(`[command] ${ci.commandName}`);

  if (ci.commandName === "magia") {
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
        "Hit a wall on my end. Try that again in a sec. Even I lose a round now and then.",
      );
    }
  }

  if (ci.commandName === "kb-add") {
    if (!isAdmin(ci.user.id)) {
      await ci.reply({
        content: "Not on the list. Nice try.",
        ephemeral: true,
      });
      return;
    }
    const question = ci.options.getString("question", true);
    const answer = ci.options.getString("answer", true);
    const category = ci.options.getString("category") ?? null;

    await ci.deferReply({ ephemeral: true });
    try {
      const vector = await embed(question);
      const entry = await prisma.knowledgeEntry.create({
        data: {
          question,
          answer,
          category,
          embedding: vector,
          createdBy: ci.user.id,
        },
      });
      await ci.editReply(`Added entry #${entry.id}. Knowledge base updated.`);
    } catch (err) {
      console.error(err);
      await ci.editReply("Couldn't save that entry. Check logs.");
    }
    return;
  }

  if (ci.commandName === "kb-edit") {
    if (!isAdmin(ci.user.id)) {
      await ci.reply({
        content: "Not on the list. Nice try.",
        ephemeral: true,
      });
      return;
    }
    const id = ci.options.getInteger("id", true);
    const question = ci.options.getString("question");
    const answer = ci.options.getString("answer");
    const category = ci.options.getString("category");

    await ci.deferReply({ ephemeral: true });
    try {
      const existing = await prisma.knowledgeEntry.findUnique({
        where: { id },
      });
      if (!existing) {
        await ci.editReply(`No entry #${id}.`);
        return;
      }
      const newQuestion = question ?? existing.question;
      const newAnswer = answer ?? existing.answer;
      const newVector = question
        ? await embed(newQuestion)
        : (existing.embedding as number[]);

      await prisma.knowledgeEntry.update({
        where: { id },
        data: {
          question: newQuestion,
          answer: newAnswer,
          category: category ?? existing.category,
          embedding: newVector,
        },
      });
      await ci.editReply(`Updated entry #${id}.`);
    } catch (err) {
      console.error(err);
      await ci.editReply("Couldn't update that entry. Check logs.");
    }
    return;
  }

  if (ci.commandName === "kb-delete") {
    if (!isAdmin(ci.user.id)) {
      await ci.reply({
        content: "Not on the list. Nice try.",
        ephemeral: true,
      });
      return;
    }
    const id = ci.options.getInteger("id", true);
    await ci.deferReply({ ephemeral: true });
    try {
      await prisma.knowledgeEntry.delete({ where: { id } });
      await ci.editReply(`Deleted entry #${id}.`);
    } catch (err) {
      console.error(err);
      await ci.editReply(`No entry #${id}, or delete failed.`);
    }
    return;
  }

  if (ci.commandName === "kb-list") {
    if (!isAdmin(ci.user.id)) {
      await ci.reply({
        content: "Not on the list. Nice try.",
        ephemeral: true,
      });
      return;
    }
    await ci.deferReply({ ephemeral: true });
    const entries = await prisma.knowledgeEntry.findMany({
      orderBy: { id: "asc" },
      select: { id: true, question: true, category: true },
      take: 50,
    });
    if (entries.length === 0) {
      await ci.editReply("Knowledge base is empty.");
      return;
    }
    const list = entries
      .map((e) => `#${e.id} [${e.category ?? "uncategorized"}] ${e.question}`)
      .join("\n");
    for (const part of chunk(list))
      await ci.followUp({ content: part, ephemeral: true });
    // await ci.editReply(
    //   `${entries.length} entr${entries.length === 1 ? "y" : "ies"}:`,
    // );
    return;
  }
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) return;
  if (!isChannelAllowed(message.channelId)) return;

  const raw = message.content.trim();
  let question: string | null = null;

  if (config.enableTextPrefix && raw.startsWith(config.textPrefix)) {
    question = raw.slice(config.textPrefix.length).trim();
  } else if (config.respondToQuestionMarks && raw.endsWith("?")) {
    question = raw;
  }

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
      "Something broke on my end. Give me a second, I don't lose twice in a row.",
    );
  }
});

client.login(config.discordToken);
