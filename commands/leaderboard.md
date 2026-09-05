---
description: Add a YouGame leaderboard to this game
---

Add a YouGame leaderboard to the game in this project, following the `yougame-sdk` skill.

Add `<script src="https://yougame.co/sdk.js"></script>` before the game code and call
`YouGame.gameOver(score, { onRestart })` when a run ends, with the SDK's overlay replacing
the game's own game-over screen. Scores are non-negative integers, higher is better.
Change nothing else about how the game plays.
