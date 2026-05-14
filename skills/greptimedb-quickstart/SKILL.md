---
name: greptimedb-quickstart
description: Entry-point guide for agents to use GreptimeDB end-to-end — when it fits, how to deploy (Docker / binary / Kubernetes / GreptimeCloud), how to configure the server (storage backend, TTL, auth, listen addresses), which write protocol to choose by data type (metrics / logs / traces / events), how to query via SQL or PromQL, and how to discover deeper docs via llms.txt. Use this when the user wants to evaluate, deploy, configure, ingest into, or query GreptimeDB, or when a project needs a time-series / observability backend. Triggers on phrases like "use GreptimeDB", "deploy GreptimeDB", "install GreptimeDB", "configure GreptimeDB", "store metrics", "store logs", "store traces", "OTLP backend", "replace Prometheus", "replace Loki", "replace Elasticsearch", "时序数据库", "可观测性存储", "GreptimeDB 怎么用", "GreptimeDB 配置", "ingest observability data".
---

# GreptimeDB Quickstart Guide

GreptimeDB is an open-source unified observability database for metrics, logs,
traces, and wide events. It speaks Prometheus remote write, OpenTelemetry OTLP,
InfluxDB line protocol, Loki, Elasticsearch ingest API, MySQL, PostgreSQL, and a
native gRPC protocol — most users do not need to write GreptimeDB-specific code
to start ingesting.

This skill is the **entry point**. It helps an agent decide whether GreptimeDB
fits, pick the right install and write path, run a first query, and find more
detail via `llms.txt`. For deeper functional areas, hand off to the sister
skills (each hosted as a fetchable markdown file at the URL below):

