---
keywords: [Flow 引擎, 持续计算, ETL 过程, 持续聚合, 程序模型, 使用案例, 快速入门]
description: 了解 GreptimeDB 的 Flow 引擎如何随 source 数据变化维护查询结果，并创建一个从 nginx 日志计算 user_agent 统计信息的 Flow。
---

# 流计算

GreptimeDB 的 Flow 引擎会随 source 数据变化维护 sink 表中的查询结果。
它适用于提取 - 转换 - 加载（ETL）任务，以及求和、平均值和时间窗口计算等持续聚合。

使用案例包括：

- 为仪表盘和告警维护聚合结果
- 将高频数据降采样到更粗的时间窗口

:::note
Flow 对聚合和 TQL workload 使用 batching mode。简单的非聚合 Flow 查询当前会使用已废弃的 streaming mode，不推荐新 workload 使用。
:::

## 程序模型

对于聚合和 TQL 查询，Flow 使用 batching 引擎。写入会标记受影响的 source 数据范围，引擎重新计算这些范围并将结果 upsert 到 sink 表。设置 `EVAL INTERVAL` 后，Flow 会按指定周期执行完整查询。简单的 projection/filter 查询使用已废弃的 streaming 引擎。

source 和 sink 都是 GreptimeDB 表。如果 sink 表不存在，Flow 会根据查询结果的 schema 自动创建；如果需要控制主键、索引、分区、TTL 或列定义，应提前创建 sink 表。

![连续聚合](/flow-ani.svg)

## 快速入门示例

为了说明 GreptimeDB 的 Flow 引擎的功能，
考虑从 nginx 日志计算 user_agent 统计信息的任务。
source 表是 `ngx_http_log`，
sink 表是 `user_agent_statistics`。

首先，创建 source 表 `ngx_http_log`。
为了优化计算 `user_agent` 字段的性能，
使用 `PRIMARY KEY` 关键字将其指定为 `TAG` 列类型。

```sql
CREATE TABLE ngx_http_log (
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

最后，创建 Flow `user_agent_flow` 以计算 `ngx_http_log` 表中每个 user_agent 的出现次数。

```sql
CREATE FLOW user_agent_flow
SINK TO user_agent_statistics
EVAL INTERVAL '1m'
AS
SELECT
  user_agent,
  COUNT(user_agent) AS total_count
FROM
  ngx_http_log
GROUP BY
  user_agent;
```

创建 Flow 后，引擎每分钟执行一次查询并更新 `user_agent_statistics`。

要观察 Flow 的结果，
将示例数据插入 `ngx_http_log` 表。

```sql
INSERT INTO ngx_http_log
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
