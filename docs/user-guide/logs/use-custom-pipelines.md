---
keywords: [quick start, write logs, query logs, pipeline, structured data, log ingestion, log collection, log management tools]
description: A comprehensive guide to quickly writing and querying logs in GreptimeDB, including direct log writing and using pipelines for structured data.
---

# Using Custom Pipelines

Pipelines enable automatic parsing and transformation of log messages into structured data with multiple columns,
handling automatic table creation and schema management based on your pipeline configuration.
When the built-in pipelines cannot process your specific text log formats,
you can create custom pipelines to define how to parse and transform the log data according to your needs.

## Identify Your Log Format

Before creating a custom pipeline, it's essential to understand the format of your log data.
If you're using log collectors and aren't sure about the log format,
there are two ways to examine your logs:

1. **Check collector documentation**: Configure your collector to output data to console or file to inspect the log format.
2. **Use the identity pipeline**: Ingest sample logs directly into GreptimeDB using the built-in `greptime_identity` pipeline.
  The `greptime_identity` pipeline treats the entire text log as a single `message` field,
  allowing you to inspect the raw log content stored in GreptimeDB without any processing.

Once you understand the log format you want to process,
you can create a custom pipeline.
This document uses the following Nginx access log entry as an example:

```txt
127.0.0.1 - - [25/May/2024:20:16:37 +0000] "GET /index.html HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
```

## Create a Custom Pipeline

GreptimeDB provides an HTTP interface for creating pipelines.
Here's how to create one.

First, create an example pipeline configuration file to process Nginx access logs,
naming it `pipeline.yaml`:

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
  - vrl:
      source: |
        .greptime_table_ttl = "7d"
        .

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

