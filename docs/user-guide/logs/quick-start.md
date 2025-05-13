---
keywords: [quick start, write logs, query logs, pipeline, structured data, log ingestion, log collection, log management tools]
description: Guides users through the process of quickly writing and querying logs in GreptimeDB, including direct log writing and using pipelines for structured data.
---

# Quick Start

This guide will walk you through the process of quickly writing and querying logs.

You can write logs directly or use pipeline to write logs.
Writing logs directly is simple but cannot split log text to structured data as the pipeline method does.
The following sections will help you understand the differences between these two methods.

## Write logs directly

This is the simplest way to write logs to GreptimeDB. 

### Create a table

First, create a table named origin_logs to store your logs.
The `FULLTEXT INDEX` specification for the message column in the following SQL creates a full-text index to optimize queries.

```sql
CREATE TABLE `origin_logs` (
  `message` STRING FULLTEXT INDEX,
  `time` TIMESTAMP TIME INDEX
) WITH (
  append_mode = 'true'
);
```

### Insert logs

#### Write logs using the SQL protocol

Use the `INSERT` statement to insert logs into the table.

```sql
INSERT INTO origin_logs (message, time) VALUES
('127.0.0.1 - - [25/May/2024:20:16:37 +0000] "GET /index.html HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"', '2024-05-25 20:16:37.217'),
('192.168.1.1 - - [25/May/2024:20:17:37 +0000] "POST /api/login HTTP/1.1" 200 1784 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36"', '2024-05-25 20:17:37.217'),
('10.0.0.1 - - [25/May/2024:20:18:37 +0000] "GET /images/logo.png HTTP/1.1" 304 0 "-" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0"', '2024-05-25 20:18:37.217'),
('172.16.0.1 - - [25/May/2024:20:19:37 +0000] "GET /contact HTTP/1.1" 404 162 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"', '2024-05-25 20:19:37.217');
```

The above SQL inserts the entire log text into a single column,
and you must add an extra timestamp for each log.

#### Write logs using the gRPC protocol

You can also write logs using the gRPC protocol, which is a more efficient method.

Refer to [Write Data Using gRPC](/user-guide/ingest-data/for-iot/grpc-sdks/overview.md) to learn how to write logs using the gRPC protocol.

## Write logs by Pipeline

Using a pipeline allows you to automatically parse and transform the log message into multiple columns,
as well as create and alter tables automatically.

### Write JSON logs using the built-in Pipeline (Experimental)

:::warning
The JSON feature is currently experimental and may change in future releases.
:::

GreptimeDB offers a built-in pipeline, `greptime_identity`, for handling JSON log formats. This pipeline simplifies the process of writing JSON logs.

```shell
curl -X POST \
  "http://localhost:4000/v1/events/logs?db=public&table=pipeline_logs&pipeline_name=greptime_identity" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic {{authentication}}" \
  -d '[
    {
      "name": "Alice",
      "age": 20,
      "is_student": true,
      "score": 90.5,
      "object": { "a": 1, "b": 2 }
    },
    {
      "age": 21,
      "is_student": false,
      "score": 85.5,
      "company": "A",
      "whatever": null
    },
    {
      "name": "Charlie",
      "age": 22,
      "is_student": true,
      "score": 95.5,
      "array": [1, 2, 3]
    }
  ]'
```

