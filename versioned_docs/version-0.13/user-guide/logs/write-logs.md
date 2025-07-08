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
     -H 'Content-Type: application/x-ndjson' \
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

## Example

Please refer to the "Writing Logs" section in the [Quick Start](quick-start.md#write-logs) guide for an example.