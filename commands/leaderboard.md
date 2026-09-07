---
description: Add a YouGame leaderboard to this game
---

Add a YouGame leaderboard to the game in this project if one fits it, following the
`yougame-sdk` skill ("Which board fits the game").

A game whose runs end with a score gets the points board: add
`<script src="https://yougame.co/sdk.js"></script>` before the game code and call
`YouGame.gameOver(score, { onRestart })` when a run ends, with the SDK's overlay replacing
the game's own game-over screen. Scores are non-negative integers, higher is better.

A game against the clock ranks by time, which the board cannot show yet: keep its own
results screen and say so. A head-to-head game gets no leaderboard: its board is the ranked
ladder that comes with online multiplayer (`findMatch` with `ranked: true`), and without
online multiplayer the honest result is no board at all: say so. Never invent points so a
game can have a board.

Change nothing else about how the game plays.
