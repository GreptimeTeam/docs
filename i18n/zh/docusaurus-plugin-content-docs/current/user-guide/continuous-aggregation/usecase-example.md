# 用例
持续聚合的三个主要用例示例如下：

1. **实时分析**：一个实时分析平台，不断聚合来自事件流的数据，提供即时洞察，同时可选择将数据降采样到较低分辨率。例如，此系统可以编译来自高频日志事件流（例如，每毫秒发生一次）的数据，以提供每分钟的请求数、平均响应时间和每分钟的错误率等最新洞察。

2. **实时监控**：一个实时监控系统，不断聚合来自事件流的数据，根据聚合数据提供实时警报。例如，此系统可以处理来自传感器事件流的数据，以提供当温度超过某个阈值时的实时警报。

3. **实时仪表盘**：一个实时仪表盘，显示每分钟的请求数、平均响应时间和每分钟的错误数。此仪表板可用于监控系统的健康状况，并检测系统中的任何异常。

在所有这些用例中，持续聚合系统不断聚合来自事件流的数据，并根据聚合数据提供实时洞察和警报。系统还可以将数据降采样到较低分辨率，以减少存储和处理的数据量。这使得系统能够提供实时洞察和警报，同时保持较低的数据存储和处理成本。

## 实时分析示例

请参阅[概述](overview.md)中的实时分析示例。该示例用于计算日志的总数、包大小的最小、最大和平均值，以及大小大于 550 的数据包数量按照每个状态码在 1 分钟固定窗口中的实时分析。

另外，您还可以使用持续聚合来计算其他类型的实时分析。例如，要从 `ngx_access_log` 表中获取所有不同的国家。持续聚合的查询如下：

```sql
-- input table
CREATE TABLE ngx_access_log (
    client STRING,
    country STRING,
    access_time TIMESTAMP TIME INDEX
);
-- create flow task to calculate the distinct country
CREATE FLOW calc_ngx_country
SINK TO ngx_country
AS
SELECT
    DISTINCT country,
FROM ngx_access_log;
```

或者，如果您想要按时间窗口对数据进行分组，可以使用以下查询：

```sql
CREATE FLOW calc_ngx_country
SINK TO ngx_country
AS
SELECT
    DISTINCT country,
    date_bin(INTERVAL '1 hour', access_time) as time_window,
FROM ngx_access_log
GROUP BY
    country,
    time_window;
```

上述的查询将 `ngx_access_log` 表中的数据放入 `ngx_country` 表中。它计算每个时间窗口的不同国家。`date_bin` 函数用于将数据分组为一小时的间隔。`ngx_country` 表将不断更新聚合数据，提供实时洞察，显示正在访问系统的不同国家。

请注意，目前没有持久存储用于 flow 的内部状态（但是表数据有持久存储），因此建议使用适当的时间窗口来最小化数据丢失，因为如果内部状态丢失，相关时间窗口数据也将丢失。

## 实时监控示例

假设您希望实时监控一个来自温度传感器网络的传感器事件流。传感器事件包含传感器 ID、温度读数、读数的时间戳和传感器的位置等信息。您希望不断聚合这些数据，以在温度超过某个阈值时提供实时警报。那么持续聚合的查询将是：

```sql
CREATE TABLE temp_sensor_data (
    sensor_id INT,
    loc STRING,
    temperature DOUBLE,
    ts TIMESTAMP TIME INDEX
);

CREATE FLOW temp_monitoring
SINK TO temp_alerts
AS
SELECT
    sensor_id,
    loc,
    max(temperature) as max_temp,
FROM temp_sensor_data
GROUP BY
    sensor_id,
    loc
HAVING max_temp > 100;
```

上述的查询将从 `temp_sensor_data` 表中不断聚合数据到 `temp_alerts` 表中。它计算每个传感器和位置的最高温度读数，并过滤出最高温度超过 100 度的数据。`temp_alerts` 表将不断更新聚合数据，并且当温度超过阈值时提供实时警报（即 `temp_alerts` 表中的新行）。

## 实时仪表盘示例

假设您需要一个柱状图显示每个状态码的数据包大小分布，以监控系统的健康状况。持续聚合的查询将是：

```sql
-- create input table
CREATE TABLE ngx_access_log (
    client STRING,
    stat INT,
    size INT,
    access_time TIMESTAMP TIME INDEX
);
-- create output table
CREATE TABLE ngx_distribution (
    stat INT,
    bucket_size INT,
    total_logs BIGINT,
    time_window TIMESTAMP TIME INDEX,
    update_at TIMESTAMP, -- auto generated column to store the last update time
    PRIMARY KEY(stat, bucket_size)
);
-- create flow task to calculate the distribution of packet sizes for each status code
CREATE FLOW calc_ngx_distribution SINK TO ngx_distribution AS
SELECT
    stat,
    trunc(size, -1)::INT as bucket_size,
    count(client) AS total_logs,
    date_bin(INTERVAL '1 minutes', access_time) as time_window,
FROM
    ngx_access_log
GROUP BY
    stat,
    time_window,
    bucket_size;
```

上述查询将从 `ngx_access_log` 表中的数据放入 `ngx_distribution` 表中。它计算每个状态码的数据包大小分布，并将数据分组到每个时间窗口中。`ngx_distribution` 表将不断更新聚合数据，提供实时洞察，显示每个状态码的数据包大小分布。

## 结论

持续聚合是实时分析、监控和仪表盘的强大工具。它允许您不断聚合来自事件流的数据，并根据聚合数据提供实时洞察和警报。通过将数据降采样到较低分辨率，您可以减少存储和处理的数据量，从而更容易提供实时洞察和警报，同时保持较低的数据存储和处理成本。持续聚合是任何实时数据处理系统的关键组件，可以在各种用例中使用，以提供基于流数据的实时洞察和警报。