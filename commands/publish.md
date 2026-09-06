---
description: Make this game YouGame-ready, check it, and zip it for upload (or, signed in to the YouGame MCP or with YOUGAME_API_KEY set, upload it and fill in the listing for review)
argument-hint: "[build folder, e.g. dist]"
---

Publish the game in this project on YouGame, following the `publish-to-yougame` skill.

Build folder: $1 (if that is empty, work out which folder is the built game, or build it
first, and say which one you picked).

Do all of it: make the build static and self-contained, add the leaderboard with the SDK,
run `check_build` and fix everything it reports until the verdict is `ready`, then zip the
folder's contents. If the YouGame MCP connection is signed in (get a bearer token from its
`upload_token` tool) or `YOUGAME_API_KEY` is set, upload the zip, fill in every listing field
with `prepare_submission` (skill step 6), ask me about anything you cannot decide (the
thumbnail above all), and give me the review link; I press Publish there. Do not call
`publish_game` unless I tell you to publish without reviewing. Otherwise tell me where the
zip is and what to do on the upload page.
