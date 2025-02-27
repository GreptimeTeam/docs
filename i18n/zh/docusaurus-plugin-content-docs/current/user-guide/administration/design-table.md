---
keywords: [数据模型, 表结构, 标签, tag 列, 时间线, 高基数, 倒排索引, 全文索引, 跳数索引, 宽表, 分布式表]
description: 详细介绍了 GreptimeDB 的数据模型使用指南，以及常见场景的表结构设计方式。
---

# 数据建模指南

表结构设计将极大影响写入和查询性能。
在写入数据之前，你需要了解业务中涉及到的数据类型、数量规模以及常用查询，
并根据这些数据特征进行数据建模。
本文档将详细介绍 GreptimeDB 的数据模型使用指南，以及常见场景的表结构设计方式。

## 了解 GreptimeDB 的数据模型

在阅读本文档之前，请先阅读 GreptimeDB [数据模型文档](/user-guide/concepts/data-model.md)。

## 基本概念

基数（Cardinality）：是指数据集中唯一值的数量。我们可以通过"高基数"和"低基数"来分类：

- 低基数（Low Cardinality）示例：订单状态包括 "待付款/已付款/已发货/已完成"等，约 4~5 个唯一的值，星期几固定是 7 个，城市和省份的数量也是有限。
- 高基数（High Cardinality）示例：用户 ID 是典型的，比如可能是百万到千万的用户数量；设备 IP 地址，也可能是数百万个；商品 SKU 也是一个典型的高基数数据。

## 列的类型及选择

GreptimeDB 中列区分为三种类型： Tag、Field 和 Time Index。
时间戳不用做过多讨论，一般是数据采样的时间或者日志、事件发生的时间作为 Time Index 列。
GreptimeDB 也会按照 Time Index 来优化数据组织，提升查询性能。

我们重点讨论 Tag 和 Field ，以及如何为列选择正确的类型。

### Tag 列

Tag 列，也称为标签列（Label），一般来说是携带了度量数据或者日志、事件的元信息。
举例来说，采集全国的气象温度数据，那么城市（city）就是一个典型的标签列，
比如 `city="New York"`；监控中，采集系统的 CPU 、内存等指标，
通常会有 `host` 标签来表示主机名。
Kubernetes 的 `pod` 容器就带有大量的 label。

Tag 列在 GreptimeDB 中的主要用途包括：

1. 存储低基数（low-cardinality）的元信息
2. 用于数据的过滤，例如去查看纽约市过去一周的平均气温，城市 `city` 就作为一个过滤条件来使用，相当于 SQL 中出现在 `WHERE` 中的条件
3. 用于数据的分组和聚合，例如，假设气温的数据，除了 `city` 之外我们还有个省份标签 `state`，那我们可以按照省份来分组数据，并聚合计算一个省份过去一周的平均气温，相当于 SQL 中的 `GROUP BY` 字段

GreptimeDB 中将加入 `PRIMARY KEY` 的列都认为是 Tag 列，并默认将为这些列建立倒排索引（指定 `INVERTED INDEX` 约束会带来一些变化，我们将在索引一节展开）。
我们建议：

- Tag 列的值类型通常使用字符串，避免使用 `FLOAT` 或 `DOUBLE`
- 一张表中 Tag 列的数量控制在一个适中的范围内，通常不超过 20 个
- Tag 列中的唯一值数量控制在一个适中的范围内，避免高基数问题，高基数会影响写入性能并导致索引膨胀
- Tag 列的值不会频繁变化，一个错误范例就是将 serverless 容器的主机名作为 tag 列

### Field 列

Field 列，一般来说就是携带了度量的实际值，仍然以气温数据为例，温度这个度量的值通常都应该设置为 Field 列。监控系统中的 CPU 利用率、内存利用率、磁盘利用率等，也是典型的  Field 列。

它的数据特点：
1. 通常是数值类型（整数、浮点数），日志和事件消息一般是字符串
2. 用于计算和聚合，比如求平均值，最大值，P99 等
3. 可以高频率变化，也就是可以是任意基数（cardinality）的

GreptimeDB 中不在 `PRIMARY KEY` 的非 `TIME INDEX` 列就是 Field 列， GreptimeDB 不会为这些列建索引。
使用上我们建议：

1. 避免将过滤条件作用在 Field 中
2. 适合需要做计算和聚合的数据
3. 适合存储高频变化也就是高基数的数据

### Tag 列 vs. Field 列

