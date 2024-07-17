# Writing Logs Using a Pipeline

This document describes how to write logs to GreptimeDB by processing them through a specified pipeline using the HTTP interface.

Before writing logs, please read the [Pipeline Configuration](pipeline-config.md) and [Managing Pipelines](manage-pipelines.md) documents to complete the configuration setup and upload.

## HTTP API

You can use the following command to write logs via the HTTP interface:

```shell
curl -X "POST" "http://localhost:4000/v1/events/logs?db=<db-name>&table=<table-name>&pipeline_name=<pipeline-name>&version=<pipeline-version>" \
     -H 'Content-Type: application/json' \
     -d "$<log-items>"
```

## Query parameters

This interface accepts the following parameters:

- `db`: The name of the database.
- `table`: The name of the table.
- `pipeline_name`: The name of the [pipeline](./pipeline-config.md).
- `version`: The version of the pipeline.

## Body data format

The request body supports NDJSON and JSON Array formats, where each JSON object represents a log entry.

## Example

Please refer to the "Writing Logs" section in the [Quick Start](quick-start.md#write-logs) guide for an example.