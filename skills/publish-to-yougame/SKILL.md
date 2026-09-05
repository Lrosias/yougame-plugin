---
name: publish-to-yougame
description: Turn a browser game into a build that runs on YouGame and get it ready to upload — the static build contract, the leaderboard SDK, the pre-upload checks, and the zip. Use when the user wants to publish, ship, upload, or post a game to YouGame, asks to make a game YouGame-ready, or hits errors from YouGame's checks or upload page.
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

Do **not** add multiplayer, coins, or anything else from the SDK unless the user asks.
Details for those: the `yougame-sdk` skill, or `get_sdk_reference` / https://yougame.co/sdk.md.

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

- where the zip is, and that the upload page takes it by drag and drop;
- that the listing needs a 16:9 thumbnail (PNG/JPG/WebP/GIF, up to 8 MB) — screenshots and
  a short demo video are optional;
- what you added (leaderboard or not, and why), and anything `check_build` warned about but
  you left alone.

The upload itself is the creator's step: it needs their account, and there is no upload
token yet.

## Fixing a build that already failed

If the user pastes a report from the upload page or from `check_build`, go straight to
step 4's fix loop: read the failing items, change the build, re-run `check_build`, repeat
until it is ready. The `make_yougame_ready` MCP prompt is the same instructions in one
message if you want to hand them to a subagent.
