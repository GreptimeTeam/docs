---
keywords: [ADMIN statement, SQL, administration functions, flush table, compact table, migrate region, gc table, gc regions]
description: Describes the `ADMIN` statement used to run administration functions, including examples for flushing tables, scheduling compactions, migrating regions, querying procedure states, and garbage collecting orphaned files.
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

-- Garbage collect orphaned SST files for a dropped table --
admin gc_table("test");

-- Garbage collect orphaned SST files for a dropped table with full file listing --
admin gc_table("test", true);

-- Garbage collect orphaned SST files for specific regions --
admin gc_regions(1, 2, 3);

-- Garbage collect orphaned SST files for specific regions with full file listing --
admin gc_regions(1, 2, 3, true);
```
