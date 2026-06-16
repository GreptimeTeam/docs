---
keywords: [表分片, 分区规则, 分布式表, 插入数据, 分布式查询]
description: 介绍表分片技术及其在 GreptimeDB 中的应用，包括分片时机、分区规则、创建和调整分布式表、插入数据和分布式查询等内容。
---

# 表分片

表分片是一种将大表分成多个小表的技术。
这种做法通常用于提高数据库系统的性能。

在 GreptimeDB 中，数据从逻辑上被分片成多个分区。
由于 GreptimeDB 使用“表”来分组数据并使用 SQL 来查询数据，
因此采用了 OLTP 数据库中常用的术语“分区”。

## 表分片的时机

在 GreptimeDB 中，数据管理和调度都是基于 region 级别的，
每个 region 对应一个表分区。
因此，当你的表太大而无法放入单个节点，
或者表太热而无法由单个节点提供服务时，
应该考虑进行分片。

GreptimeDB 中的一个 region 具有相对固定的吞吐量，
表中的 region 数量决定了表的总吞吐量容量。
如果你想增加表的吞吐量容量，
可以增加表中的 region 数量。
理想情况下，表的整体吞吐量应与 region 的数量成正比。

至于使用哪个特定的分区列或创建多少个 region，
这取决于数据分布和查询模式。
一个常见的目标是使数据在 region 之间的分布尽可能均匀。
在设计分区规则集时应考虑查询模式，
因为一个查询可以在 region 之间并行处理。
换句话说，查询延迟取决于“最慢”的 region 延迟。

请注意，region 数量的增加会带来一些基本的消耗并增加系统的复杂性。
你需要考虑数据写入速率的要求、查询性能、存储系统上的数据分布。
只有在必要时才应进行表分片。

有关分区和 region 之间关系的更多信息，请参阅贡献者指南中的[表分片](/contributor-guide/frontend/table-sharding.md)部分。

## 分区

在 GreptimeDB 中，表可以按列值范围进行水平分区。
目前，GreptimeDB 支持使用 `PARTITION ON COLUMNS` 语法进行范围分区。

每个分区仅包含表中的一部分数据，
并按某些列的值范围进行分组。
例如，我们可以在 GreptimeDB 中这样分区一个表：

```sql
CREATE TABLE (...)
PARTITION ON COLUMNS (<COLUMN LIST>) (
  <RULE LIST>
);
```

该语法主要由两部分组成：

1. `PARTITION ON COLUMNS` 后跟一个用逗号分隔的列名列表，指定了将用于分区的列。目前，表中定义的任意列都可以作为分区列。请注意，所有分区的范围必须**不能**重叠。

2. `RULE LIST` 是多个分区规则的列表。每个规则是一个分区条件，GreptimeDB 会为这些规则生成 `p0`、`p1` 等分区名称。这里的表达式可以使用 `=`, `!=`, `>`, `>=`, `<`, `<=`, `AND`, `OR`, 列名和字面量。

:::tip 选择分区列
建议使用 Tag 列（主键列）进行分区。对于**不是** append-only 的表（启用了去重）尤其重要：分区列应该是主键列的子集。这样具有相同主键的行会始终进入同一个分区，从而保证去重和合并可以正确工作。
:::

:::tip 提示
`PARTITION ON COLUMNS` 括号里只能写列名（如 `device_id`、`area`），不支持表达式。GreptimeDB 不支持 MySQL 的 `PARTITION BY RANGE` 语法。
:::

## 创建分区表

你可以使用 MySQL CLI [连接到 GreptimeDB](/user-guide/protocols/mysql.md) 并创建一个分布式表。
下方的示例创建了一个表并基于 `device_id` 列进行分区。

```SQL
CREATE TABLE sensor_readings (
  device_id INT16,
  reading_value FLOAT64,
  ts TIMESTAMP DEFAULT current_timestamp(),
  PRIMARY KEY (device_id),
  TIME INDEX (ts)
)
PARTITION ON COLUMNS (device_id) (
  device_id < 100,
  device_id >= 100 AND device_id < 200,
  device_id >= 200
);
```

你可以使用更多的分区列来创建更复杂的分区规则：

```sql
CREATE TABLE sensor_readings (
  device_id INT,
  area STRING,
  reading_value FLOAT64,
  ts TIMESTAMP DEFAULT current_timestamp(),
  PRIMARY KEY (device_id, area),
  TIME INDEX (ts)
)
PARTITION ON COLUMNS (device_id, area) (
  device_id < 100 AND area < 'South',
  device_id < 100 AND area >= 'South',
  device_id >= 100 AND area <= 'East',
  device_id >= 100 AND area > 'East'
);
```

以下内容以具有两个分区列的 `sensor_readings` 表为例。

## 为已有表添加分区

你也可以使用 `ALTER TABLE ... PARTITION ON COLUMNS` 为已有的未分区表创建分区。
它的语法和创建分区表类似，只是把分区规则添加到已有表上：

