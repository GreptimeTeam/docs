---
keywords: [异常检测, 异常评分, 窗口函数, zscore, MAD, IQR, 统计函数]
description: 列出并介绍 GreptimeDB 中可用的异常检测窗口函数，包括 Z-Score、MAD 和 IQR 评分。
---

# 异常检测函数

GreptimeDB 提供一组基于统计学的异常评分**窗口函数**，用于计算每行相对于其窗口内数据的异常程度。
这三个函数都必须搭配 `OVER` 子句（窗口函数语法）使用。

:::tip
当窗口内有效（非 NULL）数据点不足时，这些函数返回 `NULL`。
评分为 `0.0` 表示该值无异常；评分越高表示异常程度越强。
若统计离散度（stddev / MAD / IQR）为零但当前值偏离窗口中心，则返回 `+inf`，表示该偏差在统计上无限异常。
:::

## `anomaly_score_zscore`

对窗口内的每一行计算基于 Z-Score 的异常评分。

**公式：** `|x − mean| / stddev`

**最少有效样本数：** 2（与 `STDDEV_SAMP` 保持一致）

```sql
anomaly_score_zscore(value) OVER (window_spec)
```

**参数：**

- **value**：要评估的数值列或表达式。

**返回类型：** `DOUBLE`

**退化情况：**

| 条件 | 结果 |
|---|---|
| 窗口内有效点少于 2 | `NULL` |
| `stddev = 0` 且 `value = mean` | `0.0` |
| `stddev = 0` 且 `value ≠ mean` | `+inf` |
| 正常情况 | 有限正数 `DOUBLE` |

**示例：**

```sql
SELECT
    ts,
    val,
    anomaly_score_zscore(val) OVER (
        ORDER BY ts
        ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ) AS zscore
FROM metrics
ORDER BY ts;
```

## `anomaly_score_mad`

对窗口内的每一行计算基于中位绝对偏差（MAD）的异常评分。
MAD 比 Z-Score 更鲁棒，因为它不受极端异常值的影响。

**公式：** `|x − median| / (MAD × 1.4826)`

常数 1.4826 是一致性因子，使得 MAD 评分在数据服从正态分布时渐近等价于 Z-Score。

**最少有效样本数：** 3（样本数 ≤ 2 时，MAD 几乎总为 0，会产生虚假的 `+inf` 评分）

```sql
anomaly_score_mad(value) OVER (window_spec)
```

**参数：**

- **value**：要评估的数值列或表达式。

**返回类型：** `DOUBLE`

**退化情况：**

| 条件 | 结果 |
|---|---|
| 窗口内有效点少于 3 | `NULL` |
| `MAD = 0` 且 `value = median` | `0.0` |
| `MAD = 0` 且 `value ≠ median` | `+inf` |
| 正常情况 | 有限正数 `DOUBLE` |

**示例：**

```sql
SELECT
    ts,
    val,
    anomaly_score_mad(val) OVER (
        PARTITION BY host
        ORDER BY ts
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS mad_score
FROM metrics
ORDER BY host, ts;
```

## `anomaly_score_iqr`

对窗口内的每一行计算基于四分位距（IQR / Tukey Fences）的异常评分。
评分衡量当前值超出下围栏（`Q1 − k × IQR`）或上围栏（`Q3 + k × IQR`）的距离。
落在围栏范围内的值评分为 `0.0`。

**公式：**
- 若 `value < Q1 − k × IQR`：score = `(Q1 − k × IQR − value) / IQR`
- 若 `value > Q3 + k × IQR`：score = `(value − Q3 − k × IQR) / IQR`
- 否则：score = `0.0`

**最少有效样本数：** 3（线性插值的 Q1 ≠ Q3 仅在 n ≥ 3 时才可能成立）

```sql
anomaly_score_iqr(value, k) OVER (window_spec)
```

**参数：**

- **value**：要评估的数值列或表达式。
- **k**：IQR 围栏的正数 `DOUBLE` 倍数（例如 `1.5` 表示标准 Tukey 围栏，`3.0` 表示远端围栏）。

**返回类型：** `DOUBLE`

**退化情况：**

| 条件 | 结果 |
|---|---|
| 窗口内有效点少于 3 | `NULL` |
| `IQR = 0` 且值在围栏内 | `0.0` |
| `IQR = 0` 且值在围栏外 | `+inf` |
| 正常情况 | 有限非负 `DOUBLE` |

**示例：**

```sql
SELECT
    ts,
    val,
    anomaly_score_iqr(val, 1.5) OVER (
        PARTITION BY host
        ORDER BY ts
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS iqr_score
FROM metrics
ORDER BY host, ts;
```

## 完整使用示例

下面的示例创建一张示例表，插入包含一个人为注入的异常点的时序数据，然后同时使用三个异常检测函数。

```sql
CREATE TABLE sensor_data (
    host   STRING,
    val    DOUBLE,
    ts     TIMESTAMP TIME INDEX,
    PRIMARY KEY (host)
);

INSERT INTO sensor_data VALUES
    ('web-1', 10.0, '2025-01-01 00:00:00'),
    ('web-1', 11.0, '2025-01-01 00:01:00'),
    ('web-1', 10.5, '2025-01-01 00:02:00'),
    ('web-1', 10.8, '2025-01-01 00:03:00'),
    ('web-1', 80.0, '2025-01-01 00:04:00'),  -- 异常点
    ('web-1', 10.3, '2025-01-01 00:05:00'),
    ('web-1', 11.2, '2025-01-01 00:06:00');
```

使用命名窗口共享同一窗口定义，并对结果进行四舍五入以提高可读性：

```sql
SELECT
    ts,
    val,
    ROUND(anomaly_score_zscore(val) OVER w, 2) AS zscore,
    ROUND(anomaly_score_mad(val)    OVER w, 2) AS mad,
    ROUND(anomaly_score_iqr(val, 1.5) OVER w, 2) AS iqr
FROM sensor_data
WINDOW w AS (
    PARTITION BY host
    ORDER BY ts
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
)
ORDER BY ts;
```

异常行（`val = 80.0`）的三个指标得分都会明显偏高。

### 过滤异常行

可以将窗口查询包装在子查询中，仅保留评分超过阈值的行：

```sql
SELECT * FROM (
    SELECT
        host,
        ts,
        val,
        ROUND(anomaly_score_mad(val) OVER (
            PARTITION BY host
            ORDER BY ts
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ), 2) AS mad
    FROM sensor_data
) WHERE mad > 3.0
ORDER BY host, ts;
```
