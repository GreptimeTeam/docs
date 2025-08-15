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
    log TEXT,
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
        approx_percentile_cont(latency, 0.95) RANGE '5s' AS p95_latency
    FROM 
        grpc_latencies
    ALIGN '5s' FILL PREV
),
logs AS (
    SELECT 
        ts, 
        host,
        COUNT(log) RANGE '5s' AS num_errors
    FROM
        app_logs
    WHERE 
        log_level = 'ERROR'
    ALIGN '5s' BY (HOST)
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
      WITH 
      metrics AS (
          SELECT 
            ts, 
            host, 
            approx_percentile_cont(latency, 0.95) RANGE '5s' AS p95_latency
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
          COUNT(log) RANGE '5s' AS num_errors
        FROM
          app_logs
        WHERE 
          log_level = 'ERROR'
        ALIGN '5s' BY (HOST)
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

## 总结

通过 CTE，您可以将复杂的 SQL 查询分解为更易于管理和理解的部分。在本示例中，我们分别创建了两个 CTE 来计算第 95 百分位延迟和错误日志的数量，然后将它们合并到最终查询中进行分析。阅读更多 [WITH](/reference/sql/with.md)。
