---
keywords: [manage pipelines, create pipeline, delete pipeline, built-in pipelines, pipeline debugging]
description: Guides on creating, deleting, and managing pipelines in GreptimeDB for parsing and transforming log data, including built-in pipelines and debugging.
---

# Manage Pipelines

In GreptimeDB, each `pipeline` is a collection of data processing units used for parsing and transforming the ingested log content. This document provides guidance on creating and deleting pipelines to efficiently manage the processing flow of log data.


For specific pipeline configurations, please refer to the [Pipeline Configuration](pipeline-config.md) documentation.

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

Querying a pipeline with a name through HTTP interface as follow:

```shell
## 'test' is the name of the pipeline, it will return a pipeline with latest version if the pipeline named `test` exists.
curl "http://localhost:4000/v1/events/pipelines/test"
```

```shell
## with the version parameter, it will return the specify version pipeline.
curl "http://localhost:4000/v1/events/pipelines/test?version=2025-04-01%2006%3A58%3A31.335251882%2B0000"
```

 If the pipeline exists, the output should be:

```json
{
  "pipelines": [
    {
      "name": "test",
      "version": "2025-04-01 06:58:31.335251882+0000",
      "pipeline": "processors:\n  - dissect:\n      fields:\n        - message\n      patterns:\n        - '%{ip_address} - - [%{timestamp}] \"%{http_method} %{request_line}\" %{status_code} %{response_size} \"-\" \"%{user_agent}\"'\n      ignore_missing: true\n  - date:\n      fields:\n        - timestamp\n      formats:\n        - \"%d/%b/%Y:%H:%M:%S %z\"\n\ntransform:\n  - fields:\n      - ip_address\n      - http_method\n    type: string\n    index: tag\n  - fields:\n      - status_code\n    type: int32\n    index: tag\n  - fields:\n      - request_line\n      - user_agent\n    type: string\n    index: fulltext\n  - fields:\n      - response_size\n    type: int32\n  - fields:\n      - timestamp\n    type: time\n    index: timestamp\n"
    }
  ],
  "execution_time_ms": 92
}
```

In the output above, the `pipeline` field is a YAML-formatted string. Since the JSON format does not display YAML strings well, the `echo` command can be used to present it in a more human-readable way:

```shell
echo "processors:\n  - dissect:\n      fields:\n        - message\n      patterns:\n        - '%{ip_address} - - [%{timestamp}] \"%{http_method} %{request_line}\" %{status_code} %{response_size} \"-\" \"%{user_agent}\"'\n      ignore_missing: true\n  - date:\n      fields:\n        - timestamp\n      formats:\n        - \"%d/%b/%Y:%H:%M:%S %z\"\n\ntransform:\n  - fields:\n      - ip_address\n      - http_method\n    type: string\n    index: tag\n  - fields:\n      - status_code\n    type: int32\n    index: tag\n  - fields:\n      - request_line\n      - user_agent\n    type: string\n    index: fulltext\n  - fields:\n      - response_size\n    type: int32\n  - fields:\n      - timestamp\n    type: time\n    index: timestamp\n"
```

```yml
processors:
  - dissect:
      fields:
        - message
      patterns:
        - '%{ip_address} - - [%{timestamp}] "%{http_method} %{request_line}" %{status_code} %{response_size} "-" "%{user_agent}"'
      ignore_missing: true
  - date:
      fields:
        - timestamp
      formats:
        - "%d/%b/%Y:%H:%M:%S %z"

transform:
  - fields:
      - ip_address
      - http_method
    type: string
    index: tag
  - fields:
      - status_code
    type: int32
    index: tag
  - fields:
      - request_line
      - user_agent
    type: string
    index: fulltext
  - fields:
      - response_size
    type: int32
  - fields:
      - timestamp
    type: time
    index: timestamp

```

Or you can use SQL to query pipeline information.

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
      |     index: inverted              +|
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

It can be seen that the `.` in the string `1998.08` has been replaced with `-`, indicating a successful processing of the Pipeline.
