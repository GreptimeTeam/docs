# Query Access Guide

Use MCP and GreptimeDB HTTP SQL as peer query access methods for discovery, analysis, and validation. MCP is not required when a reachable self-monitoring HTTP endpoint is available.

The data source for this skill is the GreptimeDB Cluster self-monitoring instance — typically a GreptimeDB Standalone instance — that stores logs and metrics for the GreptimeDB cluster being investigated. A business or production GreptimeDB endpoint is the cluster being investigated, not the default log export source, unless that endpoint is also the self-monitoring instance.

Query access is separate from export method:

- **Query access** locates incident windows, checks schemas, estimates rows, validates counts, and discovers optional metrics.
- **Export method** writes the final data files through the GreptimeDB HTTP port or confirmed `COPY TO` modes.

## Choose a query access method

Prefer the first available connection to the self-monitoring instance, but do not treat MCP as mandatory:

1. **GreptimeDB MCP** — read-only analysis queries only.
2. **GreptimeDB HTTP port** — recommended when reachable because it supports read-only discovery, validation queries, and local export through `/v1/sql`.
3. **SQL client** — user- or agent-executed fallback when HTTP and MCP are unavailable.

Before querying, identify which endpoint belongs to the self-monitoring instance. In GreptimeDB Operator deployments, this is usually a GreptimeDB Standalone service such as `${cluster}-monitor-standalone`, and it stores logs and metrics for the GreptimeDB cluster being investigated. If the user provides a business or production cluster endpoint, explain that it is the monitored system, not the default log export data source. Check whether `public._gt_logs` exists before relying on the connection.

## HTTP SQL helper

Use [`../scripts/http_sql_query.sh`](../scripts/http_sql_query.sh) for small discovery and validation queries:

```bash
scripts/http_sql_query.sh \
  --url "http://<host>:4000" \
  --db "public" \
  --format "csvWithNames" \
  --sql "SELECT date_trunc('minute', timestamp) AS minute, level, count(*) AS cnt FROM public._gt_logs WHERE timestamp >= '<start_utc>' AND timestamp < '<end_utc>' GROUP BY minute, level ORDER BY minute, level LIMIT 1000" \
  --output "discovery/log_level_timeline.csv"
```

The script sends one read-only SQL statement as `application/x-www-form-urlencoded` POST data to `/v1/sql`, sets `X-Greptime-Timezone: UTC`, saves response headers, and does not set an HTTP timeout header.

Use `AUTH_HEADER` for credentials:

```bash
AUTH_HEADER="Basic <base64-user-password>" scripts/http_sql_query.sh ...
```

Never write credentials into generated artifact files.

## Recommended formats

- `csvWithNames`: best default for discovery artifacts saved under `discovery/`.
- `table`: best for quick terminal inspection.
- `greptimedb_v1`: useful when another tool expects GreptimeDB JSON.
- `arrow`: reserve for bulk export through the HTTP port export script [`../scripts/http_arrow_export.sh`](../scripts/http_arrow_export.sh), not routine discovery.

Keep HTTP SQL discovery queries small. Use aggregates, narrow time ranges, and `LIMIT` where possible. For verification runs, choose the smallest time window that proves the path works.

## Artifact placement

HTTP SQL command records belong in `commands/run_http_discovery.sh` or concrete SQL files such as `commands/discovery.sql`. The wrapper should call the canonical helper from the installed skill `scripts/` directory instead of duplicating it. Query outputs belong in `discovery/` or `metadata/` for analysis and in `commands/validate_rows.sql` for validation SQL. Do not place query outputs in `logs/`; `logs/` is reserved for exported log data.
