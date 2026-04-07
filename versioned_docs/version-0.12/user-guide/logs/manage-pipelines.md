---
keywords: [manage pipelines, create pipeline, delete pipeline, built-in pipelines, pipeline debugging]
description: Guides on creating, deleting, and managing pipelines in GreptimeDB for parsing and transforming log data, including built-in pipelines and debugging.
---

# Manage Pipelines

In GreptimeDB, each `pipeline` is a collection of data processing units used for parsing and transforming the ingested log content. This document provides guidance on creating and deleting pipelines to efficiently manage the processing flow of log data.


For specific pipeline configurations, please refer to the [Pipeline Configuration](pipeline-config.md) documentation.

## Built-in Pipelines

GreptimeDB offers built-in pipelines for common log formats, allowing you to use them directly without creating new pipelines.

Note that the built-in pipelines are not editable. Additionally, the "greptime_" prefix of the pipeline name is reserved.

### `greptime_identity`

The `greptime_identity` pipeline is designed for writing JSON logs and automatically creates columns for each field in the JSON log.

- The first-level keys in the JSON log are used as column names.
- An error is returned if the same field has different types.
- Fields with `null` values are ignored.
- An additional column, `greptime_timestamp`, is added to the table as the time index to indicate when the log was written.

#### Type conversion rules

- `string` -> `string`
- `number` -> `int64` or `float64`
- `boolean` -> `bool`
- `null` -> ignore
- `array` -> `json`
- `object` -> `json`


For example, if we have the following json data:

```json
[
    {"name": "Alice", "age": 20, "is_student": true, "score": 90.5,"object": {"a":1,"b":2}},
    {"age": 21, "is_student": false, "score": 85.5, "company": "A" ,"whatever": null},
    {"name": "Charlie", "age": 22, "is_student": true, "score": 95.5,"array":[1,2,3]}
]
```

We'll merge the schema for each row of this batch to get the final schema. The table schema will be:

```sql
mysql> desc pipeline_logs;
+--------------------+---------------------+------+------+---------+---------------+
| Column             | Type                | Key  | Null | Default | Semantic Type |
+--------------------+---------------------+------+------+---------+---------------+
| age                | Int64               |      | YES  |         | FIELD         |
| is_student         | Boolean             |      | YES  |         | FIELD         |
| name               | String              |      | YES  |         | FIELD         |
| object             | Json                |      | YES  |         | FIELD         |
| score              | Float64             |      | YES  |         | FIELD         |
| company            | String              |      | YES  |         | FIELD         |
| array              | Json                |      | YES  |         | FIELD         |
| greptime_timestamp | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
+--------------------+---------------------+------+------+---------+---------------+
8 rows in set (0.00 sec)
```

The data will be stored in the table as follows:

```sql
mysql> select * from pipeline_logs;
+------+------------+---------+---------------+-------+---------+---------+----------------------------+
| age  | is_student | name    | object        | score | company | array   | greptime_timestamp         |
+------+------------+---------+---------------+-------+---------+---------+----------------------------+
|   22 |          1 | Charlie | NULL          |  95.5 | NULL    | [1,2,3] | 2024-10-18 09:35:48.333020 |
|   21 |          0 | NULL    | NULL          |  85.5 | A       | NULL    | 2024-10-18 09:35:48.333020 |
|   20 |          1 | Alice   | {"a":1,"b":2} |  90.5 | NULL    | NULL    | 2024-10-18 09:35:48.333020 |
+------+------------+---------+---------------+-------+---------+---------+----------------------------+
3 rows in set (0.01 sec)
```

## Create a Pipeline

GreptimeDB provides a dedicated HTTP interface for creating pipelines.
Assuming you have prepared a pipeline configuration file `pipeline.yaml`, use the following command to upload the configuration file, where `test` is the name you specify for the pipeline:

```shell
## Upload the pipeline file. 'test' is the name of the pipeline
curl -X "POST" "http://localhost:4000/v1/events/pipelines/test?db=public" -F "file=@pipeline.yaml"
```

The created Pipeline is associated with a database, which can be specified with the URL parameter `db`, defaulting to `public`.
When writing log to a database, the Pipeline used must be under the same database as the table being written to.

## Delete a Pipeline

You can use the following HTTP interface to delete a pipeline:

```shell
## 'test' is the name of the pipeline
curl -X "DELETE" "http://localhost:4000/v1/events/pipelines/test?db=public&version=2024-06-27%2012%3A02%3A34.257312110Z"
```

In the above example, we deleted a pipeline named `test` in `public` database. The `version` parameter is required to specify the version of the pipeline to be deleted.

## Query Pipelines

Currently, you can use SQL to query pipeline information.

```sql
SELECT * FROM greptime_private.pipelines;
```

Please note that if you are using the MySQL or PostgreSQL protocol to connect to GreptimeDB, the precision of the pipeline time information may vary, and nanosecond-level precision may be lost.

