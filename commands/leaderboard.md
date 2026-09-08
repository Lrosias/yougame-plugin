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

Three boards, three switches. Whatever the game posts, the creator decides who sees it, on the
upload form or the game's Manage page: the everyone leaderboard (every player ranked together),
the friends leaderboard (the same scores, each signed-in player seeing only themself and their
friends), and the ranked ladder (what ranked online matches feed). Any combination is fine, and a
friends-only board is a normal choice for a game meant to be played among friends. The build is
the same either way: one `gameOver` call feeds both score boards and the ladder needs no call at
all, so never write code for a friends board. If the creator said which boards to turn on, say so
in your notes (`leaderboard`, `friends_board`, and `ladder` as booleans beside `score_kind` when
you fill in the listing yourself); otherwise leave them at their defaults, all three on.

Change nothing else about how the game plays.