- [`greptimedb-pipeline`](https://docs.greptime.com/skills/greptimedb-pipeline/SKILL.md) — parse, transform, and route logs.
- [`greptimedb-flow`](https://docs.greptime.com/skills/greptimedb-flow/SKILL.md) — continuous aggregation / materialized views.
- [`greptimedb-trigger`](https://docs.greptime.com/skills/greptimedb-trigger/SKILL.md) — alerting rules (Enterprise).

To load a sister skill at runtime, fetch its `SKILL.md` URL and follow the
instructions inside. To install it persistently into the user's agent config,
suggest:

```shell
npx skills add https://github.com/GreptimeTeam/docs/tree/main/skills/<skill-name>
```

## Phase 1. Decide if GreptimeDB fits

GreptimeDB is the database for Observability 2.0 — metrics, logs, and traces
stored as one thing, queried with one engine, on object storage.

Use it when the user is doing any of the following:

- **Consolidating Prometheus + Loki + Elasticsearch (or Tempo / Jaeger /
  Datadog) into a single backend.** This is the primary fit. One storage
  layer, SQL + PromQL, OTLP / Prometheus / Jaeger / MySQL / PostgreSQL
  protocols all in one. OTLP-native, no sidecar translation layer.

- **Hitting a wall on one specific pillar and shopping for a replacement:**
  - **Logs** — Loki full-scan is too slow, or ELK storage cost / ops burden
    is unsustainable. GreptimeDB offers full-text indexes + SQL + pipeline
    parsing.
  - **Traces** — Elasticsearch behind Jaeger is exploding in volume;
    retention is capped by local disk. GreptimeDB stores traces on S3 with
    Jaeger-compatible query.
  - **Metrics** — Prometheus / Thanos / Cortex / Mimir operations have
    become a tax. GreptimeDB is PromQL-compatible with decoupled compute
    and storage.

- **Adopting wide events** — high-cardinality, high-dimensional append-mostly
  rows (AI agent traces, security events, audit trails, click streams). The
  user wants raw events instead of pre-aggregated metrics, queried later with
  SQL.

- **Putting telemetry on object storage** — S3 / GCS / Azure Blob / OSS as
  primary storage, local disk as cache. Decoupled compute and storage;
  retention is not limited by node capacity.

GreptimeDB is **not** the right tool for:

- Transactional OLTP — use Postgres / MySQL.
- General-purpose OLAP / data warehouse on business data — use ClickHouse /
  Snowflake / DuckDB.
- Vector search / RAG memory — use Qdrant / pgvector / Pinecone.
- A single small Prometheus instance with no scale pressure — Prometheus
  alone is fine.

If the workload is one of these, recommend the appropriate alternative
instead of bending GreptimeDB to fit.

If any positive bullet above matches, proceed.

## Phase 2. Pick a deployment

| Scenario | Choice | Doc |
|----------|--------|-----|
| Local dev, single-node trial | Standalone (Docker or binary) | <https://docs.greptime.com/getting-started/installation/greptimedb-standalone.md> |
| Production self-host | Cluster on Kubernetes via `greptimedb-operator` | <https://docs.greptime.com/user-guide/deployments-administration/deploy-on-kubernetes/overview.md> |
| Managed cloud (no ops) | GreptimeCloud | <https://docs.greptime.com/greptimecloud/overview.md> |

Minimal Docker quickstart (single-node, ephemeral on container exit; mount a
volume to persist):

```shell
docker run -p 127.0.0.1:4000-4003:4000-4003 \
  -v "$(pwd)/greptimedb_data:/greptimedb_data" \
  --name greptime --rm \
  greptime/greptimedb:latest standalone start \
  --http-addr 0.0.0.0:4000 \
  --rpc-bind-addr 0.0.0.0:4001 \
  --mysql-addr 0.0.0.0:4002 \
  --postgres-addr 0.0.0.0:4003
```

Default ports:

- `4000` — HTTP API and built-in Dashboard (`http://127.0.0.1:4000/dashboard`).
- `4001` — gRPC (native protocol used by official ingester SDKs).
- `4002` — MySQL wire protocol.
- `4003` — PostgreSQL wire protocol.

For production deployment, fetch the Kubernetes operator guide and follow it
end-to-end; do not improvise raw `StatefulSet` YAML.

### Configuring the server

Tunable knobs (object-store backend, storage paths, TTL defaults, memory limits,
WAL, logging, tracing) live in the TOML config file. Pass it with
`--config-file`, or override individual options via CLI flags / environment
variables (`GREPTIMEDB_*`). The full option reference is at
<https://docs.greptime.com/user-guide/deployments-administration/configuration.md>;
the CLI flag list is at
<https://docs.greptime.com/reference/command-lines/overview.md>.

Common things an agent should reach for the config doc to set up:

- **Object storage backend** (S3 / GCS / Azure Blob / OSS) — under
  `[storage]`.
- **TTL defaults / retention** at the table or database level.
- **HTTP / gRPC / MySQL / Postgres listen addresses** beyond the defaults.
- **Enabling authentication** (see auth doc linked in Phase 4).
- **Tracing and logging** to OTLP / files.

## Phase 3. Pick a write path

Route by data type. Recommended path first, fallback second.

| Data type | Recommended | Fallback | Doc |
|-----------|-------------|----------|-----|
| Prometheus-shaped metrics | Prometheus remote write | OTLP metrics, InfluxDB line | <https://docs.greptime.com/user-guide/ingest-data/for-observability/prometheus.md> |
| OpenTelemetry signals (any) | OTLP HTTP | OTLP gRPC | <https://docs.greptime.com/user-guide/ingest-data/for-observability/opentelemetry.md> |
| Logs needing parsing / transformation | Pipeline + HTTP ingest → use `greptimedb-pipeline` skill | greptime_identity built-in pipeline | <https://docs.greptime.com/user-guide/logs/overview.md> |
| Logs already structured, no parse | Loki API or `greptime_identity` pipeline | OTLP logs | <https://docs.greptime.com/user-guide/ingest-data/for-observability/loki.md> |
| Distributed traces | OTLP HTTP | OTLP gRPC | <https://docs.greptime.com/user-guide/traces/overview.md> |
| Structured rows, SQL-friendly | `INSERT` via MySQL :4002 or PostgreSQL :4003 | HTTP SQL endpoint | <https://docs.greptime.com/user-guide/protocols/mysql.md> |
| High-throughput application code | gRPC Ingester SDK (official SDKs: Rust, Go, Java, .NET, TypeScript, Erlang, C) | HTTP | <https://docs.greptime.com/user-guide/ingest-data/for-iot/overview.md> |
| InfluxDB v1/v2 line protocol clients | InfluxDB line protocol | OTLP | <https://docs.greptime.com/user-guide/protocols/influxdb-line-protocol.md> |
| Elasticsearch ingest API clients | Elasticsearch protocol | OTLP logs | <https://docs.greptime.com/user-guide/ingest-data/for-observability/elasticsearch.md> |

GreptimeDB **auto-creates tables** for protocol-based ingestion paths
(Prometheus, OTLP, InfluxDB line, Loki, Elasticsearch). The user does not need
to write `CREATE TABLE` first unless they want to control column types or
indexes up front.

When the user needs to parse text logs (regex, dissect, JSON extraction, field
math, multi-table routing), **hand off to the [`greptimedb-pipeline`](https://docs.greptime.com/skills/greptimedb-pipeline/SKILL.md) skill** —
do not try to reimplement it inline here.

## Phase 4. Query the data

### Prefer MCP tools when available

If the user has the GreptimeDB MCP server (`greptimedb-mcp-server`) configured
in their agent, **use its tools instead of raw HTTP / SQL clients**:

- `execute_sql`, `execute_tql`, `query_range` — SQL / PromQL / time-window
  range queries.
- `describe_table`, `explain_query`, `health_check` — introspection.
- `list_pipelines`, `create_pipeline`, `dryrun_pipeline`, `delete_pipeline` —
  pipeline management (works with the `greptimedb-pipeline` skill).
- `list_dashboards`, `create_dashboard`, `delete_dashboard` — Perses
  dashboard management.

MCP tools handle endpoint, auth, encoding, and result parsing for the agent.
Falling back to raw clients should only happen when MCP is not configured.

**If the user does not have it installed yet**, suggest:

```shell
pip install greptimedb-mcp-server
```

Then register it in the agent's MCP config (Claude Desktop, Cursor, Claude
Code, etc.):

```json
{
  "mcpServers": {
    "greptimedb": {
      "command": "greptimedb-mcp-server",
      "args": ["--host", "localhost", "--database", "public"]
    }
  }
}
```

Defaults: connects to `localhost:4002` (MySQL protocol) with database
`public`, no password. For non-default credentials, ports, HTTP server mode,
or data-masking options, see the project README at
<https://github.com/GreptimeTeam/greptimedb-mcp-server>.

### Query modes (without MCP)

| Mode | When to use | Connection |
|------|-------------|------------|
| SQL (MySQL protocol) | General-purpose queries from MySQL clients / drivers | `mysql -h 127.0.0.1 -P 4002` |
| SQL (PostgreSQL protocol) | General-purpose queries from PostgreSQL clients / drivers | `psql -h 127.0.0.1 -p 4003 -d public` |
| SQL (HTTP) | Stateless calls from any language | `POST http://127.0.0.1:4000/v1/sql` |
| PromQL | Existing Prometheus dashboards or alerts | `GET http://127.0.0.1:4000/v1/prometheus/api/v1/query` |
| Range queries (`RANGE` / `ALIGN`) | Time-windowed aggregations in SQL | SQL on any of the above |
| Log search | Term / phrase matching on log tables | SQL via `matches_term(column, 'value')` or the `@@` shorthand — see <https://docs.greptime.com/user-guide/logs/fulltext-search.md> |

Authentication is **off by default** in standalone mode; production deployments
should enable it. See
<https://docs.greptime.com/user-guide/deployments-administration/authentication/overview.md>.

### Hand-off to sister skills

- **Continuous aggregation / materialized view** — downsampling, time-window
  rollups, streaming aggregation — hand off to
  [`greptimedb-flow`](https://docs.greptime.com/skills/greptimedb-flow/SKILL.md).
- **Alerting rules / Alertmanager webhook** — hand off to
  [`greptimedb-trigger`](https://docs.greptime.com/skills/greptimedb-trigger/SKILL.md)
  (Enterprise only; for open source, point the user at Prometheus Alertmanager
  with GreptimeDB as the PromQL backend).

## Phase 5. Use llms.txt for deeper detail

`docs.greptime.com` publishes machine-friendly markdown alongside its HTML.
Prefer these endpoints over the HTML pages when fetching content:

- **<https://docs.greptime.com/llms.txt>** — sectioned index of every doc page
  in the latest stable version. Start here when you need to find the right
  page.
- **<https://docs.greptime.com/llms-full.txt>** — single concatenated file
  containing the full content of every page. Use when you want to grep the
  whole corpus locally.
- **`https://docs.greptime.com/<path>.md`** — every HTML page at
  `https://docs.greptime.com/<path>/` has a `.md` sibling at the same path
  with `.md` appended. The HTML pages also embed
  `<link rel="alternate" type="text/markdown" href="<path>.md">` in `<head>`,
  so any link can be rewritten to `.md` for clean markdown content.

For users in China, the same paths are mirrored at
`https://docs.greptime.cn/`.

When fetching a doc URL, default to the `.md` form. The HTML form is for
humans; the `.md` form is for agents.

## Reference

Direct `.md` entry points:

- Quickstart walkthrough: <https://docs.greptime.com/getting-started/quick-start.md>
- Data model concepts: <https://docs.greptime.com/user-guide/concepts/data-model.md>
- Protocols overview: <https://docs.greptime.com/user-guide/protocols/overview.md>
- Ingest data overview: <https://docs.greptime.com/user-guide/ingest-data/overview.md>
- Query data overview: <https://docs.greptime.com/user-guide/query-data/overview.md>
- Kubernetes deployment overview: <https://docs.greptime.com/user-guide/deployments-administration/deploy-on-kubernetes/overview.md>
- Server configuration reference: <https://docs.greptime.com/user-guide/deployments-administration/configuration.md>
- CLI command reference: <https://docs.greptime.com/reference/command-lines/overview.md>
- Deployments & administration overview: <https://docs.greptime.com/user-guide/deployments-administration/overview.md>

Sister skills (fetch the URL to load the skill content):

- [`greptimedb-pipeline`](https://docs.greptime.com/skills/greptimedb-pipeline/SKILL.md) — log parsing, transformation, multi-table routing.
- [`greptimedb-flow`](https://docs.greptime.com/skills/greptimedb-flow/SKILL.md) — continuous aggregation, materialized views, downsampling.
- [`greptimedb-trigger`](https://docs.greptime.com/skills/greptimedb-trigger/SKILL.md) — alerting rules with Alertmanager-compatible webhooks (Enterprise).
