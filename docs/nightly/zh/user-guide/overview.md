# 概述

欢迎使用 GreptimeDB 用户指南。

GreptimeDB 是用于指标、事件和日志的统一时间序列数据库，
可提供从边缘到云的任何规模的实时洞察。
本指南将帮助你探索 GreptimeDB 的每个强大功能。

## SQL 查询示例

让我们从一个 SQL 查询示例开始。

为了监控特定指标的性能和可靠性，
工程师通常定期查询并分析一段时间内的数据。
在分析过程中通常涉及到 JOIN 两个数据源，
但如下方的查询在之前是不可能的，
而现在使用 GreptimeDB 就可以做到：

```sql
SELECT
  host,
  approx_percentile_cont(latency, 0.95) RANGE '15s' as p95_latency,
  count(error) RANGE '15s' as num_errors,
FROM
  metrics INNER JOIN logs on metrics.host = logs.host
WHERE
  time > now() - INTERVAL '1 hour' AND
  matches(path, '/api/v1/avator')
ALIGN '5s' BY (host) FILL PREV
```

该查询分析了过去一小时内特定 API 路径 (`/api/v1/avator`) 的性能和错误。
它计算了每个 15 秒间隔内的第 95 百分位延迟和错误数量，并将结果对齐到每个 5 秒间隔以保持连续性和可读性。

逐步解析该查询：

1. SELECT 子句：
  - `host`：选择 host 字段。
  - `approx_percentile_cont(latency, 0.95) RANGE '15s' as p95_latency`：计算 15 秒范围内的第 95 百分位延迟，并将其标记为 p95_latency。
  - `count(error) RANGE '15s' as num_errors`：计算 15 秒范围内的错误数量，并将其标记为 num_errors。
2. FROM 子句：
  - `metrics INNER JOIN logs on metrics.host = logs.host`：在 host 字段上将 metrics 和 logs 表进行连接。
3. WHERE 子句：
  - `time > now() - INTERVAL '1 hour'`：筛选出过去一小时内的记录。
  - `matches(path, '/api/v1/avator')`：筛选出特定 API 路径 `/api/v1/avator` 的记录。
4. ALIGN 子句：
  - `ALIGN '5s' BY (host) FILL PREV`：将结果对齐到每 5 秒，并使用前一个非空值填充缺失值。

接下来解析一下该查询示例展示的 GreptimeDB 关键功能：

- **统一存储：** GreptimeDB 是支持同时存储和分析指标及[日志](/user-guide/logs/overview.md)的时序数据库。简化的架构和数据一致性增强了分析和解决问题的能力，并可节省成本且提高系统性能。
- **独特的数据模型：** 独特的[数据模型](/user-guide/concepts/data-model.md)搭配时间索引和全文索引，大大提升了查询性能，并在超大数据集上也经受住了考验。它不仅支持[数据指标的插入](/user-guide/write-data/overview.md)和[查询](/user-guide/query-data/overview.md)，也提供了非常友好的方式便于日志的[写入](/user-guide/logs/write-logs.md)和[查询](/user-guide/logs/query-logs.md)。
- **范围查询：** GreptimeDB 支持[范围查询](/user-guide/query-data/sql#aggregate-data-by-time-window)来计算一段时间内的[表达式](/reference/sql/functions/overview.md)，从而了解指标趋势。你还可以[持续聚合](/user-guide/continuous-aggregation/overview)数据以进行进一步分析。
- **SQL 和多种协议：** GreptimeDB 使用 SQL 作为主要查询语言，并支持[多种协议](/user-guide/clients/overview.md#protocols)，大大降低了学习曲线和接入成本。你可以轻松从 Prometheus 或 [Influxdb 迁移](/user-guide/migrate-to-greptimedb/migrate-from-influxdb)至 GreptimeDB，或者从 0 接入 GreptimeDB。
- **JOIN 操作：** GreptimeDB 的时间序列表的数据模型，使其具备了支持[JOIN](/reference/sql/join.md)数据指标和日志的能力。

了解了这些功能后，你现在可以直接探索感兴趣的功能，或按顺序继续阅读下一步骤。

## 下一步

* [概念](./concepts/overview.md)
* [客户端](./clients/overview.md)
* [表管理](./table-management.md)
* [迁移到 GreptimeDB](./migrate-to-greptimedb/migrate-from-influxdb.md)
* [数据写入](./write-data/overview.md)
* [数据查询](./query-data/overview.md)
* [持续聚合](./continuous-aggregation/overview.md)
* [Python 脚本](./python-scripts/overview.md)
* [运维操作](./operations/overview.md)
* [集群](./cluster.md)
