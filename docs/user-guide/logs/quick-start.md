---
keywords: [logs, log service, pipeline, greptime_identity, quick start, json logs]
description: Quick start guide for GreptimeDB log service, including basic log ingestion using the built-in greptime_identity pipeline and integration with log collectors.
---

# Quick Start

This guide will walk you through the essential steps to get started with GreptimeDB's log service.
You'll learn how to ingest logs using the built-in `greptime_identity` pipeline and integrate with popular log collectors.

GreptimeDB provides a powerful pipeline-based log ingestion system.
For quick setup with JSON-formatted logs,
you can use the built-in `greptime_identity` pipeline, which:

- Automatically handles field mapping from JSON to table columns
- Creates tables dynamically if they don't exist
- Supports flexible schemas for varying log structures
- Requires minimal configuration to get started

This makes it ideal for getting started quickly or for logs with dynamic schemas.

## Direct HTTP Ingestion

The simplest way to test GreptimeDB's log ingestion is through a direct HTTP request using the `greptime_identity` pipeline.

For example, you can use `curl` to send a POST request with JSON log data:

```shell
curl -X POST \
  "http://localhost:4000/v1/ingest?db=public&table=demo_logs&pipeline_name=greptime_identity" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic {{authentication}}" \
  -d '[
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "level": "INFO",
      "service": "web-server",
      "message": "User login successful",
      "user_id": 12345,
      "ip_address": "192.168.1.100"
    },
    {
      "timestamp": "2024-01-15T10:31:00Z",
      "level": "ERROR", 
      "service": "database",
      "message": "Connection timeout occurred",
      "error_code": 500,
      "retry_count": 3
    }
  ]'
```

The key parameters are:

- `db=public`: Target database name (use your database name)
- `table=demo_logs`: Target table name (created automatically if it doesn't exist)
- `pipeline_name=greptime_identity`: Uses `greptime_identity` identity pipeline for JSON processing
- `Authorization` header: Basic authentication with base64-encoded `username:password`, see the [HTTP Authentication Guide](/user-guide/protocols/http.md#authentication)

A successful request returns:
```json
{
  "output": [{"affectedrows": 2}],
  "execution_time_ms": 15
}
```
After successful ingestion,
the corresponding table `demo_logs` is automatically created with columns based on the JSON fields.
The schema is as follows:

```sql
+--------------------+---------------------+------+------+---------+---------------+
| Column             | Type                | Key  | Null | Default | Semantic Type |
+--------------------+---------------------+------+------+---------+---------------+
| greptime_timestamp | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| ip_address         | String              |      | YES  |         | FIELD         |
| level              | String              |      | YES  |         | FIELD         |
| message            | String              |      | YES  |         | FIELD         |
| service            | String              |      | YES  |         | FIELD         |
| timestamp          | String              |      | YES  |         | FIELD         |
| user_id            | Int64               |      | YES  |         | FIELD         |
| error_code         | Int64               |      | YES  |         | FIELD         |
| retry_count        | Int64               |      | YES  |         | FIELD         |
+--------------------+---------------------+------+------+---------+---------------+
```

## Integration with Log Collectors

For production environments,
you'll typically use log collectors to automatically forward logs to GreptimeDB.
Here is an example about how to configure Vector to send logs to GreptimeDB using the `greptime_identity` pipeline:

```toml
[sinks.my_sink_id]
type = "greptimedb_logs"
dbname = "public"
endpoint = "http://<host>:4000"
pipeline_name = "greptime_identity"
table = "<table>"
username = "<username>"
password = "<password>"
# Additional configurations as needed
```

The key configuration parameters are:
- `type = "greptimedb_logs"`: Specifies the GreptimeDB logs sink
- `dbname`: Target database name
- `endpoint`: GreptimeDB HTTP endpoint
- `pipeline_name`: Uses `greptime_identity` pipeline for JSON processing
- `table`: Target table name (created automatically if it doesn't exist)
- `username` and `password`: Credentials for HTTP Basic Authentication

For details about the Vector configuration and options,
refer to the [Vector Integration Guide](/user-guide/ingest-data/for-observability/vector.md#using-greptimedb_logs-sink-recommended).


## Next Steps

You've successfully ingested your first logs, here are the recommended next steps:

- **Integrate with Popular Log Collectors**: For detailed instructions on integrating GreptimeDB with various log collectors like Fluent Bit, Fluentd, and others, refer to the [Integrate with Popular Log Collectors](./overview.md#integrate-with-popular-log-collectors) section in the [Logs Overview](./overview.md) guide.
- **Using Custom Pipelines**: To learn more about creating custom pipelines for advanced log processing and transformation, refer to the [Using Custom Pipelines](./use-custom-pipelines.md) guide.
- **Learn more about the behaviours of built-in Pipelines**: Refer to the [Built-in Pipelines](/reference/pipeline/built-in-pipelines.md) guide for detailed information on available built-in pipelines and their configurations.

