---
keywords: [soft drop, recycle bin, drop table, undrop table, purge table, data recovery]
description: How to enable and use soft-drop tables in GreptimeDB.
---

# Soft-Drop Tables

Soft-drop protects tables from accidental `DROP TABLE` operations in distributed GreptimeDB clusters. When enabled, `DROP TABLE` closes the table regions and moves the table metadata to tombstones instead of immediately deleting the physical data. You can restore the table before the retention period expires, or purge it manually when you are sure the table is no longer needed.

Soft-drop applies to supported table engines in distributed mode. Standalone mode keeps the existing hard-drop behavior. File-engine tables and metric logical tables also keep hard-drop behavior when the cluster-wide soft-drop switch is enabled.

## Enable soft-drop

Soft-drop is configured on Metasrv under the GC configuration. It requires Metasrv GC to be enabled.

```toml
[gc]
enable = true

[gc.soft_drop]
enable = true
retention = "7d"
```

The options are:

| Option | Description |
| --- | --- |
| `gc.enable` | Enables the Metasrv GC scheduler. Required when `gc.soft_drop.enable = true`. |
| `gc.soft_drop.enable` | Enables soft-drop for supported tables in distributed mode. |
| `gc.soft_drop.retention` | How long a soft-dropped table can stay in the recycle bin before Metasrv GC automatically purges it. The value must be at least `1ms`. |

Restart Metasrv after changing these options. For ordinary file GC, keep Metasrv and Datanode GC settings consistent as described in [Garbage Collection](./gc.md).

## Drop a table

After soft-drop is enabled, use `DROP TABLE` as usual:

```sql
DROP TABLE monitor;
```

The table becomes invisible to DDL and DML. It no longer appears in `information_schema.tables`, but it appears in [`information_schema.recycle_bin`](/reference/sql/information-schema/recycle-bin.md) until it is restored, manually purged, or automatically purged after the retention deadline.

## View dropped tables

Query the recycle bin to find dropped tables and their retention deadlines:

```sql
SELECT object_id,
       object_type,
       original_catalog_name,
       original_schema_name,
       original_object_name,
       dropped_at,
       retention_expires_at,
       purge_status,
       restorable
FROM information_schema.recycle_bin
WHERE original_schema_name = 'public';
```

Only active, restorable soft-dropped tables are listed. Tables that are already being purged are hidden from the recycle bin.

## Restore a table

Use `UNDROP TABLE` to restore a soft-dropped table:

```sql
UNDROP TABLE monitor;
```

You can also use a fully qualified table name:

```sql
UNDROP TABLE greptime.public.monitor;
```

The table is restored with its original data if no live table with the same full name exists. If a new live table already uses that name, `UNDROP TABLE` fails and does not restore the dropped table under another name.

## Purge a table

Use the admin function `purge_table()` to permanently delete a soft-dropped table before the retention deadline:

```sql
ADMIN purge_table('monitor');
```

You can pass an unqualified, schema-qualified, or fully qualified table name:

```sql
ADMIN purge_table('public.monitor');
ADMIN purge_table('greptime.public.monitor');
```

Purging is permanent. After purge finishes, the table disappears from `information_schema.recycle_bin` and cannot be restored. `purge_table()` is available only through the `ADMIN` statement; calling it from a normal `SELECT` statement is rejected.

## Name conflict rules

- You can create a new table with the same name after the old table is soft-dropped.
- `UNDROP TABLE` fails if a live table with the same full name already exists.
- Dropping a newly recreated table fails while an older tombstone still owns the same full name. Purge or restore the older tombstone first.
- `ADMIN purge_table('<name>')` resolves the tombstoned table, not a live table with the same name.

## Automatic purge

Metasrv GC periodically scans soft-dropped tables. When a table's `retention_expires_at` deadline has passed, GC submits the same purge procedure used by `ADMIN purge_table()`. The retention deadline is fixed when the table is dropped, so changing `gc.soft_drop.retention` later does not change existing dropped tables.
