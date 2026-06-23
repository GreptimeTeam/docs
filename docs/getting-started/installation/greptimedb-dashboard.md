---
keywords: [dashboard, observability, SQL, PromQL, metrics, logs, traces, unified database]
description: Access the built-in GreptimeDB Dashboard and query metrics, logs, and traces through Table Query and signal-specific views.
---

# GreptimeDB Dashboard

GreptimeDB stores metrics, logs, and traces in a single database. The [Dashboard](https://github.com/GreptimeTeam/dashboard) is a built-in web UI for exploring that data after installation — no extra components required. For the motivation behind unified observability storage, see [Why GreptimeDB](/user-guide/concepts/why-greptimedb.md).

## Access the Dashboard

The Dashboard is embedded in the GreptimeDB binary since v0.2.0. After starting [GreptimeDB Standalone](greptimedb-standalone.md) or [GreptimeDB Cluster](greptimedb-cluster.md), open:

```
http://localhost:4000/dashboard
```

To disable the Dashboard HTTP service, set `--disable-dashboard` when starting the frontend. See [frontend command-line options](/reference/command-lines/frontend.md).

## Explore your data

The Dashboard provides a general query entry and signal-specific views:

| View | Data scope | Description |
| --- | --- | --- |
| [Table Query](#table-query) | Any data | General query entry. Switch between SQL and PromQL in the editor. |
| [Metrics Query](#metrics-query) | Metrics | Browse and query metrics with a PromQL-oriented UI. |
| [Logs Query](#logs-query) | Logs | Filter and search logs with a builder or code editor. |
| [Traces Query](#traces-query) | Traces | Search traces and inspect spans with a builder or code editor. |

## Table Query

Table Query is the Dashboard's general query entry. You can query any data in GreptimeDB and switch between SQL and PromQL in the editor. Browse databases and tables on the left, run queries with **Run Query**, **Explain Query**, or **Run All**, and view results below.

![Table Query](/dashboard-table-query.png)

- Browse databases and tables in the left panel.
- Write multiple queries in separate editor tabs.
- Inspect results in a table with pagination.
- Use **Explain Query** to visualize [`EXPLAIN ANALYZE`](/reference/sql/explain.md) execution plans.

See [SQL](/user-guide/query-data/sql.md) and [PromQL](/user-guide/query-data/promql.md) for query syntax.

## Metrics Query

Metrics Query is a metrics-specific view. Browse available metrics, enter a metric name or PromQL expression, and switch between list and chart views.

![Metrics Query](/dashboard-metrics-query.png)

- Search and browse metrics in the left panel.
- Run queries from the editor and view label sets with values.
- Toggle between list and chart display.

See [PromQL](/user-guide/query-data/promql.md) for query syntax. You can also run PromQL from [Table Query](#table-query).

## Logs Query

Logs Query is a logs-specific view. Select a database and log table, add filters, and inspect log lines. Use **Builder** for point-and-click queries or **Code** to write queries directly.

![Logs Query](/dashboard-logs-query.png)

- Set time range, filters, order, and limit in the builder.
- View a row-count chart over time above the results.
- Enable **Live** for streaming results or export results as CSV.

See [Log Query](/user-guide/query-data/log-query.md) and [Logs](/user-guide/logs/overview.md) for more details.

## Traces Query

Traces Query is a traces-specific view. Select a trace table, filter by trace ID or span attributes, and inspect trace records.

![Traces Query](/dashboard-traces-query.png)

- Use **Builder** or **Code** to compose queries.
- Filter root spans (for example, `parent_span_id` not exist) or search by `trace_id`.
- View a row-count chart over time and paginate through results.

See [Traces](/user-guide/traces/overview.md) and [Jaeger](/user-guide/query-data/jaeger.md) for more details.

## More capabilities

The Dashboard also includes:

### Logs Pipelines

Create, edit, and test log pipelines in the UI. See [Manage Pipelines](/user-guide/logs/manage-pipelines.md).

### Ingest

Write data manually in [InfluxDB Line Protocol](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md) format.

### Flow

View and manage Flow tasks for continuous computation. See [Manage Flow](/user-guide/flow-computation/manage-flow.md).

### Visualization

Build Perses dashboards for metrics, logs, and traces. The embedded editor uses the same datasource plugins — see [Perses integration](/user-guide/integrations/perses.md) for connection and query configuration.

### Status

View node and cluster runtime status, including CPU and memory usage. See [Runtime Info](/user-guide/deployments-administration/monitoring/runtime-info.md).

## Next steps

- [Quick Start](/getting-started/quick-start.md) — ingest and correlate metrics, logs, and traces
- [User Guide](/user-guide/overview.md) — full reference for ingestion, querying, and operations
- [Perses integration](/user-guide/integrations/perses.md) — configure GreptimeDB and Prometheus datasources in Perses
- [Grafana integration](/user-guide/integrations/grafana.md) — production dashboards and alerting
