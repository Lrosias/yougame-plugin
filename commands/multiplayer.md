---
description: Add YouGame online multiplayer to this game
---

Add YouGame online multiplayer to the game in this project — two people on two different
computers, not local seats or bots — following the `yougame-sdk` skill and the Multiplayer
section of https://yougame.co/sdk.md. Rooms hold people only and start when every seat is
filled and everyone is Ready; there is no partial start and no bot fill, so any bot play stays in single-player. If the game has no versus or co-op mode to put online,
make it a race: both players start the same run from the same seed at the same moment (`room.seed` from the `ready` event, through `YouGame.rng`; no seed handshake), each
sees the other's progress, and whoever is ahead when the round ends wins.

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

Use the host-authoritative pattern through `room.hostSync` (or Pattern C, `room.lockstep` /
`room.rollback`, for a fighter or any versus game where every player must feel the same delay;
the SDK doc's "Pattern C" section says what the game has to be deterministic about), start every
round from the room's `ready` event (it
covers rematches — do not write your own handshake), call `room.finish({ winner })` on every
client when a round ends, handle `leave` and `close`, and auto-start online mode when
`YouGame.multiplayer.invite` is set. Single-player must keep working exactly as before.

Test actual buttons by keyboard and touch, then two designated test identities in the hosted
player: all three choices, cancel/retry, Ready, results, rematch, and invite recipient entry.
Local Friends only creates a link; dev results do not persist ratings. Report build/static
checks separately from runtime evidence and untested flows.
