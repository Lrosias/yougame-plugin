---
description: Run YouGame's pre-upload checks on a build folder
argument-hint: "[build folder, e.g. dist]"
---

Run YouGame's pre-upload checks on $1 (default: the built game folder in this project).

List every file in that folder with its size, read `index.html` and the `.html`/`.css`/`.js`
files under 2 MB, and call the `yougame` MCP tool `check_build` with all of it. Show me the
verdict and the items it lists, then fix the failures and re-run until the verdict is
`ready`. Do not zip or upload anything unless I ask.

The verdict covers static packaging and SDK references only. Runtime behavior is not tested.
Do not claim working multiplayer, Friends, or ranked results from this check. List the hosted
button/lifecycle tests still needed separately.
