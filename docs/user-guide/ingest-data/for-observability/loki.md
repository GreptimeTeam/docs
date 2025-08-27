---
keywords: [Loki, log storage, API, configuration, data model]
description: Guide to integrating Loki with GreptimeDB for log storage, including API usage, example configurations, and data model mapping.
---

# Loki

## Usage

### API

To send logs to GreptimeDB through the raw HTTP API, use the following information:

* **URL**: `http{s}://<host>/v1/loki/api/v1/push`
* **Headers**:
  * `X-Greptime-DB-Name`: `<dbname>`
  * `Authorization`: `Basic` authentication, which is a Base64 encoded string of `<username>:<password>`. For more information, please refer to [Authentication](https://docs.greptime.com/user-guide/deployments-administration/authentication/static/) and [HTTP API](https://docs.greptime.com/user-guide/protocols/http#authentication).
  * `X-Greptime-Log-Table-Name`: `<table_name>` (optional) - The table name to store the logs. If not provided, the default table name is `loki_logs`.

The request uses binary protobuf to encode the payload. The defined schema is the same as the [logproto.proto](https://github.com/grafana/loki/blob/main/pkg/logproto/logproto.proto).

### Example Code

[Grafana Alloy](https://grafana.com/docs/alloy/latest/) is a vendor-neutral distribution of the OpenTelemetry (OTel) Collector. Alloy uniquely combines the very best OSS observability signals in the community.

It supplies a Loki exporter that can be used to send logs to GreptimeDB. Here is an example configuration:

```hcl
loki.source.file "greptime" {
  targets = [
    {__path__ = "/tmp/foo.txt"},
  ]
  forward_to = [loki.write.greptime_loki.receiver]
}

loki.write "greptime_loki" {
    endpoint {
        url = "${GREPTIME_SCHEME:=http}://${GREPTIME_HOST:=greptimedb}:${GREPTIME_PORT:=4000}/v1/loki/api/v1/push"
        headers  = {
          "x-greptime-db-name" = "${GREPTIME_DB:=public}",
          "x-greptime-log-table-name" = "${GREPTIME_LOG_TABLE_NAME:=loki_demo_logs}",
        }
    }
    external_labels = {
        "job" = "greptime",
        "from" = "alloy",
    }
}
```

This configuration reads logs from the file `/tmp/foo.txt` and sends them to GreptimeDB. The logs are stored in the table `loki_demo_logs` with the external labels `job` and `from`.

For more information, please refer to the [Grafana Alloy loki.write documentation](https://grafana.com/docs/alloy/latest/reference/components/loki/loki.write/).

You can run the following command to check the data in the table:

```sql
SELECT * FROM loki_demo_logs;
+----------------------------+------------------------+--------------+-------+----------+
| greptime_timestamp         | line                   | filename     | from  | job      |
+----------------------------+------------------------+--------------+-------+----------+
| 2024-11-25 11:02:31.256251 | Greptime is very cool! | /tmp/foo.txt | alloy | greptime |
+----------------------------+------------------------+--------------+-------+----------+
1 row in set (0.01 sec)
```

## Data Model

The Loki logs data model is mapped to the GreptimeDB data model according to the following rules:

**Default table schema without external labels:**

```sql
DESC loki_demo_logs;
+--------------------+---------------------+------+------+---------+---------------+
| Column             | Type                | Key  | Null | Default | Semantic Type |
+--------------------+---------------------+------+------+---------+---------------+
| greptime_timestamp | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| line               | String              |      | YES  |         | FIELD         |
+--------------------+---------------------+------+------+---------+---------------+
5 rows in set (0.00 sec)
```

- `greptime_timestamp`: The timestamp of the log entry
- `line`: The log message content

If you specify external labels, they will be added as tags to the table schema (like `job` and `from` in the above example).

**Important notes:**
- You cannot specify tags manually; all labels are treated as tags with string type
- Do not attempt to pre-create the table using SQL to specify tag columns, as this will cause a type mismatch and write failure

### Example Table Schema

The following is an example of the table schema with external labels:

```sql
DESC loki_demo_logs;
+--------------------+---------------------+------+------+---------+---------------+
| Column             | Type                | Key  | Null | Default | Semantic Type |
+--------------------+---------------------+------+------+---------+---------------+
| greptime_timestamp | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| line               | String              |      | YES  |         | FIELD         |
| filename           | String              | PRI  | YES  |         | TAG           |
| from               | String              | PRI  | YES  |         | TAG           |
| job                | String              | PRI  | YES  |         | TAG           |
+--------------------+---------------------+------+------+---------+---------------+
5 rows in set (0.00 sec)
```

```sql
SHOW CREATE TABLE loki_demo_logs\G
*************************** 1. row ***************************
       Table: loki_demo_logs
Create Table: CREATE TABLE IF NOT EXISTS `loki_demo_logs` (
  `greptime_timestamp` TIMESTAMP(9) NOT NULL,
  `line` STRING NULL,
  `filename` STRING NULL,
  `from` STRING NULL,
  `job` STRING NULL,
  TIME INDEX (`greptime_timestamp`),
  PRIMARY KEY (`filename`, `from`, `job`)
)

ENGINE=mito
WITH(
  append_mode = 'true'
)
1 row in set (0.00 sec)
```

## Using Pipeline with Loki Push API

:::warning Experimental Feature
This experimental feature may contain unexpected behavior and have its functionality change in the future.
:::

Starting from version `v0.15`, GreptimeDB supports using pipelines to process Loki push requests.
You can simply set the HTTP header `x-greptime-pipeline-name` to the target pipeline name to enable pipeline processing.

**Note:** When request data goes through the pipeline engine, GreptimeDB adds prefixes to the label and metadata column names:
- `loki_label_` before each label name
- `loki_metadata_` before each structured metadata name
- The original Loki log line is named `loki_line`

### Pipeline Example

Here is a complete example demonstrating how to use pipelines with Loki push API.

**Step 1: Prepare the log file**

Suppose we have a log file named `logs.json` with JSON-formatted log entries:
```json
{"timestamp":"2025-08-21 14:23:17.892","logger":"sdk.tool.DatabaseUtil","level":"ERROR","message":"Connection timeout exceeded for database pool","trace_id":"a7f8c92d1e4b4c6f9d2e5a8b3f7c1d9e","source":"application"}
{"timestamp":"2025-08-21 14:23:18.156","logger":"core.scheduler.TaskManager","level":"WARN","message":"Task queue capacity reached 85% threshold","trace_id":"b3e9f4a6c8d2e5f7a1b4c7d9e2f5a8b3","source":"scheduler"}
{"timestamp":"2025-08-21 14:23:18.423","logger":"sdk.tool.NetworkUtil","level":"INFO","message":"Successfully established connection to remote endpoint","trace_id":"c5d8e7f2a9b4c6d8e1f4a7b9c2e5f8d1","source":"network"}
```

Each line is a separate JSON object containing log information.

**Step 2: Create the pipeline configuration**

Here is a pipeline configuration that parses the JSON log entries:
```yaml
# pipeline.yaml
version: 2
processors:
  - vrl:
      source: |
        message = parse_json!(.loki_line)
        target = {
          "log_time": parse_timestamp!(message.timestamp, "%Y-%m-%d %T%.3f"),
          "log_level": message.level,
          "log_source": message.source,
          "logger": message.logger,
          "message": message.message,
          "trace_id": message.trace_id,
        }
        . = target
transform:
  - field: log_time
    type: time, ms
    index: timestamp
```

Note that the input field name is `loki_line`, which contains the original log line from Loki.

**Step 3: Configure Grafana Alloy**

Prepare an Alloy configuration file to read the log file and send it to GreptimeDB:
```
loki.source.file "greptime" {
  targets = [
    {__path__ = "/logs.json"},
  ]
  forward_to = [loki.write.greptime_loki.receiver]
}

loki.write "greptime_loki" {
    endpoint {
        url = "http://127.0.0.1:4000/v1/loki/api/v1/push"
        headers = {
            "x-greptime-pipeline-name" = "pp",
        }
    }
    external_labels = {
        "job" = "greptime",
        "from" = "alloy",
    }
}
```

**Step 4: Deploy and run**

1. First, start your GreptimeDB instance.

2. Upload the pipeline configuration:

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/pp" -F "file=@pipeline.yaml"
```

3. Start the Alloy Docker container to process the logs:
```shell
docker run --rm \
    -v ./config.alloy:/etc/alloy/config.alloy \
    -v ./logs.json:/logs.json \
    --network host \
    grafana/alloy:latest \
      run --server.http.listen-addr=0.0.0.0:12345 --storage.path=/var/lib/alloy/data \
      /etc/alloy/config.alloy
```

**Step 5: Verify the results**

After the logs are processed, you can verify that they have been successfully ingested and parsed. The database logs will show the ingestion activity.

Query the table using a MySQL client to see the parsed log data:
```sql
mysql> show tables;
+-----------+
| Tables    |
+-----------+
| loki_logs |
| numbers   |
+-----------+
2 rows in set (0.00 sec)

mysql> select * from loki_logs limit 1 \G
*************************** 1. row ***************************
  log_time: 2025-08-21 14:23:17.892000
 log_level: ERROR
log_source: application
    logger: sdk.tool.DatabaseUtil
   message: Connection timeout exceeded for database pool
  trace_id: a7f8c92d1e4b4c6f9d2e5a8b3f7c1d9e
1 row in set (0.01 sec)
```

This output demonstrates that the pipeline engine has successfully parsed the original JSON log lines and extracted the structured data into separate columns.

For more details about pipeline configuration and features, refer to the [pipeline documentation](/user-guide/logs/pipeline-config.md).
