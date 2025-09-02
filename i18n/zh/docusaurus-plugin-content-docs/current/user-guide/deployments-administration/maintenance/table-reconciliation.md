---
keywords: [GreptimeDB, 表元数据协调, 元数据一致性, Metasrv, Datanode, 表元数据修复]
description: 了解 GreptimeDB 的表协调机制，该机制可检测并修复 Metasrv 和 Datanode 之间的元数据不一致问题。
---
# 表元数据修复

## 概述

在 GreptimeDB 分布式环境中，系统采用了分层的元数据管理架构：
- **Metasrv**：作为元数据管理层，负责维护集群中所有表的元信息
- **Datanode**：负责实际的数据存储和查询执行，同时会持久化部分表元信息

在理想情况下，Metasrv 和 Datanode 的表元信息应该保持完全一致。但在实际生产环境中，从元数据备份恢复集群的操作可能会导致元数据不一致。

**Table Reconciliation** 是 GreptimeDB 提供的表元数据修复机制，用于：
- 检测 Metasrv 与 Datanode 之间的元信息差异
- 根据预定义的策略修复不一致问题
- 确保系统能够从异常状态恢复到一致、可用的状态

## 修复场景

### `Table not found` 错误

当集群从特定元数据恢复后，写入和查询可能出现 `Table not found` 错误。

- **场景一**：原集群在备份元数据后新增了表，导致新增表的元数据没有包含在备份中，从而查询这些新增表时出现 `Table not found` 错误。针对这种情况，你需要手动设置 [待分配表 ID](/user-guide/deployments-administration/maintenance/sequence-management.md)，确保恢复后的集群在新创建表时不会因为表 ID 冲突导致创建失败。

- **场景二**：原集群在备份元数据后将原有表重命名，这种情况下新表名将丢失。

### `Empty region directory` 错误

当集群从特定元数据恢复后，启动 Datanode 时出现 `Empty region directory` 错误。这通常是因为原集群在备份元数据后删除了表（即执行 `DROP TABLE`），导致删除表的元数据没有包含在备份中，从而启动 Datanode 时出现该错误。针对这种情况，你需要在启动集群时，在 Metasrv 启动后开启 [Recovery Mode](/user-guide/deployments-administration/maintenance/recovery-mode.md)，确保 Datanode 可以正常启动。

- **Mito Engine 表**：表元信息不可修复，需要手动执行 `DROP TABLE` 命令删除不存在的表。
- **Metric Engine 表**：表元信息可以修复，需要手动执行 `ADMIN reconcile_table(table_name)` 命令修复表元信息。

### `No field named` 错误

当集群从特定元数据恢复后，写入和查询可能出现 `No field named` 错误。这通常是因为原集群在备份元数据后删除了列（即执行 `DROP COLUMN`），导致删除列的元数据没有包含在备份中，从而查询这些已删除列时出现该错误。针对这种情况，你需要手动执行 `ADMIN reconcile_table(table_name)` 命令修复表元信息。

### `schema has a different type` 错误

当集群从特定元数据恢复后，写入和查询可能出现 `schema has a different type` 错误。这通常是因为原集群在备份元数据后修改了列类型（即执行 `MODIFY COLUMN [column_name] [type]`），导致修改列类型的元数据没有包含在备份中，从而查询这些修改后的列时出现该错误。针对这种情况，你需要手动执行 `ADMIN reconcile_table(table_name)` 命令修复表元信息。

### 缺少特定列

当集群从特定元数据恢复后，写入和查询可能正常运行，但是未包含一些列。这是因为原集群在备份元数据后新增了列（即执行 `ADD COLUMN`），导致新增列的元数据未包含在备份中，从而查询时无法列出这些列。针对这种情况，你需要手动执行 `ADMIN reconcile_table(table_name)` 命令修复表元信息。

### 列缺少索引

当集群从特定元数据恢复后，写入和查询可能正常运行，但是 `SHOW CREATE TABLE`/`SHOW INDEX FROM [table_name]` 显示某些列未包含预期索引。这是因为原集群在备份元数据后修改了索引（即执行 `MODIFY INDEX [column_name] SET [index_type] INDEX`），导致索引变更后的元数据未包含在备份中。针对这种情况，你需要手动执行 `ADMIN reconcile_table(table_name)` 命令修复表元信息。

## 修复操作

GreptimeDB 提供了以下 Admin 函数用于触发表元数据修复：

### 修复指定表

修复单个表的元数据不一致问题：

```sql
ADMIN reconcile_table(table_name)
```

### 修复指定数据库

修复指定数据库中所有表的元数据不一致问题：

```sql
ADMIN reconcile_database(database_name)
```

### 修复所有表

修复整个集群中所有表的元数据不一致问题：

```sql
ADMIN reconcile_catalog()
```

### 查看修复进度

上述 Admin 函数执行后会返回一个 `ProcedureID`，你可以通过以下命令查看修复任务的执行进度：

```sql
ADMIN procedure_state(procedure_id)
```

## 注意事项

在执行表元数据修复操作时，请注意以下几点：

- 修复操作是异步执行的，可以通过 `procedure_id` 查看执行进度
- 建议在业务低峰期执行修复操作，以减少对系统性能的影响
- 对于大规模的修复操作（如 `reconcile_catalog()`），建议先在测试环境验证
