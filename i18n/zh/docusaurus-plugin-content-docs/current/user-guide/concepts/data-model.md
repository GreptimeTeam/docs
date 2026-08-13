---
keywords: [数据模型, 时间索引, Tag, Timestamp, Field, Metrics, Logs, Traces]
description: 介绍 GreptimeDB 的关系表模型、时间索引和 Tag、Timestamp、Field 列语义，并给出 metrics、logs、traces 示例。
---

# 数据模型

## 模型

GreptimeDB 使用关系表模型，并增加时间索引以及 `Tag`、`Timestamp`、`Field` 三类列语义。Metrics、logs、traces 和事件数据都使用这套模型，但可以保存在不同的表中。

每张表都有表名和唯一的时间索引。各类列的含义如下：

- `Tag` 列参与主键，用来组织相关的数据行。在 metrics 表中，Tag 通常对应标识时间序列的 labels。Tag 不是必选项，append-only 日志表和事件表可以没有主键列。
- `Timestamp` 列通过 `TIME INDEX` 声明为时间索引，用来记录事件或采样时间。GreptimeDB 据此按时间组织数据，并优化时间范围查询。
- `Field` 列保存测量值、日志内容、trace 属性或其他数据，可以使用数值、字符串、JSON、时间戳等 GreptimeDB 支持的数据类型。

对于有主键的表，持久化数据按 `(primary key, timestamp)` 排序。主键和时间戳相同的数据如何合并，由 [merge mode](/reference/sql/create.md#创建带有-merge-模式的表)决定。Append-only 表关闭去重；如果表没有主键，持久化数据按时间戳排序。GreptimeDB 将表数据存为不可变的 Parquet SST 文件，详见 [SST 文件中的数据布局](/contributor-guide/datanode/storage-engine.md#sst-文件中的数据布局)。

Schema 会影响写放大、压缩率、索引大小和查询裁剪效果。选择主键和索引前，请阅读[表设计指南](/user-guide/deployments-administration/performance-tuning/design-table.md)。

### Metrics

下面的表用于保存主机资源指标：

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

![system_metrics 表中，host 和 idc 是 Tag 列，ts 是 Timestamp 列和时间索引，其余测量值是 Field 列。](/time-series-data-model.zh.svg)

- `host` 和 `idc` 是通过 `PRIMARY KEY` 声明的 Tag 列。
- `ts` 是通过 `TIME INDEX` 声明的 Timestamp 列。
- `cpu_util`、`memory_util`、`disk_util` 是 Field 列。
- 使用默认的 [`last_row` merge mode](/reference/sql/create.md#创建带有-merge-模式的表)时，查询会为每组相同的 `host`、`idc`、`ts` 保留最后写入的一行。

Prometheus metrics 与 GreptimeDB 表的映射方式，参见 [Prometheus 数据模型](/user-guide/ingest-data/for-observability/prometheus.md#数据模型)。

### Logs

Web Server 访问日志通常适合使用 append-only 表：

```sql
CREATE TABLE access_logs (
  access_time TIMESTAMP TIME INDEX,
  remote_addr STRING,
  http_status STRING,
  http_method STRING,
  http_refer STRING,
  user_agent STRING,
  request STRING
) WITH ('append_mode' = 'true');
```

- `access_time` 是 Timestamp 列。
- 表没有 Tag 列或主键。
- 其余列都是 Field。
- [`append_mode`](/reference/sql/create.md#创建-append-only-表)会关闭去重和删除，适合不可变的日志记录，不适合需要更新或删除数据行的 workload。
- 表没有主键，持久化数据按 `access_time` 排序。

列语义和表选项的语法参见[建表](/user-guide/deployments-administration/manage-data/basic-table-operations.md#创建表)和 [CREATE TABLE 参考](/reference/sql/create.md)。

### Traces

GreptimeDB 通过 OTLP/HTTP 接收 OpenTelemetry traces，并将 spans 映射到包含时间索引、trace 标识、span 标识、属性和耗时字段的表中。详见 [OTLP Trace 数据模型](/user-guide/ingest-data/for-observability/opentelemetry.md#数据模型-2)。

Trace 写入、存储和 SQL 查询都是一等能力。GreptimeDB 还提供 Jaeger 兼容查询接口。

## 设计考虑

采用表模型有几个直接收益：

- schema 向存储和查询引擎提供类型与列语义；
- SQL 可以跨表过滤、聚合和关联数据；
- 一行可以包含多个 Field，避免单值模型把同一采样拆成多行；
- 每张表可以独立选择主键、merge mode、append-only 模式、索引、TTL 和存储后端；
- 支持的写入协议可以通过自动建表创建表和列；
- metrics、logs、traces 和宽事件采用共同的 Tag、Timestamp、Field 概念，但不要求写入同一张表。

GreptimeDB 使用 SQL 管理表 schema，详见[表管理](/user-guide/deployments-administration/manage-data/basic-table-operations.md)和[自动生成表结构](/user-guide/ingest-data/overview.md#自动生成表结构)。

表还可以携带可选的[表语义层](./semantic-layer.md)，向机器消费者说明信号身份和写入元数据。[统一的可观测数据模型](./observability-2.md)进一步解释了原生信号和上下文事件如何共用表模型，但不共用同一张表。
