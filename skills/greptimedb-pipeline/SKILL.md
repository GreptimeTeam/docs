---
name: greptimedb-pipeline
description: Guide for creating a GreptimeDB Pipeline — a processing layer between ingestion and storage that parses, transforms, indexes, and optionally routes log data. Use when the user asks to create a pipeline, parse logs, transform fields, write a pipeline YAML, dryrun a pipeline, or fan out logs to multiple tables. Triggers on phrases like "create pipeline", "解析日志", "log parsing", "transform fields", "GreptimeDB pipeline yaml", "dryrun pipeline", "dispatcher 分流", "VRL processor".
---

# GreptimeDB Pipeline Guide

Create GreptimeDB pipeline definition to transform data into specific structured
table, including data extraction, processing, type parsing, datetime handling
and more.

## The workflow

To create GreptimeDB pipeline, we should follow these phases:

### Phase 1. Understanding GreptimeDB Pipeline

First, we should read greptimedb pipeline definitions and how it works from
GreptimeDB's documentation.

There are pages available, use WebFetch to load and understand them:

1. High level information of how to use custom pipeline
   https://docs.greptime.com/user-guide/logs/use-custom-pipelines/
2. Details about pipeline elements and docs for each processor, transform and
   dispatcher
   https://docs.greptime.com/reference/pipeline/pipeline-config/
3. Built-in pipelines (e.g. `greptime_identity` for zero-config JSON ingestion)
   https://docs.greptime.com/reference/pipeline/built-in-pipelines/

We will always create version 2 pipeline.

If the user just wants to land arbitrary JSON without caring about schema,
suggest the built-in `greptime_identity` pipeline first. It auto-creates
columns for each JSON field, flattens nested objects using dot notation, and
falls back to a `greptime_timestamp` column when no time index is specified.
Move on to a custom pipeline only when the user needs parsing, type control,
indexes, or routing.

### Phase 2. Create an initial pipeline that works

Ask user to provide a sample input data. It can be one of:

1. text data line
2. ndjson data line
3. an array of json data

And try to understand what type of information that user want to extract from
the sample data.

For text data line, we should try to split it by any potential field separator
like space or tab using `dissect` or `regex`. Find out the datetime part and
use `date` processor (for formatted strings) or `epoch` processor (for numeric
timestamps) to parse it. Try to name each field by its meaning. If it's
impossible to understand the text line, we try to use a field called `message`
for all the line.

For ndjson and json, we will find out a datetime field and use `date` or
`epoch` processor on it to generate the time index. And we will use json key
for all other fields.

#### Auto-transform vs explicit transform (v0.15+)

Since v0.15, the `transform` block is optional in a version-2 pipeline. The
engine will infer column types from the pipeline context and use the produced
timestamp as the time index automatically, **if and only if**:

- **Exactly one** timestamp field is produced by `date` / `epoch` processors
  (multiple timestamp fields raise an ambiguity error).
- The `date` / `epoch` processor producing that timestamp does **not** have
  `ignore_missing: true`.

Guidance:

- Use **auto-transform** (omit `transform`) for simple flat shapes where
  default inferred types are acceptable and a single time column is obvious.
- Write an explicit `transform` block when you need specific types, index
  configurations (inverted / fulltext / skipping), renames, or when you have
  multiple candidate time fields.

Provide user a sample of how the initial pipeline definition will look like, as
well as how the parsed data to be like. We can use a markdown table to show each
field name, data type in greptimedb and values:

| Field name 1 (Data type) | Field name 2 (Data type) | ... |
|--------------------------|--------------------------|-----|
| Value 1                  | Value 2                  | ... |
| Value 1                  | Value 2                  | ... |

### Phase 3. Work on special requirements and verify

The user may have more requirements on particular field, use processor to
address them.

**Routing to multiple tables.** If the user wants to dispatch data into
multiple tables, or hand off to different pipelines, use the `dispatcher`
element (the key is `dispatcher`, not `dispatch`). Each rule matches on a
field value and sets `table_suffix` (appended after an underscore) and
optionally `pipeline` (a downstream pipeline name):

```yaml
dispatcher:
  field: type
  rules:
    - value: http
      table_suffix: http        # -> <base>_http
      pipeline: http_pipeline
    - value: db
      table_suffix: db          # -> <base>_db
```

Rows whose `field` value matches no rule stay in the base table.

**Static table suffix from input.** For the simpler case of appending a
per-row suffix without branching pipelines, use the top-level `table_suffix`
with `${var}` interpolation (this feature is marked Experimental):

```yaml
table_suffix: _${app_name}
```

If `app_name` is missing or not a string/integer at runtime, the input table
name is used unchanged.

**Advanced remapping.** When declarative processors are not enough (field
math, conditional logic, array reshaping), use the `vrl` processor. See the
VRL reference for the language.

**Dryrun.** If the `greptimedb-mcp-server` is available, use its
`dryrun_pipeline` tool (note: underscore, not hyphen) to test pipeline
definition + sample data against GreptimeDB without persisting. It accepts
either inline YAML (`pipeline=`) or a saved name (`pipeline_name=`) together
with `data` and `data_type`. The output is the parsed row(s) encoded as JSON.

### Phase 4. Check index and table options

The Pipeline system also allow user to specify various index on the result
table. We will understand how user will query the table and provide suggestion
on index:

- `timestamp` — required on exactly one column
- `inverted` — low-cardinality equality / range filters
- `fulltext` — tokenized text search on message bodies
- `skipping` — high-cardinality IDs (e.g. request_id, trace_id)

**Advanced table options via `greptime_*` variables.** These are **variable
names** (no leading dot). The leading dot `.greptime_*` only appears inside a
VRL script, because VRL uses `.` to address the event being processed.

Recognized variables:

- `greptime_auto_create_table`
- `greptime_ttl`
- `greptime_append_mode`
- `greptime_merge_mode`
- `greptime_physical_table`
- `greptime_skip_wal`
- `greptime_table_suffix` (pipeline-specific)

Example — set suffix and TTL dynamically from input:

```yaml
processors:
  - date:
      fields:
        - time
      formats:
        - "%Y-%m-%dT%H:%M:%S%.3fZ"
  - vrl:
      source: |
        .greptime_table_suffix = "_" + .tenant
        .greptime_ttl = "7d"
        .
```

## Reference

1. GreptimeDB Index Options:
   https://docs.greptime.com/user-guide/manage-data/data-index/
2. VRL, the advanced processing language from Vector:
   https://vector.dev/docs/reference/vrl/
3. Using Table Options from Pipeline/VRL:
   https://docs.greptime.com/reference/pipeline/write-log-api/#set-table-options
4. Managing pipelines (create, update, delete, query):
   https://docs.greptime.com/user-guide/logs/manage-pipelines/
