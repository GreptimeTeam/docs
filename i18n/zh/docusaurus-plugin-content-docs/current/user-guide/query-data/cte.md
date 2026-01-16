---
keywords: [公共表表达式, CTE, SQL 查询, 临时结果集, 简化查询, 可读性, 可重用性]
description: 介绍公共表表达式（CTE）的基本概念和使用方法。
---

# 公共表表达式（CTE）

CTE 与 [视图](./view.md) 类似，它们帮助您简化查询的复杂性，将长而复杂的 SQL 语句分解，并提高可读性和可重用性。

您已经在 [快速开始](/getting-started/quick-start.md#指标和日志的关联查询) 文档中阅读了一个 CTE 的例子。

## 什么是公共表表达式（CTE）？

公共表表达式 (CTE) 是可以在 `SELECT`、`INSERT`、`UPDATE` 或 `DELETE` 语句中引用的临时结果集。CTE 有助于将复杂的查询分解成更可读的部分，并且可以在同一个查询中多次引用。

## CTE 的基本语法

CTE 通常使用 `WITH` 关键字定义。基本语法如下：

```sql
WITH cte_name [(column1, column2, ...)] AS (
    QUERY
)
SELECT ...
FROM cte_name;
```

## 示例解释

接下来，我们将通过一个完整的示例来演示如何使用 CTE，包括数据准备、CTE 创建和使用。

### 步骤 1：创建示例数据

假设我们有以下两个表：

- `grpc_latencies`：包含 gRPC 请求延迟数据。
- `app_logs`：包含应用程序日志信息。

```sql
CREATE TABLE grpc_latencies (
    ts TIMESTAMP TIME INDEX,
    host VARCHAR(255),
    latency FLOAT,
    PRIMARY KEY(host),
);

INSERT INTO grpc_latencies VALUES
('2023-10-01 10:00:00', 'host1', 120),
('2023-10-01 10:00:00', 'host2', 150),
('2023-10-01 10:00:05', 'host1', 130);

CREATE TABLE app_logs (
    ts TIMESTAMP TIME INDEX,
    host VARCHAR(255),
    `log` TEXT,
    log_level VARCHAR(50),
    PRIMARY KEY(host, log_level),
);

INSERT INTO app_logs VALUES
('2023-10-01 10:00:00', 'host1', 'Error on service', 'ERROR'),
('2023-10-01 10:00:00', 'host2', 'All services OK', 'INFO'),
('2023-10-01 10:00:05', 'host1', 'Error connecting to DB', 'ERROR');
```

### 步骤 2：定义和使用 CTE

我们将创建两个 CTE 来分别计算第 95 百分位延迟和错误日志的数量。

```sql
WITH
metrics AS (
    SELECT
        ts,
        host,
        approx_percentile_cont(0.95) WITHIN GROUP (ORDER BY latency) RANGE '5s' AS p95_latency
    FROM
        grpc_latencies
    ALIGN '5s' FILL PREV
),
logs AS (
    SELECT
        ts,
        host,
        COUNT(*) RANGE '5s' AS num_errors
    FROM
        app_logs
    WHERE
        log_level = 'ERROR'
    ALIGN '5s' BY (host)
)
SELECT
    metrics.ts,
    metrics.host,
    metrics.p95_latency,
    COALESCE(logs.num_errors, 0) AS num_errors
FROM
    metrics
LEFT JOIN logs ON metrics.host = logs.host AND metrics.ts = logs.ts
ORDER BY
    metrics.ts;
```

输出：

```sql
+---------------------+-------+-------------+------------+
| ts                  | host  | p95_latency | num_errors |
+---------------------+-------+-------------+------------+
| 2023-10-01 10:00:00 | host2 |         150 |          0 |
| 2023-10-01 10:00:00 | host1 |         120 |          1 |
| 2023-10-01 10:00:05 | host1 |         130 |          1 |
+---------------------+-------+-------------+------------+
```

### 详细说明

1. **定义 CTEs**：
  - `metrics`:
      ```sql
    metrics AS (
        SELECT
            ts,
            host,
            approx_percentile_cont(0.95) WITHIN GROUP (ORDER BY latency) RANGE '5s' AS p95_latency
        FROM
            grpc_latencies
        ALIGN '5s' FILL PREV
    ),
      ```
     这里我们使用[范围查询](/user-guide/query-data/sql.md#按时间窗口聚合数据)计算每个 `host` 在每个 5 秒时间窗口内的第 95 百分位延迟。

  - `logs`:
      ```sql
      logs AS (
        SELECT
          ts,
          host,
          COUNT(*) RANGE '5s' AS num_errors
        FROM
          app_logs
        WHERE
          log_level = 'ERROR'
        ALIGN '5s' BY (host)
      )
      ```
      同样地，我们计算每个 `host` 在每个 5 秒时间窗口内的错误日志数量。

2. **使用 CTEs**：
    在最终的查询部分：
      ```sql
      SELECT
          metrics.ts,
          metrics.host,
          metrics.p95_latency,
          COALESCE(logs.num_errors, 0) AS num_errors
      FROM
          metrics
      LEFT JOIN logs ON metrics.host = logs.host AND metrics.ts = logs.ts
      ORDER BY
          metrics.ts;
    ```
    我们对两个 CTE 结果集进行左连接，以获得最终的综合分析结果。

## 在 CTE 中使用 TQL

GreptimeDB 支持在 CTE 中使用 [TQL](/reference/sql/tql.md)（Telemetry 查询语言），将 PromQL 的时序计算能力与 SQL 强大的后处理能力（过滤、JOIN、聚合等）相结合。

### 基本语法

```sql
WITH cte_name AS (
    TQL EVAL (start, end, step) promql_expression AS value_alias
)
SELECT * FROM cte_name;
```

### 关键点

1. **列名**：
   - 时间索引列名取决于表结构（例如，自定义表使用 `ts`，Prometheus 远程写入的默认使用 `greptime_timestamp`）
   - 值的列名取决于 PromQL 表达式，可能无法预测，因此更推荐使用 TQL 中的 `AS` 进行值别名以确保可预测的值列名：`TQL EVAL (...) expression AS my_value`
   - **重要**：避免在 CTE 定义中使用列别名（如 `WITH cte_name (ts, val) AS (...)`），因为 TQL EVAL 结果的列数量和顺序可能变化，特别是在 Prometheus 场景中标签可能动态添加或删除

2. **支持的命令**：CTE 中仅支持 `TQL EVAL`。不能在 CTE 中使用 `TQL ANALYZE` 和 `TQL EXPLAIN`。

3. **回溯参数**：可选的第四个参数控制回溯持续时间（默认：5 分钟）。

### 示例

以下示例使用 Kubernetes 监控指标来演示实际用例。

#### 使用 SQL 过滤 TQL 结果

此示例使用 PromQL 计算每个 Pod 的 CPU 使用率，然后使用 SQL 过滤和排序结果：

```sql
WITH cpu_usage AS (
    TQL EVAL (now() - interval '1' hour, now(), '5m')
    sum by (namespace, pod) (rate(container_cpu_usage_seconds_total{container!=""}[5m]))
    AS cpu_cores
)
SELECT
    greptime_timestamp as ts,
    namespace,
    pod,
    cpu_cores
FROM cpu_usage
WHERE cpu_cores > 0.5
ORDER BY cpu_cores DESC;
```

#### 关联多个指标

此示例展示了 PromQL 单独无法实现的能力：关联不同指标进行分析。它将 CPU 使用率与请求速率关联，以分析资源效率：

```sql
WITH
    cpu_data AS (
        TQL EVAL (now() - interval '1' hour, now(), '5m')
        sum by (pod) (rate(container_cpu_usage_seconds_total{container!=""}[5m]))
        AS cpu_cores
    ),
    request_data AS (
        TQL EVAL (now() - interval '1' hour, now(), '5m')
        sum by (pod) (rate(http_requests_total[5m]))
        AS req_per_sec
    )
SELECT
    c.greptime_timestamp as ts,
    c.pod,
    c.cpu_cores,
    r.req_per_sec
FROM cpu_data c
JOIN request_data r
    ON c.greptime_timestamp = r.greptime_timestamp
    AND c.pod = r.pod
WHERE r.req_per_sec > 1;
```

在 JOIN 多个 TQL CTE 时，请确保：
- `by (...)` 子句包含匹配的维度
- JOIN 条件包含时间戳和标签列

## 总结

通过 CTE，您可以将复杂的 SQL 查询分解为更易于管理和理解的部分。在本示例中，我们分别创建了两个 CTE 来计算第 95 百分位延迟和错误日志的数量，然后将它们合并到最终查询中进行分析。CTE 中的 TQL 支持通过将 PromQL 风格的查询与 SQL 处理无缝集成来扩展这种能力。阅读更多关于 [WITH](/reference/sql/with.md) 和 [TQL](/reference/sql/tql.md) 的内容。

更多 TQL + CTE 示例请参阅博客文章[当 PromQL 遇上 SQL：用混合查询解锁 Kubernetes 监控分析](https://greptime.cn/blogs/2026-01-08-tql-alias-k8s-monitoring)。
