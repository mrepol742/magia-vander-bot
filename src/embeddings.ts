import { config } from "./config";

/**
 * Embeds a given text using the OpenRouter embeddings API.
 *
 * @param text The text to embed.
 * @returns A promise that resolves to the embedding vector.
 */
export async function embed(text: string): Promise<number[]> {
  const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
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
      model: config.openrouterEmbeddingModel,
      input: text,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenRouter embeddings error ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as { data?: { embedding?: number[] }[] };
  const vector = data.data?.[0]?.embedding;
  if (!vector) throw new Error("OpenRouter embeddings returned no vector.");
  return vector;
}

/**
 * Calculates the cosine similarity between two embedding vectors.
 *
 * @param a The first embedding vector.
 * @param b The second embedding vector.
 * @returns The cosine similarity between the two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
