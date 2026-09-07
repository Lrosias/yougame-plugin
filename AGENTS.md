# Publishing this game on YouGame

Drop this file into a game project to give any agent that reads `AGENTS.md` (Codex and
friends) the YouGame workflow. Claude Code users get the same thing from the plugin.

1. Read https://yougame.co/publish.md and follow it: one folder, `index.html` at the top,
   every asset inside it and referenced relatively, nothing that needs a server, key
   listeners on `window`, canvas sized to the window with a `resize` handler.
2. Add the board that fits ("Which board fits the game" in https://yougame.co/sdk.md). A
   game whose runs end with a score gets the points leaderboard:
   `<script src="https://yougame.co/sdk.js"></script>` and
   `YouGame.gameOver(score, { onRestart })` when a run ends, non-negative integers, higher
   is better. A game against the clock gets the time board: the same call with the run's
   milliseconds, `YouGame.gameOver(elapsedMs, { onRestart })`, and the listing's leaderboard
   set to Time (`score_kind: "time"`), so runs rank fastest first and read as times; never
   turn a time into points. A head-to-head game (chess, a fighter) gets no leaderboard; the
   ranked ladder that comes with online multiplayer is its board (`findMatch` with
   `ranked: true`), and without online multiplayer the honest result is no board at all:
   say so. Never invent points so a game can have a board.
3. Saves, online multiplayer, paywalls, and phone controls are opt-in: add them only when
   the creator asks. Saves are `YouGame.load()` at start (Continue when it returns data)
   and `YouGame.save(state)` at checkpoints; the SDK keeps them in the browser and on the
   player's account. When they ask for multiplayer, two people on two different computers is
   the bar: `YouGame.multiplayer.findMatch({ players: 2, mode: "duel" })`, a
   host-authoritative round with `room.hostSync` (Pattern C, `room.lockstep` or `room.rollback`,
   for fighters and other versus games where every player must feel the same delay),
   `room.finish({ winner })`, rounds started from the room's
   `ready` event, `leave` / `close` handled. A versus or co-op game becomes an online room
   directly; a single-player game becomes a race from the same seed, each player seeing the
   other's progress. Local seats and bots do not count, and rooms never mix humans with
   bots (bot play stays in single-player).
4. Run the pre-upload checks on the finished folder and fix what they report until the
   verdict is `ready`: the `check_build` tool if the YouGame MCP
   (`https://yougame.co/mcp`) is connected, otherwise POST
   `{ "files": [{ "path": "index.html", "size": 1234, "text": "…" }] }` to
   https://yougame.co/api/check-build.
5. Zip the folder's *contents* (not the folder) and tell the creator the path. They upload
   it at https://yougame.co/upload; the listing needs a 16:9 thumbnail.
6. When the YouGame MCP connection is signed in (it asks for that when it connects; the
   `upload_token` tool then gives a bearer token for the upload) or `YOUGAME_API_KEY` is set
   (made at https://yougame.co/account → Coding agents): POST the zip to
   https://yougame.co/api/agent/upload with that token, then call `prepare_submission` (or POST
   https://yougame.co/api/agent/draft) with every listing field filled in from the game —
   title, description, genres, controls, play mode, phones, mature, max score, paywall prices,
   a thumbnail (from the build, or one you make and PUT to /api/agent/media). Ask the creator
   about anything the game cannot settle, then give them the review link it returns; they press
   Publish there. Never call `publish_game` unless they explicitly asked you to skip the review.
