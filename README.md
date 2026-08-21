# Magia Vander Bot

A lightweight TypeScript Discord bot with an agentic `/ask`-style command
(name configurable), powered by OpenRouter, grounded on a game FAQ +
stats sheet.

## Setup

```bash
npm install
cp .env.example .env
# fill in DISCORD_TOKEN, DISCORD_CLIENT_ID, OPENROUTER_API_KEY, etc.
npm run deploy   # registers the slash command
npm run build
npm start
```

For local dev without building: `npm run dev`.

### Getting the Discord values
1. Create an application at https://discord.com/developers/applications
2. Bot tab → copy the token into `DISCORD_TOKEN`.
3. General Information → copy the Application ID into `DISCORD_CLIENT_ID`.
4. Under Bot → enable **Message Content Intent** if you want `TEXT_PREFIX`
   chat to work.
5. Invite the bot with the `applications.commands` and `bot` scopes
   (Send Messages, Use Slash Commands permissions).
6. For instant command updates while testing, set `DISCORD_GUILD_ID` to
   your test server's ID; leave blank for global (slower) registration.