|       | Tag 列 | Field 列 |
| ----- | ----------- | ------------- |
| 主要用途 | - 用于数据分类和筛选 <br/> - 建立索引加速查询 <br/>- 数据分组和上下文元信息记录 | - 存储实际的测量值和指标 <br/>- 用于计算和聚合<br/>- 作为分析的目标数据|
| 数据特点 | - 通常为字符串类型 <br/> - 相对稳定，变化频率低 <br/>- 自动建索引 <br/>- 通常是低基数 <br/> - 索引会占用额外存储空间 |- 通常为数值类型（整数、浮点数），日志事件可能是字符串 <br/>- 高频变化 <br/>- 不建索引<br/>- 可以是高基数<br/>- 存储开销相对较小 |
| 使用建议 | - 用于频繁的查询过滤条件 <br/> - 控制基数以避免索引膨胀 <br/>- 选择有意义的分类标签，避免存储度量值导致高基数 | - 存储需要计算和聚合的指标 <br/>- 避免用作查询过滤条件 <br/>- 适合存储高频变化的数据<br/>- 配合时间戳使用做时序分析 | 
| 实际例子 | - 机房：`dc-01` <br/> - 环境：`prod/dev` <br/> - 服务名：`api-server`<br/>- 主机名：`host-01`<br/>- 城市，例如 `"New York"` | - CPU 使用率：`75.5` <br/>- 内存使用量：`4096MB`<br/>- 请求响应时间：`156ms`<br/>- 温度：`25.6°C`<br/>- 队列长度：`1000`| 

## 时间线

介绍完 Tag 和 Field 列后，我们将引入时间线概念。

时间线在 GreptimeDB 数据模型中至关重要，与 Tag 列和 Field 列紧密相关，是高效存储和查询数据的基础。
时间线是按时间顺序排列的数据点集合，
由唯一的 Tag 集合和 Time Index 标识。
如采集全国气象温度数据，`city = New York` 且 `state = New York State` 的每天温度数据构成一条时间线，每个数据点对应时间戳和温度值。

时间线使 GreptimeDB 能高效处理和存储时间序列数据，通过唯一 Tag 集合可快速定位检索特定时间范围数据，还能优化存储减少冗余。
在实际应用中，理解时间线概念对设计表结构和优化查询性能关键，
不同时间线特性不同，可据此优化表结构和查询策略，
合理组织 Tag 列、Field 列和 Time Index 能构建高效数据模型满足业务需求。
总之，时间线是 GreptimeDB 数据模型的桥梁，理解运用其概念有助于数据建模和处理。 

## 主键和索引

在 GreptimeDB 中，数据依照主键列 `PRIMARY KEY` 进行顺序组织，
并基于 `PRIMARY KEY` 和 `TIME INDEX` 的值的组合（也就是时间线）来执行去重操作。
GreptimeDB 中对数据更新的支持是通过插入覆盖具有相同 `PRIMARY KEY` 和 `TIME INDEX` 值的行来达成的。
你能够更新 Field 列的值，但无法更改主键列和 `TIME INDEX` 的值，不过可以将其删除。

默认情况下，在建表时候加入 `PRIMARY KEY` 约束的列将被视为 Tag 列，
没有加入的非 `TIME INDEX` 列即为 Field 列。
并且默认情况下， GreptimeDB 会为所有 Tag 列建立倒排索引，用于精确和快速的查询和过滤。
例如：

```sql
CREATE TABLE IF NOT EXISTS system_metrics (
    host STRING,
    idc STRING,
    cpu_util DOUBLE,
    memory_util DOUBLE,
    disk_util DOUBLE,
    `load` DOUBLE,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(host, idc),
    TIME INDEX(ts)
);
```


这里 `host` 和 `idc` 同时是主键列和 Tag 列，ts 为 `TIME INDEX`，其他字段如 `cpu_util` 等都是 Field 列。

![time-series-table-model](/time-series-data-model.svg)

但是这样的设计下，无法实现以下效果：我想对某些列的数据做去重和排序优化，但是不想为这些列建立额外索引导致数据膨胀和性能下降。

举例来说，监控场景里的 Serverless 容器都是短生命周期的，如果将这些容器的主机名加入主键，
很可能导致高基数问题，但是因为采集链路或者网络等问题，
可能数据延迟，我们还是想基于主机名来做数据的去重，
这就无法兼得。
在 IoT 场景也有类似的问题，
IoT 设备可能成千上万，如果将他们的 ip 地址加入主键，
也会导致高基数问题，但是我们又希望按照 ip 来做数据的去重。

## 主键和倒排索引分离

