---
keywords: [migrate from Loki, Loki push API, log migration, Grafana Alloy, log pipelines]
description: Guide to migrating from Loki to GreptimeDB, including Loki-compatible ingestion, dual-write cutover, data model mapping, and pipeline-based log parsing.
---

# Migrate from Loki

This guide explains how to migrate Loki log ingestion to GreptimeDB.
GreptimeDB supports the Loki push API for log ingestion, so existing Loki-compatible writers can send logs to GreptimeDB with minimal configuration changes.

The Loki-compatible endpoint in GreptimeDB is for ingestion.
For querying and dashboards, use GreptimeDB SQL, full-text search, and the [Grafana integration](/user-guide/integrations/grafana.md) instead of LogQL.

## Before you start the migration

Review the current Loki deployment and decide how logs should be stored in GreptimeDB:

* Identify every writer that sends logs to Loki, such as Grafana Alloy, OpenTelemetry Collector, Promtail, Fluent Bit, Vector, or custom clients.
* Plan the target GreptimeDB database and table name. If no table header is provided, GreptimeDB writes Loki logs to `loki_logs`.
* Review Loki stream labels. GreptimeDB stores labels as tag columns, so avoid high-cardinality labels such as request IDs, user IDs, and trace IDs.
* Decide whether raw log lines are enough or whether you need a GreptimeDB pipeline to parse log lines into structured columns.
* Plan historical migration. GreptimeDB does not import Loki chunk or index files directly; migrate historical logs by replaying from the original log sources, archives, or exported records through GreptimeDB's log ingestion APIs.

For new collector changes, Grafana Alloy is recommended.
If you still run an existing Loki-compatible client, you can retarget it to GreptimeDB by changing the Loki push URL and adding GreptimeDB headers.

## Migration steps

### Configure the GreptimeDB Loki endpoint

Send Loki push requests to:

```text
http{s}://<host>:4000/v1/loki/api/v1/push
```

Use the following GreptimeDB-specific headers:

| Header | Required | Description |
| --- | --- | --- |
| `X-Greptime-DB-Name` | Yes | Target database name, for example `public`. |
| `X-Greptime-Log-Table-Name` | No | Target log table name. The default is `loki_logs`. |
| `Authorization` | Depends on deployment | Basic authentication with Base64-encoded `<username>:<password>`. |
| `X-Greptime-Pipeline-Name` or `X-Greptime-Log-Pipeline-Name` | No | Pipeline name for parsing Loki entries before insertion. |

GreptimeDB accepts the same Loki push body shapes:

* `Content-Type: application/x-protobuf`: a Snappy-compressed Loki `PushRequest`.
* `Content-Type: application/json`: a JSON body with a top-level `streams` array.

The following JSON request is useful for a quick connectivity check:

```bash
curl -X POST "http://localhost:4000/v1/loki/api/v1/push" \
  -H "Content-Type: application/json" \
  -H "X-Greptime-DB-Name: public" \
  -H "X-Greptime-Log-Table-Name: loki_demo_logs" \
  --data-raw '{
    "streams": [
      {
        "stream": {
          "job": "api",
          "env": "prod"
        },
        "values": [
          ["1731748568804293888", "request completed", {"trace_id": "abc"}]
        ]
      }
    ]
  }'
```

### Dual-write to Loki and GreptimeDB

During migration, write to both Loki and GreptimeDB until you have validated ingestion, retention, dashboards, and alerts.

The following Alloy example keeps the existing Loki sink and adds GreptimeDB as a second Loki-compatible sink:

```hcl
loki.source.file "app" {
  targets = [
    {__path__ = "/var/log/app/*.log"},
  ]
  forward_to = [loki.process.app.receiver]
}

loki.process "app" {
  forward_to = [
    loki.write.existing_loki.receiver,
    loki.write.greptimedb.receiver,
  ]

  stage.static_labels {
    values = {
      job = "app",
      env = "prod",
    }
  }
}

loki.write "existing_loki" {
  endpoint {
    url = "http://loki:3100/loki/api/v1/push"
  }
}

loki.write "greptimedb" {
  endpoint {
    url = "http://greptimedb:4000/v1/loki/api/v1/push"
    headers = {
      "X-Greptime-DB-Name"        = "public",
      "X-Greptime-Log-Table-Name" = "loki_app_logs",
    }

    basic_auth {
      username = "<greptime_user>"
      password = "<greptimedb_password>"
    }
  }
}
```

If your collector already has a Loki output, keep its labels and processing stages unchanged at first.
Only change the GreptimeDB sink URL, database header, table header, and authentication settings.

### Validate the direct ingestion data model

Without a pipeline, GreptimeDB stores Loki entries in a raw log table:

| Loki data | GreptimeDB column |
| --- | --- |
| Entry timestamp | `greptime_timestamp` time index |
| Log line | `line` field |
| Structured metadata | `structured_metadata` JSON field |
| Stream labels | String tag columns |