```sql
ALTER TABLE sensor_readings PARTITION ON COLUMNS (device_id, area) (
  device_id < 100 AND area < 'South',
  device_id < 100 AND area >= 'South',
  device_id >= 100 AND area <= 'East',
  device_id >= 100 AND area > 'East'
);
```

当一张表最初是单分区表，后续需要分布到多个 region 上时，可以使用这种方式。

:::warning 警告
为已有表创建分区属于重分区操作，仅支持分布式集群，并且需要共享对象存储和 GC。完整前置条件请参考[重分区](/user-guide/deployments-administration/manage-data/repartition.md#前置条件)。
:::

## 调整分区规则

表分区后，你可以继续通过拆分热点分区或合并较小的冷分区来调整分区布局。

使用 `SPLIT PARTITION` 将已有分区拆分为多个分区：

```sql
ALTER TABLE sensor_readings SPLIT PARTITION (
  device_id < 100 AND area < 'South'
) INTO (
  device_id < 50 AND area < 'South',
  device_id >= 50 AND device_id < 100 AND area < 'South'
);
```

使用 `MERGE PARTITION` 将多个分区合并为一个分区：

```sql
ALTER TABLE sensor_readings MERGE PARTITION (
  device_id < 100 AND area < 'South',
  device_id < 100 AND area >= 'South'
);
```

如需了解前置条件、热点分区判断方法和更多分步示例，请参考[重分区](/user-guide/deployments-administration/manage-data/repartition.md)。

## 向表中插入数据

以下代码向 `sensor_readings` 表的每个分区插入 3 行数据。

```sql
INSERT INTO sensor_readings (device_id, area, reading_value, ts) 
VALUES (1, 'North', 22.5, '2023-09-19 08:30:00'),
     (10, 'North', 21.8, '2023-09-19 09:45:00'),
     (50, 'North', 23.4, '2023-09-19 10:00:00');

INSERT INTO sensor_readings (device_id, area, reading_value, ts) 
VALUES (20, 'South', 20.1, '2023-09-19 11:15:00'),
     (40, 'South', 19.7, '2023-09-19 12:30:00'),
     (90, 'South', 18.9, '2023-09-19 13:45:00');

INSERT INTO sensor_readings (device_id, area, reading_value, ts) 
VALUES (110, 'East', 25.3, '2023-09-19 14:00:00'),
     (120, 'East', 26.5, '2023-09-19 15:30:00'),
     (130, 'East', 27.8, '2023-09-19 16:45:00');

INSERT INTO sensor_readings (device_id, area, reading_value, ts) 
VALUES (150, 'West', 24.1, '2023-09-19 17:00:00'),
     (170, 'West', 22.9, '2023-09-19 18:15:00'),
     (180, 'West', 23.7, '2023-09-19 19:30:00');
```

:::tip NOTE
注意，当写入数据不满足分区规则中的任何规则时，数据将被分配到默认分区（即表的第一个分区 0）。
:::

## 分布式查询

只需使用 `SELECT` 语法查询数据：

```sql
SELECT * FROM sensor_readings order by reading_value desc LIMIT 5;
```

```sql
+-----------+------+---------------+---------------------+
| device_id | area | reading_value | ts                  |
+-----------+------+---------------+---------------------+
|       130 | East |          27.8 | 2023-09-19 16:45:00 |
|       120 | East |          26.5 | 2023-09-19 15:30:00 |
|       110 | East |          25.3 | 2023-09-19 14:00:00 |
|       150 | West |          24.1 | 2023-09-19 17:00:00 |
|       180 | West |          23.7 | 2023-09-19 19:30:00 |
+-----------+------+---------------+---------------------+
5 rows in set (0.02 sec)
```

```sql
SELECT MAX(reading_value) AS max_reading 
FROM sensor_readings;
```

```sql
+-------------+
| max_reading |
+-------------+
|        27.8 |
+-------------+
1 row in set (0.03 sec)
```

```sql
SELECT * FROM sensor_readings 
WHERE area = 'North' AND device_id < 50
ORDER BY device_id;
```

```sql
+-----------+-------+---------------+---------------------+
| device_id | area  | reading_value | ts                  |
+-----------+-------+---------------+---------------------+
|         1 | North |          22.5 | 2023-09-19 08:30:00 |
|        10 | North |          21.8 | 2023-09-19 09:45:00 |
+-----------+-------+---------------+---------------------+
2 rows in set (0.03 sec)
```

## 检查分片表

GreptimeDB 提供了几个系统表来检查数据库的状态。
对于表分片信息，你可以查询 [`information_schema.partitions`](/reference/sql/information-schema/partitions.md)，
它提供了一个表内分区的详细信息，
以及 [`information_schema.region_peers`](/reference/sql/information-schema/region-peers.md) 提供了 region 的运行时分布信息。
