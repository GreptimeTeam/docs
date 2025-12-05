---
keywords: [HTTP API, endpoints, health check, status, metrics, configuration, query APIs, PromQL, InfluxDB, OpenTelemetry]
description: Provides a full list of HTTP paths and their usage in GreptimeDB, including admin APIs, query endpoints, and protocol endpoints.
---

# HTTP API Endpoint List

Here is the full list for the various HTTP paths and their usage in GreptimeDB:

## Admin APIs

Endpoints that is not versioned (under `/v1`). For admin usage like health check, status, metrics, etc.

### Health Check

- **Path**: `/health`
- **Methods**: `GET`, `POST`
- **Description**: Provides a health check endpoint to verify that the server is running.
- **Usage**: Access this endpoint to check the health status of the server.

Please refer to the [check GreptimeDB health documentation](/enterprise/deployments-administration/monitoring/check-db-status.md#check-if-greptimedb-is-running-normally) for an example.

### Status

- **Path**: `/status`
- **Methods**: `GET`
- **Description**: Retrieves the current status of the server.
- **Usage**: Use this endpoint to obtain server status information.

Please refer to the [Check GreptimeDB status documentation](/enterprise/deployments-administration/monitoring/check-db-status.md#check-greptimedb-status) for an example.

### Metrics

- **Path**: `/metrics`
- **Methods**: `GET`
- **Description**: Exposes Prometheus metrics for monitoring purposes.
- **Usage**: Prometheus can scrape this endpoint to collect metrics data.

Example:

```bash
curl -X GET http://127.0.0.1:4000/metrics

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
- **Endpoints**:
  - `cpu`
  - `mem`
- **Methods**: `POST` for profiling the database node.
- **Description**: Runtime profiling for CPU or Memory usage.
- **Usage**:
  - Refer to [Profiling CPU](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-profile-cpu.md) for detailed guide for CPU profiling.
  - Refer to [Profiling Memory](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-profile-memory.md) for detailed guide for Memory profiling.

## Query Endpoints

Various query APIs for sending query to GreptimeDB.

### SQL API

- **Path**: `/v1/sql`
- **Methods**: `GET`, `POST`
- **Description**: Executes SQL queries against the server.
- **Usage**: Send SQL queries in the request body.
  
For more information on the SQL API, refer to the [HTTP API documentation](/user-guide/protocols/http.md#post-sql-statements) in the user guide.

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