To address this issue, you can cast the `created_at` field to a timestamp to view the pipeline's creation time. For example, the following query displays `created_at` in `bigint` format:

```sql
SELECT name, pipeline, created_at::bigint FROM greptime_private.pipelines;
```

The query result is as follows:

```
 name |             pipeline              | greptime_private.pipelines.created_at
------+-----------------------------------+---------------------------------------
 test | processors:                      +|                   1719489754257312110
      |   - date:                        +|
      |       field: time                +|
      |       formats:                   +|
      |         - "%Y-%m-%d %H:%M:%S%.3f"+|
      |       ignore_missing: true       +|
      |                                  +|
      | transform:                       +|
      |   - fields:                      +|
      |       - id1                      +|
      |       - id2                      +|
      |     type: int32                  +|
      |   - fields:                      +|
      |       - type                     +|
      |       - logger                   +|
      |     type: string                 +|
      |     index: tag                   +|
      |   - fields:                      +|
      |       - log                      +|
      |     type: string                 +|
      |     index: fulltext              +|
      |   - field: time                  +|
      |     type: time                   +|
      |     index: timestamp             +|
      |                                   |
(1 row)
```

Then, you can use a program to convert the bigint type timestamp from the SQL result into a time string.

```shell
timestamp_ns="1719489754257312110"; readable_timestamp=$(TZ=UTC date -d @$((${timestamp_ns:0:10}+0)) +"%Y-%m-%d %H:%M:%S").${timestamp_ns:10}Z; echo "Readable timestamp (UTC): $readable_timestamp"
```

Output:

```shell
Readable timestamp (UTC): 2024-06-27 12:02:34.257312110Z
```

The output `Readable timestamp (UTC)` represents the creation time of the pipeline and also serves as the version number.

## Debug

First, please refer to the [Quick Start example](/user-guide/logs/quick-start.md#write-logs-by-pipeline) to see the correct execution of the Pipeline.

### Debug creating a Pipeline

You may encounter errors when creating a Pipeline. For example, when creating a Pipeline using the following configuration:


```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/test" \
     -H 'Content-Type: application/x-yaml' \
     -d $'processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true
  - gsub:
      fields:
        - message
      pattern: "\\\."
      replacement:
        - "-"
      ignore_missing: true

transform:
  - fields:
      - message
    type: string
  - field: time
    type: time
    index: timestamp'
```

The pipeline configuration contains an error. The `gsub` Processor expects the `replacement` field to be a string, but the current configuration provides an array. As a result, the pipeline creation fails with the following error message:


```json
{"error":"Failed to parse pipeline: 'replacement' must be a string"}
```

Therefore, We need to modify the configuration of the `gsub` Processor and change the value of the `replacement` field to a string type.

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/test" \
     -H 'Content-Type: application/x-yaml' \
     -d $'processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true
  - gsub:
      fields:
        - message
      pattern: "\\\."
      replacement: "-"
      ignore_missing: true

transform:
  - fields:
      - message
    type: string
  - field: time
    type: time
    index: timestamp'
```

Now that the Pipeline has been created successfully, you can test the Pipeline using the `dryrun` interface.

### Debug writing logs

We can test the Pipeline using the `dryrun` interface. We will test it with erroneous log data where the value of the message field is in numeric format, causing the pipeline to fail during processing.

**This API is only used to test the results of the Pipeline and does not write logs to GreptimeDB.**


```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/dryrun?pipeline_name=test" \
     -H 'Content-Type: application/json' \
     -d $'{"message": 1998.08,"time":"2024-05-25 20:16:37.217"}'

{"error":"Failed to execute pipeline, reason: gsub processor: expect string or array string, but got Float64(1998.08)"}
```

The output indicates that the pipeline processing failed because the `gsub` Processor expects a string type rather than a floating-point number type. We need to adjust the format of the log data to ensure the pipeline can process it correctly.
Let's change the value of the message field to a string type and test the pipeline again.

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/dryrun?pipeline_name=test" \
     -H 'Content-Type: application/json' \
     -d $'{"message": "1998.08","time":"2024-05-25 20:16:37.217"}'
```

At this point, the Pipeline processing is successful, and the output is as follows:

```json
{
    "rows": [
        [
            {
                "data_type": "STRING",
                "key": "message",
                "semantic_type": "FIELD",
                "value": "1998-08"
            },
            {
                "data_type": "TIMESTAMP_NANOSECOND",
                "key": "time",
                "semantic_type": "TIMESTAMP",
                "value": "2024-05-25 20:16:37.217+0000"
            }
        ]
    ],
    "schema": [
        {
            "column_type": "FIELD",
            "data_type": "STRING",
            "fulltext": false,
            "name": "message"
        },
        {
            "column_type": "TIMESTAMP",
            "data_type": "TIMESTAMP_NANOSECOND",
            "fulltext": false,
            "name": "time"
        }
    ]
}
```

It can be seen that the `.` in the string `1998.08` has been replaced with `-`, indicating a successful processing of the Pipeline.
