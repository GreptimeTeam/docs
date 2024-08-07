# 表分片

对于任何分布式数据库来说，数据的分片都是必不可少的。本文将描述 GreptimeDB 中的表数据如何进行分片。

## 分区

从逻辑上说，在 GreptimeDB 中数据是使用分区进行分片的。我们借用了在 OLTP 数据库中常用的概念“分区”，因为 GreptimeDB 使用“表”来组织数据并使用 SQL 来查询它。

在 GreptimeDB 中，一张表可以通过多种方式横向分区，并且它使用与 MySQL 相同的分区类型（以及相应的语法）。目前，GreptimeDB 支持 “RANGE COLUMNS 分区”。

在 “RANGE COLUMNS 分区”中，每个分区仅包含表中的一部分数据，并按某些列值范围进行分组。例如，我们可以像这样在 GreptimeDB 中对表进行分区：

```sql
CREATE TABLE my_table (
  a INT PRIMARY KEY,
  b STRING,
  ts TIMESTAMP TIME INDEX,
)
PARTITION BY RANGE COLUMNS (a) (
  PARTITION p0 VALUES LESS THAN (10),
  PARTITION p1 VALUES LESS THAN (20),
  PARTITION p2 VALUES LESS THAN (MAXVALUE),
);
```

我们在上面创建的 `my_table` 有 3 个分区。分区 "p0" 包含了 "a < 10" 的行；分区 "p1" 包含了 "10 \<= a < 20" 的行；分区 "p2" 包含了剩下的 "a >= 20" 的所有行。

::: warning 重要

1. 所有分区的范围必须严格递增，并最终以 "`MAXVALUE`" 结尾。
2. 用于分区的列必须是主键。

:::

::: tip 注意
目前 "PARTITION BY RANGE" 语法中不支持表达式，只能使用列名。
:::

## Region

在创建分区后，表中的数据被逻辑上分割。你可能会问："在 GreptimeDB 中，被逻辑上分区的数据是如何存储的？" 答案是保存在 `Region` 当中。

每个 `Region` 对应一个分区，并保存分区的数据。所有的 `Region` 分布在各个 `Datanode` 之中。我们的 `Metasrv` 会根据 `Datanode`
的状态在它们之间自动移动 `Region`。此外，`Metasrv` 还可以根据数据量或访问模式拆分或合并 `Region`。

分区和Region的关系参见下图：

```text
                       ┌───────┐
                       │       │
                       │ Table │
                       │       │
                       └───┬───┘
                           │
        Range [Start, end) │ Horizontally Split Data
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        │                  │                  │
  ┌─────▼─────┐      ┌─────▼─────┐      ┌─────▼─────┐
  │           │      │           │      │           │
  │ Partition │      │ Partition │      │ Partition │
  │           │      │           │      │           │
  │    P0     │      │    P1     │      │    Px     │
  └─────┬─────┘      └─────┬─────┘      └─────┬─────┘
        │                  │                  │
        │                  │                  │  
┌───────┼──────────────────┼───────┐          │  Partition 和 Region 是一一对应的
│       │                  │       │          │
│ ┌─────▼─────┐      ┌─────▼─────┐ │    ┌─────▼─────┐
│ │           │      │           │ │    │           │
│ │   Region  │      │   Region  │ │    │   Region  │
│ │           │      │           │ │    │           │
│ │     R0    │      │     R1    │ │    │     Ry    │
│ └───────────┘      └───────────┘ │    └───────────┘
│                                  │
└──────────────────────────────────┘
     可以放在同一个 Datanode 之中
```
