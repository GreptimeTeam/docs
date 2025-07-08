---
keywords: [write logs, HTTP interface, log formats, request parameters, JSON logs]
description: Describes how to write logs to GreptimeDB using a pipeline via the HTTP interface, including supported formats and request parameters.
---

# Writing Logs Using a Pipeline

This document describes how to write logs to GreptimeDB by processing them through a specified pipeline using the HTTP interface.

Before writing logs, please read the [Pipeline Configuration](pipeline-config.md) and [Managing Pipelines](manage-pipelines.md) documents to complete the configuration setup and upload.

## HTTP API

You can use the following command to write logs via the HTTP interface:

```shell
curl -X "POST" "http://localhost:4000/v1/events/logs?db=<db-name>&table=<table-name>&pipeline_name=<pipeline-name>&version=<pipeline-version>" \
     -H "Content-Type: application/x-ndjson" \
     -H "Authorization: Basic {{authentication}}" \
     -d "$<log-items>"
```

## Request parameters

This interface accepts the following parameters:

- `db`: The name of the database.
- `table`: The name of the table.
- `pipeline_name`: The name of the [pipeline](./pipeline-config.md).
- `version`: The version of the pipeline. Optional, default use the latest one.

## `Content-Type` and body format

GreptimeDB uses `Content-Type` header to decide how to decode the payload body. Currently the following two format is supported:
- `application/json`: this includes normal JSON format and NDJSON format.
- `application/x-ndjson`: specifically uses NDJSON format, which will try to split lines and parse for more accurate error checking.
- `text/plain`: multiple log lines separated by line breaks.

### `application/json` and `application/x-ndjson` format

Here is an example of JSON format body payload

```JSON
[
     {"message":"127.0.0.1 - - [25/May/2024:20:16:37 +0000] \"GET /index.html HTTP/1.1\" 200 612 \"-\" \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\""},
     {"message":"192.168.1.1 - - [25/May/2024:20:17:37 +0000] \"POST /api/login HTTP/1.1\" 200 1784 \"-\" \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36\""},
     {"message":"10.0.0.1 - - [25/May/2024:20:18:37 +0000] \"GET /images/logo.png HTTP/1.1\" 304 0 \"-\" \"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0\""},
     {"message":"172.16.0.1 - - [25/May/2024:20:19:37 +0000] \"GET /contact HTTP/1.1\" 404 162 \"-\" \"Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1\""}
]
```

Note the whole JSON is an array (log lines). Each JSON object represents one line to be processed by Pipeline engine.

The name of the key in JSON objects, which is `message` here, is used as field name in Pipeline processors. For example:

```yaml
processors:
  - dissect:
      fields:
        # `message` is the key in JSON object
        - message
      patterns:
        - '%{ip_address} - - [%{timestamp}] "%{http_method} %{request_line}" %{status_code} %{response_size} "-" "%{user_agent}"'
      ignore_missing: true

# rest of the file is ignored
```

We can also rewrite the payload into NDJSON format like following:

```JSON
{"message":"127.0.0.1 - - [25/May/2024:20:16:37 +0000] \"GET /index.html HTTP/1.1\" 200 612 \"-\" \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\""}
{"message":"192.168.1.1 - - [25/May/2024:20:17:37 +0000] \"POST /api/login HTTP/1.1\" 200 1784 \"-\" \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36\""}
{"message":"10.0.0.1 - - [25/May/2024:20:18:37 +0000] \"GET /images/logo.png HTTP/1.1\" 304 0 \"-\" \"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0\""}
{"message":"172.16.0.1 - - [25/May/2024:20:19:37 +0000] \"GET /contact HTTP/1.1\" 404 162 \"-\" \"Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1\""}
```

Note the outer array is eliminated, and lines are separated by line breaks instead of `,`.

### `text/plain` format

Log in plain text format is widely used throughout the ecosystem. GreptimeDB also supports `text/plain` format as log data input, enabling ingesting logs first hand from log producers.

The equivalent body payload of previous example is like following:

```plain
127.0.0.1 - - [25/May/2024:20:16:37 +0000] "GET /index.html HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
192.168.1.1 - - [25/May/2024:20:17:37 +0000] "POST /api/login HTTP/1.1" 200 1784 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36"
10.0.0.1 - - [25/May/2024:20:18:37 +0000] "GET /images/logo.png HTTP/1.1" 304 0 "-" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0"
172.16.0.1 - - [25/May/2024:20:19:37 +0000] "GET /contact HTTP/1.1" 404 162 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
```

Sending log ingestion request to GreptimeDB requires only modifying the `Content-Type` header to be `text/plain`, and you are good to go!

Please note that, unlike JSON format, where the input data already have key names as field names to be used in Pipeline processors, `text/plain` format just gives the whole line as input to the Pipeline engine. In this case we use `message` as the field name to refer to the input line, for example:

