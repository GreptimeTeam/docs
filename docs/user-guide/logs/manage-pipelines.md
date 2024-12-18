---
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

### Debug Pipeline Configuration

Since the Pipeline configuration file and the data to be processed need to be uploaded simultaneously, and the data formats are inconsistent, it can lead to some difficulties in debugging from the command line. Therefore, we provide a graphical debugging interface in the logview of the Dashboard. If you need to debug from the command line, you can use the following script:

**This script is only for testing the processing results of the Pipeline and will not write logs into GreptimeDB.**

```bash
#! /bin/bash

PIPELINE_TYPE=$1
P1=$2
P2=$3
P3=$4
HOST="http://localhost:4000"

function usage {
    echo "Usage: $0 <pipeline_type> <param1> <param2> [param3]"
    echo "pipeline_type: 'name' or 'content'"
    echo "  - 'name': requires param1 (pipeline_name), param2 (data), and param3 (pipeline_version)"
    echo "  - 'content': requires param1 (pipeline_content_file) and param2 (data)"
    exit 1
}

function test_pipeline_name {
    local PIPELINE_NAME=$P1
    local DATA="$P2"
    local PIPELINE_VERSION="$P3"
    if [[ -z "$PIPELINE_VERSION" ]]; then
        PIPELINE_VERSION="null"
    else
        PIPELINE_VERSION="\"$PIPELINE_VERSION\""
    fi

    local BODY=$(jq -nc --argjson data "$DATA" --arg pipeline_name "$PIPELINE_NAME" --argjson pipeline_version "$PIPELINE_VERSION" '{"pipeline_name": $pipeline_name, "pipeline_version": $pipeline_version, "data": $data}')
    local result=$(curl --silent -X POST -H "Content-Type: application/json" "$HOST/v1/events/pipelines/dryrun" --data "$BODY")
    echo "$result" | jq
}

function test_pipeline_content {
    local PIPELINE_CONTENT=$(cat "$P1")
    local DATA="$P2"
    local BODY=$(jq -nc --arg pipeline_content "$PIPELINE_CONTENT" --argjson data "$DATA" '{"pipeline": $pipeline_content, "data": $data}')
    local result=$(curl --silent -X POST -H "Content-Type: application/json" "$HOST/v1/events/pipelines/dryrun" --data "$BODY")
    echo "$result" | jq
}

if [[ -z "$PIPELINE_TYPE" || -z "$P1" || -z "$P2" ]]; then
    usage
fi

case $PIPELINE_TYPE in
  "name")
    test_pipeline_name
    ;;
  "content")
    test_pipeline_content
    ;;
  *)
    usage
    ;;
esac
```

We will use this script for subsequent debugging. First, save the script as `test_pipeline.sh`, then use `chmod +x test_pipeline.sh` to add execution permissions. This script depends on `curl` and `jq`. Please ensure that your system has these two tools installed. If you need to change the endpoint, modify the $HOST in the script to the address of your GreptimeDB.

#### Debug Pipeline

Suppose we need to replace the `.` in the `message` field of the following data with `-` and parse the `time` field into a time format.

```json
{
    "message": "1998.08",
    "time": "2024-05-25 20:16:37.217"
}
```

So we wrote the following Pipeline configuration file and saved it as `pipeline.yaml`:

```yaml
processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true
  - gsub:
      fields:
        - message
      pattern: "\\."
      replacement: "-"
      ignore_missing: true

transform:
  - fields:
      - message
    type: string
  - field: time
    type: time
    index: timestamp
```

Then use the `test_pipeline.sh` script to test:

```bash
./test_pipeline.sh content pipeline.yaml '[{"message": 1998.08,"time":"2024-05-25 20:16:37.217"}]'
```

The input is as follows:

```json
{
  "error": "Failed to build pipeline: Field replacement must be a string"
}
```

According to the error message, we need to modify the configuration of the `gsub` processor and change the value of the `replacement` field to a string type.

```yaml
processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true
  - gsub:
      fields:
        - message
      pattern: "\\."
      # Change to string type
      replacement: "-"
      ignore_missing: true

transform:
  - fields:
      - message
    type: string
  - field: time
    type: time
    index: timestamp
```

Now test the Pipeline again:

```bash
./test_pipeline.sh content pipeline.yaml '[{"message": 1998.08,"time":"2024-05-25 20:16:37.217"}]'
```

The input is as follows:

```json
{
  "error": "Failed to exec pipeline: Processor gsub: expect string value, but got Float64(1998.08)"
}
```

According to the error message, we need to modify the format of the test data and change the value of the `message` field to a string type.

```bash
./test_pipeline.sh content pipeline.yaml '[{"message": "1998.08","time":"2024-05-25 20:16:37.217"}]'
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
      "colume_type": "FIELD",
      "data_type": "STRING",
      "fulltext": false,
      "name": "message"
    },
    {
      "colume_type": "TIMESTAMP",
      "data_type": "TIMESTAMP_NANOSECOND",
      "fulltext": false,
      "name": "time"
    }
  ]
}
```

#### Debug Pipeline API Information

**This API is only for testing the processing results of the Pipeline and will not write logs into GreptimeDB.**

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/dryrun" \
     -H 'Content-Type: application/json' \
     -d 'data here'
```

The body is a fixed format JSON string, which includes the `pipeline`, `pipeline_name`, `pipeline_version`, and `data` fields.
`pipeline` and `pipeline_name` are mutually exclusive, and `pipeline_version` is an optional field. When all fields are present, the `pipeline` field is used preferentially.
`pipeline_name` is the name of the Pipeline already stored in GreptimeDB, and `pipeline_version` (optional) is the version number of the Pipeline.

* `pipeline`: String, the configuration content of the Pipeline.
* `pipeline_name`: String, the name of the Pipeline.
* `pipeline_version`: String, the version number of the Pipeline when `pipeline_name` is present.
* `data`: A JSON array, each element is a JSON object or string, the data to be processed.

For example, if we use the debug Pipeline configuration file `pipeline.yaml`, the test data is as follows, then the curl command is:

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/dryrun" \
     -H 'Content-Type: application/json' \
     -d '{
  "pipeline": "processors:\n  - date:\n      field: time\n      formats:\n        - \"%Y-%m-%d %H:%M:%S%.3f\"\n      ignore_missing: true\n  - gsub:\n      fields:\n        - message\n      pattern: \"\\\\.\"\n      # Change to string type\n      replacement: \"-\"\n      ignore_missing: true\n\ntransform:\n  - fields:\n      - message\n    type: string\n  - field: time\n    type: time\n    index: timestamp",
  "data": [
    {
      "message": "1998.08",
      "time": "2024-05-25 20:16:37.217"
    }
  ]
}'
```

If we use the Pipeline name `test_pipeline` and do not provide the `pipeline_version` parameter, the curl command is:

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/dryrun" \
     -H 'Content-Type: application/json' \
     -d '{
  "pipeline_name": "test_pipeline",
  "data": [
    {
      "message": "1998.08",
      "time": "2024-05-25 20:16:37.217"
    }
  ]
}'
```

This will use the latest version of the Pipeline named `test_pipeline` to process the data.