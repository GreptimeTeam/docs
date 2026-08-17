---
keywords: [migrate from PostgreSQL, pg_dump, psql, PostgreSQL protocol, data validation]
description: Migrate compatible PostgreSQL table data to GreptimeDB with an explicit consistency boundary and fail-fast import.
---

# Migrate from PostgreSQL

GreptimeDB implements the PostgreSQL wire protocol, not the PostgreSQL storage engine or full SQL dialect. A PostgreSQL schema dump can contain DDL, session settings, extensions, constraints, and types that GreptimeDB does not support. Create the GreptimeDB schema first and export only compatible row data.

## Plan the migration

Before exporting data:

- Check [SQL compatibility](/reference/sql/compatibility.md) and map PostgreSQL-specific types and expressions.
- Choose a natural event-time column as the GreptimeDB time index and select its precision before creating the table.
- Design GreptimeDB primary keys and indexes from the target query workload. They do not reproduce PostgreSQL uniqueness or B-tree semantics. See [Table design](/user-guide/deployments-administration/performance-tuning/design-table.md) and [Indexes](/user-guide/manage-data/data-index.md).
- Define an exact source boundary. A short read-only window is the simplest safe method for this dump-based procedure.

Application dual-write is not atomic. If downtime is unacceptable, use CDC or a dual-write process that records a PostgreSQL source position, retries both destinations, and reconciles differences before cutover. Two independent JDBC connections do not provide a cross-database transaction.

## Create the target schema

Create the databases and tables in GreptimeDB before importing rows. Translate PostgreSQL defaults, generated columns, arrays, range types, JSON operators, constraints, and indexes where necessary.

Test the mapping with representative values and inspect the resulting schema:

```sql
DESC TABLE db1.foo;
SHOW CREATE TABLE db1.foo;
```

## Export row data

`pg_dump --column-inserts` is intended for moving data to a non-PostgreSQL database, but its output also contains PostgreSQL-specific setup statements. The following example exports one table while source writes are stopped and keeps only column-qualified `INSERT` statements:

```bash
set -o pipefail

pg_dump \
  --host=127.0.0.1 \
  --port=5432 \
  --username=postgres \
  --data-only \
  --column-inserts \
  --no-owner \
  --no-privileges \
  --table='db1.foo' \
  postgres | awk '/^INSERT INTO /' > foo.sql
```

This allowlist is intentional. The previous pattern of removing every line beginning with `SE` was unsafe because broad prefix filtering can discard valid content. Inspect `foo.sql` and transform unsupported literals or types before import.

For large tables, export bounded ranges with an ETL query or tool rather than creating one unbounded SQL file. Record every completed boundary so retries do not silently duplicate or skip rows.

## Import into GreptimeDB

Use `psql` against GreptimeDB's PostgreSQL port, which defaults to `4003`. `-X` ignores local `psqlrc` settings, and `ON_ERROR_STOP` makes the command fail on the first SQL error:

```bash
psql \
  -X \
  --set ON_ERROR_STOP=1 \
  --host=127.0.0.1 \
  --port=4003 \
  --username=greptime_user \
  --dbname=public \
  --file=foo.sql
```

Do not remove `ON_ERROR_STOP`. Continuing after a failed row can produce a partial import without a clear failure boundary. Capture the exit status and import log.

## Validate and cut over

Compare PostgreSQL and GreptimeDB over the same immutable source boundary:

- Row count, minimum and maximum timestamp
- Non-null counts and distinct counts for important dimensions
- Counts grouped by business keys or time windows
- Sampled rows covering nulls, time zones, numeric boundaries, Unicode, JSON, and binary values
- Results of application-critical queries after SQL translation

Switch traffic only after the import finishes without errors and the checks pass. Keep the PostgreSQL source unchanged until the rollback window closes.
