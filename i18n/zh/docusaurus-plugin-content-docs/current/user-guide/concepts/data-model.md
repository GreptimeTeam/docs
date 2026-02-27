---
keywords: [数据模型, 表结构, 列类型, 设计考虑, 时序表, Tag, Timestamp, Field, Metrics, Logs, Traces]
description: 介绍 GreptimeDB 的数据模型，包括表结构、列类型和设计考虑，适用于 metrics、logs 和 traces 数据。
---

# 数据模型

## 模型

GreptimeDB 使用时序表来组织、压缩和管理数据的过期。数据模型基于关系型数据库的表模型，同时针对 metrics、logs、traces 的特点做了适配。

所有数据按表组织，每个表中的列分为三种语义类型：`Tag`、`Timestamp` 和 `Field`。

- 表名通常和指标名、日志源名或 metric 名称一致。
- `Tag` 列标识时间序列的身份。相同 Tag 值的行属于同一条时间序列（有些 TSDB 也叫 label）。
- `Timestamp` 是时序数据库的根基，表示数据的生成时间。每个表只能有一个 `Timestamp` 类型的列，也叫时间索引（`Time Index`）。
- 其余列是 `Field` 列，存放实际的数据指标或日志内容，通常是数值或字符串，也可以是地理位置、时间戳等其他类型。

表按时间序列组织行，同一时间序列内按 `Timestamp` 排序。表还可以对相同 `Tag` + `Timestamp` 的行做去重，具体取决于业务需求。选择合适的表结构对查询和存储效率至关重要，详见[表设计指南](/user-guide/deployments-administration/performance-tuning/design-table.md)。

### Metrics

假设有一个 `system_metrics` 表，监控数据中心机器的资源使用：

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

数据模型如下：

![time-series-table-model](/time-series-data-model.svg)

和常见的关系表模型很像，区别在于 `TIME INDEX` 约束——用来指定 `ts` 列为时间索引。

- 表名 `system_metrics`。
- `PRIMARY KEY` 指定 Tag 列：`host` 是主机名，`idc` 是数据中心。
- `ts` 是 Timestamp 列，表示数据采集时间。
- `cpu_util`、`memory_util`、`disk_util` 是 Field 列，存放实际数据。
- 表按 `host`、`idc`、`ts` 排序和去重，所以 `select count(*) from system_metrics` 需要扫全表。

Prometheus metrics 如何映射到这个模型，参见[文档](/user-guide/ingest-data/for-observability/prometheus/#数据模型)。

### Logs

创建一个存 Web Server 访问日志的表：

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

- 时间索引列是 `access_time`。
- 没有 Tag 列。
- `http_status`、`http_method`、`remote_addr`、`http_refer`、`user_agent`、`request` 是 Field 列。
- 按 `access_time` 排序。
- 这是一个 [append-only 表](/reference/sql/create.md#创建-append-only-表)，不支持去重和删除，适合日志场景。
- 查询 append-only 表通常更快，比如 `select count(*) from access_logs` 可以直接用统计信息返回结果，不需要考虑去重。

如何指定 `Tag`、`Timestamp`、`Field` 列，参见[表管理](/user-guide/deployments-administration/manage-data/basic-table-operations.md#创建表)和 [CREATE 语句](/reference/sql/create.md)。

### Traces

GreptimeDB 支持通过 OTLP/HTTP 协议直接写入 OpenTelemetry traces 数据，详见 [OTLP traces 数据模型](/user-guide/ingest-data/for-observability/opentelemetry.md#数据模型-2)。

## 设计考虑

GreptimeDB 为什么选择表模型：

- 表模型用户基础广、学习门槛低。在此基础上加一个时间索引的概念，就能统一处理 metrics、logs、traces。
- Schema 是描述数据特征的元数据，方便管理和维护。
- Schema 提供类型、长度等信息，存储和计算引擎可以做针对性优化。
- 有了表模型，自然引入 SQL，用 SQL 做跨表关联分析和聚合查询，降低用户的学习成本。
- GreptimeDB 采用多值模型，单行可以有多个 Field 列，相比需要把数据拆成多条记录的单值模型，省传输流量、查询也更简洁。详见[博客](https://greptime.com/blogs/2024-05-09-prometheus)。
- 在 Observability 2.0 范式中，metrics、logs、traces 被视为同一组底层"宽事件"的不同投影。GreptimeDB 的统一表模型天然支持这一点——所有信号类型共享 Tag + Timestamp + Field schema，一条 SQL 就能做跨信号关联。详见 [Observability 2.0](./observability-2.md)。

GreptimeDB 用 SQL 管理表 schema，参见[表管理](/user-guide/deployments-administration/manage-data/basic-table-operations.md)。不过 schema 定义不是强制的，更偏向 **Schemaless** 的方式——写入时自动建表、自动加列。详见[自动生成表结构](../ingest-data/overview.md#自动生成表结构)。
