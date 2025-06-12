---
keywords: [从 ClickHouse 迁移, ClickHouse, GreptimeDB, 写入数据, 导出数据, 导入数据, 数据迁移]
description: 分步指南，指导如何从 ClickHouse 迁移到 GreptimeDB，包括数据模型调整、表结构重建、数据导出与导入等操作。
---

# 从 ClickHouse 迁移

本指南详细介绍如何将业务平滑迁移自 ClickHouse 到 GreptimeDB，涵盖迁移前的准备、数据模型调整、表结构重构、双写保障以及数据导出与导入的具体方法，帮助实现系统的无缝切换。

## 迁移前须知

- **兼容性**
  虽然 GreptimeDB 支持 SQL 协议，但与 ClickHouse 在数据建模、索引设计和压缩机制等方面存在根本差异。请查阅 [SQL 兼容性](/reference/sql/compatibility.md) 文档以及官方[建模建议](/user-guide/deployments-administration/performance-tuning/design-table.md)，在迁移过程中重构表结构与数据流。

- **数据模型差异**
  ClickHouse 属于通用大数据分析引擎，GreptimeDB 则重点优化时序、指标及日志可观测场景。两者在数据模型、索引体系与压缩算法等方面均有差别，模型设计时需充分考虑业务场景及兼容性。

---

## 重新设计数据模型与表结构

### 时间索引
- ClickHouse 的表未必有 time index 字段，迁移时需明确选择业务主要的时间字段作为时间索引，并在 GreptimeDB 建表时指定，如日志记录时间/链路追踪时间等。
- 时间精度（秒、毫秒、微秒等）应按实际需求选定，且一旦设定不可更改。

### 主键与宽表建议
- 主键：类似 ClickHouse 的 `order by`，去掉时间戳列；但不建议包含 log_id、user_id 或 UUID 等高基数字段，以避免主键膨胀、写放大和低效查询。
- 宽表 vs 多表：同一个观测点采集多种指标时建议采用宽表，有助于提升批量写入效率和压缩比。

### 索引规划
- 倒排索引：为低基数列建立索引，提高筛选效率。
- 跳数索引：按需使用，适用于稀疏值或大表中偶尔查询的特定值。
- 全文索引：按需使用，适用于字符串字段的文本检索，避免在高基数或高变动字段上建立无用索引。
- 更多信息详见[数据索引](/user-guide/manage-data/data-index.md)。

### 表分区
ClickHouse 通过 `PARTITION BY` 语法支持分区，GreptimeDB 提供类似能力，语法不同，请参阅[表分片](/user-guide/deployments-administration/manage-data/table-sharding.md)文档。

