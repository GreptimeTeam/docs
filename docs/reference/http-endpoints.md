---
keywords: [HTTP API, endpoints, health check, status, metrics, configuration, query APIs, PromQL, InfluxDB, OpenTelemetry]
description: Provides a full list of HTTP paths and their usage in GreptimeDB, including admin APIs, query endpoints, and protocol endpoints.
---

# HTTP API Endpoint List

GreptimeDB provides two HTTP servers:

| Server | Default address | Purpose |
|--------|----------------|---------|
| **Main HTTP server** | `127.0.0.1:4000` | Internal / operational use. Serves all paths, including admin endpoints such as `/health`, `/metrics`, `/config`, and `/debug/*`, as well as all `/v1` and `/dashboard` paths. Keep this port private and accessible only by trusted operators. |
| **Public HTTP API server** | `127.0.0.1:4006` | User-facing access. Serves only `/v1` APIs and `/dashboard`. Safe to expose to database end-users. Disabled by default; enable it with `http.enable_api_server = true` in your configuration file. |

We recommend keeping the main HTTP server port for internal/operational use only. Alternatively, it can be safely exposed through an HTTP proxy, provided direct access is restricted and the proxy allows only the required protocols. But If you want to expose GreptimeDB as a service to end-users, enable the dedicated public API server and expose only its port.

```toml
[http]
# Main HTTP server — keep this internal
addr = "127.0.0.1:4000"

# Enable the public API server and bind it to an externally accessible address
enable_api_server = true
api_server_addr = "0.0.0.0:4006"
```

