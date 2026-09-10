---
description: Give this game one control scheme for keyboard, controllers, and phones (YouGame.input)
---

Give the game in this project one control scheme with `YouGame.input` — see "Controls and
phones" in the `yougame-sdk` skill and the Controls section of https://yougame.co/sdk.md.

Add the SDK script tag if it is missing, call `YouGame.input.setup({ preset, buttons, labels })`
once at start, and read `YouGame.input.state` every frame (`move.x`/`move.y`, `a`, `b`, …;
`YouGame.input.pressed("a")` once per press). Pick the preset that matches the game, enable
only the buttons it uses, label them with what they do, and use `custom` buttons when the
actions are the game's own. Replace the old key handling with the state object. A game with
local multiplayer passes `players: N` and reads `YouGame.input.players[i].state` per seat;
never poll `navigator.getGamepads()` or build a remap screen (the site's Controls panel does
that). Keep everything else working exactly as before.

For timing-sensitive games, pass `sampling: "manual"` and call `input.sample()` immediately
before each original simulation frame. Rollback replays recorded frame input. Use
`input.prompt(action, seat)` for the controller's printed button labels.

Read the controller device API in sdk.md before adding special hardware: `YouGame.controllers`
provides platform-owned GameCube input with raw stick bytes and separate analog triggers/digital
clicks. `connect()` opens platform Controls; the host Connect button obtains browser consent.
Keep game-specific conversions explicit, and never put raw GameCube data through the normal
action mapper. Browser support, real-device compatibility and latency require separate checks.
