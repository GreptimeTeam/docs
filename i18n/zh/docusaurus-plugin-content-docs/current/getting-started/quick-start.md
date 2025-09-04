---
keywords: [快速开始, 数据库连接, 创建表, 写入数据, 查询数据, 数据可视化]
description: 介绍如何快速开始使用 GreptimeDB，包括连接数据库、创建表、写入数据、查询数据等核心功能。
---

# 快速开始

在继续阅读之前，请确保你已经[安装了 GreptimeDB](./installation/overview.md)。

本指南通过引导你创建一个 metric 表和一个 log 表来介绍 GreptimeDB 的核心功能。

## 连接到 GreptimeDB

GreptimeDB 支持[多种协议](/user-guide/protocols/overview.md)与数据库进行交互。
在本快速入门文档中，我们使用 SQL 作为实例。

如果你的 GreptimeDB 实例运行在 `127.0.0.1` 中，
并且使用 MySQL 客户端默认端口 `4002` 或 PostgreSQL 客户端默认端口 `4003`，
你可以使用以下命令连接到数据库。

GreptimeDB 默认不开启[鉴权认证](/user-guide/deployments-administration/authentication/overview.md)。
在本章节中你可以在连接数据库时不提供用户名密码。

```shell
mysql -h 127.0.0.1 -P 4002
```

或者

```shell
psql -h 127.0.0.1 -p 4003 -d public
```

你也可以通过浏览器访问 DB 内置的 Dashboard 地址 `http://127.0.0.1:4000/dashbaord` 运行本文档中的 SQL。

## 创建表

假设你有一个名为 `grpc_latencies` 的事件（Events）表，用于存储的 gRPC 调用接口以及它的处理时间。表 schema 如下：

```sql
CREATE TABLE grpc_latencies (
  ts TIMESTAMP TIME INDEX,
  host STRING INVERTED INDEX,
  method_name STRING,
  latency DOUBLE,
  PRIMARY KEY (host, method_name)
) with('append_mode'='true');
```

