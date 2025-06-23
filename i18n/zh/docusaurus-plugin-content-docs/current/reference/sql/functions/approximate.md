---
keywords: [近似函数, 近似去重计数, 近似分位数, SQL 函数]
description: 列出和描述 GreptimeDB 中可用的近似函数，包括它们的用法和示例。
---

# 近似函数

本页面列出了 GreptimeDB 中的近似函数，这些函数用于近似数据分析。

:::warning
下述的近似函数目前仍处于实验阶段，可能会在未来的版本中发生变化。
:::

## 近似去重计数 (HLL)

这里使用了 [HyperLogLog](https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf) (HLL) 算法来计算一组值的近似去重计数。它在内存使用和速度方面提供了高效的性能。GreptimeDB 提供了三个函数来处理 HLL 算法，具体描述如下：

:::warning
由于算法的近似性质，结果可能不完全精确，但通常非常接近实际的去重计数。HyperLogLog 算法的相对标准误差约为 1.04/√m，其中 m 是算法中使用的寄存器数量。GreptimeDB 默认使用 16384 个寄存器，这使得相对标准误差约为 0.008125（即 0.8125%）。
:::

### `hll`

`hll(value)` 从给定列创建二进制的 HyperLogLog 状态。`value` 可以是你希望计算近似去重计数的任何列。它返回 HLL 状态的二进制表示，可以存储在表中或用于进一步计算。有关如何结合其他函数使用此函数计算近似去重计数的完整示例，请参阅 [完整使用示例](#完整使用示例)。

### `hll_merge`

`hll_merge(hll_state)` 将多个 HyperLogLog 状态合并为一个。当你需要合并多个 HLL 计算结果时，例如聚合来自不同时间窗口或来源的数据时，这非常有用。`hll_state` 参数是由 [`hll`](#hll) 创建的 HLL 状态的二进制表示。合并后的状态可用于计算所有合并状态的近似去重计数。有关如何结合其他函数使用此函数计算近似去重计数的完整示例，请参阅 [完整使用示例](#完整使用示例)。


### `hll_count`

`hll_count(hll_state)` 从 HyperLogLog 状态中计算得到近似去重计数的结果。此函数接受由 `hll` 创建或由 `hll_merge` 合并的 HLL 状态，并返回近似的去重值计数。有关如何结合其他函数使用此函数计算近似去重计数的完整示例，请参阅 [完整使用示例](#完整使用示例)。

### 完整使用示例

此示例演示了如何组合使用这些函数来计算近似的去重的用户 ID 的数量。

首先创建用于存储用户访问日志的基础表 `access_log`，以及用于在 10 秒时间窗口内存储 HyperLogLog 状态的 `access_log_10s` 表。请注意，`state` 列的类型为 `BINARY`，它将以二进制格式存储 HyperLogLog 状态。
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

现在我们可以使用 `hll` 函数为 `user_id` 列创建 10 秒时间窗口的 HyperLogLog 状态。输出将是 HLL 状态的二进制表示，其中包含计算后续近似去重计数所需的信息。`date_bin` 函数用于将数据分组到 10 秒的时间窗口中。因此，此 `INSERT INTO` 语句将为 `access_log` 表中每个 10 秒时间窗口创建 HyperLogLog 状态，并将其插入到 `access_log_10s` 表中：
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
然后我们可以使用 `hll_count` 函数从 HyperLogLog 状态（即 `state` 列）中检索近似去重计数。例如，要获取每个 10 秒时间窗口的用户访问近似去重计数，我们可以运行以下查询：
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

此外，我们可以通过使用 `hll_merge` 合并 HyperLogLog 状态，将 10 秒的数据聚合到 1 分钟级别。这使我们能够计算更大时间窗口的近似去重计数，这对于分析随时间变化的趋势非常有用。以下查询演示了如何实现：
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

请注意 `hll_merge` 函数如何用于合并 `access_log_10s` 表中的 HyperLogLog 状态，然后 `hll_count` 函数用于计算每个 1 分钟时间窗口的近似去重计数。如果只使用 `hll_merge` 而不使用 `hll_count`，结果将只是合并后的 HyperLogLog 状态的不可读二进制表示，这对于分析没有太大用处。因此，我们使用 `hll_count` 从合并后的状态中计算得到近似去重计数。

以下流程图说明了 HyperLogLog 函数的上述用法。首先，原始事件数据按时间窗口和 URL 分组，然后使用 `hll` 函数为每个时间窗口和 URL 创建一个 HyperLogLog 状态，接着使用 `hll_count` 函数检索每个时间窗口和 URL 的近似去重计数。最后，使用 `hll_merge` 函数合并每个 URL 的 HyperLogLog 状态，然后再次使用 `hll_count` 函数检索 1 分钟时间窗口的近似去重计数。
![HLL 用例流程图](/hll.svg)

## 近似分位数（UDDSketch）

使用 [UDDSketch](https://arxiv.org/abs/2004.08604) 算法提供了三个函数用于近似分位数计算。

:::warning
UDDSketch 算法旨在提供具有可调误差率的近似分位数，这有助于实现高效的内存使用和快速计算。结果可能并非完全精确，但通常非常接近实际分位数。
:::

### `uddsketch_state`

`uddsketch_state` 函数用于从给定列创建二进制格式的 UDDSketch 状态。它接受三个参数：
- `bucket_num`：用于记录分位数信息的桶数量。关于如何确定该值，请参阅[如何确定桶数量和误差率](#如何确定桶数量和误差率)。
- `error_rate`：分位数计算所需的误差率。
- `value`：用于计算分位数的列。

例如，对于下述表 `percentile_base`，我们可以为 `value` 列创建一个 `uddsketch_state`，其中桶数量为 128，误差率为 0.01 (1%)。输出将是 UDDSketch 状态的二进制表示，其中包含后续计算近似分位数所需的信息。

该输出的二进制状态可被视为 `value` 列中值的直方图，后续可使用 `uddsketch_merge` 进行合并，或使用 `uddsketch_calc` 计算分位数。有关如何结合使用这些函数来计算近似分位数的完整示例，请参阅[UDDSketch 完整使用示例](#uddsketch-完整使用示例)。

### `uddsketch_merge`

`uddsketch_merge` 函数用于将多个 UDDSketch 状态合并为一个。它接受三个参数：
- `bucket_num`：用于记录分位数信息的桶数量。关于如何确定该值，请参阅[如何确定桶数量和误差率](#如何确定桶数量和误差率)。
- `error_rate`：分位数计算所需的误差率。
- `udd_state`：由 `uddsketch_state` 创建的 UDDSketch 状态的二进制表示。

当你需要合并来自不同时间窗口或来源的结果时，此函数非常有用。请注意，`bucket_num` 和 `error_rate` 必须与创建原始状态时使用的参数匹配，否则合并将失败。

例如，如果你有来自不同时间窗口的多个 UDDSketch 状态，你可以将它们合并为一个状态，以计算所有数据的整体分位数。该输出的二进制状态随后可用于使用 `uddsketch_calc` 计算分位数。有关如何结合使用这些函数来计算近似分位数的完整示例，请参阅[UDDSketch 完整使用示例](#uddsketch-完整使用示例)。


### `uddsketch_calc`
  
`uddsketch_calc` 函数用于从 UDDSketch 状态计算近似分位数。它接受两个参数：
- `quantile`：一个介于 0 和 1 之间的值，表示要计算的目标分位数，例如，0.99 代表第 99 百分位数。
- `udd_state`：由 `uddsketch_state` 创建或由 `uddsketch_merge` 合并的 UDDSketch 状态的二进制表示。

有关如何结合使用这些函数来计算近似分位数的完整示例，请参阅[UDDSketch 完整使用示例](#uddsketch-完整使用示例)。

### 如何确定桶数量和误差率

`bucket_num` 参数设置了 UDDSketch 算法可使用的内部容器的最大数量，直接控制其内存占用。可以将其视为跟踪不同值范围的物理存储容量。更大的 `bucket_num` 允许 UddSketch 状态更准确地表示更宽的数据动态范围（即最大值和最小值之间更大的比率）。如果此限制对于你的数据而言过小，UddSketch 状态将被迫合并非常高或非常低的值，从而降低其准确性。对于大多数用例，`bucket_num` 的推荐值为 128，这在准确性和内存使用之间提供了良好的平衡。

`error_rate` 定义了分位数计算所需的精度。它保证任何计算出的分位数（例如 p99）都在真实值的某个*相对*百分比范围内。例如，`error_rate` 为 `0.01` 确保结果在实际值的 1% 以内。较小的 `error_rate` 提供更高的准确性，因为它强制 UDDSketch 算法使用更细粒度的桶来区分更接近的数字。

这两个参数之间存在直接的权衡关系。为了达到小 `error_rate` 所承诺的高精度，UDDSketch 算法需要足够的 `bucket_num`，特别是对于跨度较大的数据。`bucket_num` 充当了精度的物理限制。如果你的 `bucket_num` 受到内存限制，那么将 `error_rate` 设置为极小值并不会提高精度，因为受到可用桶数量的限制。

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

现在我们可以使用 `uddsketch_state` 函数为 `value` 列创建一个 UDDSketch 状态，其中桶数量为 128，误差率为 0.01 (1%)。输出将是 UDDSketch 状态的二进制表示，其中包含后续计算近似分位数所需的信息。`date_bin` 函数用于将数据分到 5 秒的时间窗口中。因此，此 `INSERT INTO` 语句将为 `percentile_base` 表中每个 5 秒时间窗口创建 UDDSketch 状态，并将其插入到 `percentile_5s` 表中：

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

现在我们可以使用 `uddsketch_calc` 函数从 UDDSketch 状态中计算近似分位数。例如，要获取每个 5 秒时间窗口的近似第 99 百分位数 (p99)，我们可以运行以下查询：
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
请注意，在上述查询中，`percentile_state` 列是由 `uddsketch_state` 创建的 UDDSketch 状态。

此外，我们可以通过使用 `uddsketch_merge` 合并 UDDSketch 状态，将 5 秒的数据聚合到 1 分钟级别。这使我们能够计算更大时间窗口的近似分位数，这对于分析随时间变化的趋势非常有用。以下查询演示了如何实现：
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
请注意 `uddsketch_merge` 函数是如何用于合并 `percentile_5s` 表中的 UDDSketch 状态，然后 `uddsketch_calc` 函数用于计算每个 1 分钟时间窗口的近似第 99 百分位数 (p99)。

以下流程图说明了 UDDSketch 函数的上述用法。首先，原始事件数据按时间窗口分组，然后使用 `uddsketch_state` 函数为每个时间窗口创建一个 UDDSketch 状态，接着使用 `uddsketch_calc` 函数检索每个时间窗口的近似第 99 分位数。最后，使用 `uddsketch_merge` 函数合并每个时间窗口的 UDDSketch 状态，然后再次使用 `uddsketch_calc` 函数检索 1 分钟时间窗口的近似第 99 分位数。
![UDDSketch 用例流程图](/udd.svg)
