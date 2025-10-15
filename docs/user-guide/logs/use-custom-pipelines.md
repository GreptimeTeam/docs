---
keywords: [quick start, write logs, query logs, pipeline, structured data, log ingestion, log collection, log management tools]
description: A comprehensive guide to quickly writing and querying logs in GreptimeDB, including direct log writing and using pipelines for structured data.
---

# Using Custom Pipelines

Pipelines enable automatic parsing and transformation of log messages into multiple columns,
as well as automatic table creation and alteration.

Custom pipelines allow you to parse and transform log messages into multiple columns based on specific patterns,
and automatically create tables.

## Create a Pipeline

GreptimeDB provides an HTTP interface for creating pipelines.
Here is how to do it:

First, create a pipeline file, for example, `pipeline.yaml`.

```yaml
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

The pipeline splits the message field using the specified pattern to extract the `ip_address`, `timestamp`, `http_method`, `request_line`, `status_code`, `response_size`, and `user_agent`.
It then parses the `timestamp` field using the format` %d/%b/%Y:%H:%M:%S %z` to convert it into a proper timestamp format that the database can understand.
Finally, it converts each field to the appropriate datatype and indexes it accordingly.

Note at the beginning the pipeline is using version 2 format, see [here](./pipeline-config.md#transform-in-version-2) for more details.
In short, the version 2 indicates the pipeline engine to find fields that are not specified in the transform section, and persist them using the default datatype.

Although the `http_method` is not specified in the transform, it is persisted as well.
Also, a `select` processor is used to filter out the original `message` field.

It is worth noting that the `request_line` and `user_agent` fields are indexed as `fulltext` to optimize full-text search queries.
And there must be one time index column specified by the `timestamp`.

Execute the following command to upload the configuration file:

```shell
curl -X "POST" \
  "http://localhost:4000/v1/pipelines/nginx_pipeline" \
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

## Write logs

The following example writes logs to the `custom_pipeline_logs` table and uses the `nginx_pipeline` pipeline to format and transform the log messages.

```shell
curl -X POST \
  "http://localhost:4000/v1/ingest?db=public&table=custom_pipeline_logs&pipeline_name=nginx_pipeline" \
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

## Compared with Not Using Pipeline

When you use a pipeline to process logs, you can take advantage of structured data and automatic field extraction.
This allows for more efficient querying and analysis of log data.

You can also write logs directly to the database without using a pipeline.
However, this method limits the ability to perform high-performance analysis.

### Insert Logs Directly

For example, you can create a table named `origin_logs` to store the original log messages.

```sql
CREATE TABLE `origin_logs` (
  `message` STRING FULLTEXT INDEX,
  `time` TIMESTAMP TIME INDEX
) WITH (
  append_mode = 'true'
);
```

Use the `INSERT` statement to insert logs into the table.
Note that you need to add an extra timestamp field for each log.

```sql
INSERT INTO origin_logs (message, time) VALUES
('127.0.0.1 - - [25/May/2024:20:16:37 +0000] "GET /index.html HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"', '2024-05-25 20:16:37.217'),
('192.168.1.1 - - [25/May/2024:20:17:37 +0000] "POST /api/login HTTP/1.1" 200 1784 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36"', '2024-05-25 20:17:37.217'),
('10.0.0.1 - - [25/May/2024:20:18:37 +0000] "GET /images/logo.png HTTP/1.1" 304 0 "-" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0"', '2024-05-25 20:18:37.217'),
('172.16.0.1 - - [25/May/2024:20:19:37 +0000] "GET /contact HTTP/1.1" 404 162 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"', '2024-05-25 20:19:37.217');
```

### Advantages of Using Pipeline

In the above examples, the table `custom_pipeline_logs` is automatically created by writing logs using pipeline, 
and the table `origin_logs` is created by writing logs directly.
Let's explore the differences between these two tables.

```sql
DESC custom_pipeline_logs;
```

```sql
+---------------+---------------------+------+------+---------+---------------+
| Column        | Type                | Key  | Null | Default | Semantic Type |
+---------------+---------------------+------+------+---------+---------------+
| ip_address    | String              | PRI  | YES  |         | TAG           |
| status_code   | Int32               | PRI  | YES  |         | TAG           |
| request_line  | String              |      | YES  |         | FIELD         |
| user_agent    | String              |      | YES  |         | FIELD         |
| response_size | Int32               |      | YES  |         | FIELD         |
| timestamp     | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| http_method   | String              |      | YES  |         | FIELD         |
+---------------+---------------------+------+------+---------+---------------+
7 rows in set (0.00 sec)
```

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

From the table structure, you can see that the `origin_logs` table has only two columns,
with the entire log message stored in a single column.
The `custom_pipeline_logs` table stores the log message in multiple columns.

It is recommended to use the pipeline method to split the log message into multiple columns, which offers the advantage of explicitly querying specific values within certain columns. Column matching query proves superior to full-text searching for several key reasons:

- **Performance Efficiency**: Column matching query is typically faster than full-text searching.
- **Resource Consumption**: Due to GreptimeDB's columnar storage engine, structured data is more conducive to compression. Additionally, the inverted index used for tag matching query typically consumes significantly fewer resources than a full-text index, especially in terms of storage size.
- **Maintainability**: Tag matching query is straightforward and easier to understand, write, and debug.

Of course, if you need keyword searching within large text blocks, you must use full-text searching as it is specifically designed for that purpose.

