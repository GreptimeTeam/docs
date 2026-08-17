---
keywords: [PostgreSQL 迁移, pg_dump, psql, PostgreSQL 协议, 数据校验]
description: 使用明确的一致性边界和遇错即停的导入流程，把兼容的 PostgreSQL 表数据迁移到 GreptimeDB。
---

# 从 PostgreSQL 迁移

GreptimeDB 实现了 PostgreSQL Wire Protocol，但不是 PostgreSQL 存储引擎，也不支持完整的 PostgreSQL SQL 方言。PostgreSQL Schema Dump 可能包含 GreptimeDB 不支持的 DDL、Session 设置、Extension、约束和数据类型。应先在 GreptimeDB 中创建表结构，只导出兼容的行数据。

## 规划迁移

导出数据前：

- 检查 [SQL 兼容性](/reference/sql/compatibility.md)，转换 PostgreSQL 特有的数据类型和表达式。
- 选择自然的事件时间作为 GreptimeDB Time Index，并在建表前确定时间精度。
- 根据目标查询负载设计 GreptimeDB 主键和索引。它们不会复现 PostgreSQL 的唯一性或 B-tree 语义。参见[表结构设计](/user-guide/deployments-administration/performance-tuning/design-table.md)和[索引](/user-guide/manage-data/data-index.md)。
- 明确源端一致性边界。对于这种 Dump 迁移，短暂停止源端写入是最简单且可靠的方式。

应用双写不具备原子性。如果不能停机，应使用能够记录 PostgreSQL 源端位置的 CDC 或双写流程，对两个目标进行重试，并在切换前完成差异对账。两个独立 JDBC 连接不能提供跨数据库事务。

## 创建目标表结构

导入行数据前，先在 GreptimeDB 中创建数据库和表。根据需要转换 PostgreSQL 默认值、生成列、Array、Range Type、JSON Operator、约束和索引。

使用有代表性的值测试映射，并检查最终表结构：

```sql
DESC TABLE db1.foo;
SHOW CREATE TABLE db1.foo;
```

## 导出行数据

`pg_dump --column-inserts` 适合向非 PostgreSQL 数据库迁移数据，但输出中仍包含 PostgreSQL 特有的初始化语句。下面的示例在停止源端写入后导出一张表，并且只保留带列名的 `INSERT`：

```bash
set -o pipefail

pg_dump \
  --host=127.0.0.1 \
  --port=5432 \
  --username=postgres \
  --data-only \
  --column-inserts \
  --no-owner \
  --no-privileges \
  --table='db1.foo' \
  postgres | awk '/^INSERT INTO /' > foo.sql
```

这里有意使用 Allowlist。旧示例删除所有以 `SE` 开头的行，前缀范围过大，可能丢弃有效内容。导入前检查 `foo.sql`，并转换 GreptimeDB 不支持的字面量或数据类型。

对于大表，应使用 ETL 查询或工具按有限范围导出，而不是生成一个没有边界的 SQL 文件。记录每个已完成范围，避免重试时静默重复或跳过数据。

## 导入 GreptimeDB

使用 `psql` 连接 GreptimeDB 的 PostgreSQL 端口，默认端口为 `4003`。`-X` 会忽略本地 `psqlrc` 设置，`ON_ERROR_STOP` 使命令遇到第一条 SQL 错误即失败：

```bash
psql \
  -X \
  --set ON_ERROR_STOP=1 \
  --host=127.0.0.1 \
  --port=4003 \
  --username=greptime_user \
  --dbname=public \
  --file=foo.sql
```

不要移除 `ON_ERROR_STOP`。发生错误后继续执行，会产生没有明确失败边界的部分导入。应保存命令退出状态和导入日志。

## 校验并切换

在同一个不可变源端范围内比较 PostgreSQL 和 GreptimeDB：

- 行数、最小和最大时间戳
- 重要维度的非空数量和去重数量
- 按业务 Key 或时间窗口统计的行数
- 覆盖 NULL、时区、数值边界、Unicode、JSON 和二进制值的抽样数据
- 完成 SQL 改写后的应用关键查询结果

只有导入没有报错且上述校验通过后，才能切换流量。回滚窗口结束前保持 PostgreSQL 源端数据不变。
