# GreptimeDB Skills

This is the GreptimeDB documentation for AI agents.

![bot](bot.jpg)

## Content

- `greptimedb-quickstart`: Entry-point guide — when to use GreptimeDB, how to install, which write protocol to choose, how to query, plus pointers to deeper docs via `llms.txt`. Start here.
- `greptimedb-pipeline`: For creating greptimedb pipeline definition
- `greptimedb-flow`: For creating greptimedb flow, continuous aggregation tasks
- `greptimedb-trigger`: For creating greptimedb trigger

The `greptimedb-quickstart` skill is also hosted at <https://docs.greptime.com/SKILL.md> (and <https://docs.greptime.cn/SKILL.md>), so any AI coding agent can load it with a single instruction:

> Read https://docs.greptime.com/SKILL.md and follow the instructions to install and configure GreptimeDB for your AI agent.

## How to install

Using `skills` cli tool to install the skill to your coding agents.

### `greptimedb-quickstart`

`npx skills add https://github.com/GreptimeTeam/docs/tree/main/skills/greptimedb-quickstart`

### `greptimedb-pipeline`

`npx skills add https://github.com/GreptimeTeam/docs/tree/main/skills/greptimedb-pipeline`

### `greptimedb-flow`

`npx skills add https://github.com/GreptimeTeam/docs/tree/main/skills/greptimedb-flow`

### `greptimedb-trigger`

`npx skills add https://github.com/GreptimeTeam/docs/tree/main/skills/greptimedb-trigger`
