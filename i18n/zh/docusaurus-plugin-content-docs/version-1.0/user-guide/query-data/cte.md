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

GreptimeDB 支持在 CTE 中使用 [TQL](/reference/sql/tql.md)（Telemetry 查询语言），让你可以在 SQL 工作流中使用 PromQL 风格的查询。

### 基本语法

```sql
WITH cte_name AS (
    TQL EVAL (start, end, step) promql_expression
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

#### 使用值别名的基本 TQL CTE

```sql
-- 使用 TQL 中的 AS 子句为值列命名
WITH metrics_data AS (
    TQL EVAL (0, 40, '10s') metric AS value
)
SELECT * FROM metrics_data WHERE value > 5;
```

#### 带 PromQL 函数的 TQL

```sql
WITH request_rate AS (
    TQL EVAL (0, 40, '10s') rate(metric[20s]) AS rate_per_sec
)
SELECT * FROM request_rate;
```

#### 组合多个 TQL CTE

```sql
WITH
    current AS (
        TQL EVAL (0, 40, '10s') metric AS current_value
    ),
    rate AS (
        TQL EVAL (0, 40, '10s') rate(metric[20s]) AS rate_value
    )
SELECT
    c.*,
    r.rate_value
FROM current c
JOIN rate r ON c.ts = r.ts;  -- 注意：时间列名取决于您的表
```

#### 混合 CTE（TQL + SQL）

```sql
WITH
    tql_data AS (
        TQL EVAL (0, 40, '10s') metric AS val
    ),
    filtered AS (
        SELECT * FROM tql_data WHERE val > 5
    )
SELECT count(*) FROM filtered;
```

## 总结

通过 CTE，您可以将复杂的 SQL 查询分解为更易于管理和理解的部分。在本示例中，我们分别创建了两个 CTE 来计算第 95 百分位延迟和错误日志的数量，然后将它们合并到最终查询中进行分析。CTE 中的 TQL 支持通过将 PromQL 风格的查询与 SQL 处理无缝集成来扩展这种能力。阅读更多关于 [WITH](/reference/sql/with.md) 和 [TQL](/reference/sql/tql.md) 的内容。
