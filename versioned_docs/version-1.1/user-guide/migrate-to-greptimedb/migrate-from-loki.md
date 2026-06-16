---
keywords: [migrate from Loki, Loki push API, log migration, Grafana Alloy, log pipelines]
description: Guide to migrating from Loki to GreptimeDB, including Loki-compatible ingestion, dual-write cutover, data model mapping, and pipeline-based log parsing.
---

# Migrate from Loki

This guide explains how to migrate Loki log ingestion to GreptimeDB.
GreptimeDB supports the Loki push API for log ingestion, so existing Loki-compatible writers can send logs to GreptimeDB with minimal configuration changes.

The Loki-compatible endpoint in GreptimeDB is for ingestion.
For querying and dashboards, use GreptimeDB SQL, [full-text search](/user-guide/logs/fulltext-search.md), the [GreptimeDB Dashboard](/getting-started/installation/greptimedb-dashboard.md), and the [Grafana integration](/user-guide/integrations/grafana.md) instead of LogQL.

## Before you start the migration

Review the current Loki deployment and decide how logs should be stored in GreptimeDB:

* Identify every writer that sends logs to Loki, such as Grafana Alloy, OpenTelemetry Collector, Promtail, Fluent Bit, Vector, or custom clients.
* Plan the target GreptimeDB database and table name. If no table header is provided, GreptimeDB writes Loki logs to `loki_logs`.
* Review Loki stream labels. GreptimeDB stores labels as tag columns, so avoid high-cardinality labels such as request IDs, user IDs, and trace IDs.
* Decide whether raw log lines are enough or whether you need a GreptimeDB pipeline to parse log lines into structured columns.
* Plan historical migration. GreptimeDB does not import Loki chunk or index files directly; migrate historical logs by replaying from the original log sources, archives, or exported records through GreptimeDB's log ingestion APIs.

For new collector changes, [Grafana Alloy](/user-guide/integrations/alloy.md) is recommended.
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
| `X-Greptime-DB-Name` | No | Target database name. The default is `public`. |
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

  file_match {
    enabled = true
  }
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
This example follows the Loki component pattern in the [Grafana Alloy guide](/user-guide/ingest-data/for-observability/alloy.md): `loki.source.file` reads files, `loki.process` keeps label processing in the Loki pipeline, and `loki.write.endpoint` carries the GreptimeDB URL, custom headers, and optional Basic authentication.
Because the example uses a glob pattern in `__path__`, `file_match` enables Alloy's built-in file discovery so the pattern is expanded to matching files. If you use an exact file path, you can omit `file_match`.

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

You can also open the [GreptimeDB Dashboard](/getting-started/installation/greptimedb-dashboard.md) at `http://<host>:4000/dashboard` and use Log View to query the ingested logs.

### Parse Loki log lines with a pipeline

