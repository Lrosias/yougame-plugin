---
description: Add YouGame races and ghost challenges to this game (speedrun categories, challenge links, a race mode in its online rooms)
---

Let players of the game in this project record a run, share it as a challenge link, and race
the ghost of anyone's run, following the `yougame-sdk` skill and the sections "Speedrun
categories and ghost challenges" and "Replays" of https://yougame.co/sdk.md.

Put `speedruns.categories` in the build's root `yougame.json`, one category per distinct
challenge (a track, a difficulty, a route). For every run: `await YouGame.speedruns.start(category)`
before the clock starts, record it with `YouGame.speedruns.createRecorder({ version, tickRate,
seed, initialState })` (normalized game inputs per simulation frame for a deterministic game,
sparse position snapshots as the input otherwise; never browser key events), and submit with
`run.submit(elapsedMs, { replay: recorder.export() })` in integer milliseconds. Only that
input recording may go to `run.submit`; a `YouGame.replay.record({ state })` recording is
refused there, so use it only as an optional watch-back recording saved with
`YouGame.replay.save`. Offer `result.shareUrl` on a Copy challenge link button. When a
challenge link opens the game (`YouGame.speedruns.getChallenge()`), select its category,
restore its seed and initial state, and draw the ghost yourself from
`YouGame.speedruns.createPlayback(ghost.replay)`; the ghost never affects the player. Show a
category picker, a result card and the category leaderboard in the game. Category runs post
only through `speedruns`, never also through `gameOver`, and they are refused while the
listing's leaderboard is off, so the listing keeps a leaderboard (points or time).

If the game already has online rooms, add a race mode beside its other modes with its own
`mode: "race"`: everyone plays the same challenge on the same seed (`room.seed` with
`YouGame.rng`), each client publishes `p_<id>: { progress, done, timeMs }` in the shared
state, and the verdict is a pure function of those entries (lowest `timeMs` among the
finished, else best progress, then seat order), so every client reports the same result. If
the game's rules run on YouGame's server instead, the server module keeps the standings and
calls `ctx.finish` itself. Change nothing else about how the game plays.
