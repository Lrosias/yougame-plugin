---
description: Add a YouGame leaderboard to this game
---

Add a YouGame leaderboard to the game in this project if one fits it, following the
`yougame-sdk` skill ("Which board fits the game").

A game whose runs end with a score gets the points board: add
`<script src="https://yougame.co/sdk.js"></script>` before the game code and call
`YouGame.gameOver(score, { onRestart })` when a run ends, with the SDK's overlay replacing
the game's own game-over screen. Scores are non-negative integers, higher is better.

A game against the clock gets the time board, fastest first: call
`YouGame.gameOver(elapsedMs, { onRestart })` with the run's length in milliseconds, and tell
the creator to set the leaderboard to "Time" in the game's leaderboard settings on YouGame
(`score_kind: "time"` when you fill in the listing yourself); never turn a time into points.
A head-to-head game gets no leaderboard: its board is the ranked ladder that comes with
online multiplayer (`findMatch` with `ranked: true`), shown on the game page where a
leaderboard would sit, and without online multiplayer the honest result is no board at all:
say so. Either way tell the creator to set the leaderboard to "None" in the game's
leaderboard settings (`score_kind: "none"` when you fill in the listing yourself) — a
leaderboard is optional, and no board is a normal answer. Never invent points so a game can
have a board.

Change nothing else about how the game plays.