Use a GreptimeDB pipeline when the Loki log line contains JSON, logfmt, Nginx access logs, or another structured format that should become queryable columns.
If you use an AI coding agent to create the pipeline, you can give it the [`greptimedb-pipeline` Skill](/faq-and-others/vibecoding.md#greptimedb-skills) so it can generate, dry-run, and refine the pipeline configuration.

When `X-Greptime-Pipeline-Name` or `X-Greptime-Log-Pipeline-Name` is present, GreptimeDB sends each Loki entry through the pipeline with these input fields:

| Pipeline input field | Description |
| --- | --- |
| `greptime_timestamp` | Loki entry timestamp. |
| `loki_line` | Original Loki log line. |
| `loki_label_<name>` | Loki stream label value. |
| `loki_metadata_<name>` | Loki structured metadata value. |

For example, suppose Alloy reads the following ZooKeeper log file:

```text
2015-08-25 11:23:58,959 - WARN  [LearnerHandler-/10.10.34.11:45441:Leader@574] - Committing zxid 0xf00000000 from /10.10.34.13:2888 not first!
2015-08-25 11:23:58,960 - WARN  [LearnerHandler-/10.10.34.11:45441:Leader@576] - First is 0x0
2015-08-25 11:23:58,960 - INFO  [LearnerHandler-/10.10.34.11:45441:Leader@598] - Have quorum of supporters; starting up and setting last processed zxid: 0xf00000000
2015-08-25 11:26:27,891 - INFO  [/10.10.34.13:3888:QuorumCnxManager$Listener@493] - Received connection request /10.10.34.12:57513
2015-08-25 11:26:27,897 - INFO  [WorkerReceiver[myid=3]:FastLeaderElection@542] - Notification: 2 (n.leader), 0xd0000001b (n.zxid), 0x1 (n.round), LOOKING (n.state), 2 (n.sid), 0xd (n.peerEPoch), LEADING (my state)
2015-08-25 11:26:27,898 - INFO  [WorkerReceiver[myid=3]:FastLeaderElection@542] - Notification: 3 (n.leader), 0xd0000001b (n.zxid), 0x3 (n.round), LOOKING (n.state), 2 (n.sid), 0xe (n.peerEPoch), LEADING (my state)
2015-08-25 11:26:28,138 - INFO  [LearnerHandler-/10.10.34.12:38330:LearnerHandler@263] - Follower sid: 2 : info : org.apache.zookeeper.server.quorum.QuorumPeer$QuorumServer@7761c32f
2015-08-25 11:26:28,159 - INFO  [LearnerHandler-/10.10.34.12:38330:LearnerHandler@318] - Synchronizing with Follower sid: 2 maxCommittedLog=0x0 minCommittedLog=0x0 peerLastZxid=0xd0000001b
2015-08-25 11:26:28,159 - INFO  [LearnerHandler-/10.10.34.12:38330:LearnerHandler@395] - Sending SNAP
2015-08-25 11:26:28,159 - INFO  [LearnerHandler-/10.10.34.12:38330:LearnerHandler@419] - Sending snapshot last zxid of peer is 0xd0000001b  zxid of leader is 0xf00000000sent zxid of db as 0xf00000000
```

Create a pipeline that extracts the ZooKeeper timestamp, level, thread, source line, and message:

```yaml
# zk_pipeline.yaml
version: 2
processors:
  - regex:
      fields:
        - loki_line, zk
      patterns:
        - '^(?<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) - (?<level>[A-Z]+)\s+\[(?<thread>.*)@(?<source_line>\d+)\] - (?<message>.*)$'
      ignore_missing: true
  - date:
      fields:
        - zk_timestamp
      formats:
        - "%Y-%m-%d %H:%M:%S,%3f"
      timezone: "UTC"
  - select:
      fields:
        - zk_timestamp
        - zk_level
        - zk_thread
        - zk_source_line
        - zk_message
        - loki_label_job
        - loki_label_env
transform:
  - field: zk_timestamp
    type: time
    index: timestamp
  - fields:
      - zk_level
      - loki_label_job
      - loki_label_env
    type: string
    tag: true
  - field: zk_thread
    type: string
    index: inverted
  - field: zk_source_line
    type: int32
  - field: zk_message
    type: string
    index: fulltext
```

The sample timestamps do not include a time zone. Set `timezone` to the time zone used by the log producer.

Upload the pipeline:

```bash
curl -X POST "http://localhost:4000/v1/pipelines/zk_logs" \
  -F "file=@zk_pipeline.yaml"
```

Then add the pipeline header to the GreptimeDB Loki sink:

```hcl
loki.write "greptimedb" {
  endpoint {
    url = "http://greptimedb:4000/v1/loki/api/v1/push"
    headers = {
      "X-Greptime-DB-Name"        = "public",
      "X-Greptime-Log-Table-Name" = "loki_zookeeper_logs",
      "X-Greptime-Pipeline-Name"  = "zk_logs",
    }
  }
}
```

When Alloy sends the ZooKeeper log file through this sink, GreptimeDB applies the pipeline before inserting rows into `loki_zookeeper_logs`.

After writing through the pipeline, query the structured columns:

```sql
SELECT
  zk_timestamp,
  loki_label_job AS job,
  loki_label_env AS env,
  zk_level,
  zk_thread,
  zk_source_line,
  zk_message
FROM loki_zookeeper_logs
WHERE zk_level = 'WARN'
ORDER BY zk_timestamp DESC
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
