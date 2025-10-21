---
keywords: [manage pipelines, create pipeline, delete pipeline, built-in pipelines, pipeline debugging]
description: Guides on creating, deleting, and managing pipelines in GreptimeDB for parsing and transforming log data, including built-in pipelines and debugging.
---

# Manage Pipelines

In GreptimeDB, each `pipeline` is a collection of data processing units used for parsing and transforming the ingested log content. This document provides guidance on creating and deleting pipelines to efficiently manage the processing flow of log data.

For specific pipeline configurations, please refer to the [Pipeline Configuration](/reference/pipeline/pipeline-config.md) documentation.

## Authentication

The HTTP API for managing pipelines requires authentication.  
For more information, see the [Authentication](/user-guide/protocols/http.md#authentication) documentation.

## Create a Pipeline

GreptimeDB provides a dedicated HTTP interface for creating pipelines.
Assuming you have prepared a pipeline configuration file `pipeline.yaml`, use the following command to upload the configuration file, where `test` is the name you specify for the pipeline:

```shell
## Upload the pipeline file. 'test' is the name of the pipeline
curl -X "POST" "http://localhost:4000/v1/pipelines/test" \
  -H "Authorization: Basic {{authentication}}" \
  -F "file=@pipeline.yaml"
```

The created Pipeline is shared for all databases.

## Delete a Pipeline

You can use the following HTTP interface to delete a pipeline:

```shell
## 'test' is the name of the pipeline
curl -X "DELETE" "http://localhost:4000/v1/pipelines/test?version=2024-06-27%2012%3A02%3A34.257312110Z" \
  -H "Authorization: Basic {{authentication}}"
```

In the above example, we deleted a pipeline named `test`. The `version` parameter is required to specify the version of the pipeline to be deleted.

## Query Pipelines

Querying a pipeline with a name through HTTP interface as follow:

```shell
## 'test' is the name of the pipeline, it will return a pipeline with latest version if the pipeline named `test` exists.
curl "http://localhost:4000/v1/pipelines/test" \
  -H "Authorization: Basic {{authentication}}"
```

```shell
## with the version parameter, it will return the specify version pipeline.
curl "http://localhost:4000/v1/pipelines/test?version=2025-04-01%2006%3A58%3A31.335251882%2B0000" \
  -H "Authorization: Basic {{authentication}}"
```

 If the pipeline exists, the output should be:

```json
{
  "pipelines": [
    {
      "name": "test",
      "version": "2025-04-01 06:58:31.335251882",
      "pipeline": "version: 2\nprocessors:\n  - dissect:\n      fields:\n        - message\n      patterns:\n        - '%{ip_address} - - [%{timestamp}] \"%{http_method} %{request_line}\" %{status_code} %{response_size} \"-\" \"%{user_agent}\"'\n      ignore_missing: true\n  - date:\n      fields:\n        - timestamp\n      formats:\n        - \"%d/%b/%Y:%H:%M:%S %z\"\n  - select:\n      type: exclude\n      fields:\n        - message\n\ntransform:\n  - fields:\n      - ip_address\n    type: string\n    index: inverted\n    tag: true\n  - fields:\n      - status_code\n    type: int32\n    index: inverted\n    tag: true\n  - fields:\n      - request_line\n      - user_agent\n    type: string\n    index: fulltext\n  - fields:\n      - response_size\n    type: int32\n  - fields:\n      - timestamp\n    type: time\n    index: timestamp\n"
    }
  ],
  "execution_time_ms": 7
}
```

In the output above, the `pipeline` field is a YAML-formatted string. Since the JSON format does not display YAML strings well, the `echo` command can be used to present it in a more human-readable way:

```shell
echo -e "version: 2\nprocessors:\n  - dissect:\n      fields:\n        - message\n      patterns:\n        - '%{ip_address} - - [%{timestamp}] \"%{http_method} %{request_line}\" %{status_code} %{response_size} \"-\" \"%{user_agent}\"'\n      ignore_missing: true\n  - date:\n      fields:\n        - timestamp\n      formats:\n        - \"%d/%b/%Y:%H:%M:%S %z\"\n  - select:\n      type: exclude\n      fields:\n        - message\n\ntransform:\n  - fields:\n      - ip_address\n    type: string\n    index: inverted\n    tag: true\n  - fields:\n      - status_code\n    type: int32\n    index: inverted\n    tag: true\n  - fields:\n      - request_line\n      - user_agent\n    type: string\n    index: fulltext\n  - fields:\n      - response_size\n    type: int32\n  - fields:\n      - timestamp\n    type: time\n    index: timestamp\n"
```

```yml
version: 2
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
  - select:
      type: exclude
      fields:
        - message

transform:
  - fields:
      - ip_address
    type: string
    index: inverted
    tag: true
  - fields:
      - status_code
    type: int32
    index: inverted
    tag: true
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
curl -X "POST" "http://localhost:4000/v1/pipelines/test" \
     -H "Content-Type: application/x-yaml" \
     -H "Authorization: Basic {{authentication}}" \
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
    index: timestamp
```

The pipeline configuration contains an error. The `gsub` Processor expects the `replacement` field to be a string, but the current configuration provides an array. As a result, the pipeline creation fails with the following error message:


```json
{"error":"Failed to parse pipeline: 'replacement' must be a string"}
```

Therefore, We need to modify the configuration of the `gsub` Processor and change the value of the `replacement` field to a string type.

```bash
curl -X "POST" "http://localhost:4000/v1/pipelines/test" \
     -H "Content-Type: application/x-yaml" \
     -H "Authorization: Basic {{authentication}}" \
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
    index: timestamp
```

Now that the Pipeline has been created successfully, you can test the Pipeline using the `dryrun` interface.

### Debug writing logs

We can test the Pipeline using the `dryrun` interface. We will test it with erroneous log data where the value of the message field is in numeric format, causing the pipeline to fail during processing.

**This API is only used to test the results of the Pipeline and does not write logs to GreptimeDB.**


```bash
curl -X "POST" "http://localhost:4000/v1/pipelines/dryrun?pipeline_name=test" \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic {{authentication}}" \
     -d $'{"message": 1998.08,"time":"2024-05-25 20:16:37.217"}'

{"error":"Failed to execute pipeline, reason: gsub processor: expect string or array string, but got Float64(1998.08)"}
```

The output indicates that the pipeline processing failed because the `gsub` Processor expects a string type rather than a floating-point number type. We need to adjust the format of the log data to ensure the pipeline can process it correctly.
Let's change the value of the message field to a string type and test the pipeline again.

```bash
curl -X "POST" "http://localhost:4000/v1/pipelines/dryrun?pipeline_name=test" \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic {{authentication}}" \
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

## Get Table DDL from a Pipeline Configuration

When using pipelines, GreptimeDB automatically creates target tables upon first data ingestion by default.
However, you may want to manually create tables beforehand to add custom table options,
such as partition rules for better performance.

While the auto-created table schema is deterministic for a given pipeline configuration,
manually writing the table DDL (Data Definition Language) according to the configuration can be tedious.
The `/ddl` API endpoint simplifies this process.

For an existing pipeline, you can use the `/v1/pipelines/{pipeline_name}/ddl` endpoint to generate the `CREATE TABLE` SQL.
This API examines the transform definition in the pipeline configuration and infers the appropriate table schema.
You can use this API to generate the basic table DDL, fine-tune table options and manually create the table before ingesting data. Some common cases would be:
- Add [partition rules](/user-guide/deployments-administration/manage-data/table-sharding.md)
- Modify [index options](/user-guide/manage-data/data-index.md)
- Add other [table options](/reference/sql/create.md#table-options)

Here is an example demonstrating how to use this API. Consider the following pipeline configuration:
```YAML
# pipeline.yaml
processors:
- dissect:
    fields:
      - message
    patterns:
      - '%{ip_address} - %{username} [%{timestamp}] "%{http_method} %{request_line} %{protocol}" %{status_code} %{response_size}'
    ignore_missing: true
- date:
    fields:
      - timestamp
    formats:
      - "%d/%b/%Y:%H:%M:%S %z"

transform:
  - fields:
      - timestamp
    type: time
    index: timestamp
  - fields:
      - ip_address
    type: string
    index: skipping
  - fields:
      - username
    type: string
    tag: true
  - fields:
      - http_method
    type: string
    index: inverted
  - fields:
      - request_line
    type: string
    index: fulltext
  - fields:
      - protocol
    type: string
  - fields:
      - status_code
    type: int32
    index: inverted
    tag: true
  - fields:
      - response_size
    type: int64
    on_failure: default
    default: 0
  - fields:
      - message
    type: string
```

First, upload the pipeline to the database using the following command:
```bash
curl -X "POST" "http://localhost:4000/v1/pipelines/pp" -F "file=@pipeline.yaml"
```
Then, query the table DDL using the following command:
```bash
curl -X "GET" "http://localhost:4000/v1/pipelines/pp/ddl?table=test_table"
```
The API returns the following output in JSON format:
```JSON
{
  "sql": {
    "sql": "CREATE TABLE IF NOT EXISTS `test_table` (\n  `timestamp` TIMESTAMP(9) NOT NULL,\n  `ip_address` STRING NULL SKIPPING INDEX WITH(false_positive_rate = '0.01', granularity = '10240', type = 'BLOOM'),\n  `username` STRING NULL,\n  `http_method` STRING NULL INVERTED INDEX,\n  `request_line` STRING NULL FULLTEXT INDEX WITH(analyzer = 'English', backend = 'bloom', case_sensitive = 'false', false_positive_rate = '0.01', granularity = '10240'),\n  `protocol` STRING NULL,\n  `status_code` INT NULL INVERTED INDEX,\n  `response_size` BIGINT NULL,\n  `message` STRING NULL,\n  TIME INDEX (`timestamp`),\n  PRIMARY KEY (`username`, `status_code`)\n)\nENGINE=mito\nWITH(\n  append_mode = 'true'\n)"
  },
  "execution_time_ms": 3
}
```
After formatting the `sql` field in the response, you can see the inferred table schema:
```SQL
CREATE TABLE IF NOT EXISTS `test_table` (
  `timestamp` TIMESTAMP(9) NOT NULL,
  `ip_address` STRING NULL SKIPPING INDEX WITH(false_positive_rate = '0.01', granularity = '10240', type = 'BLOOM'),
  `username` STRING NULL,
  `http_method` STRING NULL INVERTED INDEX,
  `request_line` STRING NULL FULLTEXT INDEX WITH(analyzer = 'English', backend = 'bloom', case_sensitive = 'false', false_positive_rate = '0.01', granularity = '10240'),
  `protocol` STRING NULL,
  `status_code` INT NULL INVERTED INDEX,
  `response_size` BIGINT NULL,
  `message` STRING NULL,
  TIME INDEX (`timestamp`),
  PRIMARY KEY (`username`, `status_code`)
  )
ENGINE=mito
WITH(
  append_mode = 'true'
)
```

You can use the inferred table DDL as a starting point.
After customizing the DDL to meet your requirements, execute it manually before ingesting data through the pipeline.

**Notes:**
1. The API only infers the table schema from the pipeline configuration; it doesn't check if the table already exists.
2. The API doesn't account for table suffixes. If you're using `dispatcher`, `table_suffix`, or table suffix hints in your pipeline configuration, you'll need to adjust the table name manually. 
