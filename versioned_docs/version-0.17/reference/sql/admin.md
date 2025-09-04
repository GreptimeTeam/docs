---
keywords: [ADMIN statement, SQL, administration functions, flush table, compact table, migrate region]
description: Describes the `ADMIN` statement used to run administration functions, including examples for flushing tables, scheduling compactions, migrating regions, and querying procedure states.
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

For example:
```sql
-- Flush the table test --
admin flush_table("test");

-- Schedule a compaction for table test --
admin compact_table("test");
```
