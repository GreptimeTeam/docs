---
keywords: [近似函数, 近似去重计数, 近似分位数, SQL 函数]
description: 列出和描述 GreptimeDB 中可用的近似函数，包括它们的用法和示例。
---

# 近似函数

GreptimeDB 提供近似去重计数和近似分位数函数。

:::warning
这些函数仍处于实验阶段，后续版本可能会调整。
:::

## 近似去重计数 (HLL)

GreptimeDB 使用 [HyperLogLog](https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf) (HLL) 快速计算近似去重计数，并控制内存使用。三个函数分别用于创建 sketch、合并 sketch 和读取近似计数。

:::warning
HLL 返回估计值，而非精确计数。其相对标准误差约为 `1.04 / sqrt(m)`，其中 `m` 为寄存器数量。GreptimeDB 使用 16,384 个寄存器，对应约 0.8125% 的相对标准误差。
:::

### `hll`

`hll(value)` 将每个值转换为 `STRING`，再聚合为二进制 HLL 状态。该状态可以存入 `BINARY` 列、与其他状态合并，或传给 `hll_count`。

### `hll_merge`

`hll_merge(hll_state)` 将 [`hll`](#hll) 生成的多个二进制状态聚合为一个状态，可用于合并不同分组或时间窗口的 sketch。


### `hll_count`

`hll_count(hll_state)` 从 `hll` 创建或 `hll_merge` 合并的状态中返回近似去重计数。

### 完整使用示例

以下示例按时间窗口计算近似去重用户数。

创建存储原始数据的 `access_log` 表，以及每个 10 秒窗口存储一个二进制 HLL 状态的 `access_log_10s` 表。
```sql
CREATE TABLE access_log (
    `url` STRING,
    user_id BIGINT,
    ts TIMESTAMP TIME INDEX,
    PRIMARY KEY (`url`, `user_id`)
);

CREATE TABLE access_log_10s (
    `url` STRING,
    time_window timestamp time INDEX,
    state BINARY,
    PRIMARY KEY (`url`)
);
```

将一些示例数据插入到 `access_log` 中：
```sql
INSERT INTO access_log VALUES
        ("/dashboard", 1, "2025-03-04 00:00:00"),
        ("/dashboard", 1, "2025-03-04 00:00:01"),
        ("/dashboard", 2, "2025-03-04 00:00:05"),
        ("/dashboard", 2, "2025-03-04 00:00:10"),
        ("/dashboard", 2, "2025-03-04 00:00:13"),
        ("/dashboard", 4, "2025-03-04 00:00:15"),
        ("/not_found", 1, "2025-03-04 00:00:10"),
        ("/not_found", 3, "2025-03-04 00:00:11"),
        ("/not_found", 4, "2025-03-04 00:00:12");
```

将数据按 10 秒窗口分组，并为每个 URL 和窗口存储一个 HLL 状态：
```sql
-- 使用 10 秒窗口查询来计算 HyperLogLog 状态：
INSERT INTO
    access_log_10s
SELECT
    `url`,
    date_bin("10s" :: INTERVAL, ts) AS time_window,
    hll(`user_id`) AS state
FROM
    access_log
GROUP BY
    `url`,
    time_window;
-- 结果类似：
-- Query OK, 3 rows affected (0.05 sec)
```
从每个已存储的状态中读取近似去重计数：
```sql
-- 使用 `hll_count` 查询 `access_log_10s` 中的近似数据，请注意对于小型数据集，结果可能不是很准确。
SELECT `url`, `time_window`, hll_count(state) FROM access_log_10s;

-- 结果如下：
-- +------------+---------------------+---------------------------------+
-- | url        | time_window         | hll_count(access_log_10s.state) |
-- +------------+---------------------+---------------------------------+
-- | /dashboard | 2025-03-04 00:00:00 |                               2 |
-- | /dashboard | 2025-03-04 00:00:10 |                               2 |
-- | /not_found | 2025-03-04 00:00:10 |                               3 |
-- +------------+---------------------+---------------------------------+
```

合并 10 秒窗口的状态，计算每个 1 分钟窗口的近似去重计数。把已存储状态聚合为更大的时间窗口可用于趋势分析：
```sql
-- 使用 `hll_merge` 合并 HyperLogLog 状态，将 10 秒的数据聚合到 1 分钟级别。
SELECT
    `url`,
    date_bin('1 minute' :: INTERVAL, `time_window`) AS time_window_1m,
    hll_count(hll_merge(state)) as uv_per_min
FROM
    access_log_10s
GROUP BY
    `url`,
    date_bin('1 minute' :: INTERVAL, `time_window`);

-- 结果如下：
-- +------------+---------------------+------------+
-- | url        | time_window_1m      | uv_per_min |
-- +------------+---------------------+------------+
-- | /dashboard | 2025-03-04 00:00:00 |          3 |
-- | /not_found | 2025-03-04 00:00:00 |          3 |
-- +------------+---------------------+------------+
```

`hll_merge` 仍返回二进制状态，需要再使用 `hll_count` 读取估计值。

下图展示状态创建、计数和合并操作：
![HLL 用例流程图](/hll.svg)

## 近似分位数（UDDSketch）

GreptimeDB 使用 [UDDSketch](https://arxiv.org/abs/2004.08604) 实现 sketch 状态的创建、合并和查询。

:::warning
UDDSketch 可以在有限内存中快速计算近似分位数。内存使用和误差取决于 `bucket_num`、`error_rate` 和输入值范围，详见下文。
:::

### `uddsketch_state`

`uddsketch_state(bucket_num, error_rate, value)` 将 `DOUBLE` 值聚合为二进制状态。

- `bucket_num`：sketch 的最大 bucket 数量。
- `error_rate`：初始相对误差上限。
- `value`：要聚合的 `DOUBLE` 表达式。

该状态可以存入 `BINARY` 列、使用 `uddsketch_merge` 合并，或使用 `uddsketch_calc` 查询。

### `uddsketch_merge`

`uddsketch_merge(bucket_num, error_rate, udd_state)` 将多个二进制 UDDSketch 状态聚合为一个状态。`bucket_num` 和 `error_rate` 必须与创建输入状态时的参数一致。


### `uddsketch_calc`
  
`uddsketch_calc(quantile, udd_state)` 从 `uddsketch_state` 创建或 `uddsketch_merge` 合并的状态中返回分位数估计值。

- `quantile`：取值范围为 0 到 1；例如 `0.99` 表示第 99 百分位数。
- `udd_state`：二进制 UDDSketch 状态。

有关如何结合使用这些函数来计算近似分位数的完整示例，请参阅[UDDSketch 完整使用示例](#uddsketch-完整使用示例)。

### 如何确定桶数量和误差率

`bucket_num` 参数设置内部 bucket 的最大数量，从而限制 sketch 的内存使用。值越大，在触发 compaction 前可表示的最小值与最大值比例越大。达到上限后，sketch 会合并数值范围一端的 bucket，精度随之下降。推荐值为 `128`，对大多数工作负载可以兼顾准确性和内存使用。

`error_rate` 设置将数值映射到桶时使用的初始相对误差上限。值越小，桶的粒度越细。如果数据范围需要的桶数超过 `bucket_num`，UDDSketch 会压缩桶，并提高实际最大误差。因此，`error_rate` 为 `0.01` 并不保证每个结果始终与精确值相差 1% 以内。

这两个参数用于权衡内存与准确性。较小的 `error_rate` 需要足够多的桶来覆盖数据的动态范围。如果 `bucket_num` 过小，继续减小 `error_rate` 无法避免桶压缩及最大误差上升。

### UDDSketch 完整使用示例
本示例演示了如何使用上述三个 `uddsketch` 函数来计算一组值的近似分位数。

首先创建用于存储原始数据的基表 `percentile_base`，以及用于存储 5 秒时间窗口内 UDDSketch 状态的 `percentile_5s` 表。请注意，`percentile_state` 列的类型为 `BINARY`，它将以二进制格式存储 UDDSketch 状态。
```sql
CREATE TABLE percentile_base (
    `id` INT PRIMARY KEY,
    `value` DOUBLE,
    `ts` timestamp(0) time index
);

CREATE TABLE percentile_5s (
    `percentile_state` BINARY,
    `time_window` timestamp(0) time index
);
```

向 `percentile_base` 插入一些示例数据：
```sql
INSERT INTO percentile_base (`id`, `value`, `ts`) VALUES
    (1, 10.0, 1),
    (2, 20.0, 2),
    (3, 30.0, 3),
    (4, 40.0, 4),
    (5, 50.0, 5),
    (6, 60.0, 6),
    (7, 70.0, 7),
    (8, 80.0, 8),
    (9, 90.0, 9),
    (10, 100.0, 10);
```

将数据按 5 秒窗口分组，并为每个窗口存储一个 UDDSketch 状态：

```sql
INSERT INTO
    percentile_5s
SELECT
    uddsketch_state(128, 0.01, `value`) AS percentile_state,
    date_bin('5 seconds' :: INTERVAL, `ts`) AS time_window
FROM
    percentile_base
GROUP BY
    time_window;
-- 结果类似：
-- Query OK, 3 rows affected (0.05 sec)
```

计算每个已存储状态的 p99：
```sql
-- 查询 percentile_5s 以获取近似第 99 百分位数
SELECT
    time_window,
    uddsketch_calc(0.99, `percentile_state`) AS p99
FROM
    percentile_5s;

-- 结果如下：
-- +---------------------+--------------------+
-- | time_window         | p99                |
-- +---------------------+--------------------+
-- | 1970-01-01 00:00:00 |  40.04777053326359 |
-- | 1970-01-01 00:00:05 |  89.13032933635911 |
-- | 1970-01-01 00:00:10 | 100.49456770856492 |
-- +---------------------+--------------------+
```
合并 5 秒窗口的状态，计算每个 1 分钟窗口的 p99。把已存储状态聚合为更大的时间窗口可用于趋势分析：
```sql
-- 此外，我们可以通过使用 `uddsketch_merge` 合并 UDDSketch 状态，将 5 秒的数据聚合到 1 分钟级别。
SELECT
    date_bin('1 minute' :: INTERVAL, `time_window`) AS time_window_1m,
    uddsketch_calc(0.99, uddsketch_merge(128, 0.01, `percentile_state`)) AS p99
FROM
    percentile_5s
GROUP BY
    time_window_1m;

-- 结果如下：
-- +---------------------+--------------------+
-- | time_window_1m      | p99                |
-- +---------------------+--------------------+
-- | 1970-01-01 00:00:00 | 100.49456770856492 |
-- +---------------------+--------------------+
```
下图展示状态创建、分位数计算和合并操作：
![UDDSketch 用例流程图](/udd.svg)
