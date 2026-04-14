---
keywords: [Trace, OpenTelemetry, Jaeger]
description: Covers internals of how trace data is stored in GreptimeDB.
---

# Trace Data Modeling

:::warning

This section currently in the experimental stage and may be adjusted in future versions.

:::

In this section, we will cover how trace data is modeled in GreptimeDB as
tables.

We reuse the concept of Pipeline for trace data modeling. However, note that at
the moment, only built-in pipelines are supported.

## Data Model Versioning

First, the data types and features in GreptimeDB are evolving. For
forward-compatibility, we use the pipeline name for data model
versioning. Currently we have following pipeline for trace:

- `greptime_trace_v1`

It is required for user to specify this on OpenTelemetry OTLP/HTTP headers via
`x-greptime-pipeline-name: greptime_trace_v1`.

We may introduce new data model by adding new available pipeline names. And we
will keep previous pipeline supported. Note that new pipeline may not be
compatible with previous ones so you are recommended to use it in new table.

## Data Model

The `greptime_trace_v1` data model is pretty straight-forward. By default,
trace data is stored in a table named `opentelemetry_traces`. You can customize
the table name by specifying the `x-greptime-trace-table-name` header in your
OTLP/HTTP requests.

- It maps most common data fields from [OpenTelemetry
  Trace](https://opentelemetry.io/docs/concepts/signals/traces/) data model to
  GreptimeDB's table columns.
- `service_name` is extracted from `resource_attributes["service.name"]` and
  used as a **Tag** (part of the **Primary Key**).
- `timestamp` is the start time of the span and is used as the **Time Index**.
- A new `duration_nano` column is generated using `end_time - start_time`.
- All attributes fields are flattened into columns using the name pattern:
  `[span|resource|scope]_attributes.[attribute_key]`.
  - Note: `resource_attributes.service.name` is excluded from flattening as it
    is already stored in the `service_name` column.
  - If the attribute value is a compound type like `Array` or `Kvlist`, it is
    serialized to `JSON` type of GreptimeDB.
- Compound fields, `span_links` and `span_events` are stored as `JSON` type.

The table will be automatically generated when your first data item arrived. It
also follows our schema-less principle to update the table schema automatically
for new columns, for example, the new attribute fields.

A typical table structure generated from OpenTelemetry django instrument is like:

```
timestamp                                  | 2025-05-07 10:03:29.657544
timestamp_end                              | 2025-05-07 10:03:29.661714
duration_nano                              | 4169970
trace_id                                   | fb60d19aa36fdcb7d14a71ca0b9b42ae
span_id                                    | 49806a2671f2ddcb
span_kind                                  | SPAN_KIND_SERVER
span_name                                  | POST todos/
span_status_code                           | STATUS_CODE_UNSET
span_status_message                        |
trace_state                                |
scope_name                                 | opentelemetry.instrumentation.django
scope_version                              | 0.51b0
service_name                               | myproject
span_attributes.http.request.method        | POST
span_attributes.url.full                   |
span_attributes.server.address             | django:8000
span_attributes.network.peer.address       |
span_attributes.server.port                | 8000
span_attributes.network.peer.port          |
span_attributes.http.response.status_code  | 201
span_attributes.network.protocol.version   | 1.1
resource_attributes.telemetry.sdk.language | python
resource_attributes.telemetry.sdk.name     | opentelemetry
resource_attributes.telemetry.sdk.version  | 1.30.0
span_events                                | []
span_links                                 | []
parent_span_id                             | eccc18b6fc210f31
span_attributes.db.system                  |
span_attributes.db.name                    |
span_attributes.db.statement               |
span_attributes.url.scheme                 | http
span_attributes.url.path                   | /todos/
span_attributes.client.address             | 10.89.0.5
span_attributes.client.port                | 44302
span_attributes.user_agent.original        | python-requests/2.32.3
span_attributes.http.route                 | todos/
```

To check the table definition, you can use `show create table opentelemetry_traces`
statement. An output like this is expected:

```
Table        | opentelemetry_traces
Create Table | CREATE TABLE IF NOT EXISTS "opentelemetry_traces" (                                           +
             |   "timestamp" TIMESTAMP(9) NOT NULL,                                                    +
             |   "timestamp_end" TIMESTAMP(9) NULL,                                                    +
             |   "duration_nano" BIGINT UNSIGNED NULL,                                                 +
             |   "trace_id" STRING NULL SKIPPING INDEX WITH(granularity = '10240', type = 'BLOOM'),    +
             |   "span_id" STRING NULL,                                                                +
             |   "span_kind" STRING NULL,                                                              +
             |   "span_name" STRING NULL,                                                              +
             |   "span_status_code" STRING NULL,                                                       +
             |   "span_status_message" STRING NULL,                                                    +
             |   "trace_state" STRING NULL,                                                            +
             |   "scope_name" STRING NULL,                                                             +
             |   "scope_version" STRING NULL,                                                          +
             |   "service_name" STRING NULL SKIPPING INDEX WITH(granularity = '10240', type = 'BLOOM'),+
             |   "span_attributes.http.request.method" STRING NULL,                                    +
             |   "span_attributes.url.full" STRING NULL,                                               +
             |   "span_attributes.server.address" STRING NULL,                                         +
             |   "span_attributes.network.peer.address" STRING NULL,                                   +
             |   "span_attributes.server.port" BIGINT NULL,                                            +
             |   "span_attributes.network.peer.port" BIGINT NULL,                                      +
             |   "span_attributes.http.response.status_code" BIGINT NULL,                              +
             |   "span_attributes.network.protocol.version" STRING NULL,                               +
             |   "resource_attributes.telemetry.sdk.language" STRING NULL,                             +
             |   "resource_attributes.telemetry.sdk.name" STRING NULL,                                 +
             |   "resource_attributes.telemetry.sdk.version" STRING NULL,                              +
             |   "span_events" JSON NULL,                                                              +
             |   "span_links" JSON NULL,                                                               +
             |   "parent_span_id" STRING NULL,                                                         +
             |   "span_attributes.db.system" STRING NULL,                                              +
             |   "span_attributes.db.name" STRING NULL,                                                +
             |   "span_attributes.db.statement" STRING NULL,                                           +
             |   "span_attributes.url.scheme" STRING NULL,                                             +
             |   "span_attributes.url.path" STRING NULL,                                               +
             |   "span_attributes.client.address" STRING NULL,                                         +
             |   "span_attributes.client.port" BIGINT NULL,                                            +
             |   "span_attributes.user_agent.original" STRING NULL,                                    +
             |   "span_attributes.http.route" STRING NULL,                                             +
             |   TIME INDEX ("timestamp"),                                                             +
             |   PRIMARY KEY ("service_name")                                                          +
             | )                                                                                       +
             | PARTITION ON COLUMNS ("trace_id") (                                                     +
             |   trace_id < '1',                                                                       +
             |   trace_id >= 'f',                                                                      +
             |   trace_id >= '1' AND trace_id < '2',                                                   +
             |   trace_id >= '2' AND trace_id < '3',                                                   +
             |   trace_id >= '3' AND trace_id < '4',                                                   +
             |   trace_id >= '4' AND trace_id < '5',                                                   +
             |   trace_id >= '5' AND trace_id < '6',                                                   +
             |   trace_id >= '6' AND trace_id < '7',                                                   +
             |   trace_id >= '7' AND trace_id < '8',                                                   +
             |   trace_id >= '8' AND trace_id < '9',                                                   +
             |   trace_id >= '9' AND trace_id < 'a',                                                   +
             |   trace_id >= 'a' AND trace_id < 'b',                                                   +
             |   trace_id >= 'b' AND trace_id < 'c',                                                   +
             |   trace_id >= 'c' AND trace_id < 'd',                                                   +
             |   trace_id >= 'd' AND trace_id < 'e',                                                   +
             |   trace_id >= 'e' AND trace_id < 'f'                                                    +
             | )                                                                                       +
             | ENGINE=mito                                                                             +
             | WITH(                                                                                   +
             |   append_mode = 'true',                                                                 +
             |   table_data_model = 'greptime_trace_v1'                                                +
             | )
```

### Partition Rules

We included default [partition
rules](/user-guide/deployments-administration/manage-data/table-sharding.md#partition) for
trace table on the `trace_id` column based on the first character of it. This is
optimised for retrieve trace spans by the trace id.

The partition rule introduces 16 partitions for the table. It is suitable for a
3-5 datanode setup.

To customize the partition rule, you can:

1. Create a new table ahead-of-time by copying the DDL output by `show create
   table` on original table, update the `PARTITION ON` section to include your
   own rules.
2. Use `x-greptime-hints` [HTTP header](/user-guide/protocols/http#hints) in
   your OTLP ingestion request, include a hint `trace_table_partitions=n` where
   `n` is the partition number. Set `n` to `1` to disable partitioning.

### Index

We include [skipping
index](/user-guide/manage-data/data-index.md#skipping-index) on `service_name`
and `trace_id` for most typical queries.

In real-world, you may want to speed up queries on other fields like an attribute
field. It's possible by apply additional index on these fields using [alter
table](/reference/sql/alter.md#create-an-index-for-a-column) statement.

Unlike partition rules, index can be created on existing table and be affective
on new data.

### Append-only Mode

By default, trace table created by OpenTelemetry API are in [append only
mode](/user-guide/deployments-administration/performance-tuning/design-table.md#when-to-use-append-only-tables).

### TTL

You can apply [TTL on trace table](/reference/sql/alter.md#alter-table-options).

## Auxiliary Tables

When you ingest trace data, GreptimeDB automatically creates two auxiliary
tables to facilitate searching for services and operations. These tables are
named by appending `_services` and `_operations` to your main trace table name.

By default, these are named `opentelemetry_traces_services` and
`opentelemetry_traces_operations`. If you customize the main trace table name
using the `x-greptime-trace-table-name` HTTP header, the auxiliary tables will
be named accordingly (e.g., `<custom_table_name>_services` and
`<custom_table_name>_operations`).

### Services Table (`opentelemetry_traces_services`)

This table stores the list of unique service names found in the trace data.

- **Columns**:
  - `timestamp`: A constant timestamp (2100-01-01 00:00:00) used for all entries.
  - `service_name`: The name of the service (Tag).

### Operations Table (`opentelemetry_traces_operations`)

This table stores the list of unique operations (service, span name, and span
kind) found in the trace data.

- **Columns**:
  - `timestamp`: A constant timestamp (2100-01-01 00:00:00) used for all entries.
  - `service_name`: The name of the service (Tag).
  - `span_name`: The name of the span (Tag).
  - `span_kind`: The kind of the span (Tag).