See the [configuration documentation](/user-guide/deployments-administration/configuration.md#protocol-options) for all `[http]` options.

Here is the full list for the various HTTP paths and their usage in GreptimeDB:

## Admin APIs

Endpoints that is not versioned (under `/v1`). For admin usage like health check, status, metrics, etc.

:::note
Admin API endpoints are available **only** on the main HTTP server (default port `4000`). They are not exposed by the dedicated public API server even when `http.enable_api_server` is enabled.
:::

### Health Check

- **Path**: `/health`
- **Methods**: `GET`, `POST`
- **Description**: Provides a health check endpoint to verify that the server is running.
- **Usage**: Access this endpoint to check the health status of the server.

Please refer to the [check GreptimeDB health documentation](/user-guide/deployments-administration/monitoring/check-db-status.md#check-if-greptimedb-is-running-normally) for an example.

### Status

- **Path**: `/status`
- **Methods**: `GET`
- **Description**: Retrieves the current status of the server.
- **Usage**: Use this endpoint to obtain server status information.

Please refer to the [Check GreptimeDB status documentation](/user-guide/deployments-administration/monitoring/check-db-status.md#check-greptimedb-runtime-status) for an example.

### Metrics

- **Path**: `/metrics`
- **Methods**: `GET`
- **Description**: Exposes Prometheus metrics for monitoring purposes.
- **Usage**: Prometheus can scrape this endpoint to collect metrics data.

Example:

```bash
curl -X GET http://127.0.0.1:4000/metrics
```

Output:

```text
# HELP greptime_app_version app version
# TYPE greptime_app_version gauge
greptime_app_version{app="greptime-edge",short_version="main-b4bd34c5",version="0.12.0"} 1
# HELP greptime_catalog_catalog_count catalog catalog count
# TYPE greptime_catalog_catalog_count gauge
greptime_catalog_catalog_count 1
# HELP greptime_catalog_schema_count catalog schema count
# TYPE greptime_catalog_schema_count gauge
greptime_catalog_schema_count 3
# HELP greptime_flow_run_interval_ms flow run interval in ms
# TYPE greptime_flow_run_interval_ms gauge
greptime_flow_run_interval_ms 1000
# HELP greptime_meta_create_catalog meta create catalog
# TYPE greptime_meta_create_catalog histogram
greptime_meta_create_catalog_bucket{le="0.005"} 1
greptime_meta_create_catalog_bucket{le="0.01"} 1
greptime_meta_create_catalog_bucket{le="0.025"} 1
greptime_meta_create_catalog_bucket{le="0.05"} 1
greptime_meta_create_catalog_bucket{le="0.1"} 1
...
```

### Configuration

- **Path**: `/config`
- **Methods**: `GET`
- **Description**: Retrieves the server's configuration options.
- **Usage**: Access this endpoint to get configuration details.

For example:

```shell
curl http://localhost:4000/config
```

The output contains the configuration information of the GreptimeDB server.

```toml
enable_telemetry = true
user_provider = "static_user_provider:file:user"
init_regions_in_background = false
init_regions_parallelism = 16

[http]
addr = "127.0.0.1:4000"
timeout = "30s"
body_limit = "64MiB"
is_strict_mode = false

# ...
```

### Dashboard

- **Paths**: `/dashboard`
- **Methods**: `GET`, `POST`
- **Description**: Provides access to the server's dashboard interface.
- **Usage**: Access these endpoints to interact with the web-based dashboard.

This dashboard is packaged with the GreptimeDB server and provides a user-friendly interface for interacting with the server. It requires corresponding compile flags to be enabled when building GreptimeDB. The original source code for the dashboard can be found at https://github.com/GreptimeTeam/dashboard

### Log Level

- **Path**: `/debug/log_level`
- **Methods**: `POST`
- **Description**: Adjusts the server's log level dynamically.
- **Usage**: Send a log level change request to this endpoint.
 
For more information, refer to the [how-to documentation](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-change-log-level-on-the-fly.md).

### Enable/Disable Trace

- **Path**: `/debug/enable_trace`
- **Methods**: `POST`
- **Description**: Dynamically enables or disables distributed tracing at runtime.
- **Usage**: Send `true` to enable tracing or `false` to disable tracing.

Example to enable tracing:

```bash
curl --data "true" http://127.0.0.1:4000/debug/enable_trace
# Output: trace enabled
```

Example to disable tracing:

```bash
curl --data "false" http://127.0.0.1:4000/debug/enable_trace
# Output: trace disabled
```

For more information on tracing configuration, refer to the [tracing documentation](/user-guide/deployments-administration/monitoring/tracing.md).

### Profiling Tools

- **Base Path**: `/debug/prof/`
- **Description**: Runtime profiling for CPU or memory usage on the database node.

CPU profiling:

| Path | Method | Description |
| --- | --- | --- |
| `/debug/prof/cpu` | `POST` | Collects a CPU profile. Query parameters include `seconds`, `frequency`, and `output`. Supported output formats are `proto`, `text`, and `flamegraph`. |

Example:

```bash
curl -X POST -s 'http://127.0.0.1:4000/debug/prof/cpu?seconds=10&output=flamegraph' > greptime-cpu.svg
```

Memory profiling:

| Path | Method | Description |
| --- | --- | --- |
| `/debug/prof/mem` | `POST` | Dumps memory profiling data. Query parameter `output` supports `text`, `proto`, and `flamegraph`. |
| `/debug/prof/mem/status` | `GET` | Checks whether heap profiling is active. |
| `/debug/prof/mem/activate` | `POST` | Activates heap profiling. |
| `/debug/prof/mem/deactivate` | `POST` | Deactivates heap profiling. |
| `/debug/prof/mem/gdump` | `GET` | Checks whether jemalloc gdump is active. |
| `/debug/prof/mem/gdump` | `POST` | Activates or deactivates jemalloc gdump. Use form field `activate=true` or `activate=false`. |
| `/debug/prof/mem/symbol` | `POST` | Uploads a jemalloc heap dump file and returns a symbolicated flamegraph. |

Examples:

```bash
curl -X POST -s 'http://127.0.0.1:4000/debug/prof/mem?output=flamegraph' > greptime-mem.svg
curl -X GET 'http://127.0.0.1:4000/debug/prof/mem/status'
curl -X POST 'http://127.0.0.1:4000/debug/prof/mem/gdump' -d 'activate=true'
```

For operational guidance, see [Collect profiling data](/user-guide/deployments-administration/performance-tuning/performance-tuning-tips.md#collect-profiling-data). For advanced usage, refer to [Profiling CPU](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-profile-cpu.md) and [Profiling Memory](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-profile-memory.md).

## Query Endpoints

Various query APIs for sending query to GreptimeDB.

### SQL API

- **Path**: `/v1/sql`
- **Methods**: `GET`, `POST`
- **Description**: Executes SQL queries against the server.
- **Usage**: Send SQL queries in the request body.
  
For more information on the SQL API, refer to the [HTTP API documentation](/user-guide/protocols/http.md#post-sql-statements) in the user guide.

### Format SQL API

- **Path**: `/v1/sql/format`
- **Methods**: `GET`, `POST`
- **Description**: Rewrites an SQL statement into the canonical form of GreptimeDB's SQL dialect. Available since v0.17.
- **Usage**: Pass the SQL in the `sql` query parameter, or in the form body of a `POST` request, which must set `Content-Type: application/x-www-form-urlencoded`. Returns a JSON object `{"formatted": "..."}` holding the normalized SQL string.

For more information on the Format SQL API, refer to the [HTTP API documentation](/user-guide/protocols/http.md#format-sql-with-greptimedbs-sql-dialect) in the user guide.

### PromQL API

- **Path**: `/v1/promql`
- **Methods**: `GET`, `POST`
- **Description**: Executes PromQL queries for Prometheus-compatible metrics, and returns data in GreptimeDB's JSON format.
- **Usage**: Send PromQL queries in the request body.
  
For more information on the PromQL API, refer to the [PromQL documentation](/user-guide/query-data/promql.md).

## Protocol Endpoints

Endpoints for various protocols that are compatible with GreptimeDB. Like InfluxDB, Prometheus, OpenTelemetry, etc.

### InfluxDB Compatibility

- **Paths**:
  - `/v1/influxdb/write`
  - `/v1/influxdb/api/v2/write`
  - `/v1/influxdb/ping`
  - `/v1/influxdb/health`
- **Methods**:
  - `POST` for write endpoints.
  - `GET` for ping and health endpoints.
- **Description**: Provides endpoints compatible with InfluxDB for data ingestion and health checks.
- **Usage**:
  - Ingest data using InfluxDB line protocol.
  - Use ping and health endpoints to check server status.

The detailed documentation for InfluxDB protocol can be found at [here](/user-guide/protocols/influxdb-line-protocol.md).

### Prometheus Remote Write/Read

- **Paths**:
  - `/v1/prometheus/write`
  - `/v1/prometheus/read`
- **Methods**: `POST`
- **Description**: Supports Prometheus remote write and read APIs.
- **Usage**:
  - Send metric data using Prometheus remote write protocol.
  - Read metric data using Prometheus remote read protocol.

### Prometheus HTTP API

- **Base Path**: `/v1/prometheus/api/v1`
- **Endpoints**:
  - `/format_query`
  - `/status/buildinfo`
  - `/query`
  - `/query_range`
  - `/labels`
  - `/series`
  - `/parse_query`
  - `/label/{label_name}/values`
- **Methods**: `GET`, `POST`
- **Description**: Provides Prometheus HTTP API endpoints for querying and retrieving metric data.
- **Usage**: Use these endpoints to interact with metrics using standard Prometheus HTTP API.

Refer to the original Prometheus documentation for more information on the [Prometheus HTTP API](https://prometheus.io/docs/prometheus/latest/querying/api/).

### OpenTelemetry Protocol (OTLP)

- **Paths**:
  - `/v1/otlp/v1/metrics`
  - `/v1/otlp/v1/traces`
  - `/v1/otlp/v1/logs`
- **Methods**: `POST`
- **Description**: Supports OpenTelemetry protocol for ingesting metrics, traces, and logs.
- **Usage**: Send OpenTelemetry formatted data to these endpoints.

### Loki Compatibility

- **Path**: `/v1/loki/api/v1/push`
- **Methods**: `POST`
- **Description**: Compatible with Loki's API for log ingestion.
- **Usage**: Send log data in Loki's format to this endpoint.

### Splunk HEC Compatibility

- **Path**: `/v1/splunk/services/collector/event`, `/v1/splunk/services/collector/raw`, `/v1/splunk/services/collector/health`
- **Methods**: `POST` for the ingestion endpoints, `GET` for the health endpoint
- **Description**: Compatible with the Splunk HTTP Event Collector (HEC) protocol for log ingestion.
- **Usage**: Send JSON events to `/event` or plain text to `/raw`. See [Ingest Data with Splunk](/user-guide/ingest-data/for-observability/splunk.md).

### OpenTSDB Protocol

- **Path**: `/v1/opentsdb/api/put`
- **Methods**: `POST`
- **Description**: Supports data ingestion using the OpenTSDB protocol.
- **Usage**: Ingest time series data using OpenTSDB's JSON format.

## Log Ingestion Endpoints

- **Paths**:
  - `/v1/ingest`
  - `/v1/pipelines/{pipeline_name}`
  - `/v1/pipelines/_dryrun`
- **Methods**:
  - `POST` for ingesting logs and adding pipelines.
  - `DELETE` for deleting pipelines.
- **Description**: Provides endpoints for log ingestion and pipeline management.
- **Usage**:
  - Ingest logs via the `/logs` endpoint.
  - Manage log pipelines using the `/pipelines` endpoints.

For more information on log ingestion and pipeline management, refer to the [log overview](/user-guide/logs/overview.md).
