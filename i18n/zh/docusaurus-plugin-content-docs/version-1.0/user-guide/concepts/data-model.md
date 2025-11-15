---
keywords: [数据模型, 表结构, 列类型, 设计考虑, 时序表, Tag 列, Timestamp 列, Field 列, Metric 表, Log 表,链路追踪,GreptimeDB 数据模型]
description: 介绍 GreptimeDB 的数据模型，包括表的结构、列类型和设计考虑，适用于指标、日志和链路追踪数据。
---

# 数据模型

## 模型

GreptimeDB 使用时序表来进行数据的组织、压缩和过期管理。数据模型主要基于关系型数据库中的表模型，同时考虑到了指标（metrics）、日志（logs）及链路追踪（traces）数据的特点。

GreptimeDB 中的所有数据都被组织成具有名称的表，每个表中的数据项由三种语义类型的列组成：`Tag`、`Timestamp` 和 `Field`。

- 表名通常与指标、日志的名称相同。
- `Tag` 列唯一标识时间序列。具有相同 `Tag` 值的行属于同一个时间序列。有些 TSDB 也可能称它们为 label。
- `Timestamp` 是指标、日志和链路追踪数据库的基础。它表示数据生成的日期和时间。一个表只能有一个具有 `Timestamp` 语义类型的列，也称为时间索引（`Time Index`）列。
- 其他列是 `Field` 列。字段包含收集的数据指标或日志内容。这些字段通常是数值或字符串，但也可能是其他类型的数据，例如地理位置或时间戳。

表按时间序列对行进行组织，并按 `Timestamp` 对同一时间序列的行进行排序。表还可以根据应用的需求对具有相同 `Tag` 和 `Timestamp` 值的行进行去重。GreptimeDB 按时间序列存储和处理数据。选择正确的表结构对于高效的数据存储和查询至关重要；请参阅[表设计指南](/user-guide/deployments-administration/performance-tuning/design-table.md)了解更多详情。

### 指标

假设我们有一个名为 `system_metrics` 的表，用于监控数据中心中机器的资源使用情况：

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

这与大家熟悉的表模型非常相似。不同之处在于 `TIME INDEX` 约束，它用于将 `ts` 列指定为此表的时间索引列。

- 表名为 `system_metrics`。
- `PRIMARY KEY` 约束指定了表的 `Tag` 列。`host` 列表示收集的独立机器的主机名，`idc` 列显示机器所在的数据中心。
- `Timestamp` 列 `ts` 表示收集数据的时间。
- `Field` 列中的 `cpu_util`、`memory_util`、`disk_util` 列分别表示机器的 CPU 利用率、内存利用率和磁盘利用率。这些列包含实际的数据。
- 表按 `host`、`idc`、`ts` 对行进行排序和去重。因此，查询 `select count(*) from system_metrics` 需要扫描所有的行做统计。

要了解 GreptimeDB 如何将 Prometheus 指标映射到此模型，请参阅[文档](/user-guide/ingest-data/for-observability/prometheus/#数据模型)。

### 日志

另一个例子是创建一个用于日志（如 Server 访问日志）的表：

```sql
CREATE TABLE access_logs (
  access_time TIMESTAMP TIME INDEX,
  remote_addr STRING,
  http_status STRING,
  http_method STRING,
  http_refer STRING,
  user_agent STRING,
  request STRING,
) with ('append_mode'='true');
```

- 时间索引列为 `access_time`。
- 没有 tag 列。
- `http_status`、`http_method`、`remote_addr`、`http_refer`、`user_agent` 和 `request` 是字段列。
- 表按 `access_time` 对行进行排序。
- 这个表是一个用于存储不需要去重的日志的[append-only 表](/reference/sql/create.md#创建-append-only-表)。
- 查询 append-only 表一般会更快。例如，`select count(*) from access_logs` 可以直接使用统计信息作为结果而不需要考虑重复。

要了解如何指定 `Tag`、`Timestamp` 和 `Field` 列，请参见[表管理](/user-guide/deployments-administration/manage-data/basic-table-operations.md#创建表)和 [CREATE 语句](/reference/sql/create.md)。

### 链路追踪

GreptimeDB 支持通过 OTLP/HTTP 协议直接写入 OpenTelemetry 追踪数据，详细信息请参考 [OLTP 追踪数据模型](/user-guide/ingest-data/for-observability/opentelemetry.md#数据模型-2)。

## 设计考虑

GreptimeDB 基于表进行设计，原因如下：

- 表格模型易于学习，具有广泛的用户群体，我们只需引入时间索引的概念即可实现对指标、日志和链路跟踪的统一处理。
- Schema 是描述数据特征的元数据，对于用户来说更方便管理和维护。
- Schema 通过其类型、长度等信息带来了巨大的优化存储和计算的好处，我们可以进行有针对性的优化。
- 当我们有了表格 Schema 后，自然而然地引入了 SQL，并用它来处理各种表之间的关联分析和聚合查询，为用户抵消了学习和使用成本。
- 比起 OpenTSDB 和 Prometheus 采用的单值模型，GreptimeDB 使用多值模型使其中一行数据可以具有多列数据。多值模型面向数据源建模，一个指标或者事件可以使用多个 field 表示值。多值模型的优势在于它可以一次性向数据库写入或读取多个值，从而减少传输流量并简化查询。相比之下，单值模型则需要将数据拆分成多个记录。阅读[博客](https://greptime.com/blogs/2024-05-09-prometheus)以获取更多详情。

GreptimeDB 使用 SQL 管理表 Schema。有关更多信息，请参见[表管理](/user-guide/deployments-administration/manage-data/basic-table-operations.md)。但是，我们对 Schema 的定义并不是强制性的，而是倾向于 **Schemaless** 的方式，类似于 MongoDB。有关更多详细信息，请参见[自动生成表结构](../ingest-data/overview.md#自动生成表结构)。
