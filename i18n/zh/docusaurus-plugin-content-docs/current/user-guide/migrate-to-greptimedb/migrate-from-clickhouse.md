---
keywords: [从 ClickHouse 迁移, ClickHouse, CSV, COPY FROM, 迁移校验]
description: 为 GreptimeDB 重新设计 ClickHouse 表，并通过 CSV 或对象存储迁移有明确边界的数据集。
---

# 从 ClickHouse 迁移

ClickHouse 和 GreptimeDB 使用不同的 SQL 方言、表模型、索引和存储引擎。迁移时应重新设计 Schema 并转换数据，不能直接恢复 ClickHouse DDL 或数据文件。

## 定义迁移边界

导出前选择一种方式：

- 最终导出和导入期间停止源端写入。
- 导出一个不可变的时间范围，并从该范围边界开始使用新的写入路径。
- 使用能够记录源端位置并对账失败记录的 CDC 或应用双写流程。

应用双写是两次独立写入，不是跨数据库事务。只有记录、重试并对账失败时，双写才能降低切换停机时间。不能假设配置两个 Sink 就不会产生缺口或重复数据。

## 重新设计表结构

先阅读 [SQL 兼容性](/reference/sql/compatibility.md)、[表结构设计](/user-guide/deployments-administration/performance-tuning/design-table.md)和[索引](/user-guide/manage-data/data-index.md)。重点处理以下差异：

- 选择一个事件时间列作为 GreptimeDB Time Index，并在导出过程中保留其时区和精度。
- 不要把 ClickHouse `ORDER BY` 机械复制为 GreptimeDB 主键。应根据目标端过滤、分组和行合并语义选择主键列。
- 只有查询 Operator 和列适用时才添加倒排、跳数或全文索引。不能只根据基数决定索引类型。
- 只有目标负载确实需要显式分片时，才把 ClickHouse `PARTITION BY` 转换为 GreptimeDB 表分区。
- 把 ClickHouse TTL 表达式转换为 GreptimeDB Database 或 Table 的 `ttl` 选项。
- 展开或转换 ClickHouse Array、Tuple、Map、Aggregate State 以及其他没有等价目标类型的数据。

迁移 OpenTelemetry 日志和 Trace 时，优先使用 GreptimeDB 内置的[日志](/user-guide/logs/overview.md)和 [Trace](/user-guide/traces/overview.md) 数据模型，不要另建一套不兼容的 Schema。

## 表结构映射示例

ClickHouse 源表：

```sql
CREATE TABLE example (
  timestamp DateTime,
  host String,
  app String,
  metric String,
  value Float64
)
ENGINE = MergeTree
TTL timestamp + INTERVAL 30 DAY
ORDER BY (timestamp, host, app, metric);
```

一种 GreptimeDB 目标表结构是：

```sql
CREATE TABLE example (
  ts TIMESTAMP(3) NOT NULL,
  host STRING,
  app STRING,
  metric STRING,
  value DOUBLE,
  PRIMARY KEY (host, app, metric),
  TIME INDEX (ts)
) WITH (ttl = '30d');
```

这只是映射示例，不是通用建议。导出时把 `timestamp` 重命名为 `ts`；只有检查实际查询和更新语义后，才能确定主键或添加索引。

## 导出有界数据

`CSVWithNames` 会写入 Header。显式选择并转换列，确保文件与目标 Schema 一致。下面的命令在 Client 所在机器写入 CSV，并排除切换边界及之后的数据：

```bash
clickhouse-client \
  --host <clickhouse-host> \
  --query "
    SELECT
      timestamp AS ts,
      host,
      app,
      metric,
      value
    FROM example
    WHERE timestamp < toDateTime('2026-08-01 00:00:00', 'UTC')
    ORDER BY timestamp
    FORMAT CSVWithNames
  " > example.csv
```

如果 ClickHouse `DateTime` 列使用其他时区，应使用源端时区而不是 `UTC`。大表应按互不重叠的时间范围导出，并记录每个文件的行数和边界。

## 导入 GreptimeDB

分布式 GreptimeDB 集群应先把文件上传到对象存储，再执行 `COPY FROM`。如果 CSV 列名与目标表不一致，`STRICT_HEADERS` 会在读取数据前失败：

```sql
COPY example
FROM 's3://migration-bucket/clickhouse/example.csv'
WITH (
  FORMAT = 'CSV',
  HEADERS = 'true',
  STRICT_HEADERS = 'true'
)
CONNECTION (REGION = 'us-west-2');
```

按需添加连接凭证，或者使用部署环境的 Credential Provider。Standalone 只能访问 `storage.copy_root` 内的本地路径；分布式部署禁用本地 SQL 文件访问。参见 [COPY FROM](/reference/sql/copy.md#copy-from)和[迁移本地 SQL 文件访问](/user-guide/deployments-administration/migrate-local-sql-file-access.md)。

迁移期间保持 `SKIP_BAD_RECORDS` 关闭。跳过转换失败的记录会让源端和目标端行数出现差异，而且无法确认丢失了哪些行。

## 校验并切换

对每个导出范围比较：

- 源端查询行数和已导入行数
- 最小和最大事件时间
- 重要维度的 NULL 数量和去重数量
- 按应用实际使用的维度和时间窗口计算的聚合结果
- 覆盖时区、Nullable 值、嵌套数据转换和数值边界的抽样数据
- 改写后的 Dashboard、Alert 和应用查询结果

所有范围和关键查询均通过校验后才能切换。回滚窗口结束前保持 ClickHouse 源端数据不变。
