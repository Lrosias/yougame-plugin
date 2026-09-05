---
name: yougame-sdk
description: Add YouGame SDK features to a game — leaderboards and beat-my-score links, touch controls that qualify for the phone listing, online multiplayer with matchmaking and rematches, ratings, and coins. Use when the user asks for a leaderboard, high scores, online or head-to-head play, phone support, or anything else from the YouGame SDK.
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
`add_leaderboard`, `make_playable_on_phones`, `add_multiplayer`.

## Leaderboard

`YouGame.gameOver(score, { onRestart })` when a run ends. Non-negative integers, higher is
better; convert timed games so faster is a bigger number. The SDK draws the game-over
overlay, the rank reveal, and the beat-my-score link, so remove the game's own game-over
screen rather than stacking two. This is the one feature worth adding to every game.

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

## Coins

Tips and coin matches need no game code. Paid items and paywalls are switched off for now; do not
build against them.

## After any of these

Re-run the pre-upload checks (`check_build`, or the `publish-to-yougame` skill's loop)
before telling the user it is done — the checks look at the SDK tag and at what the game
actually calls.
