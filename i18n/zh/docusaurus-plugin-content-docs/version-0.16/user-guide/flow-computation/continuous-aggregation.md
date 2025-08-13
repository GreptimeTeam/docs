---
keywords: [持续聚合, 实时分析, 实时监控, 实时仪表盘, 聚合函数, 时间窗口, SQL 示例]
description: 持续聚合是处理时间序列数据以提供实时洞察的关键方面。本文介绍了持续聚合的三个主要用例：实时分析、实时监控和实时仪表盘，并提供了详细的 SQL 示例。
---

# 持续聚合

持续聚合是处理时间序列数据以提供实时洞察的关键方面。
Flow 引擎使开发人员能够无缝地执行持续聚合，例如计算总和、平均值和其他指标。
它在指定的时间窗口内高效地更新聚合数据，使其成为分析的宝贵工具。

持续聚合的三个主要用例示例如下：

1. **实时分析**：一个实时分析平台，不断聚合来自事件流的数据，提供即时洞察，同时可选择将数据降采样到较低分辨率。例如，此系统可以编译来自高频日志事件流（例如，每毫秒发生一次）的数据，以提供每分钟的请求数、平均响应时间和每分钟的错误率等最新洞察。
2. **实时监控**：一个实时监控系统，不断聚合来自事件流的数据，根据聚合数据提供实时警报。例如，此系统可以处理来自传感器事件流的数据，以提供当温度超过某个阈值时的实时警报。
3. **实时仪表盘**：一个实时仪表盘，显示每分钟的请求数、平均响应时间和每分钟的错误数。此仪表板可用于监控系统的健康状况，并检测系统中的任何异常。

在所有这些用例中，持续聚合系统不断聚合来自事件流的数据，并根据聚合数据提供实时洞察和警报。系统还可以将数据降采样到较低分辨率，以减少存储和处理的数据量。这使得系统能够提供实时洞察和警报，同时保持较低的数据存储和处理成本。

## 实时分析示例

### 日志统计

这个例子是根据输入表中的数据计算一系列统计数据，包括一分钟时间窗口内的总日志数、最小大小、最大大小、平均大小以及大小大于 550 的数据包数。

首先，创建一个 source 表 `ngx_access_log` 和一个 sink 表 `ngx_statistics`，如下所示：

```sql
CREATE TABLE `ngx_access_log` (
  `client` STRING NULL,
  `ua_platform` STRING NULL,
  `referer` STRING NULL,
  `method` STRING NULL,
  `endpoint` STRING NULL,
  `trace_id` STRING NULL FULLTEXT INDEX,
  `protocol` STRING NULL,
  `status` SMALLINT UNSIGNED NULL,
  `size` DOUBLE NULL,
  `agent` STRING NULL,
  `access_time` TIMESTAMP(3) NOT NULL,
  TIME INDEX (`access_time`)
)
WITH(
  append_mode = 'true'
);
```

```sql
CREATE TABLE `ngx_statistics` (
  `status` SMALLINT UNSIGNED NULL,
  `total_logs` BIGINT NULL,
  `min_size` DOUBLE NULL,
  `max_size` DOUBLE NULL,
  `avg_size` DOUBLE NULL,
  `high_size_count` BIGINT NULL,
  `time_window` TIMESTAMP time index,
  `update_at` TIMESTAMP NULL,
  PRIMARY KEY (`status`)
);
```

然后创建名为 `ngx_aggregation` 的 flow 任务，包括 `count`、`min`、`max`、`avg` `size` 列的聚合函数，以及大于 550 的所有数据包的大小总和。聚合是在 `access_time` 列的 1 分钟固定窗口中计算的，并且还按 `status` 列分组。因此，你可以实时了解有关数据包大小和对其的操作的信息，例如，如果 `high_size_count` 在某个时间点变得太高，你可以进一步检查是否有任何问题，或者如果 `max_size` 列在 1 分钟时间窗口内突然激增，你可以尝试定位该数据包并进一步检查。

