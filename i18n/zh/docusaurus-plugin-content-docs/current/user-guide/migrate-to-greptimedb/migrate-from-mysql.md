---
keywords: [MySQL 迁移, mysqldump, MySQL 协议, 数据校验]
description: 使用明确的一致性边界和校验流程，把兼容的 MySQL 表数据迁移到 GreptimeDB。
---

# 从 MySQL 迁移

GreptimeDB 实现了 MySQL Wire Protocol，但不是 MySQL 存储引擎，也不支持完整的 MySQL SQL 方言。因此不能直接恢复 MySQL Schema Dump；应先在 GreptimeDB 中创建表结构，再迁移兼容的行数据。

## 规划迁移

导出数据前：

- 检查 [SQL 兼容性](/reference/sql/compatibility.md)，转换 GreptimeDB 不支持的 MySQL 类型和表达式。
- 选择自然的事件时间作为 GreptimeDB Time Index。只有业务语义确实是写入时间时，才应另建写入时间列。
- 根据 GreptimeDB 的查询负载设计主键和索引。GreptimeDB 主键不是 MySQL 唯一性约束。参见[表结构设计](/user-guide/deployments-administration/performance-tuning/design-table.md)和[索引](/user-guide/manage-data/data-index.md)。
- 明确迁移的一致性边界。对于 SQL Dump 迁移，短暂停止源端写入是最简单且可靠的方式。

应用双写不具备原子性：一个目标写入成功时，另一个目标可能失败。如果不能停机，应使用能够记录源端位置的 CDC 或双写流程，对每个目标独立重试，并在切换前对账缺失或冲突的数据。仅创建两个客户端连接不能防止数据丢失。

## 创建目标表结构

在 GreptimeDB 中创建目标数据库和表。列名应与数据 Dump 一致，但数据类型、默认值、生成列、索引和约束必须转换为 GreptimeDB 语法。

Time Index 的类型和精度不能原地修改。完整导入前先用有代表性的行验证表结构：

```sql
DESC TABLE db1.foo;
SHOW CREATE TABLE db1.foo;
```

## 导出行数据

下面的示例在停止源端写入后导出一张 InnoDB 表。`--single-transaction` 可以为事务表提供一致性快照，但不能保证非事务表的一致性。`--skip-extended-insert` 让每一行使用一条 `INSERT`，`awk` 只保留计划导入 GreptimeDB 的语句。

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

如果不同表需要不同的截止条件或数据转换，应分别导出。导入前检查 `foo.sql`：其中应只包含带列名的 `INSERT`，并确认字面量和列名适用于目标表。

## 导入 GreptimeDB

使用 MySQL Client 连接 GreptimeDB 的 MySQL 端口，默认端口为 `4002`：

```bash
mysql \
  --host=127.0.0.1 \
  --port=4002 \
  --user=greptime_user \
  --password \
  --database=db1 \
  < foo.sql
```

不要使用 MySQL Client 的 `--force` 参数；该参数会在 SQL 出错后继续执行，可能让部分导入看起来像成功完成。应保存命令退出状态和导入日志。大表应按照稳定的时间或 Key 边界拆分，并记录每个已完成范围。

## 校验并切换

在同一个不可变数据范围内比较源端和目标端：

- 行数、最小和最大时间戳
- 重要字段的非空数量
- 按业务 Key 或时间窗口统计的行数
- 抽样数据，包括 NULL、Unicode、二进制值和边界时间戳
- 应用关键查询的结果

只有导入没有报错且上述校验通过后，才能切换读写流量。回滚窗口结束前保持源端数据不变。
