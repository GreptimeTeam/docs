---
keywords: [MCP, Model Context Protocol, AI assistant, Claude, database integration, semantic layer, TQL, pipeline]
description: Learn how to integrate GreptimeDB with Model Context Protocol (MCP) for AI assistants to explore and analyze your metrics, logs, and traces.
---

# Model Context Protocol (MCP)

:::warning Experimental Feature
The GreptimeDB MCP Server is currently in experimental stage and under active development. APIs and features may change without notice. Please use with caution in production environments.
:::

The [GreptimeDB MCP Server](https://github.com/GreptimeTeam/greptimedb-mcp-server) provides a Model Context Protocol implementation that enables AI assistants like Claude to securely query and analyze your GreptimeDB databases using SQL, TQL (PromQL-compatible), and RANGE queries — with read-only enforcement and data masking built in.

Watch our [demo video on YouTube](https://www.youtube.com/watch?v=EBTc46yamFI) to see the MCP Server in action.

## What is MCP?

Model Context Protocol (MCP) is a standard protocol that lets AI assistants interact with external data sources and tools. With the GreptimeDB MCP Server, an assistant can explore your tables, understand what each one represents through the [semantic layer](/user-guide/concepts/semantic-layer.md), run queries, and manage pipelines and dashboards.

## Tools

The server (v0.5.0) exposes the following tools.

### Query and inspection

| Tool | Description |
| --- | --- |
| `execute_sql` | Execute SQL queries with format (csv/json/markdown) and limit options. |
| `execute_tql` | Execute TQL (PromQL-compatible) queries for time-series analysis. |
| `query_range` | Execute time-window aggregation queries with RANGE/ALIGN syntax. |
| `describe_table` | Inspect a table profile: schema, semantic metadata, latest sample rows, and query guidance. |
| `explain_query` | Analyze SQL or TQL query execution plans. |
| `health_check` | Check database connection status and server version. |

`describe_table` reads the [table semantic layer](/user-guide/concepts/semantic-layer.md), so the assistant learns the signal type, source, and metric metadata of a table instead of guessing from column names.

### Pipeline management

| Tool | Description |
| --- | --- |
| `list_pipelines` | List all pipelines or get details of a specific pipeline. |
| `create_pipeline` | Create a new pipeline with YAML configuration. |
| `dryrun_pipeline` | Test a pipeline with sample data without writing to the database. |
| `delete_pipeline` | Delete a specific version of a pipeline. |

### Dashboard management

| Tool | Description |
| --- | --- |
| `list_dashboards` | List all Perses dashboard definitions. |
| `create_dashboard` | Create or update a Perses dashboard definition. |
| `delete_dashboard` | Delete a dashboard definition. |

The server also ships built-in Jinja prompt templates for common tasks (metrics analysis, trace analysis, pipeline creation, schema design, query performance tuning, and more).

## Installation

```bash
pip install greptimedb-mcp-server
```

Run it directly (connects to `localhost:4002` by default):

```bash
greptimedb-mcp-server --host localhost --database public
```

## Configuration

The server is configured through environment variables or CLI arguments. The table below lists the most common options; [HTTP server mode](#http-server-mode) adds a few more.

| Environment variable | CLI argument | Default | Description |
| --- | --- | --- | --- |
| `GREPTIMEDB_HOST` | `--host` | `localhost` | Database host. |
| `GREPTIMEDB_PORT` | `--port` | `4002` | MySQL protocol port. |
| `GREPTIMEDB_USER` | `--user` | `root` | Database user. |
| `GREPTIMEDB_PASSWORD` | `--password` | — | Database password. |
| `GREPTIMEDB_DATABASE` | `--database` | `public` | Database name. |
| `GREPTIMEDB_TIMEZONE` | `--timezone` | `UTC` | Session timezone. |
| `GREPTIMEDB_HTTP_PORT` | `--http-port` | `4000` | HTTP API port (for pipeline/dashboard tools). |
| `GREPTIMEDB_MASK_ENABLED` | `--mask-enabled` | `true` | Mask sensitive columns. |
| `GREPTIMEDB_AUDIT_ENABLED` | `--audit-enabled` | `true` | Log every tool invocation. |
| `GREPTIMEDB_ALLOW_WRITE` | `--allow-write` | `false` | Allow write/DDL via `execute_sql`. See [Write mode](#write-mode) below. |
| `GREPTIMEDB_TRANSPORT` | `--transport` | `stdio` | Transport: `stdio`, `sse`, or `streamable-http`. |

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

For containerized or Kubernetes deployments, run the server over HTTP instead of stdio (requires `mcp>=1.8.0`):

```bash
# Streamable HTTP (recommended for production)
greptimedb-mcp-server --transport streamable-http --listen-port 8080

# SSE mode (legacy)
greptimedb-mcp-server --transport sse --listen-port 3000
```

DNS rebinding protection is disabled by default for compatibility with proxies and Kubernetes services. Enable it with `--allowed-hosts` if needed.

## Security

The server is **read-only by default** and applies several safeguards.

- **Security gate**: blocks `DROP`, `DELETE`, `TRUNCATE`, `UPDATE`, `INSERT`, `ALTER`, `CREATE`, `GRANT`, `REVOKE`, and encoded bypass attempts; allows `SELECT`, `SHOW`, `DESCRIBE`, `TQL`, `EXPLAIN`, `UNION`.
- **Data masking**: columns whose names match patterns such as `password`, `token`, `api_key`, `ssn`, or `credit_card` are masked as `******`. Add patterns with `--mask-patterns`.
- **Audit logging**: every tool invocation is logged. Disable with `--audit-enabled false`.

For the strongest setup, also create a read-only database user with the [static user provider](/user-guide/deployments-administration/authentication/static.md) and connect the server with it.

### Write mode

For local development or testing, you can allow write/DDL statements (`CREATE`, `DROP`, `ALTER`, `INSERT`, `UPDATE`, `DELETE`) through `execute_sql`:

```bash
greptimedb-mcp-server --allow-write true
```

When enabled, the security gate is bypassed for `execute_sql` and the server logs a warning on startup.

:::danger
Write mode lets an AI assistant run destructive statements against your database. Never enable it against production data.
:::

## Learn More

For advanced usage and troubleshooting, refer to the [GreptimeDB MCP Server documentation](https://github.com/GreptimeTeam/greptimedb-mcp-server).

:::note
The GreptimeDB MCP Server is an experimental project still under development. Exercise caution when using it with sensitive data.
:::
