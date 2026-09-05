---
description: Add YouGame online multiplayer to this game
---

Add YouGame online multiplayer to the game in this project — two people on two different
computers, not local seats or bots — following the `yougame-sdk` skill and the Multiplayer
section of https://yougame.co/sdk.md. Rooms hold people only and start when every seat is
filled; there is no partial start and no bot fill, so any bot play stays in single-player. If the game has no versus or co-op mode to put online,
make it a race: both players start the same run from the same seed at the same moment, each
sees the other's progress, and whoever is ahead when the round ends wins.

Add an "Online" option that calls `YouGame.multiplayer.findMatch({ players: 2, mode: "duel" })`,
use the host-authoritative pattern, start every round from the room's `ready` event (it
covers rematches — do not write your own handshake), call `room.finish({ winner })` on every
client when a round ends, handle `leave` and `close`, and auto-start online mode when
`YouGame.multiplayer.invite` is set. Single-player must keep working exactly as before.
