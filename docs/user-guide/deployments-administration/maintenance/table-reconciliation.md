---
keywords: [GreptimeDB, table reconciliation, metadata consistency, Metasrv, Datanode, table metadata repair]
description: Guide for understanding GreptimeDB's table reconciliation mechanism that detects and repairs metadata inconsistencies between Metasrv and Datanode.
---

# Table Reconciliation

## Overview

GreptimeDB uses a layered metadata management architecture in distributed environments:
- **Metasrv**: Acts as the metadata management layer, responsible for maintaining metadata information for all tables in the cluster
- **Datanode**: Handles actual data storage and query execution, while also persisting some table metadata

Under ideal conditions, table metadata between Metasrv and Datanode should remain perfectly consistent. However, in real production environments, restore from a [metadata backup](/user-guide/deployments-administration/manage-metadata/restore-backup.md) may cause metadata inconsistencies.

**Table Reconciliation** is a table metadata repair mechanism provided by GreptimeDB that:
- Detects metadata differences between Metasrv and Datanode
- Repairs inconsistency issues according to predefined strategies
- Ensures the system can recover from abnormal states to a consistent, available state

## Before starting
Before starting the table reconciliation process, you need to:
1. Restore the cluster from a specific [metadata backup](/user-guide/deployments-administration/manage-metadata/restore-backup.md)
2. Set the [Next Table ID](/user-guide/deployments-administration/maintenance/sequence-management.md) to the original cluster's next table ID

## Repair Scenarios

### `Table not found` Error

After a cluster is restored from specific metadata, write and query operations may encounter `Table not found` errors.

- **Scenario 1**: The original cluster created new tables after the metadata backup, causing the new table metadata to not be included in the backup. This results in `Table not found` errors when querying these new tables. For this situation, you need to manually set the [Next Table ID](/user-guide/deployments-administration/maintenance/sequence-management.md) to ensure that the restored cluster won't fail to create tables due to table ID conflicts when creating new tables.

- **Scenario 2**: The original cluster renamed existing tables after the metadata backup. In this case, the new table names will be lost.

### `Empty region directory` Error

After a cluster is restored from specific metadata, starting the Datanode may result in an `Empty region directory` error. This usually occurs because the original cluster deleted tables (executed `DROP TABLE`) after the metadata backup, causing the deleted table metadata to not be included in the backup, resulting in this error when starting the Datanode. For this situation, you need to enable [Recovery Mode](/user-guide/deployments-administration/maintenance/recovery-mode.md) after starting Metasrv when starting the cluster to ensure the Datanode can start normally.

- **Mito Engine tables**: Table metadata cannot be repaired, you need to manually execute the `DROP TABLE` command to delete the non-existent table.
- **Metric Engine tables**: Table metadata can be repaired, you need to manually execute the `ADMIN reconcile_table(table_name)` command to repair the table metadata.

### `No field named` Error

After a cluster is restored from specific metadata, write and query operations may encounter `No field named` errors. This usually occurs because the original cluster deleted columns (executed `DROP COLUMN`) after the metadata backup, causing the deleted column metadata to not be included in the backup, resulting in this error when querying these deleted columns. For this situation, you need to manually execute the `ADMIN reconcile_table(table_name)` command to repair the table metadata.

### `schema has a different type` Error

After a cluster is restored from specific metadata, write and query operations may encounter `schema has a different type` errors. This usually occurs because the original cluster modified column types (executed `MODIFY COLUMN [column_name] [type]`) after the metadata backup, causing the modified column type metadata to not be included in the backup, resulting in this error when querying these modified columns. For this situation, you need to manually execute the `ADMIN reconcile_table(table_name)` command to repair the table metadata.

### Missing Specific Columns

After a cluster is restored from specific metadata, write and query operations may run normally but not include some columns. This occurs because the original cluster added columns (executed `ADD COLUMN`) after the metadata backup, causing the new column metadata to not be included in the backup, making these columns unavailable during queries. For this situation, you need to manually execute the `ADMIN reconcile_table(table_name)` command to repair the table metadata.

### Missing Column Indexes

After a cluster is restored from specific metadata, write and query operations may run normally, but `SHOW CREATE TABLE`/`SHOW INDEX FROM [table_name]` shows that certain columns don't include expected indexes. This occurs because the original cluster modified indexes (executed `MODIFY INDEX [column_name] SET [index_type] INDEX`) after the metadata backup, causing the index change metadata to not be included in the backup. For this situation, you need to manually execute the `ADMIN reconcile_table(table_name)` command to repair the table metadata.

## Perform the repair operation

GreptimeDB provides the following Admin functions to trigger table metadata repair:

### Repair All Tables

Repair the metadata inconsistency of all tables in the entire cluster:

```sql
ADMIN reconcile_catalog()
```

### Repair a Specific Database

Repair the metadata inconsistency of all tables in a specific database:

```sql
ADMIN reconcile_database(database_name)
```

### Repair a Specific Table

Repair the metadata inconsistency of a single table:

```sql
ADMIN reconcile_table(table_name)
```

### View Repair Progress

After the Admin function is executed, it will return a `ProcedureID`, you can use the following command to view the progress of the repair task:

```sql
ADMIN procedure_state(procedure_id)
```

When `procedure_state` returns Done, it indicates that the repair task has completed.

## Important Notes

When performing table metadata repair operations, please note the following:

- Repair operations are executed asynchronously, and you can check the execution progress through the `procedure_id`
- It is recommended to perform repair operations during low-traffic periods to reduce the impact on system performance
- For large-scale repair operations (such as `reconcile_catalog()`), it is recommended to validate in a test environment first
