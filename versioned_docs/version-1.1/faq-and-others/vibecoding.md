---
keywords: [Coding Agent, Vibe Coding, MCP, Skills, llms.txt, AI Agent]
description: Resources for using GreptimeDB with AI coding agents — MCP Server, Skills, machine-readable docs, and the one-line SKILL.md entry point
---

import AgentOnboarding from '@site/src/components/AgentOnboarding';

# For AI Agents

GreptimeDB is built to work with AI coding agents. An agent can deploy,
configure, ingest, and query GreptimeDB on its own through standard protocols
(OTLP, Prometheus, MySQL/PostgreSQL, SQL/PromQL), and the resources below help it
do that reliably.

## Quickest start: one instruction

The entry-point quickstart guide is hosted as a fetchable markdown file. Give
your agent the prompt below and it takes it from there — fetching the guide at
runtime, deciding whether GreptimeDB fits, picking the right install and write
path, and navigating the docs via `llms.txt`. No installation required.

<AgentOnboarding />

## GreptimeDB MCP Server

The [GreptimeDB MCP Server](../user-guide/integrations/mcp.md) implements the
Model Context Protocol, so agents can securely explore and analyze your
databases — list tables, read data, and run SQL, TQL (PromQL-compatible), and
range queries. It enforces read-only access and supports data masking, and ships
with built-in scenario templates for metrics, trace, and PromQL analysis, IoT
monitoring, table operations, and log pipeline creation.

```shell
pip install greptimedb-mcp-server
```

See the [greptimedb-mcp-server](https://github.com/GreptimeTeam/greptimedb-mcp-server)
repo for transports (stdio, SSE, Streamable HTTP) and configuration.

## Table semantic layer

Tables can carry a [semantic layer](../user-guide/concepts/semantic-layer.md) of
`greptime.semantic.*` metadata recording what observability concept each one
represents — signal type, source, metric type, unit, and more. An agent queries
`information_schema.table_semantics` to understand your tables without inferring
meaning from column names; the MCP Server's `describe_table` surfaces the same
metadata. GreptimeDB stamps it automatically on OTLP and Prometheus ingestion,
and you can set it yourself with `CREATE TABLE ... WITH (...)`.

## GreptimeDB Skills

GreptimeDB already speaks open standards that most coding agents know. For our
own features — pipelines, flows, triggers — a Skill teaches the agent the
complete workflow and gives it the best results. Skills tell the agent *what* to
do; the MCP Server provides the tools to *execute* it (for example, the pipeline
skill uses `dryrun_pipeline` to verify a config before applying it).

- **`greptimedb-quickstart`** — the entry point. When to use GreptimeDB, how to
  install, which write protocol to choose, how to query, plus pointers to deeper
  docs. Start here.
- **`greptimedb-pipeline`** — parse, transform, and route logs (Learn → Create →
  Verify → Refine).
- **`greptimedb-flow`** — continuous aggregation and materialized views.
- **`greptimedb-trigger`** — alerting rules, including converting Prometheus
  alert rules to `CREATE TRIGGER` (Enterprise).
- **`self-monitoring-export`** — for cluster incidents: infer the log export
  time range from the user's description, then export cluster self-monitoring
  logs and metrics for investigation.

Skills follow the [Agent Skills](https://agentskills.io/) open standard, so they
work with Claude Code, OpenAI Codex CLI, GitHub Copilot, Cursor, and others.
Every Skill is also hosted as a fetchable markdown file at
`https://docs.greptime.com/skills/<skill-name>/SKILL.md` (for example,
[`greptimedb-pipeline`](https://docs.greptime.com/skills/greptimedb-pipeline/SKILL.md)),
so an agent can load one at runtime without installing anything.

To install a Skill persistently into your agent's config, use the `skills` CLI:

```shell
npx skills add https://github.com/GreptimeTeam/docs/tree/main/skills/greptimedb-quickstart
```

See the [skills](https://github.com/GreptimeTeam/docs/tree/main/skills) repo for
the full list and install commands.

## Machine-readable docs

The whole documentation site is built to be consumed by agents, following the
[llmstxt.org](https://llmstxt.org) standard:

- [`llms.txt`](https://docs.greptime.com/llms.txt) — a structured index linking
  every documentation section with a short description. Point an agent at it to
  find the right page without crawling the site.
- [`llms-full.txt`](https://docs.greptime.com/llms-full.txt) — the entire
  documentation concatenated into one file, for loading the full corpus at once.
- **Any page as markdown** — append `.md` to any documentation URL to get the
  raw markdown of that page (for example,
  [`/user-guide/integrations/mcp.md`](https://docs.greptime.com/user-guide/integrations/mcp.md)).

For ad-hoc questions, the **Ask AI** assistant on
[docs.greptime.com](https://docs.greptime.com/) answers in plain language,
grounded in the official documentation.

## References

- [What GreptimeDB is doing for AI agents](https://greptime.com/blogs/2026-04-08-greptimedb-agent-friendly-infrastructure)
