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
   ranked ladder that comes with online multiplayer is its board (`joinLobby` with
   `queue: "ranked"`), and without online multiplayer the honest result is no board at all:
   say so. Never invent points so a game can have a board. Who sees a board is the creator's
   call, not code: three switches on YouGame (the everyone leaderboard, the friends
   leaderboard with the same scores narrowed to each player's friends, and the ranked
   ladder), passed as `leaderboard`, `friends_board`, and `ladder` beside `score_kind` when
   you fill in the listing; all on by default.
3. Saves, online multiplayer, paywalls and phone controls are opt-in. Saves use
   `YouGame.load()` and `YouGame.save(state)`. For online, read the new `joinLobby` contract
   in https://yougame.co/sdk.md: join before setup, map participant slots to game ports,
   let the game own Ready/Start, keep late arrivals for the next game, and report individual
   games plus the final match. Private lobbies can mix local and remote humans. Use native
   invitations/local-player claims/Leave; keep game-specific UI inside the game. Test the
   hosted flow with two identities and actual keyboard/touch controls.

4. Run the pre-upload checks on the finished folder and fix what they report until the
   verdict is `ready`: the `check_build` tool if the YouGame MCP
   (`https://yougame.co/mcp`) is connected, otherwise POST
   `{ "files": [{ "path": "index.html", "size": 1234, "text": "…" }] }` to
   https://yougame.co/api/check-build. These are static checks only; report runtime evidence
   and untested flows separately.
5. Zip the folder's *contents* (not the folder) and tell the creator the path. They upload
   it at https://yougame.co/upload; the listing needs a 16:9 thumbnail.
6. When the YouGame MCP connection is signed in (it asks for that when it connects; the
   `upload_token` tool then gives a bearer token for the upload) or `YOUGAME_API_KEY` is set
   (made at https://yougame.co/account → Coding agents): run the plugin's
   `node scripts/upload-build.mjs <build-folder>` with `YOUGAME_UPLOAD_TOKEN` or
   `YOUGAME_API_KEY` set (Node 22+). Without the plugin download the helper from
   https://yougame.co/upload-build.mjs. It uses the website's streaming routes with the same
   5 GB total / 100 MB per-file / 5,000-file limits and returns the uploadId and check report.
   Unzip locally first. Then call `prepare_submission` (or POST
   https://yougame.co/api/agent/draft) with every listing field filled in from the game —
   title, description, genres, controls, play mode, phones, mature, max score, paywall prices,
   a thumbnail (from the build, or one you make and PUT to /api/agent/media). Ask the creator
   about anything the game cannot settle, then give them the review link it returns; they press
   Publish there. Never call `publish_game` unless they explicitly asked you to skip the review.

## Live verification before submission

After staging a build, call the YouGame MCP's `start_test_session` with `uploadId`,
`listing` (at least the title and the intended board/play/phone settings), `players: 2`
and `relationships: "friends"` (or `"strangers"` to test friend requests). It returns
private, expiring login links for disposable players on an isolated YouGame test site.
Open each in a separate browser context/profile; tabs alone share login cookies.
Use actual controls to test desktop and phone play, social interactions and, when present,
two-player matchmaking, Friends invites, Ready, results, rematches and disconnects.
Record screenshots/traces and outcomes with `record_test_evidence`, then call `test_report`
before `prepare_submission`. Static readiness and backend counts do not prove good UX.
Reports are bound to the build files and listing settings; changed builds must be retested.
Report untested flows honestly (payments and voice are disabled in this test environment).
Call `close_test_session` when finished; sessions otherwise expire after two hours.
