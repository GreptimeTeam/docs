---
keywords: [ADMIN statement, SQL, administration functions, flush table, compact table, build index, migrate region, gc table, gc regions]
description: Describes the `ADMIN` statement used to run administration functions, including examples for flushing tables, scheduling compactions, building indexes, migrating regions, querying procedure states, and garbage collecting orphaned files.
---

# ADMIN

`ADMIN` is used to run administration functions.

```sql
ADMIN function(arg1, arg2, ...)
```


## Admin Functions

GreptimeDB provides some administration functions to manage the database and data:

* `flush_table(table_name)` to flush a table's memtables into SST file by table name.
* `flush_region(region_id)` to flush a region's memtables into SST file by region id. Find the region id through [PARTITIONS](./information-schema/partitions.md) table.
* `compact_table(table_name, [type], [options])` to schedule a compaction task for a table by table name, read [compaction](/user-guide/deployments-administration/manage-data/compaction.md#strict-window-compaction-strategy-swcs-and-manual-compaction) for more details.
* `compact_region(region_id)` to schedule a compaction task for a region by region id.
* `build_index(table_name)` to build missing physical indexes for a table's existing SST files after adding or changing index definitions.
* `migrate_region(region_id, from_peer, to_peer, [timeout])` to migrate regions between datanodes, please read the [Region Migration](/user-guide/deployments-administration/manage-data/region-migration.md).
* `procedure_state(procedure_id)` to query a procedure state by its id.
* `flush_flow(flow_name)` to flush a flow's output into the sink table.
* `reconcile_table(table_name)` to reconcile the metadata inconsistency of a table, read [table reconciliation](/user-guide/deployments-administration/maintenance/table-reconciliation.md) for more details.
* `reconcile_database(database_name)` to reconcile the metadata inconsistency of all tables in a database, read [table reconciliation](/user-guide/deployments-administration/maintenance/table-reconciliation.md) for more details.
* `reconcile_catalog()` to reconcile the metadata inconsistency of all tables in the entire cluster, read [table reconciliation](/user-guide/deployments-administration/maintenance/table-reconciliation.md) for more details.
* `gc_table(table_name, [full_file_listing])` to garbage collect orphaned SST files in object storage for a dropped table. Returns the number of processed regions. The optional `full_file_listing` boolean (default `false`) enables a thorough scan of all files when set to `true`.
* `gc_regions(region_id1, ..., region_idN, [full_file_listing])` to garbage collect orphaned SST files in object storage for one or more specific regions by their region ids. Returns the number of processed regions. The optional `full_file_listing` boolean (default `false`) enables a thorough scan of all files when set to `true`.

For example:
```sql
-- Flush the table test --
admin flush_table("test");

-- Schedule a compaction for table test with default parallelism (1) --
admin compact_table("test");

-- Schedule a regular compaction with parallelism set to 2 --
admin compact_table("test", "regular", "parallelism=2");

-- Schedule an SWCS compaction with default time window and parallelism set to 2 --
admin compact_table("test", "swcs", "parallelism=2");

-- Schedule an SWCS compaction with custom time window and parallelism --
admin compact_table("test", "swcs", "window=1800,parallelism=2");

-- Build missing indexes for existing SST files after adding or changing indexes --
admin build_index("test");

-- Garbage collect orphaned SST files for a dropped table --
admin gc_table("test");

-- Garbage collect orphaned SST files for a dropped table with full file listing --
admin gc_table("test", true);

-- Garbage collect orphaned SST files for specific regions --
admin gc_regions(1, 2, 3);

-- Garbage collect orphaned SST files for specific regions with full file listing --
admin gc_regions(1, 2, 3, true);
```

## Build Index

Use `admin build_index` to manually build indexes for existing data files when the table metadata requires indexes that some SST files do not have yet. Typical use cases include adding an index to an existing column, migrating from data written before the index was available, or retrying after a previous index build failure.

```sql
admin build_index("table_name");
```

The function takes exactly one string argument. The table name can be unqualified or fully qualified. Unqualified names are resolved with the current query context.

For example, build a fulltext index for existing data:

```sql
CREATE TABLE logs (
    ts TIMESTAMP TIME INDEX,
    message TEXT
);

INSERT INTO logs VALUES
    (1, 'The quick brown fox jumps over the lazy dog'),
    (2, 'The quick brown fox jumps over the lazy cat');

admin flush_table("logs");

ALTER TABLE logs MODIFY COLUMN message SET FULLTEXT INDEX;

admin build_index("logs");

SELECT message FROM logs WHERE matches_term(message, 'fox');
```

`admin build_index` sends build requests to all regions of the table. Each region only builds indexes for SST files whose recorded index metadata is inconsistent with the current table metadata. Files that already have the required index metadata are skipped, so rerunning the command is safe. The command currently returns an affected-row count.

Use `SHOW INDEX` to check logical index definitions:

```sql
SHOW INDEX FROM logs;
```

You can also query `information_schema.ssts_index_meta` to check physical index metadata for SST files:

```sql
SELECT COUNT(*) AS fulltext_index_meta_count
FROM information_schema.ssts_index_meta
WHERE table_id = (
    SELECT table_id
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'logs'
)
AND index_type LIKE 'fulltext%';
```

Building indexes reads SST data and writes index files, so it consumes CPU, memory, and I/O resources. In asynchronous index build mode, automatic flush, compaction, and schema-change triggers may run at the same time as a manual build. Duplicate in-flight work is deduplicated or aborted, and the command remains safe to rerun.
