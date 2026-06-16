---
keywords: [异常检测, 异常评分, 窗口函数, zscore, MAD, IQR, 统计函数]
description: GreptimeDB 异常检测窗口函数：Z-Score、MAD、IQR 评分。
---

# 异常检测函数

GreptimeDB 提供三个统计异常评分**窗口函数**，为窗口中的每一行计算异常分数。
使用时必须带 `OVER` 子句。

:::tip
窗口内有效（非 NULL）数据点不够时返回 `NULL`。
分数 `0.0` 表示正常；分数越大，异常程度越高。
如果离散度（stddev / MAD / IQR）为零，而当前值又偏离中心，则返回 `+inf`——统计意义上的"无穷异常"。
:::

## `anomaly_score_zscore`

基于 Z-Score 的异常评分。

**公式：** `|x − mean| / stddev`

**最少有效样本数：** 2（使用总体标准差，即除以 n）

```sql
anomaly_score_zscore(value) OVER (window_spec)
```

**参数：**

- **value**：数值列或表达式。

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

基于中位绝对偏差（MAD）的异常评分。
MAD 对极端离群值不敏感，比 Z-Score 更稳健。

**公式：** `|x − median| / (MAD × 1.4826)`

其中 1.4826 是正态分布一致性常数，保证在正态假设下 MAD 评分与 Z-Score 渐近等价。

**最少有效样本数：** 3（≤ 2 个样本时 MAD 几乎总为 0，会产生虚假的 `+inf`）

```sql
anomaly_score_mad(value) OVER (window_spec)
```

**参数：**

- **value**：数值列或表达式。

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

基于四分位距（IQR / Tukey Fences）的异常评分。
分数反映当前值超出下围栏（`Q1 − k × IQR`）或上围栏（`Q3 + k × IQR`）多远；
在围栏以内的值分数为 `0.0`。

**公式：**
- 若 `value < Q1 − k × IQR`：score = `(Q1 − k × IQR − value) / IQR`
- 若 `value > Q3 + k × IQR`：score = `(value − Q3 − k × IQR) / IQR`
- 否则：score = `0.0`

**最少有效样本数：** 3（线性插值下 Q1 ≠ Q3 至少需要 3 个点）

```sql
anomaly_score_iqr(value, k) OVER (window_spec)
```

**参数：**

- **value**：数值列或表达式。
- **k**：围栏倍数，非负 `DOUBLE`（`1.5` 为标准 Tukey 围栏，`3.0` 为远端围栏）。`k < 0` 时返回 `NULL`。

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

## 完整示例

建表、写入带离群点的时序数据，然后用三个异常函数同时打分。

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
    ('web-1', 80.0, '2025-01-01 00:04:00'),  -- 离群点
    ('web-1', 10.3, '2025-01-01 00:05:00'),
    ('web-1', 11.2, '2025-01-01 00:06:00');
```

用命名窗口让三个函数共享同一窗口，ROUND 取两位小数方便阅读：

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

输出如下，`val = 80.0` 那行三个分数都远高于其他行：

```
+---------------------+------+--------+--------+-------+
| ts                  | val  | zscore | mad    | iqr   |
+---------------------+------+--------+--------+-------+
| 2025-01-01 00:00:00 |   10 |   NULL |   NULL |  NULL |
| 2025-01-01 00:01:00 |   11 |      1 |   NULL |  NULL |
| 2025-01-01 00:02:00 | 10.5 |      0 |      0 |     0 |
| 2025-01-01 00:03:00 | 10.8 |    0.6 |    0.4 |     0 |
| 2025-01-01 00:04:00 |   80 |      2 | 155.58 | 136.5 |
| 2025-01-01 00:05:00 | 10.3 |   0.46 |   0.67 |     0 |
| 2025-01-01 00:06:00 | 11.2 |   0.38 |   0.67 |     0 |
+---------------------+------+--------+--------+-------+
```

### 过滤异常行

用子查询只留分数超过阈值的行：

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

输出：

```
+-------+---------------------+------+--------+
| host  | ts                  | val  | mad    |
+-------+---------------------+------+--------+
| web-1 | 2025-01-01 00:04:00 |   80 | 155.58 |
+-------+---------------------+------+--------+
```
