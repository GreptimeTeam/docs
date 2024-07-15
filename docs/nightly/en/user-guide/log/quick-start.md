# Quick Start


## Download and install & start GreptimeDB

Follow the [Installation Guide](/getting-started/overview.md) to install and start GreptimeDB.

## Create a Pipeline

GreptimeDB provides a dedicated HTTP interface for creating Pipelines. Here's how to do it:

First, create a Pipeline file, for example, `pipeline.yaml`.

```yaml
# pipeline.yaml
processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true

transform:
  - fields:
      - id1
      - id2
    type: int32
  - fields:
      - type
      - logger
    type: string
    index: tag
  - fields:
      - log
    type: string
    index: fulltext
  - field: time
    type: time
    index: timestamp
```

Then, execute the following command to upload the configuration file:

```shell
## Upload the pipeline file. "test" is the name of the Pipeline
curl -X "POST" "http://localhost:4000/v1/events/pipelines/test" -F "file=@pipeline.yaml"
```

After the successful execution of this command, a Pipeline named `test` will be created, and the result will be returned as: `{"name":"test","version":"2024-06-27 12:02:34.257312110Z"}`.
Here, `name` is the name of the Pipeline, and `version` is the Pipeline version.

This Pipeline includes one Processor and three Transforms. The Processor uses the Rust time format string `%Y-%m-%d %H:%M:%S%.3f` to parse the timestamp field in the logs, and then the Transforms convert the `id1` and `id2` fields to `int32` type, the `type` and `logger` fields to `string` type with an index of "tag", the `log` field to `string` type with an index of "fulltext", and the `time` field to a time type with an index of "timestamp".

Refer to the [Pipeline Introduction](log-pipeline.md) for specific syntax details.

## Query Pipelines

You can use SQL to query the pipeline content stored in the database. The example query is as follows:

```sql
SELECT * FROM greptime_private.pipelines;
```

The query result is as follows:

```sql
 name | schema | content_type |             pipeline              |         created_at
------+--------+--------------+-----------------------------------+----------------------------
 test | public | yaml         | processors:                      +| 2024-06-27 12:02:34.257312
      |        |              |   - date:                        +|
      |        |              |       field: time                +|
      |        |              |       formats:                   +|
      |        |              |         - "%Y-%m-%d %H:%M:%S%.3f"+|
      |        |              |       ignore_missing: true       +|
      |        |              |                                  +|
      |        |              | transform:                       +|
      |        |              |   - fields:                      +|
      |        |              |       - id1                      +|
      |        |              |       - id2                      +|
      |        |              |     type: int32                  +|
      |        |              |   - fields:                      +|
      |        |              |       - type                     +|
      |        |              |       - logger                   +|
      |        |              |     type: string                 +|
      |        |              |     index: tag                   +|
      |        |              |   - fields:                      +|
      |        |              |       - log                      +|
      |        |              |     type: string                 +|
      |        |              |     index: fulltext              +|
      |        |              |   - field: time                  +|
      |        |              |     type: time                   +|
      |        |              |     index: timestamp             +|
      |        |              |                                   |
(1 row)
```

## Write logs

The HTTP interface for writing logs is as follows:

```shell
curl -X "POST" "http://localhost:4000/v1/events/logs?db=public&table=logs&pipeline_name=test" \
     -H 'Content-Type: application/json' \
     -d $'{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}
{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}
{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}
{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}'
```

The above command returns the following result:

```json
{"output":[{"affectedrows":4}],"execution_time_ms":22}
```

In the above example, we successfully wrote 4 log entries to the `public.logs` table.

Please refer to [Writing Logs with Pipeline](write-log.md) for specific syntax for writing logs.

## `logs` table structure

We can use SQL to query the structure of the `public.logs` table.

```sql
DESC TABLE logs;
```

The query result is as follows:

```sql
 Column |        Type         | Key | Null | Default | Semantic Type
--------+---------------------+-----+------+---------+---------------
 id1    | Int32               |     | YES  |         | FIELD
 id2    | Int32               |     | YES  |         | FIELD
 type   | String              | PRI | YES  |         | TAG
 logger | String              | PRI | YES  |         | TAG
 log    | String              |     | YES  |         | FIELD
 time   | TimestampNanosecond | PRI | NO   |         | TIMESTAMP
(6 rows)
```

From the above result, we can see that based on the processed result of the pipeline, the `public.logs` table contains 6 fields: `id1` and `id2` are converted to the `Int32` type, `type`, `log`, and `logger` are converted to the `String` type, and time is converted to a `TimestampNanosecond` type and indexed as Timestamp.

## Query logs

We can use standard SQL to query log data.

```shell
# Connect to GreptimeDB using MySQL or PostgreSQL protocol

# MySQL
mysql --host=127.0.0.1 --port=4002 public

# PostgreSQL
psql -h 127.0.0.1 -p 4003 -d public
```

You can query the log table using SQL:

```sql
SELECT * FROM public.logs;
```

The query result is as follows:

```sql
 id1  | id2  | type |      logger      |                    log                     |            time
------+------+------+------------------+--------------------------------------------+----------------------------
 2436 | 2528 | I    | INTERACT.MANAGER | ClusterAdapter:enter sendTextDataToCluster+| 2024-05-25 20:16:37.217000
      |      |      |                  |                                            |
 2436 | 2528 | I    | INTERACT.MANAGER | ClusterAdapter:enter sendTextDataToCluster+| 2024-05-25 20:16:37.217000
      |      |      |                  |                                            |
 2436 | 2528 | I    | INTERACT.MANAGER | ClusterAdapter:enter sendTextDataToCluster+| 2024-05-25 20:16:37.217000
      |      |      |                  |                                            |
 2436 | 2528 | I    | INTERACT.MANAGER | ClusterAdapter:enter sendTextDataToCluster+| 2024-05-25 20:16:37.217000
      |      |      |                  |                                            |
(4 rows)
```

As you can see, the logs have been stored as structured logs after applying type conversions using the pipeline. This provides convenience for further querying and analysis of the logs.

## Conclusion

By following the above steps, you have successfully created a pipeline, written logs, and performed queries. This is just the tip of the iceberg in terms of the capabilities offered by GreptimeDB.
Next, please continue reading [Pipeline Configuration](log-pipeline.md) and [Managing Pipelines](manage-pipeline.md) to learn more about advanced features and best practices.