# YouGame for coding agents

[YouGame](https://yougame.co) hosts browser games. You upload a static build; it is live on
its own origin with a leaderboard, a player, and a listing. No review queue, no build step.

This repo is the plugin that teaches your coding agent to get a game onto YouGame: make it
static and self-contained, add the leaderboard, run the same pre-upload checks the upload
page runs, and hand you a zip that is ready to drop — or, with an API key from your
account, upload it, fill in the whole listing, and hand you a review link where you press
Publish.

## Claude Code

```bash
claude plugin marketplace add Lrosias/yougame-plugin
claude plugin install yougame@yougame
```

Or from inside a session: `/plugin marketplace add Lrosias/yougame-plugin` then
`/plugin install yougame@yougame`. That is the whole setup — the plugin brings the MCP
server with it, and there is nothing to sign up for.

Then, in the project that holds your game:

```
/yougame:publish dist
```

Other commands: `/yougame:check` (just the checks), `/yougame:leaderboard`,
`/yougame:phones`, `/yougame:multiplayer`. The two skills — `publish-to-yougame` and
`yougame-sdk` — also fire on their own when you say what you want ("get this game on
YouGame", "add a leaderboard").

## Codex, Cursor, Windsurf, and everything else that speaks MCP

There is no plugin to install: point the client at the same MCP server.

```bash
codex mcp add yougame --url https://yougame.co/mcp
```

```json
{ "mcpServers": { "yougame": { "url": "https://yougame.co/mcp" } } }
```

Then ask for the `make_yougame_ready` prompt, or paste the prompt from
https://yougame.co/publish.md. Codex users can also drop [AGENTS.md](AGENTS.md) into a
project to get the same workflow without asking for it.

## ChatGPT

- **Custom connector** (Settings → Developer mode → add an MCP server): the same URL,
  `https://yougame.co/mcp`. It answers `search` and `fetch` as well as the YouGame tools.
- **Custom GPT**: under Actions, *Import from URL* → `https://yougame.co/openapi.json`. The
  GPT can then read the guide and the SDK reference and run the pre-upload checks.

## What the MCP server gives an agent

| | |
|---|---|
| `get_publish_guide` | The build contract: what runs here, what breaks, how to verify it. |
| `get_sdk_reference` | Leaderboards, phone support, online multiplayer, ratings, coins. |
| `check_build` | The upload page's checks over a folder: `ready`, `risky`, or `broken`, with the reasons. |
| `search` / `fetch` | One answer out of the docs instead of 40 KB of markdown. |
| `prepare_submission` / `my_games` | With your API key: fill in the whole listing of a staged build (zip posted to `/api/agent/upload`) and get the review link; list your games. |
| `publish_game` / `update_game` | `publish_game` skips the review and refuses unless you explicitly told the agent to publish without reviewing; `update_game` ships a new build of a game that is already up. |
| Prompts | `make_yougame_ready` and `publish_to_yougame` (one prompt built from what the creator wants: `leaderboard`, `multiplayer`, `phones` yes/no, and the `paywalls` rows), plus `add_leaderboard`, `add_paywalls`, `make_playable_on_phones`, `add_multiplayer` for a game that is already up. |

Reading and checking is public: no account, no token, no key. Publishing is yours: either
drop the zip at https://yougame.co/upload, or make an API key at
https://yougame.co/account (Coding agents), `export YOUGAME_API_KEY=yg_…`, and the plugin's
MCP connection carries it so `/yougame:publish` finishes with a review link: every field
filled in, and the Publish button yours.

## What is in here

```
.claude-plugin/   plugin.json and the one-plugin marketplace manifest
.mcp.json         the YouGame MCP server, connected when the plugin is enabled
skills/           publish-to-yougame, yougame-sdk
commands/         /yougame:publish, :check, :leaderboard, :phones, :multiplayer
scripts/          zip-build.sh — zips the folder's contents the way the upload page wants
```

Docs, prompts and checks all live on the server, so the plugin stays current without an
update: https://yougame.co/publish.md, https://yougame.co/sdk.md, https://yougame.co/plugin.

MIT licensed. Issues and pull requests welcome.
