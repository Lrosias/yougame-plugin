---
name: publish-to-yougame
description: Turn a browser game into a build that runs on YouGame and get it ready to upload, or, with the creator's API key, upload it, fill in the whole listing, and hand the creator a review link — the static build contract, the leaderboard SDK, the pre-upload checks, the zip, and the prepare_submission step. Use when the user wants to publish, ship, upload, or post a game to YouGame, asks to make a game YouGame-ready, or hits errors from YouGame's checks or upload page.
---

# Publishing a game on YouGame

YouGame (https://yougame.co) hosts static browser games. The creator uploads a folder,
and the game is live on its own origin with a leaderboard, a player, and a listing. There
is no review queue and no build step on our side, so everything the game needs has to be
in the folder.

Work in this order. Do not skip the check step: it is the difference between a game that
plays and one that shows a black screen to everyone who clicks it.

## 1. Read the contract

Call the `yougame` MCP tool **`get_publish_guide`**. (No MCP connected? Read
https://yougame.co/publish.md instead — same text.) It is the authority on what a build
must look like; this skill only sequences the work.

## 2. Make the build static

Produce one folder whose top level is `index.html`, with every asset inside it and
referenced by a relative path. In particular:

- No dev server, no API the creator does not host, no `process.env`, no bundler aliases
  left in the output. If the game needs a backend, it is not ready to publish.
- Key listeners go on `window`. Size the canvas to the window and handle `resize`.
- Vite, Godot, Unity, Phaser, p5, plain canvas: all fine. Build with a relative base
  (`base: "./"` in Vite) so nothing points at `/assets/…`.

## 3. Add the leaderboard

This is what makes it a YouGame game rather than a page. Two lines:

```html
<script src="https://yougame.co/sdk.js"></script>
```

```js
YouGame.gameOver(score, { onRestart: () => startGame() });
```

Scores are non-negative integers and higher is better — convert timed games so faster is a
bigger number. Let the SDK's overlay be the game-over screen instead of the game's own.
If the game has no score at all, say so and move on; do not invent one.

Then add **online multiplayer**, unless this game genuinely cannot take it. Two people on two
different computers is what YouGame is for, and an online mode is the biggest reason a game
spreads here, so it belongs in the first version, not a follow-up. A game with versus or
co-op becomes an online room directly; a single-player game becomes a race — both players
start the same run from the same seed at the same moment, each sees the other's progress, and
whoever is ahead when the round ends wins. Local seats, hot-seat play, and bots filling empty
slots do not count, and rooms never mix humans with bots: a room holds people only, starts
when its last seat fills, and has no partial start. Bot play stays in single-player. Follow the `yougame-sdk` skill (or `get_sdk_reference` /
https://yougame.co/sdk.md) for the contract, and tell the user if you skipped it and why.

Coins and paywalls stay opt-in: add those only when the user asks.

## 4. Check it, and fix what it says

Call the MCP tool **`check_build`** with every file in the build folder: `path` relative to
the folder with forward slashes, `size` in bytes, and `text` for `index.html` and every
`.html`/`.css`/`.js` file under 2 MB. Without MCP, POST the same JSON to
`https://yougame.co/api/check-build`.

It reports what actually breaks games here: files the page references but the folder does
not contain, calls to a server that will not exist, a missing or wrong SDK tag, engine
exports that need compression the play origin does not do, and the size limits. Fix
everything it lists and run it again until the verdict is **ready**. Report the verdict to
the user; never tell them a build is ready on your own judgment.

## 5. Zip it and hand it over

```bash
"${CLAUDE_PLUGIN_ROOT}/scripts/zip-build.sh" <build-folder>
```

It zips the folder's *contents* (not the folder), leaves out `.git`, `node_modules`, and
editor junk, prints the path, and opens https://yougame.co/upload (pass `--no-open` first
if a browser window would be unwelcome). Then tell the user, in
one short message:

- where the zip is, and that the upload page takes it by drag and drop (or the review
  link, when step 6 applied);
- that the listing needs a 16:9 thumbnail (PNG/JPG/WebP/GIF, up to 8 MB) — screenshots and
  a short demo video are optional;
- what you added (leaderboard or not, and why), and anything `check_build` warned about but
  you left alone.

## 6. Fill in the submission, when the creator gave you a key

If `YOUGAME_API_KEY` is set in the environment (the creator made it at
https://yougame.co/account → Coding agents), take the submission all the way to the
creator's final click instead of handing over a zip:

```bash
curl -sS -X POST https://yougame.co/api/agent/upload \
  -H "Authorization: Bearer $YOUGAME_API_KEY" -H "Content-Type: application/zip" \
  --data-binary @<the zip>
```

The reply has `uploadId`, `testUrl` (the build already runs there), the `verdict`, and the
`report`. If the verdict is `broken`, fix, zip, upload again.

Then **fill in everything** with the MCP tool **`prepare_submission`**: the `uploadId`, a
title, a one-paragraph description written from the game, up to three genres, the controls,
`play_mode`, `mobile` (only if it really plays with touch), `mature`, `max_score` when the game
has a natural ceiling, a `paywalls` row for every key the build charges, `notes` saying what you
decided and assumed, and a thumbnail. You know the game; decide from it, and suggest rather
than leave blanks. Ask the creator, before calling, about the things the game itself cannot
settle:

- **Thumbnail.** If the build has a 16:9 image, pass its path as `thumbnail`. If not, ask
  whether to use an image they have, to let you make one, or to add it on the review page.
  To make one: screenshot the game running at `testUrl` at 1280×720 (Playwright or any headless
  browser you have), or render a title card; then send it as the raw body of
  `PUT https://yougame.co/api/agent/media?uploadId=<uploadId>&kind=thumb` with the right
  `Content-Type`. `kind=shot` adds screenshots.
- **Mature content**, when what you saw in the game leaves it unclear.
- **Paywall prices and kinds** (`unlock` once, or `play` every time) for every charged key.

The reply has `reviewUrl` and `questions`. Ask the creator whatever `questions` lists, call
`prepare_submission` again with the answers (it replaces the draft), then give the creator the
review link. It opens the upload form with every field filled in; they change what they want
and press Publish. Nothing is live until they do.

**Never publish for them.** `publish_game` skips the review and refuses without
`creator_approved: true`; pass that only when the creator explicitly said, in their own words,
to publish without reviewing (or approved the draft in the conversation). Speed is not a reason.
`my_games` lists what the key's owner has published. The exact fields are under "Publishing
from a coding agent" in the publish guide.

**Updating a published game** works the same way: stage the new build with the upload route,
then call **`update_game`** with the game's `slug` (from `my_games` or its URL), the new
`uploadId`, `kind` (`major` for a big change: players who saved or liked the game are
notified and the home feed features it for a week; `minor` for fixes and small changes:
silent; default `minor`), and `notes` (patch notes for players). The link, the origin, the
scores and the comments stay. Never delete and re-publish a game to update it.

Without a key, the upload is the creator's step: it needs their account, and the zip is
drag and drop on the upload page.

## Fixing a build that already failed

If the user pastes a report from the upload page or from `check_build`, go straight to
step 4's fix loop: read the failing items, change the build, re-run `check_build`, repeat
until it is ready. The `make_yougame_ready` MCP prompt is the same instructions in one
message if you want to hand them to a subagent.
