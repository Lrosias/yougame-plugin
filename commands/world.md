---
description: Add a YouGame persistent world (shared state kept between visits) to this game
---

Add a YouGame persistent world to the game in this project, following the `yougame-sdk`
skill and the Persistent worlds section of https://yougame.co/sdk.md. A world is a shared
space every player logs into whose state YouGame keeps between visits: a build world, a
shared farm, a canvas, a board everyone edits.

Before writing any code, tell the user in plain words what a world can and cannot do and
check that this game fits. It is shared state YouGame keeps and relays, not a game server:
none of the game's logic runs on YouGame, every client is trusted and any player can write
any key, so it suits co-op and creative games and not anything competitive, with an economy,
or tied to coins. Writes are last-writer-wins per key, so give every fast-changing thing one
writer (each player writes only their own `p:<id>` keys) and use `claim`, `cas`, or `inc`
for shared objects. Nothing happens while nobody is connected. Limits: 32 players, 16 KB
per value, 60 messages a second per player, 10,000 keys and 512 KB per world; no matchmaking,
ratings, or coin matches inside a world. If any of that rules this game out, say so and stop.

Otherwise add a "Join world" option that calls `YouGame.worlds.join("main")` (or lists
`YouGame.worlds.list()` and lets the player pick or create one), render from `world.state`
and the `change` event, write with `world.set`, `world.cas`, `world.inc`, and `world.claim`
as the reference says, send ephemeral things such as cursor positions and chat with
`world.send`, handle the `join`, `leave`, and `close` events, and keep single-player working
exactly as before.
