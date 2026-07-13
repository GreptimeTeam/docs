# GreptimeDB Skills

This is the GreptimeDB documentation for AI agents.

![bot](bot.jpg)

## Content

- `greptimedb-quickstart`: Entry-point guide — when to use GreptimeDB, how to install, which write protocol to choose, how to query, plus pointers to deeper docs via `llms.txt`. Start here.
- `greptimedb-pipeline`: For creating greptimedb pipeline definition
- `greptimedb-flow`: For creating greptimedb flow, continuous aggregation tasks
- `greptimedb-trigger`: For creating greptimedb trigger
- `self-monitoring-export`: For GreptimeDB Cluster incidents — infer the required log export time range from the user's abnormal-behavior description, then export complete cluster self-monitoring logs and relevant monitoring metrics for engineering investigation
- `greptimedb-performance-diagnosis`: For diagnosing a performance problem — find the bottleneck behind a slow query, lagging/stalled ingestion, or high CPU/memory, then hand off to a fix skill
- `greptimedb-performance-tuning`: For tuning server config and table options — cache sizing, write buffer, WAL, and ingestion throughput
- `greptimedb-table-design`: For designing a table schema for performance, or improving an existing one — primary key, indexes, append-only/merge mode, and partitioning
- `greptimedb-cluster-health-check`: For verifying a deployment is healthy after a deploy/restart — pod readiness, object-store smoke test, error logs, and key metrics

The `greptimedb-quickstart` skill is also hosted at <https://docs.greptime.com/SKILL.md> (and <https://docs.greptime.cn/SKILL.md>), so any AI coding agent can load it with a single instruction:

> Read https://docs.greptime.com/SKILL.md and follow the instructions to use GreptimeDB with your AI agent — deploy, configure, ingest, and query.

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

### `self-monitoring-export`

[![asciicast](https://asciinema.org/a/N59fXqonAiRYMk4L.svg)](https://asciinema.org/a/N59fXqonAiRYMk4L)

`npx skills add https://github.com/GreptimeTeam/docs/tree/main/skills/self-monitoring-export`

### `greptimedb-performance-diagnosis`

`npx skills add https://github.com/GreptimeTeam/docs/tree/main/skills/greptimedb-performance-diagnosis`

### `greptimedb-performance-tuning`

`npx skills add https://github.com/GreptimeTeam/docs/tree/main/skills/greptimedb-performance-tuning`

### `greptimedb-table-design`

`npx skills add https://github.com/GreptimeTeam/docs/tree/main/skills/greptimedb-table-design`

### `greptimedb-cluster-health-check`

`npx skills add https://github.com/GreptimeTeam/docs/tree/main/skills/greptimedb-cluster-health-check`
