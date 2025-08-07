---
keywords: [Loki, log storage, API, configuration, data model]
description: Guide to integrating Loki with GreptimeDB for log storage, including API usage, example configurations, and data model mapping.
---

# Loki

## Usage

### API

To send Logs to GreptimeDB through Raw HTTP API, use the following information:

* URL: `http{s}://<host>/v1/loki/api/v1/push`
* Headers:
  * `X-Greptime-DB-Name`: `<dbname>`
  * `Authorization`: `Basic` authentication, which is a Base64 encoded string of `<username>:<password>`. For more information, please refer to [Authentication](https://docs.greptime.com/user-guide/deployments-administration/authentication/static/) and [HTTP API](https://docs.greptime.com/user-guide/protocols/http#authentication).
  * `X-Greptime-Log-Table-Name`: `<table_name>` (optional) - The table name to store the logs. If not provided, the default table name is `loki_logs`.

  The request uses binary protobuf to encode the payload, The defined schema is the same as the [logproto.proto](https://github.com/grafana/loki/blob/main/pkg/logproto/logproto.proto).

### Example Code

[Grafana Alloy](https://grafana.com/docs/alloy/latest/) is a vendor-neutral distribution of the OpenTelemetry (OTel) Collector. Alloy uniquely combines the very best OSS observability signals in the community.

It suplies a Loki exporter that can be used to send logs to GreptimeDB. Here is an example configuration:

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
        "job" = "greptime"
        "from" = "alloy"
    }
}
```

We listen to the file `/tmp/foo.txt` and send the logs to GreptimeDB. The logs are stored in the table `loki_demo_logs` with the external labels `job` and `from`.

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

Default table schema without external labels:

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

- greptime_timestamp: The timestamp of the log.
- line: The log message.

if you specify the external labels, we will add them as tags to the table schema. like `job` and `from` in the above example.
You can't specify tags manually, all labels are treated as tags and string type.
Please do not attempt to pre-create the table using SQL to specify tag columns, as this will cause a type mismatch and write failure.

### Example

The following is an example of the table schema:

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

## Using pipeline in Loki push API

:::warning Experimental Feature
This experimental feature may contain unexpected behavior, have its functionality change in the future.
:::

Starting from `v0.15`, GreptimeDB supports using pipeline to process Loki push requests.
You can simply set the HTTP header `x-greptime-pipeline-name` to the target pipeline name to enable pipeline processing.

Note, if the request data go through the pipeline engine, GreptimeDB will add prefix to the label and metadata column names:
- `loki_label_` before each label name
- `loki_metadata_` before each structured metadata name
- The original Loki log line would be named `loki_line`

An example of data model using `greptime_identity` would be like the following:
```
mysql> select * from loki_logs limit 1;
+----------------------------+---------------------+---------------------------+---------------------------------------------------------------------------+
| greptime_timestamp         | loki_label_platform | loki_label_service_name   | loki_line                                                                 |
+----------------------------+---------------------+---------------------------+---------------------------------------------------------------------------+
| 2025-07-15 11:40:26.651141 | docker              | docker-monitoring-alloy-1 | ts=2025-07-15T11:40:15.532342849Z level=info "boringcrypto enabled"=false |
+----------------------------+---------------------+---------------------------+---------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

You can see that the label column names are prefixed with `loki_label_`.
The actual log line is named `loki_line`.
You can use a custom pipeline to process the data. It would be working like a normal pipeline process.

You can refer to the [pipeline's documentation](/user-guide/logs/pipeline-config.md) for more details.
