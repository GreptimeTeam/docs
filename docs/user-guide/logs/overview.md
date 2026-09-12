---
keywords: [logs, log ingestion, pipeline, full-text search, log collectors, Vector, Fluent Bit, Loki, Splunk]
description: How logs reach GreptimeDB, how pipelines parse and transform them on the way in, and how to query them once stored.
---

# Logs

Logs are stored in the same engine as metrics and traces, so a log table can be queried with SQL and joined against the other signals. What is specific to logs is the stage before storage: a pipeline parses a raw line into columns and decides which of them get indexed.

![log-collection-flow](/log-collection-flow.drawio.svg)

A log collector sends raw lines to GreptimeDB, a pipeline turns them into rows, and the result is a table you can search with SQL and full-text indexes.

<AnchorAlias id="log-collection-flow" />
<AnchorAlias id="pipeline-processing" />

## How a log becomes a row

A metric arrives already structured: a name, a set of labels, a value. An unstructured log line does not: it is one string, and what is inside it depends on whoever wrote the logging statement. The pipeline is the step that closes that gap, and it runs on the write path, before anything is stored.

A pipeline has two stages:

- **Processors** parse and rewrite the incoming fields. `dissect` and `regex` split a raw line into named fields, `json_parse` and `csv` read structured formats, `date` and `epoch` turn text into timestamps, and `vrl`, `gsub`, `select`, and `filter` reshape or drop what is left.
- **Transform** decides how those fields are stored: the column type for each one, whether it becomes a tag, and whether it carries an `inverted`, `skipping`, or `fulltext` index.

The result is an ordinary table, so a stored log is queried like any other data. A [dispatcher](/reference/pipeline/pipeline-config.md#dispatcher) can route different log types from one source into separate tables.

If the incoming data is already structured, no configuration is needed: the built-in `greptime_identity` pipeline stores each field as a column.

<AnchorAlias id="quick-start" />

## Getting started

[Quick Start](./quick-start.md) ingests logs with the built-in `greptime_identity` pipeline.

<AnchorAlias id="integrate-with-log-collectors" />

<AnchorAlias id="log-collectors" />

## Send logs from a collector

Each guide covers the collector's configuration and the pipeline setup it needs:

- [Vector](/user-guide/ingest-data/for-observability/vector.md#using-greptimedb_logs-sink-recommended)
- [Fluent Bit](/user-guide/ingest-data/for-observability/fluent-bit.md#http)
- [OpenTelemetry Collector](/user-guide/ingest-data/for-observability/otel-collector.md)
- [Kafka](/user-guide/ingest-data/for-observability/kafka.md#logs)
- [Loki](/user-guide/ingest-data/for-observability/loki.md#using-pipeline-with-loki-push-api)
- [Splunk](/user-guide/ingest-data/for-observability/splunk.md#using-a-pipeline)

<AnchorAlias id="learn-more-about-pipelines" />

## Write your own pipeline

A pipeline parses a log line, transforms the extracted values, and configures the indexes on the resulting columns.

- [Using Custom Pipelines](./use-custom-pipelines.md) — writing a pipeline for a log format the built-in ones do not cover.
- [Managing Pipelines](./manage-pipelines.md) — creating, updating, and deleting pipelines.

## Query logs

- [Full-Text Search](./fulltext-search.md) — matching text inside log messages.
- [GreptimeDB Dashboard](/getting-started/installation/greptimedb-dashboard.md#logs-query) — filtering and searching from the built-in Dashboard, with a builder or a code editor.

## Reference

- [Built-in Pipelines](/reference/pipeline/built-in-pipelines.md) — the pipelines GreptimeDB ships with.
- [APIs for Writing Logs](/reference/pipeline/write-log-api.md) — the HTTP API that accepts log writes.
- [Pipeline Configuration](/reference/pipeline/pipeline-config.md) — every processor and transform option.
