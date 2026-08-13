---
keywords: [data model, time index, tags, timestamps, fields, metrics, logs, traces]
description: Describes GreptimeDB's relational table model, time index, Tag, Timestamp, and Field semantics, with examples for metrics, logs, and traces.
---

# Data Model

## Model

GreptimeDB uses a relational table model extended with a time index and semantic column roles: `Tag`, `Timestamp`, and `Field`. The same model is used for metrics, logs, traces, and event data, while each signal can remain in separate tables.

Every GreptimeDB table has a name and exactly one time index. Columns have the following roles:

- `Tag` columns participate in the primary key and group related rows. For metrics, they usually represent labels that identify a time series. Tags are optional: append-only log and event tables can have no primary-key columns.
- The `Timestamp` column is declared as the table's time index. It records event or sample time, helps GreptimeDB organize data by time, and enables efficient time-range queries.
- `Field` columns store measurements, log content, trace attributes, or other values. They can use numeric, string, JSON, timestamp, and other supported data types.

For tables with primary-key columns, persisted rows are ordered by `(primary key, timestamp)`. Tables can merge rows with the same primary key and timestamp according to their [merge mode](/reference/sql/create.md#create-a-table-with-merge-mode). Append-only tables disable deduplication and, when they have no primary key, order persisted rows by timestamp. GreptimeDB stores table data in immutable Parquet SST files; see [Data Layout in SST Files](/contributor-guide/datanode/storage-engine.md#data-layout-in-sst-files) for details.

Schema design affects write amplification, compression, index size, and query pruning. See the [Schema Design Guide](/user-guide/deployments-administration/performance-tuning/design-table.md) before choosing primary-key columns and indexes.

### Metrics

The following table stores host resource metrics:

```sql
CREATE TABLE IF NOT EXISTS system_metrics (
    host STRING,
    idc STRING,
    cpu_util DOUBLE,
    memory_util DOUBLE,
    disk_util DOUBLE,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(host, idc),
    TIME INDEX(ts)
);
```

![The system_metrics table maps host and idc to Tag columns, ts to the Timestamp column and time index, and the remaining measurements to Field columns.](/time-series-data-model.svg)

- `host` and `idc` are Tag columns declared by `PRIMARY KEY`.
- `ts` is the Timestamp column declared by `TIME INDEX`.
- `cpu_util`, `memory_util`, and `disk_util` are Field columns.
- With the default [`last_row` merge mode](/reference/sql/create.md#create-a-table-with-merge-mode), queries keep the latest row for each `host`, `idc`, and `ts` combination.

See [Prometheus Data Model](/user-guide/ingest-data/for-observability/prometheus.md#data-model) for the mapping between Prometheus metrics and GreptimeDB tables.

### Logs

An append-only table is often a better fit for access logs:

```sql
CREATE TABLE access_logs (
  access_time TIMESTAMP TIME INDEX,
  remote_addr STRING,
  http_status STRING,
  http_method STRING,
  http_refer STRING,
  user_agent STRING,
  request STRING
) WITH ('append_mode' = 'true');
```

- `access_time` is the Timestamp column.
- The table has no Tag columns or primary key.
- The remaining columns are Fields.
- [`append_mode`](/reference/sql/create.md#create-an-append-only-table) disables deduplication and deletion. It fits immutable log records, but not workloads that need row updates or deletes.
- Without a primary key, persisted rows are ordered by `access_time`.

See [Create a Table](/user-guide/deployments-administration/manage-data/basic-table-operations.md#create-a-table) and the [CREATE TABLE reference](/reference/sql/create.md) for column-role syntax and table options.

### Traces

GreptimeDB accepts OpenTelemetry traces through OTLP/HTTP and maps spans to tables with a time index, trace identifiers, span identifiers, attributes, and duration fields. See the [OTLP Trace Data Model](/user-guide/ingest-data/for-observability/opentelemetry.md#data-model-2).

Trace ingestion, storage, and SQL queries are first-class capabilities. GreptimeDB also provides a Jaeger-compatible query API.

## Design Considerations

The table model provides several practical properties:

- schemas expose types and column roles to the storage and query engines;
- SQL can filter, aggregate, and join data across tables;
- a row can contain multiple Field columns, avoiding the extra rows required by single-value models;
- tables can choose primary keys, merge behavior, append-only mode, indexes, TTL, and storage providers independently;
- automatic schema generation can create tables and columns for supported ingestion protocols;
- the same Tag, Timestamp, and Field concepts apply to metrics, logs, traces, and wide events without requiring them to share a table.

GreptimeDB manages table schemas with SQL. See [Table Management](/user-guide/deployments-administration/manage-data/basic-table-operations.md) and [Automatic Schema Generation](/user-guide/ingest-data/overview.md#automatic-schema-generation).

Tables can also carry an optional [table semantic layer](./semantic-layer.md) describing signal identity and ingestion metadata for machine consumers. Read [Unified observability data model](./observability-2.md) for how native signals and wide events use the shared table model without sharing one table.
