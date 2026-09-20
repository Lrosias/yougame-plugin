---
description: Let players resume this game where they left off (YouGame saves)
---

Let players resume the game in this project where they left off, following the
`yougame-sdk` skill and the Saves section of https://yougame.co/sdk.md.

At start call `const { data } = await YouGame.load()` and, when `data` is not null, offer
Continue (restore from it) next to New game (which calls `YouGame.clearSave()`). Call
`YouGame.save(state)` whenever progress worth keeping changes: a checkpoint, a level clear,
opening the menu. Keep the state a small plain JSON object (ids, counters, flags; not level
data the game can rebuild, never scores) under 64 KB, and check its shape before restoring
from it. The SDK keeps the browser copy and sends it to the player's YouGame account, so
nothing else is needed for saves to follow the player across devices. Change nothing else
about how the game plays.

Two exceptions. If the project is a ROM hack or a patch listing (it runs in YouGame's emulator),
do nothing: the emulator's cartridge saves and save states already follow the account. If the
game has a save format of its own that does not fit 64 KB of JSON, or it is a **native build**
(a desktop program the YouGame app runs), use the account's save files instead, following the
`yougame-sdk` skill's "Native builds" section and sdk.md "Save files" / "Saves from a native
build": `YouGame.saves.files.read/write` from a web build, the bridge's
`saveFileList/saveFileRead/saveFileWrite` (base64) from a native one, reading at start, writing
on every save event, the newer copy winning, and nothing stored while signed out.
