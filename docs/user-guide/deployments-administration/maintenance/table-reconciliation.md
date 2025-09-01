---
keywords: [GreptimeDB, table reconciliation, metadata consistency, Metasrv, Datanode, table metadata]
description: Guide for understanding GreptimeDB's table reconciliation mechanism that detects and repairs metadata inconsistencies between Metasrv and Datanode.
---

# Table Reconciliation

## Overview

GreptimeDB uses a layered metadata management architecture in distributed environments:
- **Metasrv**: Acts as the metadata management layer, responsible for maintaining metadata information for all tables in the cluster
- **Datanode**: Handles actual data storage and query execution, while also persisting some table metadata

Under ideal conditions, table metadata between Metasrv and Datanode should remain perfectly consistent. However, in real production environments, the following exceptional situations may cause metadata inconsistencies:
- Backup and restore operations
- Node failures and restarts
- Network partitions
- Abnormal system shutdowns

**Table Reconciliation** is an repair mechanism provided by GreptimeDB that:
- Detects metadata differences between Metasrv and Datanode
- Repairs inconsistency issues according to predefined strategies
- Ensures the system can recover from abnormal states to a consistent, available state

## Repair Scenarios

GreptimeDB supports two table engines, each with different behaviors during table reconciliation. The following sections detail various inconsistency scenarios and their repair strategies.

### Mito Engine Repair Scenarios

Mito Engine is GreptimeDB's default storage engine and supports comprehensive table reconciliation functionality.

| Scenario | Inconsistency Type | Typical Scenario | Repair Strategy | User Action Required |
|---------|-------------------|------------------|---------------------------|---------------------|
| **A1** | Column count mismatch: Metasrv **more than** Datanode | `DROP COLUMN` executed after metadata backup | ✅ Sync metadata, remove excess column definitions | No intervention needed |
| **A2** | Column count mismatch: Metasrv **less than** Datanode | `ADD COLUMN` executed after metadata backup | ✅ Sync metadata, add missing column definitions | No intervention needed |
| **A3** | Column type mismatch | `ALTER COLUMN` executed after metadata backup | ✅ sync metadata, unify column type definitions | No intervention needed |
| **A4** | Table count mismatch: Metasrv **more than** Datanode | New table created after metadata backup | ❌ New table cannot be recovered | Manual [Next Table ID](/user-guide/deployments-administration/maintenance/sequence-management.md) setting required |
| **A5** | Table count mismatch: Metasrv **less than** Datanode | Table dropped after metadata backup | ❌ System ignores tables not in storage during startup | Enable [Recovery Mode](/user-guide/deployments-administration/maintenance/recovery-mode.md) during startup; drop the missing table |
| **A6** | Table name mismatch | `RENAME TABLE` executed after metadata backup | ❌ Table name changes cannot be recovered | New table name will be lost |


### Metric Engine Repair Scenarios

Metric Engine is optimized for time-series data and has a relatively simplified table reconciliation mechanism.

| Scenario | Inconsistency Type | Typical Scenario | Repair Strategy | User Action Required |
|---------|-------------------|------------------|---------------------------|---------------------|
| **B1** | Logical table missing: Metasrv **less than** metadata region | New metric table created after metadata backup | ❌ New table cannot be Recovered | Manual [Next Table ID](/user-guide/deployments-administration/maintenance/sequence-management.md) setting required |
| **B2** | Logical table excess: Metasrv **more than** metadata region | Metric table deleted after metadata backup | ✅ Re-create table, restore deleted table | No intervention needed |
| **B3** | Column definition missing: Metasrv **less than** metadata region | New metric column added after metadata backup | ✅ Complete missing column definitions | No intervention needed |


## Troubleshooting Guide

When encountering table metadata-related issues, you can quickly identify the problem scenario based on error messages:

| Error Message | Corresponding Scenario | Problem Description |
|---------------|------------------------|---------------------|
| `Table not found` | **A4** / **B1** | Metasrv is missing metadata information for a specific table |
| `Region not found` | **A5** / **B2** | Datanode is missing the Region for a specific table |
| `No field named` | **A1** | Metasrv contains definitions for deleted columns |
| `schema has a different type` | **A3** | Column type definitions are inconsistent |

## Reconcile Operations

We provide the following Admin functions to trigger table metadata reconciliation:

### Repair a Specific Table

Repair the metadata inconsistency of a single table:

```sql
ADMIN reconcile_table(table_name)
```

### Repair a Specific Database

Repair the metadata inconsistency of all tables in a specific database:

```sql
ADMIN reconcile_database(database_name)
```

### Repair All Tables

Repair the metadata inconsistency of all tables in the entire cluster:

```sql
ADMIN reconcile_catalog()
```

### View Repair Progress

After the Admin function is executed, it will return a `ProcedureID`, you can use the following command to view the progress of the repair task:

```sql
ADMIN procedure_state(procedure_id)
```
