---
name: yougame-sdk
description: Add YouGame SDK features to a game — leaderboards and beat-my-score links, saves that let a player resume on any device, touch controls that qualify for the phone listing, online multiplayer with matchmaking and rematches, ratings, and coins. Use when the user asks for a leaderboard, high scores, save games or continue, online or head-to-head play, phone support, or anything else from the YouGame SDK.
---

# The YouGame SDK

One script tag, no account, no keys:

```html
<script src="https://yougame.co/sdk.js"></script>
```

Everything below is documented in full at https://yougame.co/sdk.md — call the `yougame`
MCP tool **`get_sdk_reference`** for the whole document, or **`search`** (then **`fetch`**)
for one answer, e.g. `search("rematch")`. Read the relevant section before writing code:
the API details change faster than this skill does.

Each feature also exists as an MCP prompt you can run instead of re-deriving the work:
`add_leaderboard`, `add_saves`, `add_paywalls`, `make_playable_on_phones`, `add_multiplayer`; and
`make_yougame_ready` takes them all as yes/no arguments (plus the creator's paywall rows) when
the game is being made ready in one go.

## Leaderboard

`YouGame.gameOver(score, { onRestart })` when a run ends. Non-negative integers, higher is
better; convert timed games so faster is a bigger number. The SDK draws the game-over
overlay, the rank reveal, and the beat-my-score link, so remove the game's own game-over
screen rather than stacking two. This is the one feature worth adding to every game.

## Saves

A game with progress worth keeping (levels, unlocks, a run longer than one sitting) should
let the player resume: `const { data } = await YouGame.load()` at start, a Continue option
when `data` is not null (New game calls `YouGame.clearSave()`), and `YouGame.save(state)` at
checkpoints, level clears, and the menu. Keep the state a small plain JSON object under
64 KB (ids, counters, flags; never scores, which go through `gameOver`). The SDK writes the
browser copy every time and sends it to the player's account on YouGame, so a signed-in
player picks up on any device. Check the shape of what comes back before restoring from it.

## Phones

The listing has a "Works on phones" filter, and a game qualifies only if the whole thing
plays by touch: `pointerdown`/`pointerup` (or touch events) for every action, on-screen
controls where the game needs them, no keyboard, no hover, no right-click, tap targets of
44 px or more, `<meta name="viewport" content="width=device-width, initial-scale=1">`, and
default prevented so the page never scrolls or zooms mid-game. Keep the canvas sized to the
window in both orientations. Keyboard and mouse play must keep working on computers.

## Online multiplayer

Every game that can take it should have it: it is the biggest reason a game spreads on
YouGame. A versus or co-op game becomes an online room directly; a single-player game becomes
a race — both players start the same run from the same seed at the same moment, each sees the
other's progress, and whoever is ahead when the round ends wins. Local seats and bots filling
empty slots are not multiplayer here, and rooms never mix the two: a room holds people only
(2 to 10 seats), starts when its last seat fills, and has no partial start and no bots. Bot
play, if the game has it, is the single-player mode.

`YouGame.multiplayer.findMatch({ players: 2, mode: "duel" })` gets a room: matchmaking,
friend invites, ratings, and the result card are the platform's job. The game's job is the
host-authoritative loop — host simulates, others send inputs, host broadcasts state at
20–30 Hz with positions as fractions of the playfield, everyone calls `room.finish({ winner })`.

Two things agents get wrong: start every round from the room's `ready` event (it fires for
round one and again after each rematch — never build your own rematch handshake), and
handle `leave` and `close` so a player who quits does not freeze the others. Auto-start
online mode when `YouGame.multiplayer.invite` is set. Single-player must keep working
exactly as before.

## Persistent worlds

Only when the creator asked for one. A world is a shared space players log into that keeps
its state between visits (a build world, a shared farm, a canvas, a board everyone edits):
`YouGame.worlds.join("main")`, then `world.state` and the `change` event, with `set`,
`cas`, `inc`, and `claim` to write. Read the "Persistent worlds" section of the reference
before building one.

**Say what it is not, before writing code.** A world is shared state YouGame keeps and
relays, not a game server. Tell the creator, in plain words:

- none of the game's logic runs on YouGame; every client is trusted, so any player can
  write any key. Co-op and creative games only: nothing competitive between strangers, no
  economy or inventory worth cheating for, nothing tied to coins;
- writes are last-writer-wins per key. Every fast-changing thing gets exactly one writer
  (each player writes their own `p:<id>` keys); shared objects use `cas` (place a block if
  the cell is empty), `inc` (counters), or `claim` (one player handles it for a while).
  A shared simulation many players push on at once does not fit;
- nothing happens while nobody is connected: no ticks, no NPCs, no offline progress;
- everyone receives every change and a joining player downloads the whole state;
- 32 players, 16 KB per value, 60 messages a second per player, 10,000 keys and 512 KB
  per world; no matchmaking, ratings, result card, or coin match inside a world.

If any of that rules the game out, say so and stop rather than building around it.

## Coins

Tips and coin matches need no game code. Paid items and paywalls are switched off for now; do not
build against them.

## After any of these

Re-run the pre-upload checks (`check_build`, or the `publish-to-yougame` skill's loop)
before telling the user it is done — the checks look at the SDK tag and at what the game
actually calls.
