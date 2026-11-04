---
keywords: [MCP, Model Context Protocol, AI assistant, Claude, database integration, semantic layer, TQL, pipeline]
description: Learn how to integrate GreptimeDB with Model Context Protocol (MCP) for AI assistants to explore and analyze your metrics, logs, and traces.
---

# Model Context Protocol (MCP)

:::warning Experimental Feature
The GreptimeDB MCP Server is currently in experimental stage and under active development. APIs and features may change without notice. Please use with caution in production environments.
:::

The [GreptimeDB MCP Server](https://github.com/GreptimeTeam/greptimedb-mcp-server) provides a Model Context Protocol implementation that enables AI assistants like Claude to securely query and analyze your GreptimeDB databases using SQL, TQL (PromQL-compatible), and RANGE queries — with a read-only SQL gate and data masking built in.

Watch our [demo video on YouTube](https://www.youtube.com/watch?v=EBTc46yamFI) to see the MCP Server in action.

## What is MCP?

Model Context Protocol (MCP) is a standard protocol that lets AI assistants interact with external data sources and tools. With the GreptimeDB MCP Server, an assistant can explore your tables, understand what each one represents through the [semantic layer](/user-guide/concepts/semantic-layer.md), run queries, and manage pipelines and dashboards.

## Tools

The following tools are available in server v0.6.1.

### Query and inspection

| Tool | Description |
| --- | --- |
| `execute_sql` | Execute a SQL query (MySQL dialect). `format` is `csv` (default), `json`, or `markdown`; `limit` defaults to `1000` rows and is clamped to `1`–`10000`. |
| `execute_tql` | Execute a TQL (PromQL-compatible) query with `query`, `start`, `end`, `step`, and an optional `lookback` (default `5m`). Returns at most 10000 rows. |
| `query_range` | Execute a time-window aggregation query with RANGE/ALIGN syntax. `table`, `select`, and `align` are required; `by`, `where`, `fill`, and `order_by` are optional. |
| `search_table_semantics` | Find tables by observability concept, such as `redis memory usage`. Searches table names, semantic options, and entity declarations in one database, and ranks tables by matched terms. Optional `signal_type`, `schema`, and `limit` (default and maximum `50`). |
| `query_semantic_graph` | Query the [semantic graph](/user-guide/semantic-layer/semantic-graph.md). `view` is `summary`, `entities`, or `relationships`; `start_time` and `end_time` (RFC 3339) define a required half-open window. Entity and relationship filters are optional; `limit` defaults to `100` (maximum `500`). |
| `describe_table` | Inspect a table profile: schema, semantic metadata, sample rows (default `5`, maximum `20`), and query guidance. |
| `explain_query` | Show the execution plan of a SQL query or a `TQL EVAL` statement. `analyze=true` executes the query and reports runtime metrics; `verbose=true` adds per-partition scan metrics. |
| `health_check` | Check database connection status and server version. |

`execute_sql`, `query_range`, and `describe_table` accept `schema.table` to read another database. `execute_tql` reads another database with the `__schema__` matcher, for example `metric{__schema__="other_db"}`. The connected user needs read permission on that database.

`describe_table` and `search_table_semantics` read the [table semantics](/user-guide/semantic-layer/table-semantics.md), so the assistant learns the signal type, source, and metric metadata of a table instead of guessing from column names. `search_table_semantics` returns only tables that carry `greptime.semantic.*` options or receive entity declarations from a built-in convention. Entity declarations require GreptimeDB v1.3 or later. `query_semantic_graph` reads `greptime_private.semantic_entities` and `greptime_private.semantic_relationships`, which also require v1.3 or later. If these views are missing or not readable by the connected user at startup, the server does not offer `query_semantic_graph`.

Tool results are limited to `GREPTIMEDB_MAX_RESULT_BYTES` (1 MiB by default). A larger query result returns fewer rows and reports the truncation.

### Pipeline management

| Tool | Description |
| --- | --- |
| `list_pipelines` | List all pipelines or get details of a specific pipeline. |
| `create_pipeline` | Create a new pipeline version with YAML configuration. Requires [write mode](#write-mode). |
| `dryrun_pipeline` | Test an inline or saved pipeline with sample data without writing to the database. |
| `delete_pipeline` | Delete a specific version of a pipeline. Requires [write mode](#write-mode). |

### Dashboard management

| Tool | Description |
| --- | --- |
| `list_dashboards` | List all Perses dashboard definitions. |
| `create_dashboard` | Create or overwrite a Perses dashboard definition. Requires [write mode](#write-mode). |
| `delete_dashboard` | Delete a dashboard definition. Requires [write mode](#write-mode). |

### Resources and prompts

Tables can be read as resources through `greptime://<table>/data` URIs, which return up to 100 rows.

The server also ships built-in Jinja prompt templates: `pipeline_creator`, `log_pipeline`, `metrics_analysis`, `promql_analysis`, `trace_analysis`, `table_operation`, `schema_design_advisor`, `observability_correlation`, `ingestion_troubleshooting`, and `query_performance_tuning`.

## Installation

The server requires Python 3.11 or later.

```bash
pip install greptimedb-mcp-server
```

Run it directly (connects to `localhost:4002` by default):

```bash
greptimedb-mcp-server --host localhost --database public
```

## Configuration

The server is configured through environment variables or CLI arguments.

| Environment variable | CLI argument | Default | Description |
| --- | --- | --- | --- |
| `GREPTIMEDB_HOST` | `--host` | `localhost` | Database host. |
| `GREPTIMEDB_PORT` | `--port` | `4002` | MySQL protocol port. |
| `GREPTIMEDB_USER` | `--user` | Empty | Database user. |
| `GREPTIMEDB_PASSWORD` | `--password` | Empty | Database password. |
| `GREPTIMEDB_DATABASE` | `--database` | `public` | Database name. |
| `GREPTIMEDB_TIMEZONE` | `--timezone` | Empty | Session timezone. |
| `GREPTIMEDB_POOL_SIZE` | `--pool-size` | `5` | Connection pool size. |
| `GREPTIMEDB_HTTP_PORT` | `--http-port` | `4000` | HTTP API port, used by the pipeline and dashboard tools. |
| `GREPTIMEDB_HTTP_PROTOCOL` | `--http-protocol` | `http` | HTTP API protocol: `http` or `https`. |
| `GREPTIMEDB_MASK_ENABLED` | `--mask-enabled` | `true` | Mask sensitive columns. |
| `GREPTIMEDB_MASK_PATTERNS` | `--mask-patterns` | Empty | Additional sensitive column name patterns, comma-separated. |
| `GREPTIMEDB_AUDIT_ENABLED` | `--audit-enabled` | `true` | Log every tool invocation. |
| `GREPTIMEDB_ALLOW_WRITE` | `--allow-write` | `false` | Allow DDL/DML through `execute_sql` and the pipeline and dashboard write tools. See [Write mode](#write-mode). |
| `GREPTIMEDB_MAX_RESULT_BYTES` | `--max-result-bytes` | `1048576` | Byte budget for a single tool result. |
| `GREPTIMEDB_TRANSPORT` | `--transport` | `stdio` | Transport: `stdio`, `sse`, or `streamable-http`. |
| `GREPTIMEDB_LISTEN_HOST` | `--listen-host` | `0.0.0.0` | Bind host for the `sse` and `streamable-http` transports. |
| `GREPTIMEDB_LISTEN_PORT` | `--listen-port` | `8080` | Bind port for the `sse` and `streamable-http` transports. |
| `GREPTIMEDB_ALLOWED_HOSTS` | `--allowed-hosts` | Empty | Allowed hosts for DNS rebinding protection, comma-separated. Empty disables the protection. |
| `GREPTIMEDB_ALLOWED_ORIGINS` | `--allowed-origins` | Empty | Allowed CORS origins, comma-separated. Used only when `--allowed-hosts` is set. |

Boolean options accept `true`/`false`, `1`/`0`, `yes`/`no`, or `on`/`off`.

### Claude Desktop integration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "greptimedb": {
      "command": "greptimedb-mcp-server",
      "args": ["--host", "localhost", "--database", "public"],
      "env": {
        "GREPTIMEDB_PORT": "4002",
        "GREPTIMEDB_USER": "your_username",
        "GREPTIMEDB_PASSWORD": "your_password"
      }
    }
  }
}
```

### HTTP server mode

For containerized or Kubernetes deployments, run the server over HTTP instead of stdio:

```bash
# Streamable HTTP (recommended for production)
greptimedb-mcp-server --transport streamable-http --listen-port 8080

# SSE mode (legacy)
greptimedb-mcp-server --transport sse --listen-port 3000
```

DNS rebinding protection is disabled by default for compatibility with proxies and Kubernetes services. Enable it with `--allowed-hosts`, for example `--allowed-hosts "localhost:*,127.0.0.1:*,my-service.namespace:*"`.

## Security

The server is **read-only by default**. Without write mode, `execute_sql` rejects statements that the security gate blocks, and `create_pipeline`, `delete_pipeline`, `create_dashboard`, and `delete_dashboard` return an error without contacting GreptimeDB. `list_pipelines`, `dryrun_pipeline`, and `list_dashboards` remain available.

- **Security gate**: blocks `DROP`, `DELETE`, `TRUNCATE`, `UPDATE`, `INSERT`, `ALTER`, `CREATE`, `GRANT`, `REVOKE`, `REPLACE INTO`, `EXEC`/`EXECUTE`, `CALL`, `LOAD`, `COPY`, `OUTFILE`, `LOAD_FILE`, `INTO DUMPFILE`, and encoded content such as `UNHEX`, hexadecimal literals, and `CHAR()`.
- **Data masking**: columns whose names contain patterns such as `password`, `token`, `api_key`, `ssn`, or `credit_card` are masked as `******`. Add patterns with `--mask-patterns`.
- **Audit logging**: every tool invocation is logged. Disable with `--audit-enabled false`.

For the strongest setup, also create a read-only database user with the [static user provider](/user-guide/deployments-administration/authentication/static.md) and connect the server with it.

### Write mode

For local development or testing, you can enable write mode:

```bash
greptimedb-mcp-server --allow-write true
```

Write mode allows DDL/DML statements (`CREATE`, `DROP`, `ALTER`, `INSERT`, `UPDATE`, `DELETE`) through `execute_sql` by bypassing the security gate, and enables `create_pipeline`, `delete_pipeline`, `create_dashboard`, and `delete_dashboard`. The server logs a warning on startup.

:::danger
Write mode lets an AI assistant run destructive statements against your database. Never enable it against production data.
:::

## Learn More

For advanced usage and troubleshooting, refer to the [GreptimeDB MCP Server documentation](https://github.com/GreptimeTeam/greptimedb-mcp-server).

:::note
The GreptimeDB MCP Server is an experimental project still under development. Exercise caution when using it with sensitive data.
:::
