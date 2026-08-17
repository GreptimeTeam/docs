---
keywords: [migrate from ClickHouse, ClickHouse, CSV, COPY FROM, migration validation]
description: Redesign a ClickHouse table for GreptimeDB and migrate a bounded data set through CSV or object storage.
---

# Migrate from ClickHouse

ClickHouse and GreptimeDB use different SQL dialects, table models, indexes, and storage engines. Treat the migration as a schema redesign and data conversion, not as a direct restore of ClickHouse DDL or data files.

## Define the migration boundary

Choose one of these approaches before exporting data:

- Stop source writes during the final export and import.
- Export an immutable time range and start the new write path at the range boundary.
- Use a CDC or application dual-write process that records source positions and reconciles failures.

Application dual-write is two independent writes, not a cross-database transaction. It reduces cutover downtime only when failures are recorded, retried, and reconciled. Do not assume that enabling two sinks prevents gaps or duplicates.

## Redesign the table

Review [SQL compatibility](/reference/sql/compatibility.md), [Table design](/user-guide/deployments-administration/performance-tuning/design-table.md), and [Indexes](/user-guide/manage-data/data-index.md). In particular:

- Select one event-time column as the GreptimeDB time index and preserve its time zone and precision during export.
- Do not copy ClickHouse `ORDER BY` mechanically into a GreptimeDB primary key. Choose primary-key columns from the target filter, grouping, and row-merge semantics.
- Add inverted, skipping, or full-text indexes only for operators and columns that use them. Cardinality alone does not determine the index type.
- Translate `PARTITION BY` to GreptimeDB table partitioning only when the target workload needs explicit sharding.
- Translate ClickHouse TTL expressions to GreptimeDB database or table `ttl` options.
- Flatten or convert ClickHouse arrays, tuples, maps, aggregate states, and other types that do not have an equivalent target type.

For OpenTelemetry logs and traces, prefer GreptimeDB's built-in [log](/user-guide/logs/overview.md) and [trace](/user-guide/traces/overview.md) data models instead of inventing a second incompatible schema.

## Example schema mapping

ClickHouse source table:

```sql
CREATE TABLE example (
  timestamp DateTime,
  host String,
  app String,
  metric String,
  value Float64
)
ENGINE = MergeTree
TTL timestamp + INTERVAL 30 DAY
ORDER BY (timestamp, host, app, metric);
```

One possible GreptimeDB target is:

```sql
CREATE TABLE example (
  ts TIMESTAMP(3) NOT NULL,
  host STRING,
  app STRING,
  metric STRING,
  value DOUBLE,
  PRIMARY KEY (host, app, metric),
  TIME INDEX (ts)
) WITH (ttl = '30d');
```

The target is an example, not a general recommendation. Rename `timestamp` to `ts` during export, and change the primary key or add indexes only after checking actual queries and update semantics.

## Export a bounded range

`CSVWithNames` writes a header row. Select and convert columns explicitly so the file matches the target schema. The following command writes the CSV on the client machine and excludes rows at or after the cutover boundary:

```bash
clickhouse-client \
  --host <clickhouse-host> \
  --query "
    SELECT
      timestamp AS ts,
      host,
      app,
      metric,
      value
    FROM example
    WHERE timestamp < toDateTime('2026-08-01 00:00:00', 'UTC')
    ORDER BY timestamp
    FORMAT CSVWithNames
  " > example.csv
```

Use the source time zone rather than `UTC` if the ClickHouse `DateTime` column uses another zone. Export large tables in non-overlapping time ranges and record the row count and boundaries of every file.

## Import into GreptimeDB

Upload the file to object storage for a distributed GreptimeDB cluster, then run `COPY FROM`. `STRICT_HEADERS` fails before reading data if CSV column names do not match the target table:

```sql
COPY example
FROM 's3://migration-bucket/clickhouse/example.csv'
WITH (
  FORMAT = 'CSV',
  HEADERS = 'true',
  STRICT_HEADERS = 'true'
)
CONNECTION (REGION = 'us-west-2');
```

Add the required connection credentials or use the deployment's credential provider. For a standalone deployment, a local path can be used only within the configured `storage.copy_root`; distributed deployments disable local SQL file access. See [COPY FROM](/reference/sql/copy.md#copy-from) and [Migrate local SQL file access](/user-guide/deployments-administration/migrate-local-sql-file-access.md).

Keep `SKIP_BAD_RECORDS` disabled during migration. Skipping conversion failures makes source and target counts diverge without identifying which rows were lost.

## Validate and cut over

For every exported range, compare:

- Source query count and imported row count
- Minimum and maximum event time
- Null counts and distinct counts for important dimensions
- Aggregates grouped by the dimensions and time windows used by the application
- Sampled rows covering time zones, nullable values, nested-data conversions, and numeric boundaries
- Rewritten dashboard, alert, and application-query results

Cut over only after all ranges and critical queries pass validation. Keep the ClickHouse source unchanged until the rollback window closes.