- [`Authorization`](/user-guide/protocols/http.md#authentication) header.
- `pipeline_name=greptime_identity` specifies the built-in pipeline.
- `table=pipeline_logs` specifies the target table. If the table does not exist, it will be created automatically.
The `greptime_identity` pipeline will automatically create columns for each field in the JSON log. A successful command execution will return:

```json
{"output":[{"affectedrows":3}],"execution_time_ms":9}
```

For more details about the `greptime_identity` pipeline, please refer to the [Manage Pipelines](manage-pipelines.md#greptime_identity) document.

### Write logs using a custom Pipeline

If your logs follow a specific pattern, you can create a custom pipeline to parse and transform the log messages into multiple columns, and automatically create tables.

#### Create a Pipeline

GreptimeDB provides a dedicated HTTP interface for creating pipelines. Here's how to do it:

First, create a pipeline file, for example, `pipeline.yaml`.

```yaml
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

The pipeline splits the message field using the specified pattern to extract the `ip_address`, `timestamp`, `http_method`, `request_line`, `status_code`, `response_size`, and `user_agent`.
It then parses the `timestamp` field using the format` %d/%b/%Y:%H:%M:%S %z` to convert it into a proper timestamp format that the database can understand.
Finally, it converts each field to the appropriate data type and indexes it accordingly.
It is worth noting that the `request_line` and `user_agent` fields are indexed as `fulltext` to optimize full-text search queries. And there must be one time index column specified by the `timestamp`.

Execute the following command to upload the configuration file:

```shell
curl -X "POST" \
  "http://localhost:4000/v1/events/pipelines/nginx_pipeline" \
     -H 'Authorization: Basic {{authentication}}' \
     -F "file=@pipeline.yaml"
```

After successfully executing this command, a pipeline named `nginx_pipeline` will be created, and the result will be returned as:

```json
{"name":"nginx_pipeline","version":"2024-06-27 12:02:34.257312110Z"}.
```

You can create multiple versions for the same pipeline name.
All pipelines are stored at the `greptime_private.pipelines` table.
Please refer to [Query Pipelines](manage-pipelines.md#query-pipelines) to view the pipeline data in the table.

#### Write logs

The following example writes logs to the `custom_pipeline_logs` table and uses the `nginx_pipeline` pipeline to format and transform the log messages.

```shell
curl -X POST \
  "http://localhost:4000/v1/events/logs?db=public&table=custom_pipeline_logs&pipeline_name=nginx_pipeline" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic {{authentication}}" \
  -d '[
    {
      "message": "127.0.0.1 - - [25/May/2024:20:16:37 +0000] \"GET /index.html HTTP/1.1\" 200 612 \"-\" \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\""
    },
    {
      "message": "192.168.1.1 - - [25/May/2024:20:17:37 +0000] \"POST /api/login HTTP/1.1\" 200 1784 \"-\" \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36\""
    },
    {
      "message": "10.0.0.1 - - [25/May/2024:20:18:37 +0000] \"GET /images/logo.png HTTP/1.1\" 304 0 \"-\" \"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0\""
    },
    {
      "message": "172.16.0.1 - - [25/May/2024:20:19:37 +0000] \"GET /contact HTTP/1.1\" 404 162 \"-\" \"Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1\""
    }
  ]'
```

You will see the following output if the command is successful:

```json
{"output":[{"affectedrows":4}],"execution_time_ms":79}
```

## Differences between writing logs directly and using a pipeline

In the above examples, the table `origin_logs` is created by writing logs directly,
and the table `pipeline_logs` is automatically created by writing logs using pipeline.
Let's explore the differences between these two tables.

```sql
DESC origin_logs;
```

```sql
+---------+----------------------+------+------+---------+---------------+
| Column  | Type                 | Key  | Null | Default | Semantic Type |
+---------+----------------------+------+------+---------+---------------+
| message | String               |      | YES  |         | FIELD         |
| time    | TimestampMillisecond | PRI  | NO   |         | TIMESTAMP     |
+---------+----------------------+------+------+---------+---------------+
```

```sql
DESC pipeline_logs;
```

```sql
+---------------+---------------------+------+------+---------+---------------+
| Column        | Type                | Key  | Null | Default | Semantic Type |
+---------------+---------------------+------+------+---------+---------------+
| ip_address    | String              | PRI  | YES  |         | TAG           |
| http_method   | String              | PRI  | YES  |         | TAG           |
| status_code   | Int32               | PRI  | YES  |         | TAG           |
| request_line  | String              |      | YES  |         | FIELD         |
| user_agent    | String              |      | YES  |         | FIELD         |
| response_size | Int32               |      | YES  |         | FIELD         |
| timestamp     | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
+---------------+---------------------+------+------+---------+---------------+
7 rows in set (0.00 sec)
```

From the table structure, you can see that the `origin_logs` table has only two columns,
with the entire log message stored in a single column.
The `pipeline_logs` table stores the log message in multiple columns.

It is recommended to use the pipeline method to split the log message into multiple columns, which offers the advantage of explicitly querying specific values within certain columns. Column matching query proves superior to full-text searching for several key reasons:

- **Performance Efficiency**: Column matching query is typically faster than full-text searching.
- **Resource Consumption**: Due to GreptimeDB's columnar storage engine, structured data is more conducive to compression. Additionally, the inverted index used for tag matching query typically consumes significantly fewer resources than a full-text index, especially in terms of storage size.
- **Maintainability**: Tag matching query is straightforward and easier to understand, write, and debug.

Of course, if you need keyword searching within large text blocks, you must use full-text searching as it is specifically designed for that purpose.

## Query logs

We use the `pipeline_logs` table as an example to query logs.

### Query logs by tags

With the multiple tag columns in `pipeline_logs`,
you can query data by tags flexibly.
For example, query the logs with `status_code` 200 and `http_method` GET.

```sql
SELECT * FROM pipeline_logs WHERE status_code = 200 AND http_method = 'GET';
```

```sql
+------------+-------------+-------------+----------------------+---------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
| ip_address | http_method | status_code | request_line         | user_agent                                                                                                          | response_size | timestamp           |
+------------+-------------+-------------+----------------------+---------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
| 127.0.0.1  | GET         |         200 | /index.html HTTP/1.1 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 |           612 | 2024-05-25 20:16:37 |
+------------+-------------+-------------+----------------------+---------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
1 row in set (0.02 sec)
```

### Full-Text Search

For the text fields `request_line` and `user_agent`, you can use `matches_term` function to search logs.
Remember, we created the full-text index for these two columns when [creating a pipeline](#create-a-pipeline). \
This allows for high-performance full-text searches.

For example, query the logs with `request_line` containing `/index.html` or `/api/login`.

```sql
SELECT * FROM pipeline_logs WHERE matches_term(request_line, '/index.html') OR matches_term(request_line, '/api/login');
```

```sql
+-------------+-------------+-------------+----------------------+--------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
| ip_address  | http_method | status_code | request_line         | user_agent                                                                                                               | response_size | timestamp           |
+-------------+-------------+-------------+----------------------+--------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
| 127.0.0.1   | GET         |         200 | /index.html HTTP/1.1 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36      |           612 | 2024-05-25 20:16:37 |
| 192.168.1.1 | POST        |         200 | /api/login HTTP/1.1  | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36 |          1784 | 2024-05-25 20:17:37 |
+-------------+-------------+-------------+----------------------+--------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
2 rows in set (0.00 sec)
```

You can refer to the [Query Logs](query-logs.md) document for detailed usage of the `matches_term` function.

## Next steps

You have now experienced GreptimeDB's logging capabilities.
You can explore further by following the documentation below:

- [Pipeline Configuration](./pipeline-config.md): Provides in-depth information on each specific configuration of pipelines in GreptimeDB.
- [Managing Pipelines](./manage-pipelines.md): Explains how to create and delete pipelines.
- [Writing Logs with Pipelines](./write-logs.md): Provides detailed instructions on efficiently writing log data by leveraging the pipeline mechanism.
- [Query Logs](./query-logs.md): Describes how to query logs using the GreptimeDB SQL interface.