- `ts`：收集指标时的时间戳，时间索引列。
- `host`：主机名，设置了[倒排索引](/user-guide/manage-data/data-index.md#倒排索引)。
- `method_name`：RPC 请求方法的名称，tag 列。
- `latency`：RPC 请求的响应时间。

并且通过将 `append_mode` 设置为 true 来启用 [Append Only](/user-guide/deployments-administration/performance-tuning/design-table.md#何时使用-append-only-表)模式，这通常对性能有帮助。

此外，还有一个名为 `app_logs` 的表用于存储日志：

```sql
CREATE TABLE app_logs (
  ts TIMESTAMP TIME INDEX,
  host STRING INVERTED INDEX,
  api_path STRING,
  log_level STRING,
  log_msg STRING FULLTEXT INDEX WITH('case_sensitive' = 'false'),
  PRIMARY KEY (host, log_level)
) with('append_mode'='true');
```

- `ts`：日志条目的时间戳，时间索引列。
- `host`：主机名，设置了倒排索引。
- `api_path`：API 路径。
- `log_level`：日志级别，tag 列。
- `log_msg`：日志消息内容，设置了[全文索引](/user-guide/manage-data/data-index.md#全文索引)。

它也采用了 Append Only 模式。
::::tip
我们在下面使用 SQL 来导入数据，因此需要手动创建表。但 GreptimeDB 本身是 [schemaless](/user-guide/ingest-data/overview.md#自动生成表结构) 的，在使用其他写入方法时可以自动生成 schema。
::::

## 写入数据

让我们插入一些模拟数据来模拟收集的指标和错误日志。

假设有两个服务器 `host1` 和 `host2` 记录着 gRPC 延迟。
从 `2024-07-11 20:00:10` 开始，`host1` 的延迟显著增加。

下图显示了 `host1` 的不稳定延迟。

<img src="/unstable-latencies.png" alt="unstable latencies" width="600"/>

使用以下 SQL 语句插入模拟数据。

在 `2024-07-11 20:00:10` 之前，主机正常运行：

```sql
INSERT INTO grpc_latencies (ts, host, method_name, latency) VALUES
  ('2024-07-11 20:00:06', 'host1', 'GetUser', 103.0),
  ('2024-07-11 20:00:06', 'host2', 'GetUser', 113.0),
  ('2024-07-11 20:00:07', 'host1', 'GetUser', 103.5),
  ('2024-07-11 20:00:07', 'host2', 'GetUser', 107.0),
  ('2024-07-11 20:00:08', 'host1', 'GetUser', 104.0),
  ('2024-07-11 20:00:08', 'host2', 'GetUser', 96.0),
  ('2024-07-11 20:00:09', 'host1', 'GetUser', 104.5),
  ('2024-07-11 20:00:09', 'host2', 'GetUser', 114.0);
```

在 `2024-07-11 20:00:10` 之后，`host1` 的响应时间变得不稳定，处理时间大幅波动，偶尔会出现数千毫秒的峰值：

```sql

INSERT INTO grpc_latencies (ts, host, method_name, latency) VALUES
  ('2024-07-11 20:00:10', 'host1', 'GetUser', 150.0),
  ('2024-07-11 20:00:10', 'host2', 'GetUser', 110.0),
  ('2024-07-11 20:00:11', 'host1', 'GetUser', 200.0),
  ('2024-07-11 20:00:11', 'host2', 'GetUser', 102.0),
  ('2024-07-11 20:00:12', 'host1', 'GetUser', 1000.0),
  ('2024-07-11 20:00:12', 'host2', 'GetUser', 108.0),
  ('2024-07-11 20:00:13', 'host1', 'GetUser', 80.0),
  ('2024-07-11 20:00:13', 'host2', 'GetUser', 111.0),
  ('2024-07-11 20:00:14', 'host1', 'GetUser', 4200.0),
  ('2024-07-11 20:00:14', 'host2', 'GetUser', 95.0),
  ('2024-07-11 20:00:15', 'host1', 'GetUser', 90.0),
  ('2024-07-11 20:00:15', 'host2', 'GetUser', 115.0),
  ('2024-07-11 20:00:16', 'host1', 'GetUser', 3000.0),
  ('2024-07-11 20:00:16', 'host2', 'GetUser', 95.0),
  ('2024-07-11 20:00:17', 'host1', 'GetUser', 320.0),
  ('2024-07-11 20:00:17', 'host2', 'GetUser', 115.0),
  ('2024-07-11 20:00:18', 'host1', 'GetUser', 3500.0),
  ('2024-07-11 20:00:18', 'host2', 'GetUser', 95.0),
  ('2024-07-11 20:00:19', 'host1', 'GetUser', 100.0),
  ('2024-07-11 20:00:19', 'host2', 'GetUser', 115.0),
  ('2024-07-11 20:00:20', 'host1', 'GetUser', 2500.0),
  ('2024-07-11 20:00:20', 'host2', 'GetUser', 95.0);
```

当 `host1` 的 gRPC 请求的响应时间遇到问题时，收集了一些错误日志：

```sql
INSERT INTO app_logs (ts, host, api_path, log_level, log_msg) VALUES
  ('2024-07-11 20:00:10', 'host1', '/api/v1/resource', 'ERROR', 'Connection timeout'),
  ('2024-07-11 20:00:10', 'host1', '/api/v1/billings', 'ERROR', 'Connection timeout'),
  ('2024-07-11 20:00:11', 'host1', '/api/v1/resource', 'ERROR', 'Database unavailable'),
  ('2024-07-11 20:00:11', 'host1', '/api/v1/billings', 'ERROR', 'Database unavailable'),
  ('2024-07-11 20:00:12', 'host1', '/api/v1/resource', 'ERROR', 'Service overload'),
  ('2024-07-11 20:00:12', 'host1', '/api/v1/billings', 'ERROR', 'Service overload'),
  ('2024-07-11 20:00:13', 'host1', '/api/v1/resource', 'ERROR', 'Connection reset'),
  ('2024-07-11 20:00:13', 'host1', '/api/v1/billings', 'ERROR', 'Connection reset'),
  ('2024-07-11 20:00:14', 'host1', '/api/v1/resource', 'ERROR', 'Timeout'),
  ('2024-07-11 20:00:14', 'host1', '/api/v1/billings', 'ERROR', 'Timeout'),
  ('2024-07-11 20:00:15', 'host1', '/api/v1/resource', 'ERROR', 'Disk full'),
  ('2024-07-11 20:00:15', 'host1', '/api/v1/billings', 'ERROR', 'Disk full'),
  ('2024-07-11 20:00:16', 'host1', '/api/v1/resource', 'ERROR', 'Network issue'),
  ('2024-07-11 20:00:16', 'host1', '/api/v1/billings', 'ERROR', 'Network issue');
```

## 查询数据

### 根据 tag 和时间索引进行过滤

你可以使用 WHERE 子句来过滤数据。例如，要查询 `2024-07-11 20:00:15` 之后 `host1` 的延迟：

```sql
SELECT *
  FROM grpc_latencies
  WHERE host = 'host1' AND ts > '2024-07-11 20:00:15';
```

```sql
+---------------------+-------+-------------+---------+
| ts                  | host  | method_name | latency |
+---------------------+-------+-------------+---------+
| 2024-07-11 20:00:16 | host1 | GetUser     |    3000 |
| 2024-07-11 20:00:17 | host1 | GetUser     |     320 |
| 2024-07-11 20:00:18 | host1 | GetUser     |    3500 |
| 2024-07-11 20:00:19 | host1 | GetUser     |     100 |
| 2024-07-11 20:00:20 | host1 | GetUser     |    2500 |
+---------------------+-------+-------------+---------+
5 rows in set (0.14 sec)
```

你还可以在过滤数据时使用函数。例如，你可以使用 `approx_percentile_cont` 函数按主机分组计算响应时间的 95 百分位数：

```sql
SELECT 
  approx_percentile_cont(0.95) WITHIN GROUP (ORDER BY latency) AS p95_latency, 
  host
FROM grpc_latencies
WHERE ts >= '2024-07-11 20:00:10'
GROUP BY host;
```

```sql
+-------------------+-------+
| p95_latency       | host  |
+-------------------+-------+
| 4164.999999999999 | host1 |
|               115 | host2 |
+-------------------+-------+
2 rows in set (0.11 sec)
```


### 通过关键词搜索日志

通过关键词  `timeout`  过滤日志消息：
```sql
SELECT * FROM app_logs WHERE lower(log_msg) @@ 'timeout' AND ts > '2024-07-11 20:00:00';
```

```sql
+---------------------+-------+------------------+-----------+--------------------+
| ts                  | host  | api_path         | log_level | log_msg            |
+---------------------+-------+------------------+-----------+--------------------+
| 2024-07-11 20:00:10 | host1 | /api/v1/billings | ERROR     | Connection timeout |
| 2024-07-11 20:00:10 | host1 | /api/v1/resource | ERROR     | Connection timeout |
| 2024-07-11 20:00:14 | host1 | /api/v1/billings | ERROR     | Timeout            |
| 2024-07-11 20:00:14 | host1 | /api/v1/resource | ERROR     | Timeout            |
+---------------------+-------+------------------+-----------+--------------------+
```

`@@` 操作符用于[短语搜索](/user-guide/logs/query-logs.md)。

### Range query

你可以使用 [range query](/reference/sql/range.md#range-query)来实时监控延迟。例如，按 5 秒窗口计算请求的 p95 延迟：

```sql
SELECT 
  ts, 
  host, 
  approx_percentile_cont(0.95) WITHIN GROUP (ORDER BY latency) RANGE '5s' AS p95_latency
FROM 
  grpc_latencies
ALIGN '5s' FILL PREV;
```

```sql
+---------------------+-------+-------------+
| ts                  | host  | p95_latency |
+---------------------+-------+-------------+
| 2024-07-11 20:00:05 | host2 |         114 |
| 2024-07-11 20:00:10 | host2 |         111 |
| 2024-07-11 20:00:15 | host2 |         115 |
| 2024-07-11 20:00:20 | host2 |          95 |
| 2024-07-11 20:00:05 | host1 |       104.5 |
| 2024-07-11 20:00:10 | host1 |        4200 |
| 2024-07-11 20:00:15 | host1 |        3500 |
| 2024-07-11 20:00:20 | host1 |        2500 |
+---------------------+-------+-------------+
8 rows in set (0.06 sec)
```

### 指标和日志的关联查询

通过组合两个表的数据，你可以快速地确定故障时间和相应的日志。以下 SQL 查询使用 `JOIN` 操作关联指标和日志：

```sql
-- CTE 分别使用 Range Query 查询指标和日志，时间窗口对齐
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
      count(log_msg) RANGE '5s' AS num_errors,
    FROM
      app_logs 
    WHERE
      log_level = 'ERROR'
    ALIGN '5s'
) 
-- 关联 metric 和日志
SELECT 
  metrics.ts,
  p95_latency, 
  coalesce(num_errors, 0) as num_errors,
  metrics.host
FROM 
  metrics 
  LEFT JOIN logs ON metrics.host = logs.host 
  AND metrics.ts = logs.ts 
ORDER BY 
  metrics.ts;
```


```sql
+---------------------+-------------+------------+-------+
| ts                  | p95_latency | num_errors | host  |
+---------------------+-------------+------------+-------+
| 2024-07-11 20:00:05 |         114 |          0 | host2 |
| 2024-07-11 20:00:05 |       104.5 |          0 | host1 |
| 2024-07-11 20:00:10 |        4200 |         10 | host1 |
| 2024-07-11 20:00:10 |         111 |          0 | host2 |
| 2024-07-11 20:00:15 |         115 |          0 | host2 |
| 2024-07-11 20:00:15 |        3500 |          4 | host1 |
| 2024-07-11 20:00:20 |         110 |          0 | host2 |
| 2024-07-11 20:00:20 |        2500 |          0 | host1 |
+---------------------+-------------+------------+-------+
8 rows in set (0.02 sec)
```

我们可以看到当 gRPC 响应时间增大的时间窗口内，错误日志也显著增多，并且确定问题在 `host1`。
<!-- TODO need to fix bug

### 持续聚合

为了进一步分析或在频繁聚合数据时减少扫描成本，你可以将聚合结果保存到另一个表中。这可以通过使用 GreptimeDB 的 [持续聚合](/user-guide/flow-computation/overview.md) 功能来实现。

例如，按照 5 秒钟的时间窗口聚合 API 错误数量，并将数据保存到 `api_error_count` 表中。

创建 `api_error_count` 表：

```sql
CREATE TABLE api_error_count (
  ts TIMESTAMP TIME INDEX,
  host STRING,
  num_errors int, 
  PRIMARY KEY(host)
);
```

然后，创建一个 Flow 来按照 5 秒钟的时间窗口聚合错误数量：

```sql
CREATE FLOW flow_api_error_count 
SINK TO api_error_count
AS
SELECT 
  date_bin(INTERVAL '5 seconds', ts, '1970-01-01 00:00:00'::TimestampNanosecond) AS ts,
  host,
  count(error) RANGE '5s' AS num_errors
FROM 
  app_logs 
GROUP BY date_bin(INTERVAL '5 seconds', ts, '1970-01-01 00:00:00'::TimestampNanosecond);
``` -->

## GreptimeDB 控制台

GreptimeDB 提供了一个[仪表板](./installation/greptimedb-dashboard.md)用于数据探索和管理。

### 数据探索

按照[安装部分](./installation/overview.md)中的说明启动 GreptimeDB 后，你可以通过 HTTP 地址 `http://localhost:4000/dashboard` 访问控制台。

点击 `+` 按钮添加一个新的查询，在命令文本中编写你的 SQL 命令，然后点击 `Run All`。
下方的 SQL 会查询 `grpc_latencies` 表中的所有数据。

```sql
SELECT * FROM grpc_latencies;
```

然后点击结果面板中的 `Chart` 按钮来可视化数据。

![select gRPC latencies](/select-grpc-latencies.png)

### 使用 InfluxDB Line Protocol 导入数据

除了 SQL，GreptimeDB 还支持多种协议，其中最常用之一是 InfluxDB Line Protocol。
在仪表板中点击 `Ingest` 图标，你可以以 InfluxDB Line Protocol 格式上传数据。

例如，将以下数据粘贴到输入框中：

```txt
grpc_metrics,host=host1,method_name=GetUser latency=100,code=0 1720728021000000000
grpc_metrics,host=host2,method_name=GetUser latency=110,code=1 1720728021000000000
```

然后点击 `Write` 按钮来导入数据到 `grpc_metrics` 表。如果该表不存在，将会自动创建该表。
## 下一步

你现在已经体验了 GreptimeDB 的核心功能。
要进一步探索和利用 GreptimeDB：

- [使用 Grafana 可视化数据](/user-guide/integrations/grafana.md)
- [探索更多 GreptimeDB 的 Demo](https://github.com/GreptimeTeam/demo-scene/)
- [阅读用户指南学习 GreptimeDB](/user-guide/overview.md)