The pipeline configuration above uses the [version 2](/reference/pipeline/pipeline-config.md#transform-in-version-2) format,
contains `processors` and `transform` sections that work together to structure your log data:

**Processors**: Used to preprocess log data before transformation:
- **Data Extraction**: The `dissect` processor uses pattern matching to parse the `message` field and extract structured data including `ip_address`, `timestamp`, `http_method`, `request_line`, `status_code`, `response_size`, and `user_agent`.
- **Timestamp Processing**: The `date` processor parses the extracted `timestamp` field using the format `%d/%b/%Y:%H:%M:%S %z` and converts it to a proper timestamp data type.
- **Field Selection**: The `select` processor excludes the original `message` field from the final output while retaining all other fields.
- **Table Options**: The `vrl` processor sets the table options based on the extracted fields, such as adding a suffix to the table name and setting the TTL. The `greptime_table_ttl = "7d"` line configures the table data to have a time-to-live of 7 days.

**Transform**: Defines how to convert and index the extracted fields:
- **Field Transformation**: Each extracted field is converted to its appropriate data type with specific indexing configurations. Fields like `http_method` retain their default data types when no explicit configuration is provided.
- **Indexing Strategy**:
  - `ip_address` and `status_code` use inverted indexing as tags for fast filtering
  - `request_line` and `user_agent` use full-text indexing for optimal text search capabilities
  - `timestamp` serves as the required time index column

For detailed information about pipeline configuration options,
please refer to the [Pipeline Configuration](/reference/pipeline/pipeline-config.md) documentation.

## Upload the Pipeline

Execute the following command to upload the pipeline configuration:

```shell
curl -X "POST" \
  "http://localhost:4000/v1/pipelines/nginx_pipeline" \
     -H 'Authorization: Basic {{authentication}}' \
     -F "file=@pipeline.yaml"
```

After successful execution, a pipeline named `nginx_pipeline` will be created and return the following result:

```json
{"name":"nginx_pipeline","version":"2024-06-27 12:02:34.257312110Z"}.
```

You can create multiple versions for the same pipeline name.
All pipelines are stored in the `greptime_private.pipelines` table.
Refer to [Query Pipelines](manage-pipelines.md#query-pipelines) to view pipeline data.

## Ingest Logs Using the Pipeline

The following example writes logs to the `custom_pipeline_logs` table using the `nginx_pipeline` pipeline to format and transform the log messages:

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

The command will return the following output upon success:

```json
{"output":[{"affectedrows":4}],"execution_time_ms":79}
```

The `custom_pipeline_logs` table content is automatically created based on the pipeline configuration:

```sql
+-------------+-------------+-------------+---------------------------+-----------------------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
| ip_address  | http_method | status_code | request_line              | user_agent                                                                                                                              | response_size | timestamp           |
+-------------+-------------+-------------+---------------------------+-----------------------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
| 10.0.0.1    | GET         |         304 | /images/logo.png HTTP/1.1 | Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0                                                            |             0 | 2024-05-25 20:18:37 |
| 127.0.0.1   | GET         |         200 | /index.html HTTP/1.1      | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36                     |           612 | 2024-05-25 20:16:37 |
| 172.16.0.1  | GET         |         404 | /contact HTTP/1.1         | Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 |           162 | 2024-05-25 20:19:37 |
| 192.168.1.1 | POST        |         200 | /api/login HTTP/1.1       | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36                |          1784 | 2024-05-25 20:17:37 |
+-------------+-------------+-------------+---------------------------+-----------------------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
```
For more detailed information about the log ingestion API endpoint `/ingest`,
including additional parameters and configuration options,
please refer to the [APIs for Writing Logs](/reference/pipeline/write-log-api.md) documentation.

## Query Logs

We use the `custom_pipeline_logs` table as an example to query logs.

### Query logs by tags

With the multiple tag columns in `custom_pipeline_logs`,
you can query data by tags flexibly.
For example, query the logs with `status_code` 200 and `http_method` GET.

```sql
SELECT * FROM custom_pipeline_logs WHERE status_code = 200 AND http_method = 'GET';
```

```sql
+------------+-------------+----------------------+---------------------------------------------------------------------------------------------------------------------+---------------+---------------------+-------------+
| ip_address | status_code | request_line         | user_agent                                                                                                          | response_size | timestamp           | http_method |
+------------+-------------+----------------------+---------------------------------------------------------------------------------------------------------------------+---------------+---------------------+-------------+
| 127.0.0.1  |         200 | /index.html HTTP/1.1 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 |           612 | 2024-05-25 20:16:37 | GET         |
+------------+-------------+----------------------+---------------------------------------------------------------------------------------------------------------------+---------------+---------------------+-------------+
1 row in set (0.02 sec)
```

### Full‑Text Search

For the text fields `request_line` and `user_agent`, you can use `matches_term` function to search logs.
Remember, we created the full-text index for these two columns when [creating a pipeline](#create-a-pipeline).
This allows for high-performance full-text searches.

For example, query the logs with `request_line` containing `/index.html` or `/api/login`.

```sql
SELECT * FROM custom_pipeline_logs WHERE matches_term(request_line, '/index.html') OR matches_term(request_line, '/api/login');
```

```sql
+-------------+-------------+----------------------+--------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+-------------+
| ip_address  | status_code | request_line         | user_agent                                                                                                               | response_size | timestamp           | http_method |
+-------------+-------------+----------------------+--------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+-------------+
| 127.0.0.1   |         200 | /index.html HTTP/1.1 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36      |           612 | 2024-05-25 20:16:37 | GET         |
| 192.168.1.1 |         200 | /api/login HTTP/1.1  | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36 |          1784 | 2024-05-25 20:17:37 | POST        |
+-------------+-------------+----------------------+--------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+-------------+
2 rows in set (0.00 sec)
```

You can refer to the [Full-Text Search](fulltext-search.md) document for detailed usage of the `matches_term` function.


## Benefits of Using Pipelines

Using pipelines to process logs provides structured data and automatic field extraction,
enabling more efficient querying and analysis.

You can write logs directly to the database without pipelines,
but this approach limits high-performance analysis capabilities.

### Direct Log Insertion (Without Pipeline)

For comparison, you can create a table to store original log messages:

```sql
CREATE TABLE `origin_logs` (
  `message` STRING FULLTEXT INDEX,
  `time` TIMESTAMP TIME INDEX
) WITH (
  append_mode = 'true'
);
```

Use the `INSERT` statement to insert logs into the table.
Note that you need to manually add a timestamp field for each log:

```sql
INSERT INTO origin_logs (message, time) VALUES
('127.0.0.1 - - [25/May/2024:20:16:37 +0000] "GET /index.html HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"', '2024-05-25 20:16:37.217'),
('192.168.1.1 - - [25/May/2024:20:17:37 +0000] "POST /api/login HTTP/1.1" 200 1784 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36"', '2024-05-25 20:17:37.217'),
('10.0.0.1 - - [25/May/2024:20:18:37 +0000] "GET /images/logo.png HTTP/1.1" 304 0 "-" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0"', '2024-05-25 20:18:37.217'),
('172.16.0.1 - - [25/May/2024:20:19:37 +0000] "GET /contact HTTP/1.1" 404 162 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"', '2024-05-25 20:19:37.217');
```

### Schema Comparison: Pipeline vs Raw

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

Comparing the table structures shows the key differences:

The `custom_pipeline_logs` table (created with pipeline) automatically structures log data into multiple columns:
- `ip_address`, `status_code` as indexed tags for fast filtering
- `request_line`, `user_agent` with full-text indexing for text search
- `response_size`, `http_method` as regular fields
- `timestamp` as the time index

The `origin_logs` table (direct insertion) stores everything in a single `message` column.

### Why Use Pipelines?

It is recommended to use the pipeline method to split the log message into multiple columns,
which offers the advantage of explicitly querying specific values within certain columns.
Column matching query proves superior to full-text searching for several key reasons:

- **Performance**: Column-based queries are typically faster than full-text searches
- **Storage Efficiency**: GreptimeDB's columnar storage compresses structured data better; inverted indexes for tags consume less storage than full-text indexes
- **Query Simplicity**: Tag-based queries are easier to write, understand, and debug

## Next Steps

- **Full-Text Search**: Explore the [Full-Text Search](fulltext-search.md) guide to learn advanced text search capabilities and query techniques in GreptimeDB
- **Pipeline Configuration**: Explore the [Pipeline Configuration](/reference/pipeline/pipeline-config.md) documentation to learn more about creating and customizing pipelines for various log formats and processing needs

