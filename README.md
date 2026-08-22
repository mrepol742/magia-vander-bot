# Magia Vander Bot

A lightweight TypeScript Discord bot that answers game questions using RAG.
Player questions are embedded, matched against a MySQL-backed knowledge
base via cosine similarity, and answered by an OpenRouter-powered chat
model.

## Setup

```bash
npm install
cp .env.example .env
# fill in DISCORD_TOKEN, DISCORD_CLIENT_ID, OPENROUTER_API_KEY,
# DATABASE_URL, ADMIN_USER_IDS, etc.
npx prisma generate
npx prisma migrate dev --name init
npm run deploy   # registers the slash commands
npm run build
npm start
```

For local dev without building: `npm run dev`.

### Getting the Discord values

1. Create an application at https://discord.com/developers/applications
2. Bot tab → copy the token into `DISCORD_TOKEN`.
3. General Information → copy the Application ID into `DISCORD_CLIENT_ID`.
4. Under Bot → enable **Message Content Intent** if you want `TEXT_PREFIX`
   or `RESPOND_TO_QUESTION_MARKS` chat to work.
5. Invite the bot with the `applications.commands` and `bot` scopes
   (Send Messages, Use Slash Commands permissions).
6. For instant command updates while testing, set `DISCORD_GUILD_ID` to
   your test server's ID (comma-separate for multiple servers); leave
   blank for global (slower, ~1hr) registration.

### Getting an OpenRouter key

Sign up at https://openrouter.ai, create an API key, set
`OPENROUTER_API_KEY`. This single key covers both:

- `OPENROUTER_MODEL` — the chat model that answers questions
  (e.g. `openai/gpt-4o-mini`, `anthropic/claude-3.5-haiku`).
- `OPENROUTER_EMBEDDING_MODEL` — the embedding model used for retrieval
  (e.g. `openai/text-embedding-3-small`).

### Setting up admins

Add your Discord user ID(s) to `ADMIN_USER_IDS` (comma-separated for
multiple) — only these users can run `/kb-add`, `/kb-edit`, `/kb-delete`,
and `/kb-list`. Enable Developer Mode in Discord (Settings → Advanced)
to right-click and copy a user ID.

Every add/edit embeds the question text via OpenRouter and stores the
vector alongside the Q/A pair, so it's immediately searchable.

## Tuning retrieval

- `RAG_TOP_K` — how many matching entries to feed the model per question
  (default `4`).
- `RAG_MIN_SIMILARITY` — minimum cosine similarity score required for an
  entry to be considered a match (default `0.72`). If the bot says it
  has no info despite matching entries existing, this is usually the
  first thing to lower.

## Locking to a channel

Set `ALLOWED_CHANNEL_IDS` (comma-separated) to restrict the bot to
specific channels. Leave blank to allow it everywhere it's invited.

# License

This project is licensed under the **PolyForm Noncommercial License 1.0.0**.

See the [LICENSE](LICENSE) file for details.

© 2026 Melvin Jones Repol.
