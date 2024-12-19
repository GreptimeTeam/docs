---
keywords: [数据模型, 表结构, 列类型, 设计考虑, 时序表, Tag 列, Timestamp 列, Field 列, Metric 表, Log 表]
description: 介绍 GreptimeDB 的数据模型，包括表的结构、列类型和设计考虑，适用于指标、日志和事件数据。
---

# 数据模型

## 模型

GreptimeDB 使用时序表来进行数据的组织、压缩和过期管理。数据模型主要基于关系型数据库中的表模型，同时考虑到了指标（metrics）、日志（logs）及事件（events）数据的特点。

GreptimeDB 中的所有数据都被组织成表，每个表中的数据项由三种类型的列组成：`Tag`、`Timestamp` 和 `Field`。

- 表名通常与指标、日志的名称相同。
- `Tag` 列中存储经常被查询的元数据，其中的值是数据源的标签，通常用于描述数据的特定特征。`Tag` 列具有索引，所以使用 `Tag` 列的查询具备良好的性能。
- `Timestamp` 是指标、日志及事件的时序数据库的基础，它表示数据生成的日期和时间。Timestamp 具有索引，所以使用 `Timestamp` 的查询具有良好的性能。一个表只能有一个 `Timestamp` 列，被称为时间索引列。
- 其他列是 `Field` 列，其中的值是被收集的数据指标或日志。这些指标通常是数值或字符串，但也可能是其他类型的数据，例如地理位置。`Field` 列默认情况下没有被索引，对该字段做过滤查询会全表扫描。这可能会消耗大量资源并且性能较差，但是字符串字段可以启用[全文索引](/user-guide/logs/query-logs.md#全文索引加速搜索)，以加快日志搜索等查询的速度。

### Metric 表

假设我们有一个名为 `system_metrics` 的时间序列表用于监控独立设备的资源使用情况。

```sql
CREATE TABLE IF NOT EXISTS system_metrics (
    host STRING,
    idc STRING,
    cpu_util DOUBLE,
    memory_util DOUBLE,
    disk_util DOUBLE,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(host, idc),
    TIME INDEX(ts)
);
```

该表的数据模型如下：

![time-series-table-model](/time-series-data-model.svg)

这与大家熟悉的表模型非常相似。不同之处在于 `Timestamp` 约束，它用于将 `ts` 列指定为此表的时间索引列。

- 表名为 `system_metrics`。
- 对于 `Tag` 列，`host` 列表示收集的独立机器的主机名，`idc` 列显示机器所在的数据中心。这些是查询元数据，可以在查询时有效地过滤数据。
- `Timestamp` 列 `ts` 表示收集数据的时间。使用该列查询具有时间范围的数据时具备较高的性能。
- `Field` 列中的 `cpu_util`、`memory_util`、`disk_util` 和 `load` 列分别表示机器的 CPU 利用率、内存利用率、磁盘利用率和负载。
  这些列包含实际的数据并且不被索引，但是可以被高效地计算，例如求最大最小值、均值和百分比分布等。
  请避免在查询条件中使用 `Field` 列，这会消耗大量资源并且性能较差。

### Log 表

你还可以创建一个日志表用于存储访问日志：

```sql
CREATE TABLE access_logs (
  access_time TIMESTAMP TIME INDEX,
  remote_addr STRING,
  http_status STRING,
  http_method STRING,
  http_refer STRING,
  user_agent STRING,
  request STRING FULLTEXT,
  PRIMARY KEY (remote_addr, http_status, http_method, http_refer, user_agent)
)
```
其中：

- 时间索引列为 `access_time`。
- `remote_addr`、`http_status`、`http_method`、`http_refer`、`user_agent` 为 Tag。
- `request` 是通过 [`FULLTEXT` 列选项](/reference/sql/create.md#fulltext-列选项)启用全文索引的字段。

要了解如何指定 `Tag`、`Timestamp` 和 `Field` 列，请参见[表管理](/user-guide/administration/manage-data/basic-table-operations.md#创建表)和 [CREATE 语句](/reference/sql/create.md)。

当然，无论何时，你都可以将指标和日志放在一张表里，这也是 GreptimeDB 提供的关键能力。

## 设计考虑

GreptimeDB 基于表进行设计，原因如下：

- 表格模型易于学习，具有广泛的用户群体，我们只需引入时间索引的概念即可实现对指标、日志和事件的统一。
- Schema 是描述数据特征的元数据，对于用户来说更方便管理和维护。通过引入 Schema 版本的概念，我们可以更好地管理数据兼容性。
- Schema 通过其类型、长度等信息带来了巨大的优化存储和计算的好处，我们可以进行有针对性的优化。
- 当我们有了表格 Schema 后，自然而然地引入了 SQL，并用它来处理各种表之间的关联分析和聚合查询，为用户抵消了学习和使用成本。
- 比起 OpenTSDB 和 Prometheus 采用的单值模型，GreptimeDB 使用多值模型使其中一行数据可以具有多列数据。多值模型面向数据源建模，一个 metric 可以有用 field 表示的值。多值模型的优势在于它可以一次性向数据库写入或读取多个值，从而减少传输流量并简化查询。相比之下，单值模型则需要将数据拆分成多个记录。阅读[博客](https://greptime.com/blogs/2024-05-09-prometheus)以获取更多详情。

GreptimeDB 使用 SQL 管理表 Schema。有关更多信息，请参见[表管理](/user-guide/administration/manage-data/basic-table-operations.md)。但是，我们对 Schema 的定义并不是强制性的，而是倾向于 **Schemaless** 的方式，类似于 MongoDB。有关更多详细信息，请参见[自动生成表结构](../ingest-data/overview.md#自动生成表结构)。