### TTL
GreptimeDB 支持通过表选项 `ttl` 设置生命周期，详见[使用 TTL 策略管理数据存储](/user-guide/manage-data/overview.md#使用-ttl-策略保留数据)。

### 表结构举例

ClickHouse 表：
```sql
CREATE TABLE example (
 timestamp DateTime,
 host String,
 app String,
 metric String,
 value Float64
) ENGINE = MergeTree()
TTL timestamp + INTERVAL 30 DAY
ORDER BY (timestamp, host, app, metric);
````

GreptimeDB 推荐表结构：

```sql
CREATE TABLE example (
 `timestamp` TIMESTAMP NOT NULL,
 host STRING,
 app STRING INVERTED INDEX,
 metric STRING INVERTED INDEX,
 `value` DOUBLE,
 PRIMARY KEY (host, app, metric),
 TIME INDEX (`timestamp`)
) with(ttl='30d');
```

> 主键及时间索引的选型应结合业务数据量及查询场景慎重设计。如果 host 基数很大（如百万级监控主机），可不做主键，改为跳数索引。

### 典型日志表迁移

> GreptimeDB 已内置 otel 日志建模方案，操作详见[官方文档](/user-guide/ingest-data/for-observability/opentelemetry.md#logs)。

ClickHouse 日志表结构：

```sql
CREATE TABLE logs
 (
 timestamp      DateTime,
 host           String,
 service        String,
 log_level      String,
 log_message    String,
 trace_id       String,
 span_id        String,
 INDEX inv_idx(log_message)  TYPE ngrambf_v1(4, 1024, 1, 0) GRANULARITY 1
 ) ENGINE = MergeTree
 ORDER BY (timestamp, host, service);
```

推荐的 GreptimeDB 表结构：

-   时间索引：`timestamp`（根据日志频率选定精度）
-   主键：`host`, `service`（常用过滤/聚合字段）
-   字段列：`log_message`, `trace_id`, `span_id`（高基数、唯一标识或原始内容）

```sql
CREATE TABLE logs (
 `timestamp` TIMESTAMP NOT NULL,
 host STRING,
 service STRING,
 log_level STRING,
 log_message STRING FULLTEXT INDEX WITH (
        backend = 'bloom',
        analyzer = 'English',
        case_sensitive = 'false'
    ),
 trace_id STRING SKIPPING INDEX,
 span_id STRING SKIPPING INDEX,
 PRIMARY KEY (host, service),
 TIME INDEX (`timestamp`)
);
```

**说明：**

-   `host` 和 `service` 作为常用过滤项列入主键，如主机数量非常多，可移出主键，改为跳数索引。
-   `log_message` 作为原始文本内容建立全文索引。**若要全文索引生效，查询时 SQL 语法也需调整，详见[日志检索文档](/user-guide/logs/query-logs.md)**。
-   `trace_id` 和 `span_id` 通常为高基数字段，建议仅做跳数索引。


### 典型链路表迁移

> GreptimeDB 已内置 otel 链路建模方案，详见[官方文档](/user-guide/ingest-data/for-observability/opentelemetry.md#traces)。

ClickHouse 链路表结构设计：

```sql
CREATE TABLE traces (
 timestamp DateTime,
 trace_id String,
 span_id String,
 parent_span_id String,
 service String,
 operation String,
 duration UInt64,
 status String,
 tags Map(String, String)
) ENGINE = MergeTree()
ORDER BY (timestamp, trace_id, span_id);
```

GreptimeDB 推荐表结构：

-   时间索引：`timestamp`（采集/起始时间）
-   主键：`service`, `operation`（常用过滤/聚合属性）
-   字段列：`trace_id`, `span_id`, `parent_span_id`, `duration`, `tags`（高基数或 Map 字段）

```sql
CREATE TABLE traces (
 `timestamp` TIMESTAMP NOT NULL,
 service STRING,
 operation STRING,
 `status` STRING,
 trace_id STRING SKIPPING INDEX,
 span_id STRING SKIPPING INDEX,
 parent_span_id STRING SKIPPING INDEX,
 duration DOUBLE,
 tags STRING,    -- 如为结构化 JSON 可原样存储，必要时用 Pipeline 展开字段
 PRIMARY KEY (service, operation),
 TIME INDEX (`timestamp`)
);
```

**说明：**

-   `service` 与 `operation` 作为主键，便于链路调度和按服务聚合。
-   `trace_id`、`span_id`、`parent_span_id` 用跳数索引，不作为主键。
-   高基数字段仅作普通字段，便于写入效率；`tags` 推荐用字符串或 json，复杂属性可结合 [ETL Pipeline](/user-guide/logs/quick-start.md#使用-pipeline-写入日志) 展开。
-   若业务量极大可考虑多表分区（如多服务场景区分）。


双写保障迁移策略
--------

迁移期间，为避免数据丢失和写入不一致，建议采用双写：

-   应用需同时写入 ClickHouse 和 GreptimeDB，双系统并行。
-   通过日志和校验对比数据，可保证一致性，数据无误后再切换全部流量。

历史数据导出与导入
---------

1.  **迁移前开启双写** 应用同时写入 ClickHouse 和 GreptimeDB，校验数据一致性，减少数据缺失风险。
    
2.  **从 ClickHouse 导出数据** 利用 ClickHouse 命令将数据导出为 CSV、TSV、Parquet 等格式样例：
    

```sh
clickhouse client --query="SELECT * FROM example INTO OUTFILE 'example.csv' FORMAT CSVWithNames"
```

导出的 CSV 内容类似：

```csv
"timestamp","host","app","metric","value"
"2024-04-25 10:00:00","host01","nginx","cpu_usage",12.7
"2024-04-25 10:00:00","host02","redis","cpu_usage",8.4
...
```

3.  **导入数据到 GreptimeDB**

> 需先在 GreptimeDB 创建好目标表。

支持 SQL 命令批量导入，或用 [REST API](/reference/http-endpoints.md#协议端点) 分批导入大数据量。 可用 [`COPY FROM` 命令](/reference/sql/copy.md#copy-from)：

```sql
  COPY example FROM "/path/to/example.csv" WITH (FORMAT = 'CSV');
```

或转换为标准 INSERT 语句分批导入。


验证与流量切换
-------

-   导入完成后，使用 GreptimeDB 查询接口与 ClickHouse 进行数据对比。
-   校验数据及监控无误后，可正式切换业务写入到 GreptimeDB，并关闭双写。


常见问题与优化建议
---------

### SQL/类型不兼容怎么办？

迁移前需梳理所有查询 SQL 并按官方文档 ([SQL 查询](/user-guide/query-data/sql.md)、[日志检索](/user-guide/logs/query-logs.md)) 重写或翻译不兼容语法和类型。

### 如何高效批量导入大规模数据？

大表或历史全量数据建议分分区/分片导出导入，并密切监控速度和进度。

### 高基数字段如何处理？

避免作为主键，直接存为字段，必要时分表拆分。

### 宽表如何规划？

每个监控对象（采集端）建议聚合到单表，如 `host_metrics` 专表存储服务器所有指标。


如果您需要更详细的迁移方案或示例脚本，请提供具体表结构和数据量信息。[GreptimeDB 官方社区](https://github.com/orgs/GreptimeTeam/discussions)将为您提供进一步支持。欢迎加入 [Greptime Slack](http://greptime.com/slack) 交流。
