---
keywords: [GreptimeDB, 表元数据协调, 元数据一致性, Metasrv, Datanode, 表元数据修复]
description: 了解 GreptimeDB 的表协调机制，该机制可检测并修复 Metasrv 和 Datanode 之间的元数据不一致问题。
---
# 表元数据修复

## 概述

在 GreptimeDB 分布式环境中，系统采用了分层的元数据管理架构：
- **Metasrv**：作为元数据管理层，负责维护集群中所有表的元信息
- **Datanode**：负责实际的数据存储和查询执行，同时会持久化部分表元信息

在理想情况下，Metasrv 和 Datanode 的表元信息应该保持完全一致。但在实际生产环境中，以下异常情况可能导致元信息不一致：
- 备份恢复操作
- 节点故障和重启
- 网络分区
- 系统异常关闭

**Table Reconciliation** 是 GreptimeDB 提供的表元数据修复机制，用于：
- 检测 Metasrv 与 Datanode 之间的元信息差异
- 根据预定义的策略修复不一致问题
- 确保系统能够从异常状态恢复到一致、可用的状态

## 修复场景详解

支持两种表引擎，在协调时的行为有所不同。以下详细介绍各种不一致场景及其修复策略。

### Mito Engine 修复场景

Mito Engine 是 GreptimeDB 的默认存储引擎，支持较为完整的表协调功能。
| 场景编号 | 不一致类型 | 典型场景 | 修复策略 | 用户操作建议 |
|---------|-----------|----------|-------------|-------------|
| **A1** | 列数量不匹配：Metasrv **多于** Datanode | 元数据备份后执行了 `DROP COLUMN` | ✅ 同步元数据，删除多余列定义 | 无需干预 |
| **A2** | 列数量不匹配：Metasrv **少于** Datanode | 元数据备份后执行了 `ADD COLUMN` | ✅ 同步元数据，补充缺失列定义 | 无需干预 |
| **A3** | 列类型不匹配 | 元数据备份后执行了 `ALTER COLUMN` | ✅ 同步元数据，统一列类型定义 | 无需干预 |
| **A4** | 表数量不匹配：Metasrv **多于** Datanode | 元数据备份后创建了新表 | ❌ 新表无法恢复 | 需手动设置 [待分配表 ID](/user-guide/deployments-administration/maintenance/sequence-management.md) |
| **A5** | 表数量不匹配：Metasrv **少于** Datanode | 元数据备份后删除了表 | ❌ 系统启动时忽略存储中不存在的表 |启动时开启 [Recovery Mode](/user-guide/deployments-administration/manage-metadata/recover-metadata.md)；删除不存在的表。 |
| **A6** | 表名不匹配 | 元数据备份后执行了 `RENAME TABLE` | ❌ 表名变更无法恢复 | 新表名将丢失 |


### Metric Engine 修复场景

Metric Engine 专为时序数据优化，其表协调机制相对简化。

| 场景编号 | 不一致类型 | 典型场景 | 修复策略 | 用户操作建议 |
|---------|-----------|----------|-------------|-------------|
| **B1** | 逻辑表缺失：Metasrv **少于** metadata region | 元数据备份后创建了新的 metric 表 | ❌ 新表无法恢复 | 需手动设置 [待分配表 ID](/user-guide/deployments-administration/maintenance/sequence-management.md) |
| **B2** | 逻辑表多余：Metasrv **多于** metadata region | 元数据备份后删除了 metric 表 | ✅ 重新创建表，恢复被删除的表 | 无需干预 |
| **B3** | 列定义缺失：Metasrv **少于** metadata region | 元数据备份后添加了新的 metric 列 | ✅ 补齐缺失的列定义 | 无需干预 |


## 故障排查指南

当遇到表元信息相关问题时，你可以根据错误信息快速定位问题场景：

| 错误信息 | 对应场景 | 问题描述 | 
|---------|---------|----------|
| `Table not found` | **A4** / **B1** | Metasrv 中缺少特定表的元信息 |
| `Region not found` | **A5** / **B2** | Datanode 中缺少特定表的 Region |
| `No field named` | **A1** | Metasrv 中存在已删除的列定义 |
| `schema has a different type` | **A3** | 列类型定义不一致 |

## 修复操作

我们提供了以下 Admin 函数用于触发表元数据修复：

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

