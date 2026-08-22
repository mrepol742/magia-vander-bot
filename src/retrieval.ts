import { prisma } from "./db";
import { embed, cosineSimilarity } from "./embeddings";
import { config } from "./config";

export interface RetrievedEntry {
  question: string;
  answer: string;
  category: string | null;
  similarity: number;
}

/**
 * Retrieves the top-K most similar entries from the knowledge base for a given question.
 *
 * @param question The question to retrieve context for.
 * @returns A promise that resolves to an array of retrieved entries.
 */
export async function retrieveContext(
  question: string,
): Promise<RetrievedEntry[]> {
  const queryVector = await embed(question);

  const entries = await prisma.knowledgeEntry.findMany({
    select: { question: true, answer: true, category: true, embedding: true },
  });

  const scored = entries.map((e) => ({
    question: e.question,
    answer: e.answer,
    category: e.category,
    similarity: cosineSimilarity(queryVector, e.embedding as number[]),
  }));

  scored.sort((a, b) => b.similarity - a.similarity);

  return scored
    .filter((e) => e.similarity >= config.ragMinSimilarity)
    .slice(0, config.ragTopK);
}

/**
 * Formats the retrieved context entries into a human-readable string.
 *
 * @param entries The retrieved entries to format.
 * @returns The formatted context string.
 */
export function formatRetrievedContext(entries: RetrievedEntry[]): string {
  if (entries.length === 0) {
    return "(No matching entries found in the knowledge base for this question.)";
  }
  return entries
    .map(
      (e, i) =>
        `[${i + 1}] Q: ${e.question}\nA: ${e.answer}${
          e.category ? `\n(category: ${e.category})` : ""
        }`,
    )
    .join("\n\n");
}
