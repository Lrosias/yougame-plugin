---
description: Add YouGame online multiplayer (beta) to this game
---

Add YouGame online multiplayer to the game in this project, following the `yougame-sdk`
skill and the Multiplayer section of https://yougame.co/sdk.md.

Add an "Online" option that calls `YouGame.multiplayer.findMatch({ players: 2, mode: "duel" })`,
use the host-authoritative pattern, start every round from the room's `ready` event (it
covers rematches — do not write your own handshake), call `room.finish({ winner })` on every
client when a round ends, handle `leave` and `close`, and auto-start online mode when
`YouGame.multiplayer.invite` is set. Single-player must keep working exactly as before.
