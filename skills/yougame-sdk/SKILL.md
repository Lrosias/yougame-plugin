---
name: yougame-sdk
description: Add YouGame SDK features to a game — leaderboards and beat-my-score links, saves that let a player resume on any device, one control scheme for keyboard, controllers, and phones (YouGame.input) that qualifies for the phone listing, online multiplayer with matchmaking and rematches, ratings, and coins. Use when the user asks for a leaderboard, high scores, save games or continue, online or head-to-head play, phone support, touch or controller support, or anything else from the YouGame SDK.
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
`add_leaderboard`, `add_saves`, `add_paywalls`, `make_playable_on_phones`, `add_controls`, `add_multiplayer`; and
`make_yougame_ready` takes them all as yes/no arguments (plus the creator's paywall rows) when
the game is being made ready in one go.

## Which board fits the game

Not every game gets a leaderboard, and a leaderboard is not always a points board. Rank by
the metric the game's players already talk about, and read "Which board fits the game"
in the reference before adding anything:

- **Runs that end with a score** (arcade, endless, wave survival, puzzle scores, distance):
  the points leaderboard below.
- **Runs against the clock** (a speedrun, a level or puzzle to finish fast): the time board,
  fastest first, runs shown as times. The same `gameOver` call with the run's milliseconds,
  and the creator sets the leaderboard to Time (`score_kind: "time"` in the listing). Never
  turn a time into points.
- **Head-to-head** (chess, checkers, card duels, fighting games, any versus game): the
  ranked ladder that comes with online multiplayer, shown on the game page with no drawing
  code. Only ranked matches feed it and players sit on the casual queue by default, so pass
  `ranked: true` to `findMatch`, and set `score_kind: "none"` in the listing so the game page
  shows the ladder where a leaderboard would sit. No `gameOver`: a mode against a bot is
  practice, and wins against a bot are not a score. If the creator did not pick online multiplayer, the honest
  result is no board: say so.
- **No natural end or metric** (story, sandbox, creative, co-op building, a toy): nothing,
  `score_kind: "none"`. Never invent points so a game can have a board.

A leaderboard is optional and `"none"` is a normal answer, not a gap.

Three boards, three switches. Whatever the game posts, the creator decides who sees it, on the
upload form or the game's Manage page: the everyone leaderboard (every player ranked together),
the friends leaderboard (the same scores, each signed-in player seeing only themself and their
friends), and the ranked ladder (what ranked online matches feed). Any combination is fine, and a
friends-only board is a normal choice for a game meant to be played among friends. The build is
the same either way: one `gameOver` call feeds both score boards and the ladder needs no call at
all, so never write code for a friends board. If the creator said which boards to turn on, say so
in your notes (`leaderboard`, `friends_board`, and `ladder` as booleans beside `score_kind` when
you fill in the listing yourself); otherwise leave them at their defaults, all three on.

## Leaderboard

`YouGame.gameOver(score, { onRestart })` when a run ends. Non-negative integers, higher is
better. The SDK draws the game-over overlay, the rank reveal, and the beat-my-score link,
so remove the game's own game-over screen rather than stacking two.

For a game against the clock the call is `YouGame.gameOver(elapsedMs, { onRestart })` with
the finished run's length in milliseconds (`Math.round(performance.now() - startedAt)`), and
the creator sets the leaderboard to Time on the upload form or the game's leaderboard
settings (`score_kind: "time"` when the listing is filled in by an agent). The board then
ranks fastest first and shows every run as a time (`1:23.45`); the SDK learns the kind when it
connects. `YouGame.init({ scoreKind: "time" })` makes the local test board behave the same
way before publishing. Post finished runs only: a death or a reset is not a time.

## Saves

A game with progress worth keeping (levels, unlocks, a run longer than one sitting) should
let the player resume: `const { data } = await YouGame.load()` at start, a Continue option
when `data` is not null (New game calls `YouGame.clearSave()`), and `YouGame.save(state)` at
checkpoints, level clears, and the menu. Keep the state a small plain JSON object under
64 KB (ids, counters, flags; never scores, which go through `gameOver`). The SDK writes the
browser copy every time and sends it to the player's account on YouGame, so a signed-in
player picks up on any device. Check the shape of what comes back before restoring from it.

## Controls and phones (`YouGame.input`)

One call gives the game the keyboard, any controller, and, on phones, an on-screen stick and
buttons the SDK draws; the game reads one state object and never asks which device it came
from. Read "Controls" in the reference before wiring it.

```js
const input = YouGame.input.setup({ preset: "stick-ab", labels: { a: "Jump", b: "Fire" } });
// each frame:
const s = input.state;            // move.x / move.y in -1..1 (down positive), a, b held
if (input.pressed("a")) jump();   // once per press
```

- Presets: `stick-ab` (default), `stick-abxy`, `dpad-ab`, `dpad-abxy`, `twin-stick`,
  `buttons`. Enable **only the buttons the game uses** with `buttons: ["a"]` and so on; a
  button that is not enabled is not drawn, not bound, and never true. Do not leave X, Y, L1,
  R1, L2, R2 on for a game that does not use them.
- Label buttons with what they do (`labels`), and place custom buttons by fractions of the
  screen (`custom: [{ id, label, x, y, keys, pad }]`) when the actions are the game's own
  (abilities, items). Replace the game's old key handling with the state object rather than
  running both.
- Menus, text, and direct touch play (tap a tile, drag a piece, aim by dragging) stay the
  game's own pointer handling; `input.hide()` / `show()` around menus under the overlay. A
  game played entirely by direct touch keeps `YouGame.input` with `touch: false` for keys and
  controllers.
- Local multiplayer (two to four people on one machine): `players: 2` in `setup` and read
  `input.players[i].state` / `input.players[i].pressed("a")` per seat; `input.state` stays seat
  1. Controllers claim seats by pressing a button, the keyboard splits (WASD side for player 1,
  arrows for player 2). Never poll `navigator.getGamepads()` yourself. `p.padKind` ("xbox",
  "playstation", "switch", "generic") picks the button glyphs for prompts.
- The player's own remaps, seating, and dead zone come from YouGame's Controls panel and are
  applied inside the SDK: never build a remap screen in the game. A settings menu can open the
  panel with `YouGame.input.settings()`.

The listing has a "Works on phones" filter, and a game qualifies only if the whole thing
plays by touch: the overlay for the controls, `pointerdown`/`pointerup` for everything else,
no hover, no right-click, tap targets of 44 px or more,
`<meta name="viewport" content="width=device-width, initial-scale=1">`, and default
prevented so the page never scrolls or zooms mid-game. Keep the canvas sized to the window
in both orientations. Keyboard and mouse play must keep working on computers.

## Online multiplayer

Every game that can take it should have it: it is the biggest reason a game spreads on
YouGame. A versus or co-op game becomes an online room directly; a single-player game becomes
a race — both players start the same run from the same seed at the same moment, each sees the
other's progress, and whoever is ahead when the round ends wins. Local seats and bots filling
empty slots are not multiplayer here, and rooms never mix the two: a room holds people only
(2 to 10 seats), starts when every seat is full and everyone is Ready, and has no partial start and no bots. Bot
play, if the game has it, is the single-player mode.

YouGame owns the multiplayer interface. Follow "Online menu integration" in
https://yougame.co/sdk.md and the runnable example at
https://yougame.co/examples/online-menu.html. Game menu buttons call
`YouGame.multiplayer.open({ players: 2, mode: "duel" })` for Online, or add
`queue: "casual"`, `"ranked"`, or `"friends"` for direct entry. Use the same mode for all.
Complete clearly labelled fighter/loadout setup before showing these buttons; each button
then opens the relevant YouGame UI immediately. Keep YouGame's searching, friends picker,
lobby, Ready, results/Continue, cancel and error UI. Do not use `ui: false` just to embed
buttons. `findMatch` is the lower-level API for an explicitly requested fully custom UI.
Incoming invitations must join the existing room without another picker.

The game's job is the
host-authoritative loop — host simulates, others send inputs, host broadcasts state at
20–30 Hz with positions as fractions of the playfield, everyone calls `room.finish({ winner })`.
`room.hostSync({ hz, input, step, snapshot })` does that plumbing (sequenced inputs, acks,
snapshot interpolation through `net.view()`, host handover). A fighter, platform fighter, or
any versus game where every player must feel the same delay uses Pattern C instead: a
deterministic simulation on every client (fixed step, `YouGame.rng(room.seed)`, no clock or
`Math.random` in game logic) driven by `room.lockstep(...)`, or `room.rollback(...)` with
`save`/`load` for offline-feeling controls; the SDK doc's "Pattern C" section has the contract.

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
before telling the user it is done. These checks scan static files and SDK references; they
do not execute the game. Test the actual menu buttons, cancel/retry, Ready, results, rematch,
and invitation entry in the hosted player with two designated test identities. Local Friends
only creates a link and does not test the signed-in friends picker or persistent ratings.
Report build checks separately from runtime evidence, and name untested flows.