```yaml
processors:
  - dissect:
      fields:
        # use `message` as the field name
        - message
      patterns:
        - '%{ip_address} - - [%{timestamp}] "%{http_method} %{request_line}" %{status_code} %{response_size} "-" "%{user_agent}"'
      ignore_missing: true

# rest of the file is ignored
```

It is recommended to use `dissect` or `regex` processor to split the input line into fields first and then process the fields accordingly.

## Built-in Pipelines

GreptimeDB offers built-in pipelines for common log formats, allowing you to use them directly without creating new pipelines.

Note that the built-in pipelines are not editable. Additionally, the "greptime_" prefix of the pipeline name is reserved.

### `greptime_identity`

The `greptime_identity` pipeline is designed for writing JSON logs and automatically creates columns for each field in the JSON log.

- The first-level keys in the JSON log are used as column names.
- An error is returned if the same field has different types.
- Fields with `null` values are ignored.
- If time index is not specified, an additional column, `greptime_timestamp`, is added to the table as the time index to indicate when the log was written.

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

#### Specify time index

A time index is necessary in GreptimeDB. Since the `greptime_identity` pipeline does not require a YAML configuration, you must set the time index in the query parameters if you want to use the timestamp from the log data instead of the automatically generated timestamp when the data arrives.

Example of Incoming Log Data:
```JSON
[
    {"action": "login", "ts": 1742814853}
]
```

To instruct the server to use ts as the time index, set the following query parameter in the HTTP header:
```shell
curl -X "POST" "http://localhost:4000/v1/events/logs?db=public&table=pipeline_logs&pipeline_name=greptime_identity&custom_time_index=ts;epoch;s" \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic {{authentication}}" \
     -d $'[{"action": "login", "ts": 1742814853}]'
```

The `custom_time_index` parameter accepts two formats, depending on the input data format:
- Epoch number format: `<field_name>;epoch;<resolution>`
  - The field can be an integer or a string.
  - The resolution must be one of: `s`, `ms`, `us`, or `ns`.
- Date string format: `<field_name>;datestr;<format>`
  - For example, if the input data contains a timestamp like `2025-03-24 19:31:37+08:00`, the corresponding format should be `%Y-%m-%d %H:%M:%S%:z`.

With the configuration above, the resulting table will correctly use the specified log data field as the time index.
```sql
DESC pipeline_logs;
```
```sql
+--------+-----------------+------+------+---------+---------------+
| Column | Type            | Key  | Null | Default | Semantic Type |
+--------+-----------------+------+------+---------+---------------+
| ts     | TimestampSecond | PRI  | NO   |         | TIMESTAMP     |
| action | String          |      | YES  |         | FIELD         |
+--------+-----------------+------+------+---------+---------------+
2 rows in set (0.02 sec)
```

## Variable hints in the pipeline context

Starting from `v0.15`, the pipeline engine now recognizes certain variables, and can set corresponding table options based on the value of the variables.
Combined with the `vrl` processor, it's now easy to create and set table options during the pipeline execution based on input data.

Here is a list of supported common table option variables:
- `greptime_auto_create_table`
- `greptime_ttl`
- `greptime_append_mode`
- `greptime_merge_mode`
- `greptime_physical_table`
- `greptime_skip_wal`
You can find the explanation [here](/reference/sql/create.md#table-options).

Here are some pipeline specific variables:
- `greptime_table_suffix`: add suffix to the destined table name.

Let's use the following pipeline file to demonstrate:
```YAML
processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true
  - vrl:
      source: |
        .greptime_table_suffix, err = "_" + .id
        .greptime_table_ttl = "1d"
        .
```

In the vrl script, we set the table suffix variable with the input field `.id`(leading with an underscore), and set the ttl to `1d`.
Then we run the ingestion using the following JSON data.

```JSON
{
  "id": "2436",
  "time": "2024-05-25 20:16:37.217"
}
```

Assuming the given table name being `d_table`, the final table name would be `d_table_2436` as we would expected.
The table is also set with a ttl of 1 day.

## Examples

Please refer to the "Writing Logs" section in the [Quick Start](quick-start.md#write-logs) guide for examples.

## Append Only

By default, logs table created by HTTP ingestion API are in [append only
mode](/user-guide/deployments-administration/performance-tuning/design-table.md#when-to-use-append-only-tables).

## Skip Errors with skip_error

If you want to skip errors when writing logs, you can add the `skip_error` parameter to the HTTP request's query params. For example:

```shell
curl -X "POST" "http://localhost:4000/v1/events/logs?db=<db-name>&table=<table-name>&pipeline_name=<pipeline-name>&version=<pipeline-version>&skip_error=true" \
     -H "Content-Type: application/x-ndjson" \
     -H "Authorization: Basic {{authentication}}" \
     -d "$<log-items>"
```

With this, GreptimeDB will skip the log entry when an error is encountered and continue processing the remaining logs. The entire request will not fail due to an error in a single log entry.