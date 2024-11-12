# 概述

GreptimeDB 提供了一个持续聚合功能，允许你实时聚合数据。这个功能在当你需要实时计算和查询总和、平均值或其他聚合时非常有用。持续聚合功能由 Flow 引擎提供。它不断地基于传入的数据更新聚合数据并将其实现。因此，你可以将其视为一个聪明的物化视图，它知道何时更新结果视图表以及如何以最小的努力更新它。一些常见的用例包括：

- 下采样数据点，使用如平均池化等方法减少存储和分析的数据量
- 提供近实时分析，提供可操作的信息


当你将数据插入 source 表时，数据也会被发送到 Flow 引擎并存储在其中。
Flow 引擎通过时间窗口计算聚合并将结果存储在目标表中。
整个过程如下图所示：

![Continuous Aggregation](/flow-ani.svg)

## 快速开始示例

以下是持续聚合查询的一个完整示例。


这个例子是根据输入表中的数据计算一系列统计数据，包括一分钟时间窗口内的总日志数、最小大小、最大大小、平均大小以及大小大于 550 的数据包数。

首先，创建一个 source 表 `ngx_access_log` 和一个 sink 表 `ngx_statistics`，如下所示：

```sql
CREATE TABLE `ngx_access_log` (
  `client` STRING NULL,
  `ua_platform` STRING NULL,
  `referer` STRING NULL,
  `method` STRING NULL,
  `endpoint` STRING NULL,
  `trace_id` STRING NULL FULLTEXT,
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

```sql
CREATE FLOW ngx_aggregation
SINK TO ngx_statistics
AS
SELECT
    status,
    count(client) AS total_logs,
    min(size) as min_size,
    max(size) as max_size,
    avg(size) as avg_size,
    sum(case when `size` > 550 then 1 else 0 end) as high_size_count,
    date_bin(INTERVAL '1 minutes', access_time) as time_window,
FROM ngx_access_log
GROUP BY
    status,
    time_window;
```

要检查持续聚合是否正常工作，首先插入一些数据到源表 `ngx_access_log` 中。

```sql
INSERT INTO ngx_access_log 
VALUES
    ("android", "Android", "referer", "GET", "/api/v1", "trace_id", "HTTP", 200, 1000, "agent", "2021-07-01 00:00:01.000"),
    ("ios", "iOS", "referer", "GET", "/api/v1", "trace_id", "HTTP", 200, 500, "agent", "2021-07-01 00:00:30.500"),
    ("android", "Android", "referer", "GET", "/api/v1", "trace_id", "HTTP", 200, 600, "agent", "2021-07-01 00:01:01.000"),
    ("ios", "iOS", "referer", "GET", "/api/v1", "trace_id", "HTTP", 404, 700, "agent", "2021-07-01 00:01:01.500");
```

则 `ngx_access_log` 表将被增量更新以包含以下数据：

```sql
SELECT * FROM ngx_statistics;
```

```sql
 status | total_logs | min_size | max_size | avg_size | high_size_count |        time_window         |         update_at          
--------+------------+----------+----------+----------+-----------------+----------------------------+----------------------------
    200 |          2 |      500 |     1000 |      750 |               1 | 2021-07-01 00:00:00.000000 | 2024-07-24 08:36:17.439000
    200 |          1 |      600 |      600 |      600 |               1 | 2021-07-01 00:01:00.000000 | 2024-07-24 08:36:17.439000
    404 |          1 |      700 |      700 |      700 |               1 | 2021-07-01 00:01:00.000000 | 2024-07-24 08:36:17.439000
(3 rows)
```

尝试向 `ngx_access_log` 表中插入更多数据：

```sql
INSERT INTO ngx_access_log
VALUES
    ("android", "Android", "referer", "GET", "/api/v1", "trace_id", "HTTP", 200, 500, "agent", "2021-07-01 00:01:01.000"),
    ("ios", "iOS", "referer", "GET", "/api/v1", "trace_id", "HTTP", 404, 800, "agent", "2021-07-01 00:01:01.500");
```

结果表 `ngx_statistics` 将被增量更新，注意 `max_size`、`avg_size` 和 `high_size_count` 是如何更新的：

```sql
SELECT * FROM ngx_statistics;
```

```sql
 status | total_logs | min_size | max_size | avg_size | high_size_count |        time_window         |         update_at          
--------+------------+----------+----------+----------+-----------------+----------------------------+----------------------------
    200 |          2 |      500 |     1000 |      750 |               1 | 2021-07-01 00:00:00.000000 | 2024-07-24 08:36:17.439000
    200 |          2 |      500 |      600 |      550 |               1 | 2021-07-01 00:01:00.000000 | 2024-07-24 08:36:46.495000
    404 |          2 |      700 |      800 |      750 |               2 | 2021-07-01 00:01:00.000000 | 2024-07-24 08:36:46.495000
(3 rows)
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

## 下一步

恭喜你已经初步了解了持续聚合功能。
请参考以下章节了解更多：


- [用例](./usecase-example.md) 提供了更多关于如何在实时分析、监控和仪表板中使用持续聚合的示例。
- [管理 Flow](./manage-flow.md) 描述了如何创建、更新和删除 flow。你的每个持续聚合查询都是一个 flow。
- [编写查询语句](./query.md) 描述了如何编写持续聚合查询。
- [定义时间窗口](./define-time-window.md) 描述了如何为持续聚合定义时间窗口。时间窗口是持续聚合查询的一个重要属性，它定义了聚合的时间间隔。
- [表达式](./expression.md) 是持续聚合查询中可用表达式。
