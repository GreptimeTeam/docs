# Prometheus

GreptimeDB supports both of Prometheus's remote Read and Write endpoints:

- `/v1/prometheus/write` for remote write
- `/v1/prometheus/read` for remote read

Of course, there is a `/metrics` endpoint to produce GreptimeDB's internal metrics in the same
format as Prometheus.

## Create a database

```sql
CREATE DATABASE prometheus
```

## Configuration

Please follow the settings in [Prometheus configuration][1] (`prometheus.yml`):

- `remote_write`
- `remote_read`

[1]: https://prometheus.io/docs/prometheus/latest/configuration/configuration/#configuration-file

The configured URLs must be accessible by your running Prometheus servers. For example:

```yaml
remote_write:
- url: http://localhost:4000/v1/prometheus/write?db=prometheus

remote_read:
- url: http://localhost:4000/v1/prometheus/read?db=prometheus
```

## Prometheus Metrics in GreptimeDB

When the metrics are written into GreptimeDB by remote write endpoint, they will be transformed as
follows:

| Sample Metrics | In GreptimeDB                | GreptimeDB Data Types |
|:---------------|:-----------------------------|:----------------------|
| Name           | Table (Auto-created) Name    | String                |
| Value          | Column (greptime_value)     | Double                |
| Timestamp      | Column (greptime_timestamp) | Timestamp             |
| Label          | Column                       | String                |

 A primary key with all label columns will be created automatically. When a new label is added, it
 will be added into primary key automatically too.

### Example: Prometheus metrics in GreptimeDB Table

```text
prometheus_remote_storage_samples_total{instance="localhost:9090", job="prometheus",
remote_name="648f0c", url="http://localhost:4000/v1/prometheus/write"} 500
```

This example will be transformed as a row in the table `prometheus_remote_storage_samples_total`：

| Column             | Value                                       | Column  Data  Type |
|:-------------------|:--------------------------------------------|:-------------------|
| instance           | localhost:9090                              | String             |
| job                | prometheus                                  | String             |
| remote_name        | 648f0c                                      | String             |
| url                | `http://localhost:4000/v1/prometheus/write` | String             |
| greptime_value     | 500                                         | Double             |
| greptime_timestamp | The sample's unix timestamp                 | Timestamp          |
