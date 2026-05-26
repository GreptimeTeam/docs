# MCP Query Access Guide

Use GreptimeDB MCP as one peer query access method for analysis and incident time-window discovery when it is connected to the self-monitoring GreptimeDB instance that stores logs and metrics for the GreptimeDB cluster being investigated. If MCP is unavailable, use GreptimeDB HTTP SQL or a SQL client instead.

Never run `COPY`, `COPY TO`, or any export-writing command through MCP. MCP is for read-only analysis queries only, not final data export.

For actual durable data export, use GreptimeDB HTTP port export or one of the three supported `COPY TO` modes through a non-MCP SQL/HTTP connection, or generate a user-executed script.

MCP is appropriate for:

- schema inspection
- lightweight aggregations
- description-driven incident window discovery using [`signal-index.md`](signal-index.md) and targeted SQL
- identifying critical windows and possibly useful context windows

MCP is not enough when:

- the result is truncated by tool limits
- the query response is too large for the agent runtime
- the export needs a durable artifact outside the chat/tool output
- the user needs Parquet, Arrow files, or server-side files
- the export would require `COPY`, `COPY TO`, or writing files from the database

Do not offer MCP result download as a user-facing final export choice. Use MCP, HTTP SQL, or a SQL client to decide windows and counts, then choose one supported export method.

Example complete log query:

```sql
SELECT *
FROM _gt_logs
WHERE timestamp >= '<export_start_utc>'
  AND timestamp < '<export_end_utc>'
ORDER BY timestamp;
```

Never use MCP output that only shows a preview, limit, top rows, sampled rows, or aggregated rows as the final incident log export.

Never execute examples like this through MCP:

```sql
COPY (SELECT * FROM _gt_logs WHERE ...) TO '...'
```

For final export, use HTTP port export or SQL `COPY TO` through non-MCP SQL/HTTP access, or generate a user-executed script.
