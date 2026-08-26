---
keywords: [Grafana, data source, plugin, installation, connection settings, Prometheus, MySQL]
description: Steps to configure GreptimeDB as a data source in Grafana using different plugins and data sources, including installation and connection settings.
---

# Grafana

GreptimeDB can be configured as a [Grafana data source](https://grafana.com/docs/grafana/latest/datasources/add-a-data-source/).
You have the option to connect GreptimeDB with Grafana using one of three data sources: [GreptimeDB](#greptimedb-data-source-plugin), [Prometheus](#prometheus-data-source), or [MySQL](#mysql-data-source).

## GreptimeDB data source plugin

The [GreptimeDB data source plugin](https://github.com/GreptimeTeam/greptimedb-grafana-datasource) is tailored for GreptimeDB: it provides better GreptimeDB SQL query support, plus Logs and Traces query types with OpenTelemetry presets and configurable column mappings. It is modified from the ClickHouse data source plugin.

### Installation

The plugin is not published in the Grafana plugin catalog, so install the unsigned archive and
allow it explicitly in `grafana.ini`:

```ini
[plugins]
allow_loading_unsigned_plugins = info8fcc-greptimedb-datasource
```

`GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS` is the equivalent environment variable. Grafana Cloud
does not accept unsigned plugins, so use a self-hosted Grafana. If you need a signed build bound to
your own Grafana `root_url`, [contact us](https://greptime.com/contactus).

Make sure Grafana is installed and running before installing the plugin.

You can choose one of the following installation methods:
- Download `info8fcc-greptimedb-datasource-unsigned.zip` from the [release
page](https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/) and unzip it
to your [grafana plugin
directory](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#plugins).
- Use grafana cli to download and install:
  ```shell
  grafana cli --pluginUrl https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/download/info8fcc-greptimedb-datasource-unsigned.zip plugins install info8fcc
  ```
- Use our [prebuilt Grafana docker
  image](https://hub.docker.com/r/greptime/grafana-greptimedb), which ships the
  plugin by default: `docker run -p 3000:3000
  greptime/grafana-greptimedb:latest`

Note that you may need to restart your grafana server after installing the plugin.

### Connection settings

Fill in the following URL in the GreptimeDB server URL:

```txt
http://<host>:4000
```

In the Auth section, click basic auth, and fill in the username and password for GreptimeDB in the Basic Auth Details section (not set by default, no need to fill in).
- User: `<username>`
- Password: `<password>`

Then click the Save & Test button to test the connection.

### Query Builder

#### General Settings

Before selecting any query type, you first need to configure the **Database** and **Table** to query from.

| Setting   | Description                               |
| :-------- | :---------------------------------------- |
| **Database** | Select the database you want to query.     |
| **Table** | Select the table you want to query from. |

Every Builder panel automatically includes a **Within Dashboard Time Range**
filter. This generates `$__timeFilter("col")` in the SQL, which the plugin
expands to the dashboard's current time range.

![DB Table Config](/grafana/dbtable.png)

---

#### Table Query

Choose the `Table` query type when your query results **do not include a time column**. Suitable for displaying tabular data.

| Setting   | Description                                     |
| :-------- | :---------------------------------------------- |
| **Columns** | Select the columns you want to retrieve. Multiple selections are allowed. |
| **Filters** | Set conditions to filter your data.             |

![Table Query](/grafana/table.png)

---

#### Time Series Query

Select the `Time Series` query type when your query includes a time column and
numerical values. Ideal for visualizing metrics over time.

##### Time bucketing with `date_bin`

For aggregating metrics over a time range, use `date_bin` to downsample time
series data: it calculates time intervals and returns the start of the interval
nearest to each timestamp, so rows are grouped into time-based bins (windows).
Apply an aggregate or selector function to each window.

Example (or raw SQL):

```sql
SELECT date_bin('$__interval', timestamp) AS time,
       SUM(`span_attributes.gen_ai.usage.input_tokens`) AS input_tokens
FROM opentelemetry_traces
WHERE $__timeFilter(timestamp)
GROUP BY time
ORDER BY time;
```

`$__interval` follows the Grafana panel interval; `$__timeFilter` limits the
dashboard time range. See [SQL Macros](#sql-macros) for more macros.

| Setting | Description |
|:--------|:------------|
| **Time** | Select the time column. |
| **Columns** | Select label columns (e.g. `host`, `region`). |
| **Aggregate functions** | AVG / MAX / MIN / SUM / COUNT on value columns. |
| **Group By** | Select columns to group by. |
| **Filters** | Optional conditions: `=`, `!=`, `>`, `<`, `LIKE`, `IN`, `IS NULL`, AND/OR. |

![Time Series](/grafana/series.png)

##### Multi-Frame Splitting

When the query result contains **time + string + number** fields, the plugin
automatically splits the long table into multiple frames — one per unique label
combination. Grafana renders each frame as a separate series in the chart.

For example, `GROUP BY host` with three hosts produces three frames (host-a,
host-b, host-c), each with its own label and color.

To avoid splitting, use the `Table` query type instead.

---

#### Logs Query

Choose the `Logs` query type for log data.

| Setting | Description |
|:--------|:------------|
| **Time** | Select the timestamp column. |
| **Message** | Select the column containing the log content. |
| **Log Level** | (Optional) Select the column for log severity. |
| **Context Columns** | Extra columns shown when you expand a log line (from data source config). |

![Logs](/grafana/logs.png)

**Full-text search**: use `matches_term(body, 'keyword')` for exact
term/phrase matching.

---

#### Traces Query

Select the `Traces` query type for distributed tracing data.

| Main Setting          | Description                                                                                             |
| :-------------------- | :------------------------------------------------------------------------------------------------------ |
| **Trace Model** | Select `Trace Search` to query a list of traces.                                                        |
| **Trace Id Column** | Default value: `trace_id`                                                                               |
| **Span Id Column** | Default value: `span_id`                                                                                |
| **Parent Span ID Column** | Default value: `parent_span_id`                                                                       |
| **Service Name Column** | Default value: `service_name`                                                                         |
| **Operation Name Column** | Default value: `span_name`                                                                            |
| **Start Time Column** | Default value: `timestamp`                                                                              |
| **Duration Time Column** | Default value: `duration_nano`                                                                          |
| **Duration Unit** | Default value: `nanoseconds`                                                                           |
| **Tags Column** | Multiple selections allowed. Corresponds to columns starting with `span_attributes` (e.g., `span_attributes.http.method`). |
| **Service Tags Column** | Multiple selections allowed. Corresponds to columns starting with `resource_attributes` (e.g., `resource_attributes.host.name`). |

![Traces](/grafana/traceconfig.png)

##### Attribute Auto-Discovery

When the Trace ID query uses `SELECT *`, the plugin automatically discovers
all columns starting with `span_attributes.` and `resource_attributes.` and
includes them as expandable tags in the waterfall view. No need to manually
enumerate every attribute column.

### SQL Macros

Use these macros in raw SQL mode. The plugin expands them to
GreptimeDB-compatible SQL.

#### Time Range

| Macro | Expands To |
|-------|-----------|
| `$__timeFilter(col)` | `"col" >= 'ISO' AND "col" <= 'ISO'` |
| `$__timeFilter_ms(col)` | Same (ms precision) |
| `$__fromTime` | Start time as ISO string |
| `$__toTime` | End time as ISO string |
| `$fromTime_ms` | Start time as ms ISO string |
| `$toTime_ms` | End time as ms ISO string |

#### Time Interval

| Macro | Expands To |
|-------|-----------|
| `$__timeInterval(col)` | `date_bin('<interval>', "col")` |
| `$__timeInterval_ms(col)` | `date_bin('<interval>', "col")` (ms) |
| `$__interval` | Panel interval literal (e.g. `15s`) |
| `$interval_s` | Panel interval in seconds (e.g. `15`) |

#### Date Filters

| Macro | Expands To |
|-------|-----------|
| `$__dateFilter(col)` | `"col" >= 'YYYY-MM-DD' AND "col" <= 'YYYY-MM-DD'` |
| `$__dateTimeFilter(dc, tc)` | Date + time combined filter |
| `$__dt(dc, tc)` | Alias for `$__dateTimeFilter` |

#### Special

| Macro | Expands To |
|-------|-----------|
| `$__conditionalAll(col)` | All selected → `1=1`; otherwise → `col IN (values)` |

#### Identifier Quoting

The plugin automatically adds double quotes around column names in macros.
`$__timeFilter(timestamp)` and `$__timeFilter("timestamp")` both expand to
`"timestamp" >= 'ISO1' AND "timestamp" <= 'ISO2'`. The `date_bin` function
does NOT quote its column argument: `date_bin('15s', ts)`.

### Configuring Column Mappings

Before using the Logs or Traces query types, configure the default column names
in the data source settings so the Query Builder can automatically map them.

#### Logs Config

| Field | Purpose | Suggested (OTel table) |
|-------|---------|------------------------|
| Default Table | Default log table | `genai_conversations` |
| Time Column | Timestamp column | `timestamp` |
| Message Column | Log body column | `body` |
| Level Column | Log severity/level column | `severity_text` |
| Trace ID Column | Trace ID for linking | `trace_id` |
| Context Columns | Extra columns shown on log line expand | `scope_name`, `trace_id` |

Enable **Select context columns** to automatically include them in log queries.

#### Traces Config

| Field | Purpose | Suggested (OTel table) |
|-------|---------|---------|
| Default Table | Default trace table | `opentelemetry_traces` |
| Trace ID Column | Trace ID | `trace_id` |
| Span ID Column | Span ID | `span_id` |
| Parent Span ID Column | Parent Span ID | `parent_span_id` |
| Service Name Column | Service name | `service_name` |
| Operation Name Column | Span/operation name | `span_name` |
| Duration Column | Duration value | `duration_nano` |
| Duration Unit | Unit of duration column | `nanoseconds` |
| Start Time Column | Span start time | `timestamp` |
| Tags Column | Span attributes prefix | `span_attributes` |
| Service Tags Column | Resource attributes prefix | `resource_attributes` |

#### OTel Preset

If your table follows OpenTelemetry conventions, enable **Use OTel** and select
a version. All column fields above are filled automatically. You can toggle OTel
on/off in both the data source config and the Query Builder panel editor.

When OTel is enabled, the OTel preset uses GreptimeDB-style lowercase underscore
column names (e.g. `trace_id` not `TraceId`), since GreptimeDB does not preserve
case.

Full OTel 1.29.0 column map:

| Hint | Column |
|------|--------|
| Time | `timestamp` |
| LogLevel | `severity_text` |
| LogMessage | `body` |
| TraceId | `trace_id` |
| TraceSpanId | `span_id` |
| TraceParentSpanId | `parent_span_id` |
| TraceServiceName | `service_name` |
| TraceOperationName | `span_name` |
| TraceDurationTime | `duration_nano` |
| TraceTags | `span_attributes` |
| TraceServiceTags | `resource_attributes` |
| TraceStatusCode | `span_status_code` |
| TraceEventsPrefix | `span_events` |

### Included Dashboards

The plugin ships with two dashboards. After you configure a GreptimeDB data source:

1. Open **Connections → Data sources →** your GreptimeDB instance
2. Open the **Dashboards** tab
3. Click **Import** next to a dashboard

Included dashboards:

- **GreptimeDB - OTel Min Demo**
- **GenAI Observability**

![GenAI Observability](/grafana/genai-observability.jpg)

Sample data for these dashboards can be written into GreptimeDB via the [genai-observability](https://github.com/GreptimeTeam/demo-scene/tree/main/genai-observability) demo in [demo-scene](https://github.com/GreptimeTeam/demo-scene).

## Prometheus data source

Click the "Add data source" button and select Prometheus as the type.

Fill in Prometheus server URL in HTTP:

```txt
http://<host>:4000/v1/prometheus
```

Click basic auth in the Auth section and fill in your GreptimeDB username and password in Basic Auth Details:

- User: `<username>`
- Password: `<password>`

Click Custom HTTP Headers and add one header:

- Header: `x-greptime-db-name`
- Value: `<dbname>`

Then click "Save & Test" button to test the connection.

For how to query data with PromQL, please refer to the [Prometheus Query Language](/user-guide/query-data/promql.md) document.

## MySQL data source

Click the "Add data source" button and select MySQL as the type. Fill in the following information in MySQL Connection:

- Host: `<host>:4002`
- Database: `<dbname>`
- User: `<username>`
- Password: `<password>`
- Session timezone: `UTC`

Then click "Save & Test" button to test the connection.

Note that you need to use raw SQL editor for panel creation. SQL Builder is not
supported due to timestamp data type difference between GreptimeDB and vanilla
MySQL.

For how to query data with SQL, please refer to the [Query Data with SQL](/user-guide/query-data/sql.md) document.
