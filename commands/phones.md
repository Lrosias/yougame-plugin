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

"Works on phones" covers iPads and Android tablets too, and Play there is the whole
experience, so check the ways the claim usually turns out false before it goes on:

- **Keys only**: the game listens to `keydown`/`keyup` and a phone has nothing to press.
  Every action comes from `YouGame.input` or a pointer/touch handler; a typing game needs a
  focused text field so the on-screen keyboard opens.
- **Mouse only**: `mousemove`/`mousedown` without pointer or touch handlers, hover to reveal,
  right-click for a secondary action. Use pointer events, give the secondary action a
  long-press or a button, never depend on hover.
- **Layout computed once**: brick columns, grid cells and button rectangles measured at load
  and never again, so fullscreen, a rotation or a resize leaves the board in one corner with
  empty space beside it. Re-run the layout on `resize`, `orientationchange` and
  `fullscreenchange`, scale what is on screen, rebuild hit targets from the current size.
- **A fixed-size or fixed-aspect canvas** that overflows a portrait phone or an iPad, or one
  sized by CSS only that blurs: size it from `innerWidth`/`innerHeight` both ways and scale
  for `devicePixelRatio`.
- **Menus that need a key** ("press 2", "press R", Esc to leave): every menu action needs a
  tappable control of at least 44 px.
- **The page reacts to the finger** (double-tap zoom, pinch, pull-to-refresh, selection, the
  long-press callout): `touch-action: none`, `user-select: none`,
  `-webkit-touch-callout: none` on the game surface, `preventDefault` in touch handlers.
- **Silent audio**: resume the `AudioContext` in the first tap.
- **Tablets**: an iPad sends a desktop user agent; never decide touch from the user agent or
  a width breakpoint. Use pointer events, `(pointer: coarse)` and `navigator.maxTouchPoints`,
  and lay out for 768 to 1024 px wide as well as 390.
- **HUD or buttons under the host's corner button** or the SDK's stick and buttons (see
  "Reserved screen areas" in the reference).

Then verify before claiming it: run the build at 390×844 and 844×390 with touch emulation
(Chrome device mode, or a phone) and at 1024×768 (an iPad), tap through every menu, play a
round with the on-screen controls, enter and leave fullscreen and rotate, and check that
nothing sits off screen and the page never scrolls sideways. `check_build` only reads the
source. If you cannot run it on a touch screen or an emulator, say so and leave `mobile` off.
