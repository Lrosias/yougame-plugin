---
description: Make this game playable on phones, to YouGame's "Works on phones" bar
---

Make the game in this project playable on phones, to the bar YouGame's "Works on phones"
listing requires — see "Controls and phones" in the `yougame-sdk` skill and the Controls
section of https://yougame.co/sdk.md.

Controls through `YouGame.input.setup({ preset, buttons, labels })`: the on-screen stick or
d-pad and buttons on phones, and the same state from the keyboard and controllers on
computers. Enable only the buttons the game uses, label them, and place custom buttons when
the actions are the game's own. Beyond the controls: touch for menus and direct play, 44 px
tap targets, the viewport meta tag, no page scroll or zoom while playing, and a canvas that
fits portrait and landscape. Keyboard and mouse play on computers must keep working.