下方 SQL 语句中的 `EXPIRE AFTER '6h'` 参数确保 flow 计算仅使用过去 6 小时内的源数据。对于 sink 表中超过 6 小时的历史数据，本 flow 不会对其进行修改。有关`EXPIRE AFTER`的详细信息，请参阅[管理 Flow](manage-flow.md#expire-after)

```sql
CREATE FLOW ngx_aggregation
SINK TO ngx_statistics
EXPIRE AFTER '6h'
COMMENT 'aggregate nginx access logs'
AS
SELECT
    status,
    count(client) AS total_logs,
    min(size) as min_size,
    max(size) as max_size,
    avg(size) as avg_size,
    sum(case when `size` > 550 then 1 else 0 end) as high_size_count,
    date_bin('1 minutes'::INTERVAL, access_time) as time_window,
FROM ngx_access_log
GROUP BY
    status,
    time_window;
```

要检查持续聚合是否正常工作，首先插入一些数据到源表 `ngx_access_log` 中。

```sql
INSERT INTO ngx_access_log
VALUES
    ('android', 'Android', 'referer', 'GET', '/api/v1', 'trace_id', 'HTTP', 200, 1000, 'agent', now() - INTERVAL '1' minute),
    ('ios', 'iOS', 'referer', 'GET', '/api/v1', 'trace_id', 'HTTP', 200, 500, 'agent', now() - INTERVAL '1' minute),
    ('android', 'Android', 'referer', 'GET', '/api/v1', 'trace_id', 'HTTP', 200, 600, 'agent', now()),
    ('ios', 'iOS', 'referer', 'GET', '/api/v1', 'trace_id', 'HTTP', 404, 700, 'agent', now());
```

则 `ngx_access_log` 表将被增量更新以包含以下数据：

```sql
SELECT * FROM ngx_statistics;
```

```sql
+--------+------------+----------+----------+----------+-----------------+---------------------+----------------------------+
| status | total_logs | min_size | max_size | avg_size | high_size_count | time_window         | update_at                  |
+--------+------------+----------+----------+----------+-----------------+---------------------+----------------------------+
|    200 |          2 |      500 |     1000 |      750 |               1 | 2025-04-24 06:46:00 | 2025-04-24 06:47:06.680000 |
|    200 |          1 |      600 |      600 |      600 |               1 | 2025-04-24 06:47:00 | 2025-04-24 06:47:06.680000 |
|    404 |          1 |      700 |      700 |      700 |               1 | 2025-04-24 06:47:00 | 2025-04-24 06:47:06.680000 |
+--------+------------+----------+----------+----------+-----------------+---------------------+----------------------------+
3 rows in set (0.01 sec)
```

尝试向 `ngx_access_log` 表中插入更多数据：

```sql
INSERT INTO ngx_access_log
VALUES
    ('android', 'Android', 'referer', 'GET', '/api/v1', 'trace_id', 'HTTP', 200, 500, 'agent', now()),
    ('ios', 'iOS', 'referer', 'GET', '/api/v1', 'trace_id', 'HTTP', 404, 800, 'agent', now());
```

结果表 `ngx_statistics` 将被增量更新，注意 `max_size`、`avg_size` 和 `high_size_count` 是如何更新的：

```sql
SELECT * FROM ngx_statistics;
```

```sql
+--------+------------+----------+----------+----------+-----------------+---------------------+----------------------------+
| status | total_logs | min_size | max_size | avg_size | high_size_count | time_window         | update_at                  |
+--------+------------+----------+----------+----------+-----------------+---------------------+----------------------------+
|    200 |          2 |      500 |     1000 |      750 |               1 | 2025-04-24 06:46:00 | 2025-04-24 06:47:06.680000 |
|    200 |          2 |      500 |      600 |      550 |               1 | 2025-04-24 06:47:00 | 2025-04-24 06:47:21.720000 |
|    404 |          2 |      700 |      800 |      750 |               2 | 2025-04-24 06:47:00 | 2025-04-24 06:47:21.720000 |
+--------+------------+----------+----------+----------+-----------------+---------------------+----------------------------+
3 rows in set (0.01 sec)
```

`ngx_statistics` 表中的列解释如下：

- `status`: HTTP 响应的状态码。
- `total_logs`: 相同状态码的日志总数。
- `min_size`: 相同状态码的数据包的最小大小。
- `max_size`: 相同状态码的数据包的最大大小。
- `avg_size`: 相同状态码的数据包的平均大小。
- `high_size_count`: 包大小大于 550 的数据包数。
- `time_window`: 聚合的时间窗口。
- `update_at`: 聚合结果更新的时间。

### 按时间窗口查询国家

另一个实时分析的示例是从 `ngx_access_log` 表中查询所有不同的国家。
你可以使用以下查询按时间窗口对国家进行分组：

```sql
/* source 表 */
CREATE TABLE ngx_access_log (
    client STRING,
    country STRING,
    access_time TIMESTAMP TIME INDEX,
    PRIMARY KEY(client)
)WITH(
  append_mode = 'true'
);

/* sink 表 */
CREATE TABLE ngx_country (
    country STRING,
    time_window TIMESTAMP TIME INDEX,
    update_at TIMESTAMP,
    PRIMARY KEY(country)
);

/* 创建 flow 任务以计算不同的国家 */
CREATE FLOW calc_ngx_country
SINK TO ngx_country
EXPIRE AFTER '7days'::INTERVAL
COMMENT 'aggregate for distinct country'
AS
SELECT
    DISTINCT country,
    date_bin('1 hour'::INTERVAL, access_time) as time_window,
FROM ngx_access_log
GROUP BY
    country,
    time_window;
```

上述查询将 `ngx_access_log` 表中的数据聚合到 `ngx_country` 表中，它计算了每个时间窗口内的不同国家。
`date_bin` 函数用于将数据聚合到一小时的间隔中。
`ngx_country` 表将不断更新聚合数据，以监控访问系统的不同国家。`EXPIRE AFTER` 参数将确保流式处理流程自动忽略 `access_time` 超过 7 天的数据且不再参与 flow 计算，详见 请参阅[管理 Flow](manage-flow.md#expire-after) 中的说明。

你可以向 source 表 `ngx_access_log` 插入一些数据：

```sql
INSERT INTO ngx_access_log VALUES
    ('client1', 'US', now() - '2 hour'::INTERVAL),
    ('client2', 'US', now() - '2 hour'::INTERVAL),
    ('client3', 'UK', now() - '2 hour'::INTERVAL),
    ('client4', 'UK', now() - '1 hour'::INTERVAL),
    ('client5', 'CN', now() - '1 hour'::INTERVAL),
    ('client6', 'CN', now() - '1 hour'::INTERVAL),
    ('client7', 'JP', now()),
    ('client8', 'JP', now()),
    ('client9', 'KR', now()),
    ('client10', 'KR', now());
```

等待几秒钟，让 flow 将结果写入 sink 表，然后查询：

```sql
select * from ngx_country;
```

```sql
+---------+---------------------+----------------------------+
| country | time_window         | update_at                  |
+---------+---------------------+----------------------------+
| CN      | 2025-04-24 05:00:00 | 2025-04-24 06:55:17.217000 |
| JP      | 2025-04-24 06:00:00 | 2025-04-24 06:55:17.217000 |
| KR      | 2025-04-24 06:00:00 | 2025-04-24 06:55:17.217000 |
| UK      | 2025-04-24 04:00:00 | 2025-04-24 06:55:17.217000 |
| UK      | 2025-04-24 05:00:00 | 2025-04-24 06:55:17.217000 |
| US      | 2025-04-24 04:00:00 | 2025-04-24 06:55:17.217000 |
+---------+---------------------+----------------------------+
```

## 实时监控示例

假设你有一个来自温度传感器网络的传感器事件流，你希望实时监控这些事件。
传感器事件包含传感器 ID、温度读数、读数的时间戳和传感器的位置等信息。
你希望不断聚合这些数据，以便在温度超过某个阈值时提供实时告警。持续聚合的查询如下：

```sql
/* 创建 source 表 */
CREATE TABLE temp_sensor_data (
    sensor_id INT,
    loc STRING,
    temperature DOUBLE,
    ts TIMESTAMP TIME INDEX
)WITH(
  append_mode = 'true'
);

/* 创建 sink 表 */
CREATE TABLE temp_alerts (
    sensor_id INT,
    loc STRING,
    max_temp DOUBLE,
    time_window TIMESTAMP TIME INDEX,
    update_at TIMESTAMP,
    PRIMARY KEY(sensor_id, loc)
);

CREATE FLOW temp_monitoring
EXPIRE AFTER '1h'
SINK TO temp_alerts
AS
SELECT
    sensor_id,
    loc,
    max(temperature) as max_temp,
    date_bin('10 seconds'::INTERVAL, ts) as time_window,
FROM temp_sensor_data
GROUP BY
    sensor_id,
    loc,
    time_window
HAVING max_temp > 100;
```

上述查询将 `temp_sensor_data` 表中的数据不断聚合到 `temp_alerts` 表中。
它计算每个传感器和位置的最大温度读数，并过滤出最大温度超过 100 度的数据。
`temp_alerts` 表将不断更新聚合数据，
当温度超过阈值时提供实时警报（即 `temp_alerts` 表中的新行）。`EXPIRE AFTER '1h'` 使 flow 仅计算 `ts` 列处于 `(now - 1h, now)` 时间范围内的源数据，详见 [管理 Flow](manage-flow.md#expire-after) 中的说明。

现在我们已经创建了 flow 任务，可以向 source 表 `temp_sensor_data` 插入一些数据：

```sql
INSERT INTO temp_sensor_data VALUES
    (1, 'room1', 98.5, now() - '10 second'::INTERVAL),
    (2, 'room2', 99.5, now());
```

表现在应该是空的，等待几秒钟让 flow 将结果更新到输出表：

```sql
SELECT * FROM temp_alerts;
```

```sql
Empty set (0.00 sec)
```

插入一些会触发警报的数据：

```sql
INSERT INTO temp_sensor_data VALUES
    (1, 'room1', 101.5, now()),
    (2, 'room2', 102.5, now());
```

等待几秒钟，让 flow 将结果更新到输出表：

```sql
SELECT * FROM temp_alerts;
```

```sql
+-----------+-------+----------+---------------------+----------------------------+
| sensor_id | loc   | max_temp | time_window         | update_at                  |
+-----------+-------+----------+---------------------+----------------------------+
|         1 | room1 |    101.5 | 2025-04-24 06:58:20 | 2025-04-24 06:58:32.379000 |
|         2 | room2 |    102.5 | 2025-04-24 06:58:20 | 2025-04-24 06:58:32.379000 |
+-----------+-------+----------+---------------------+----------------------------+
```

## 实时仪表盘

假设你需要一个条形图来显示每个状态码的包大小分布，以监控系统的健康状况。持续聚合的查询如下：

```sql
/* 创建 source 表 */
CREATE TABLE ngx_access_log (
    client STRING,
    stat INT,
    size INT,
    access_time TIMESTAMP TIME INDEX
)WITH(
  append_mode = 'true'
);
/* 创建 sink 表 */
CREATE TABLE ngx_distribution (
    stat INT,
    bucket_size INT,
    total_logs BIGINT,
    time_window TIMESTAMP TIME INDEX,
    update_at TIMESTAMP,
    PRIMARY KEY(stat, bucket_size)
);
/* 创建 flow 任务以计算每个状态码的包大小分布 */
CREATE FLOW calc_ngx_distribution SINK TO ngx_distribution
EXPIRE AFTER '6h'
AS
SELECT
    stat,
    trunc(size, -1)::INT as bucket_size,
    count(client) AS total_logs,
    date_bin('1 minutes'::INTERVAL, access_time) as time_window,
FROM
    ngx_access_log
GROUP BY
    stat,
    time_window,
    bucket_size;
```

该查询将 `ngx_access_log` 表中的数据汇总到 `ngx_distribution` 表中。
它计算每个时间窗口内的状态代码和数据包大小存储桶（存储桶大小为 10，由 `trunc` 指定，第二个参数为 -1）的日志总数。
`date_bin` 函数将数据分组为一分钟的间隔。
因此，`ngx_distribution` 表会不断更新，
提供每个状态代码的数据包大小分布的实时洞察。`EXPIRE AFTER '6h'` 使 flow 仅计算 `access_time` 列处于 `(now - 6h, now)` 时间范围内的源数据，详见 [管理 Flow](manage-flow.md#expire-after)。

现在我们已经创建了 flow 任务，可以向 source 表 `ngx_access_log` 插入一些数据：

```sql
INSERT INTO ngx_access_log VALUES
    ('cli1', 200, 100, now()),
    ('cli2', 200, 104, now()),
    ('cli3', 200, 120, now()),
    ('cli4', 200, 124, now()),
    ('cli5', 200, 140, now()),
    ('cli6', 404, 144, now()),
    ('cli7', 404, 160, now()),
    ('cli8', 404, 164, now()),
    ('cli9', 404, 180, now()),
    ('cli10', 404, 184, now());
```

等待几秒钟，让 flow 将结果更新到 sink 表：

```sql
SELECT * FROM ngx_distribution;
```

```sql
+------+-------------+------------+---------------------+----------------------------+
| stat | bucket_size | total_logs | time_window         | update_at                  |
+------+-------------+------------+---------------------+----------------------------+
|  200 |         100 |          2 | 2025-04-24 07:05:00 | 2025-04-24 07:05:56.308000 |
|  200 |         120 |          2 | 2025-04-24 07:05:00 | 2025-04-24 07:05:56.308000 |
|  200 |         140 |          1 | 2025-04-24 07:05:00 | 2025-04-24 07:05:56.308000 |
|  404 |         140 |          1 | 2025-04-24 07:05:00 | 2025-04-24 07:05:56.308000 |
|  404 |         160 |          2 | 2025-04-24 07:05:00 | 2025-04-24 07:05:56.308000 |
|  404 |         180 |          2 | 2025-04-24 07:05:00 | 2025-04-24 07:05:56.308000 |
+------+-------------+------------+---------------------+----------------------------+
6 rows in set (0.00 sec)
```

## 下一步

- [管理 Flow](manage-flow.md)：深入了解 Flow 引擎的机制和定义 Flow 的 SQL 语法。
- [表达式](expressions.md)：了解 Flow 引擎支持的数据转换表达式。