因此，从 `v0.10` 开始， GreptimeDB 支持将主键和索引分离，创建表的时候可以通过 `INVERTED INDEX` 指定表的[倒排索引](/contributor-guide/datanode/data-persistence-indexing.md#倒排索引)列。对于每一个指定的列，GreptimeDB 会创建倒排索引以加速查询，这种情况下 `PRIMARY KEY` 将不会自动创建索引，而仅是用于去重和排序：

我们改进前面的例子：

```sql
CREATE TABLE IF NOT EXISTS system_metrics (
    host STRING,
    idc STRING INVERTED INDEX,
    cpu_util DOUBLE,
    memory_util DOUBLE,
    disk_util DOUBLE,
    `load` DOUBLE,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(host, idc),
    TIME INDEX(ts)
);
```

`host` 和 `idc` 列仍然是主键列，结合 `ts` 一起做数据去重和排序优化，但是将默认不再自动为它们建立索引。我们通过 `INVERTED INDEX` 列约束为 `idc` 列建立倒排索引。这样就避免了 `host` 列的高基数可能导致的性能和存储瓶颈。

## 全文索引

对于日志文本类的 Field 字段，如果需要分词结合倒排索引来查询，GreptimeDB 也提供了全文索引功能，例如：

```sql
Create Table: CREATE TABLE IF NOT EXISTS `logs` (
  message STRING NULL FULLTEXT INDEX WITH(analyzer = 'English', case_sensitive = 'false'),
  ts TIMESTAMP(9) NOT NULL,
  TIME INDEX (ts),
)
```

这里的 `message` 字段就通过 `FULLTEXT INDEX` 选项设置了全文索引。详见 [fulltext 列选项](/reference/sql/create.md#fulltext-列选项)。

## 跳数索引

对于类似链路追踪里的 `trace_id` 或者服务器访问日志中的 IP 地址、Mac 地址等，[跳数索引](/user-guide/manage-data/data-index.md#跳数索引)是更加合适的索引方式，它的存储开销更小，资源占用尤其是内存消耗更低：

```sql
CREATE TABLE sensor_data (
    domain STRING PRIMARY KEY,
    device_id STRING SKIPPING INDEX,
    temperature DOUBLE,
    timestamp TIMESTAMP TIME INDEX,
);
```

我们这里将 `device_id` 设置为了跳数索引。不过，跳数索引的查询效率和能力，都会逊色于全文索引和倒排索引。

## 索引类型对比和选择

|       | 倒排索引     |    全文索引     |       跳数索引|
| ----- | ----------- | ------------- |------------- |
| 适用场景 | - 基于标签值的数据查询 <br/> - 字符串列的过滤操作 <br/>- 标签列的精确查询 | - 文本内容搜索 <br/>- 模式匹配查询<br/>- 大规模文本过滤|- 数据分布稀疏的场景，例如日志中的 MAC 地址 <br/> - 在大规模数据集中查询出现频率较低的值|
| 创建方式 | - 通过 `INVERTED INDEX` 指定 |- 在列选项中指定 `FULLTEXT` | - 在列选项中指定 `SKIPPING INDEX` |


## 高基数问题

因为 GreptimeDB 内部大多数操作都是围绕“时间线”这一概念来组织的，因此需要避免时间线过度地膨胀。高基数数据对 GreptimeDB 的主要影响有两个方面：

- 维护大量时间线导致内存用量增加，同时压缩效率降低。
- 倒排索引的体积会随着基数增大而剧烈膨胀。

在基数数量过高时，应首先逐一检查作为 Tag 的每一个列是否需要表达“实体”或“去重”的概念，
即该列是否有必要作为时间线标识的一部分，尝试从建模层面降低基数。
此外，还应根据查询方式来判断某一列是否应该作为倒排索引的一部分，
如果该列不经常作为过滤条件、不需要精确匹配或是选择度过高或过低，都应该从倒排索引中去除。
对于某些选择度过高的列，可以考虑使用跳数索引 SKIPPING INDEX 来加速过滤查询。

## Append-Only 表

如果业务数据容许重复，几乎没有更新的情况，
或者可以通过上层应用来去重，
我们会推荐使用 append-only 表。
一般来说，append-only 表具有更高的扫描性能，
因为存储引擎可以跳过合并和去重操作。
此外，如果表是 append-only 表，查询引擎可以使用统计信息来加速某些查询。
典型的，比如日志的表，通过 pipeline 写入的自动创建的表，默认都会设置为 append-only 表。

例如我们创建如下日志表：

```sql
CREATE TABLE `origin_logs` (
  `message` STRING FULLTEXT INDEX,
  `time` TIMESTAMP TIME INDEX
) WITH (
  append_mode = 'true'
);
```

设置了 `append_mode = 'true'` 表选项。更多信息请参考 [CREATE 语句建表选项](/reference/sql/create.md#表选项)。

## 更新和数据合并

前文指出，在 `PRIMARY KEY` 主键列和时间戳 `TIME INDEX` 列的值相同的情形下，
可通过插入一条新的数据以覆盖已存在的数据。
倘若存在多个 Field 列，
默认状况下，对于每个 Field 列均需提供新值（或原有值），
不可缺失，否则该行数据在更新后，
未提供值的 Field 列将会丢失。 

这实际上涉及到 GreptimeDB 在进行查询时，
当遇到多条具有相同主键列和时间索引列的情况所采用的合并策略。
鉴于 GreptimeDB 采用的是基于 LSM Tree 的存储引擎，
插入新行时，并不会在原位置覆盖旧数据，而是允许多条数据同时存在，随
后在查询过程中进行合并。默认的合并行为是 last_row，即以后插入的（row）为准。 

![merge-mode-last-row](/merge-mode-last-row.png)

`last_row` 合并模式：相同主键和时间值的情况下，查询的时候返回最后一次更新的数据，更新需要提供每个 Field 值。

但是很多情况下，你可能只是想更新其中一个或者数个 Field 值，其他 Field 值保持不变，
这种情况下，你可以将表的 `merge_mode` 选项设置为 `last_non_null`，该模式下，查询的时候合并策略将是保留每个字段的最新值：

![merge-mode-last-non-null](/merge-mode-last-non-null.png)

`last_non_null` 合并模式：相同主键和时间值的情况下，查询的时候合并每个字段的最新值，更新的时候仅提供要更新的值。

`'merge_mode'='last_non_null'` 默认也是通过 InfluxDB 行协议写入的自动创建表的默认模式，跟 InfluxDB 的更新行为保持一致。

请注意， Append-Only 的表是无法设置 `merge_mode` 的，因为它不会进行合并行为。

## 宽表 vs.多表

表的模型这块，还涉及宽表或者多表模式，通常来说，在监控或者 IoT 场景，一次采样都会同步采集多个指标，典型比如 Prometheus 数据的抓取。
我们会强烈推荐将同时采样的指标数据放在一张表里，这样能显著地提升读写吞吐以及数据的压缩效率。

![wide_table](/wide_table.png)

比较遗憾， Prometheus 的存储还是多表单值的方式，不过 GreptimeDB 的 Prometheus Remote Storage 协议支持，通过 [Metric 引擎](/contributor-guide/datanode/metric-engine.md)在底层实现了宽表的数据共享。

## 分布式表

GreptimeDB 支持对数据表进行分区操作以分散读写热点，来达到水平扩容的目的。   

### 分布式表的两个常见误区

首先作为时序数据库，GreptimeDB 在存储层已经自动基于 TIME INDEX 列组织数据，保证数据在物理上的连续性和有序性。因此无需也不推荐你再按时间进行分区（如一天一个分区或每周一张新表）。

此外，GreptimeDB 是列式存储的数据库，所以对表进行分区的时候是指水平按行来分区，每一个分区都包含所有的列。

### 何时需要分区，以及需要分多少

在每个主要版本更新时，GreptimeDB 都会随源码发布最新的[基准测试报告](https://github.com/GreptimeTeam/greptimedb/tree/main/docs/benchmarks/tsbs) ，这份报告便代表着单个分区的写入效率。
你可以根据这份报告以及目标场景来估算写入量是否到达了单分区的瓶颈。
假设分区效果理想，通常可直接按照写入量来估算总分区数量，并在估计时按情况预留 30%～50% 的冗余资源来保证查询性能和稳定性。
该比例可按情况自由调整，
例如，某场景估算单表平均写入量 300 万行每秒，经过测试发现单分区写入上限为 50 万行每秒。考虑峰值写入量可能达到 500 万行每秒，以及查询负载稳定且较低。因此该场景下可预留 10～12 个分区。

### 分区方式

GreptimeDB 采用表达式来表示分区规则。具体可参见[用户手册](/user-guide/administration/manage-data/table-sharding.md#partition)。

通常来说，为了达到最好的效果，我们推荐分区键尽量均匀分散且稳定，这通常需要一些关于数据分布方式的先验知识。如：

- 通过 MAC 地址的前/后缀来分区
- 通过机房编号来分区
- 通过业务名称

同时，分区键也应该尽量贴合查询条件。例如大部分查询只关注某一个机房或业务内的数据，此时机房和业务名称可以作为合适的分区键。如果不清楚具体的数据分布情况，可以通过在已有的数据上进行聚合查询来获取相关的信息。


