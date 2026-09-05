# Publishing this game on YouGame

Drop this file into a game project to give any agent that reads `AGENTS.md` (Codex and
friends) the YouGame workflow. Claude Code users get the same thing from the plugin.

1. Read https://yougame.co/publish.md and follow it: one folder, `index.html` at the top,
   every asset inside it and referenced relatively, nothing that needs a server, key
   listeners on `window`, canvas sized to the window with a `resize` handler.
2. Add the leaderboard — `<script src="https://yougame.co/sdk.js"></script>` and
   `YouGame.gameOver(score, { onRestart })` when a run ends. Non-negative integers, higher
   is better. Reference: https://yougame.co/sdk.md.
3. Add online multiplayer unless the game genuinely cannot take it — it is what the site is
   for and the biggest reason a game spreads here.
   `YouGame.multiplayer.findMatch({ players: 2, mode: "duel" })`, a host-authoritative round,
   `room.finish({ winner })`, rounds started from the room's `ready` event, `leave` / `close`
   handled. A versus or co-op game becomes an online room directly; a single-player game
   becomes a race from the same seed, each player seeing the other's progress. Local seats
   and bots do not count. Paywalls and phone controls stay opt-in.
4. Run the pre-upload checks on the finished folder and fix what they report until the
   verdict is `ready`: the `check_build` tool if the YouGame MCP
   (`https://yougame.co/mcp`) is connected, otherwise POST
   `{ "files": [{ "path": "index.html", "size": 1234, "text": "…" }] }` to
   https://yougame.co/api/check-build.
5. Zip the folder's *contents* (not the folder) and tell the creator the path. They upload
   it at https://yougame.co/upload; the listing needs a 16:9 thumbnail.
