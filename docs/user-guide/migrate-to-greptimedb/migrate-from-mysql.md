---
keywords: [migrate from MySQL, mysqldump, MySQL protocol, data validation]
description: Migrate compatible MySQL table data to GreptimeDB with an explicit consistency boundary and validation.
---

# Migrate from MySQL

GreptimeDB implements the MySQL wire protocol, not the MySQL storage engine or full SQL dialect. A MySQL schema dump cannot be restored unchanged. Create the GreptimeDB schema first, then move compatible row data.

## Plan the migration

Before exporting data:

- Check [SQL compatibility](/reference/sql/compatibility.md) and map unsupported MySQL types and expressions.
- Choose a natural event-time column as the GreptimeDB time index. Do not add an ingestion-time column unless that is the time semantics the application needs.
- Design primary keys and indexes from the GreptimeDB query workload. A GreptimeDB primary key is not a MySQL uniqueness constraint. See [Table design](/user-guide/deployments-administration/performance-tuning/design-table.md) and [Indexes](/user-guide/manage-data/data-index.md).
- Decide on an exact migration boundary. A short read-only window is the simplest safe option for a SQL-dump migration.

Application dual-write is not atomic: one destination can succeed while the other fails. If downtime is unacceptable, use a CDC or dual-write process that records a source position, retries each destination independently, and reconciles missing or conflicting rows before cutover. Merely opening two client connections does not prevent data loss.

## Create the target schema

Create the target database and tables in GreptimeDB. Match column names used by the data dump, but translate data types, defaults, generated columns, indexes, and constraints to GreptimeDB syntax.

The time-index type and precision cannot be changed in place, so test the schema with representative rows before the full import:

```sql
DESC TABLE db1.foo;
SHOW CREATE TABLE db1.foo;
```

## Export row data

The following example exports one InnoDB table while source writes are stopped. `--single-transaction` provides a consistent snapshot for transactional tables; it does not make non-transactional tables consistent. `--skip-extended-insert` writes one row per `INSERT`, and the `awk` filter keeps only statements intended for GreptimeDB.

```bash
set -o pipefail

mysqldump \
  --host=127.0.0.1 \
  --port=3306 \
  --user=mysql_user \
  --password \
  --single-transaction \
  --compact \
  --no-create-info \
  --complete-insert \
  --skip-extended-insert \
  db1 foo | awk '/^INSERT INTO /' > foo.sql
```

Export tables separately when they require different cutoff conditions or transformations. Inspect `foo.sql` before import. It should contain only column-qualified `INSERT` statements whose literals and column names are valid in the target schema.

## Import into GreptimeDB

Use the MySQL client against GreptimeDB's MySQL port, which defaults to `4002`:

```bash
mysql \
  --host=127.0.0.1 \
  --port=4002 \
  --user=greptime_user \
  --password \
  --database=db1 \
  < foo.sql
```

Do not use the MySQL client's `--force` option: it continues after SQL errors and can leave a partial import looking successful. Capture the command exit status and import logs. For large tables, split the export on stable time or key boundaries and record each completed range.

## Validate and cut over

Compare source and target over the same immutable boundary:

- Row count, minimum and maximum timestamp
- Non-null counts for important fields
- Counts grouped by business keys or time windows
- Sampled rows, including nulls, Unicode, binary values, and boundary timestamps
- Results of application-critical queries

Only switch reads and writes after the import completes without errors and these checks pass. Keep the source unchanged until the rollback window closes.
