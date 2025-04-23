---
keywords: [Flow 引擎, 实时计算, ETL 过程, 即时计算, 程序模型, 使用案例, 快速入门]
description: 了解 GreptimeDB 的 Flow 引擎如何实现数据流的实时计算，如何用于 ETL 过程和即时计算。了解其程序模型、使用案例以及从 nginx 日志计算 user_agent 统计信息的快速入门示例。
---

# 流计算

GreptimeDB 的 Flow 引擎实现了数据流的实时计算。
它特别适用于提取 - 转换 - 加载 (ETL) 过程或执行即时的过滤、计算和查询，例如求和、平均值和其他聚合。
Flow 引擎确保数据被增量和连续地处理，
根据到达的新的流数据更新最终结果。
你可以将其视为一个聪明的物化视图，
它知道何时更新结果视图表以及如何以最小的努力更新它。

使用案例包括：

- 降采样数据点，使用如平均池化等方法减少存储和分析的数据量
- 提供近实时分析、可操作的信息

## 程序模型

在将数据插入 source 表后，
数据会同时被写入到 Flow 引擎中。
在每个触发间隔（一秒）时，
Flow 引擎执行指定的计算并将结果更新到 sink 表中。
source 表和 sink 表都是 GreptimeDB 中的时间序列表。
在创建 Flow 之前，
定义这些表的 schema 并设计 Flow 以指定计算逻辑是至关重要的。
此过程在下图中直观地表示：

![连续聚合](/flow-ani.svg)

## 快速入门示例

为了说明 GreptimeDB 的 Flow 引擎的功能，
考虑从 nginx 日志计算 user_agent 统计信息的任务。
source 表是 `nginx_access_log`，
sink 表是 `user_agent_statistics`。

首先，创建 source 表 `nginx_access_log`。
为了优化计算 `user_agent` 字段的性能，
使用 `PRIMARY KEY` 关键字将其指定为 `TAG` 列类型。

```sql
CREATE TABLE ngx_access_log (
  ip_address STRING,
  http_method STRING,
  request STRING,
  status_code INT16,
  body_bytes_sent INT32,
  user_agent STRING,
  response_size INT32,
  ts TIMESTAMP TIME INDEX,
  PRIMARY KEY (ip_address, http_method, user_agent, status_code)
) WITH ('append_mode'='true');
```

接下来，创建 sink 表 `user_agent_statistics`。
`update_at` 列跟踪数据的最后更新时间，由 Flow 引擎自动更新。
尽管 GreptimeDB 中的所有表都是时间序列表，但此计算不需要时间窗口。
因此增加了 `__ts_placeholder` 列作为时间索引占位列。

```sql
CREATE TABLE user_agent_statistics (
  user_agent STRING,
  total_count INT64,
  update_at TIMESTAMP,
  __ts_placeholder TIMESTAMP TIME INDEX,
  PRIMARY KEY (user_agent)
);
```

最后，创建 Flow `user_agent_flow` 以计算 `nginx_access_log` 表中每个 user_agent 的出现次数。

```sql
CREATE FLOW user_agent_flow
SINK TO user_agent_statistics
AS
SELECT
  user_agent,
  COUNT(user_agent) AS total_count
FROM
  ngx_access_log
GROUP BY
  user_agent;
```

一旦创建了 Flow，
Flow 引擎将持续处理 `nginx_access_log` 表中的数据，并使用计算结果更新 `user_agent_statistics` 表。

要观察 Flow 的结果，
将示例数据插入 `nginx_access_log` 表。

```sql
INSERT INTO ngx_access_log
VALUES
  ('192.168.1.1', 'GET', '/index.html', 200, 512, 'Mozilla/5.0', 1024, '2023-10-01T10:00:00Z'),
  ('192.168.1.2', 'POST', '/submit', 201, 256, 'curl/7.68.0', 512, '2023-10-01T10:01:00Z'),
  ('192.168.1.1', 'GET', '/about.html', 200, 128, 'Mozilla/5.0', 256, '2023-10-01T10:02:00Z'),
  ('192.168.1.3', 'GET', '/contact', 404, 64, 'curl/7.68.0', 128, '2023-10-01T10:03:00Z');
```

插入数据后，
查询 `user_agent_statistics` 表以查看结果。

```sql
SELECT * FROM user_agent_statistics;
```

查询结果将显示 `user_agent_statistics` 表中每个 user_agent 的总数。

```sql
+-------------+-------------+----------------------------+---------------------+
| user_agent  | total_count | update_at                  | __ts_placeholder    |
+-------------+-------------+----------------------------+---------------------+
| Mozilla/5.0 |           2 | 2024-12-12 06:45:33.228000 | 1970-01-01 00:00:00 |
| curl/7.68.0 |           2 | 2024-12-12 06:45:33.228000 | 1970-01-01 00:00:00 |
+-------------+-------------+----------------------------+---------------------+
```

## 下一步

- [持续聚合](./continuous-aggregation.md)：探索时间序列数据处理中的主要场景，了解持续聚合的三种常见使用案例。
- [管理 Flow](manage-flow.md)：深入了解 Flow 引擎的机制和定义 Flow 的 SQL 语法。
- [表达式](expressions.md)：了解 Flow 引擎支持的数据转换表达式。
