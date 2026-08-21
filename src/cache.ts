import { createHash } from "crypto";

interface CacheEntry {
  reply: string;
  timestamp: number;
}

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours, tweak as needed
const cache = new Map<string, CacheEntry>();

/*
 * Normalizes a question string by trimming, converting to lowercase, and replacing consecutive spaces with a single space.
 *
 * @param question The question string to normalize.
 * @returns The normalized question string.
 */
function normalize(question: string): string {
  return question.trim().toLowerCase().replace(/\s+/g, " ");
}

/*
 * Hashes a normalized question string using SHA-256.
 *
 * @param question The question string to hash.
 * @returns The hashed question string.
 */
export function hashQuestion(question: string): string {
  return createHash("sha256").update(normalize(question)).digest("hex");
}

/*
 * Retrieves a cached reply for a given question.
 *
 * @param question The question string to retrieve the cached reply for.
 * @returns The cached reply, or null if no cached reply is found or the cache has expired.
 */
export function getCached(question: string): string | null {
  const key = hashQuestion(question);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.reply;
}

/*
 * Sets a cached reply for a given question.
 *
 * @param question The question string to set the cached reply for.
 * @param reply The reply string to cache.
 */
export function setCached(question: string, reply: string): void {
  const key = hashQuestion(question);
  cache.set(key, { reply, timestamp: Date.now() });
}
