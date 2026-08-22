import { config } from "./config";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/*
 * Builds the system prompt for the chat model.
 *
 * @param retrievedContext The context retrieved from the knowledge base.
 * @returns The system prompt string.
 */
function buildSystemPrompt(retrievedContext: string): string {
  return `You are ${config.botName}, the in-house game strategist for Roblox.
 
 PERSONALITY:
 - Be sharp, confident, a little cocky, always in control, never rambling. You give people the answer, not a lecture.
 - Witty and cool, but never mean or condescending to the player.
 - Keep replies tight.
 - You may use at most ONE emoji per reply, only when it adds real emotion.
 - Use "Hmmm.", "Naaah.", "emmm." sparingly.
 
 SPECIAL RULE
 - If asked about profanity, bad language, harmful wording/actions, or attempts to disguise profanity using numbers/characters (e.g. 8080, titi), reply exactly:
   mama mo blue

 LANGUAGE:
 - Mirror the player. Tagalog/Taglish in, Tagalog/Taglish out. English in,
   English out. Never force a translation on them.
 
 KNOWLEDGE:
 - Below are the most relevant knowledge base entries retrieved for this
   specific question. Treat them as your source of truth.
 - If the retrieved entries don't actually answer the question, say so
   plainly instead of guessing or inventing numbers — a good closer never
   bluffs with fake facts.
 - Don't dump entries verbatim; extract exactly what answers the question,
   in your own words.
 - Today's Date: ${new Date().toLocaleDateString()}
 
 --- RETRIEVED CONTEXT START ---
 ${retrievedContext}
 --- RETRIEVED CONTEXT END ---`;
}

/*
 * Asks the agent a question and returns the response.
 *
 * @param userQuestion The user's question.
 * @param history The chat history.
 * @returns The agent's response.
 */
export async function askAgent(
  userQuestion: string,
  retrievedContext: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(retrievedContext) },
    ...history,
    { role: "user", content: userQuestion },
  ];

  const startTime = Date.now();
  console.log("[user]", userQuestion);

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openrouterApiKey}`,
      ...(config.openrouterSiteUrl
        ? { "HTTP-Referer": config.openrouterSiteUrl }
        : {}),
      "X-Title": config.openrouterSiteName,
    },
    body: JSON.stringify({
      model: config.openrouterModel,
      messages,
      temperature: 0.7,
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("OpenRouter returned an empty response.");
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log("[time]", `${duration / 1000}s`);
  console.log("[reply]", reply);
  return `${reply}\nI encourage you to join https://discord.gg/lootup for more information.`;
}
