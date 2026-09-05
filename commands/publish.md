---
description: Make this game YouGame-ready, check it, and zip it for upload
argument-hint: "[build folder, e.g. dist]"
---

Publish the game in this project on YouGame, following the `publish-to-yougame` skill.

Build folder: $1 (if that is empty, work out which folder is the built game, or build it
first, and say which one you picked).

Do all of it: make the build static and self-contained, add the leaderboard with the SDK,
run `check_build` and fix everything it reports until the verdict is `ready`, then zip the
folder's contents and tell me where the zip is and what to do on the upload page.