For direct ingestion, let GreptimeDB create the table on the first write.
Do not pre-create the direct-ingest table with SQL to specify label columns.
Labels are dynamic and become tag columns in the generated schema.
If you need a custom schema, use a pipeline and create the table from the pipeline configuration.

Use SQL to verify the result:

```sql
DESC loki_app_logs;

SELECT greptime_timestamp, line, job, env, structured_metadata
FROM loki_app_logs
ORDER BY greptime_timestamp DESC
LIMIT 10;
```

You can also check that the table is recognized as Loki log data:

```sql
SELECT table_schema, table_name, signal_type, source
FROM information_schema.table_semantics
WHERE table_name = 'loki_app_logs';
```

### Parse Loki log lines with a pipeline

Use a GreptimeDB pipeline when the Loki log line contains JSON, logfmt, Nginx access logs, or another structured format that should become queryable columns.

When `X-Greptime-Pipeline-Name` or `X-Greptime-Log-Pipeline-Name` is present, GreptimeDB sends each Loki entry through the pipeline with these input fields:

| Pipeline input field | Description |
| --- | --- |
| `greptime_timestamp` | Loki entry timestamp. |
| `loki_line` | Original Loki log line. |
| `loki_label_<name>` | Loki stream label value. |
| `loki_metadata_<name>` | Loki structured metadata value. |

For example, create a pipeline that parses JSON log lines:

```yaml
# loki_pipeline.yaml
version: 2
processors:
  - vrl:
      source: |
        message = parse_json!(.loki_line)
        . = {
          "ts": .greptime_timestamp,
          "service": .loki_label_job,
          "env": .loki_label_env,
          "level": message.level,
          "message": message.message,
          "trace_id": message.trace_id,
        }
transform:
  - field: ts
    type: timestamp, ns
    index: timestamp
  - fields:
      - service
      - env
      - level
    type: string
    tag: true
  - field: message
    type: string
    index: fulltext
  - field: trace_id
    type: string
    index: skipping
```

Upload the pipeline:

```bash
curl -X POST "http://localhost:4000/v1/pipelines/loki_json" \
  -F "file=@loki_pipeline.yaml"
```

Then add the pipeline header to the GreptimeDB Loki sink:

```hcl
loki.write "greptimedb" {
  endpoint {
    url = "http://greptimedb:4000/v1/loki/api/v1/push"
    headers = {
      "X-Greptime-DB-Name"        = "public",
      "X-Greptime-Log-Table-Name" = "loki_app_logs",
      "X-Greptime-Pipeline-Name"  = "loki_json",
    }
  }
}
```

After writing through the pipeline, query the structured columns:

```sql
SELECT ts, service, env, level, message, trace_id
FROM loki_app_logs
WHERE env = 'prod'
ORDER BY ts DESC
LIMIT 10;
```

For full-text search on parsed message fields, see [Full-Text Search](/user-guide/logs/fulltext-search.md).

### Migrate historical logs

For a full historical migration, replay data into GreptimeDB rather than copying Loki storage files.
Common approaches include:

* Replay from the original log files or object-storage archives with Alloy, Vector, Fluent Bit, or custom scripts.
* Export selected Loki query results into newline-delimited records, convert them to Loki push JSON, and write them to GreptimeDB.
* Backfill only the retention window that must remain searchable after cutover, then rely on dual-write for new data.

During backfill, keep the original timestamps in nanoseconds so GreptimeDB preserves event time.
Run imports in bounded time ranges to make validation and retries manageable.

### Cut over reads and writes

Before disabling Loki writes, validate:

* Recent logs are present in GreptimeDB for every important service, namespace, and environment.
* Row counts or sampled records match Loki for the same time windows.
* GreptimeDB retention settings match the required log retention period.
* Dashboards and alerts have been moved from LogQL to SQL or GreptimeDB log queries.
* Full-text or skipping indexes exist for the columns used by frequent searches.

After validation, remove the Loki sink from the collector configuration and keep the GreptimeDB sink as the only log destination.

## Troubleshooting

### Unsupported content type

Set `Content-Type` to `application/x-protobuf` for Loki protobuf push clients or `application/json` for JSON requests.

### Protobuf decode or Snappy errors

Loki protobuf push bodies must be Snappy-compressed.
Do not send raw protobuf bytes without Snappy compression.

### Missing labels in GreptimeDB

Check the collector processing stages before `loki.write`.
Only labels that remain on the Loki stream when the request is sent become GreptimeDB tag columns.

### Table schema mismatch

For direct Loki ingestion, let GreptimeDB auto-create the table.
If you need a custom schema, use a pipeline and generate or create the table from the pipeline configuration.

## Related documentation

* [Loki protocol](/user-guide/ingest-data/for-observability/loki.md)
* [Grafana Alloy](/user-guide/ingest-data/for-observability/alloy.md)
* [Manage Pipelines](/user-guide/logs/manage-pipelines.md)
* [Full-Text Search](/user-guide/logs/fulltext-search.md)
