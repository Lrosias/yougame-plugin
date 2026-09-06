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
