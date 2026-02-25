---
keywords: [anomaly detection, anomaly score, window functions, zscore, MAD, IQR, statistical functions]
description: Lists and describes the anomaly detection window functions available in GreptimeDB, including Z-Score, MAD, and IQR-based scoring.
---

# Anomaly Detection Functions

GreptimeDB provides a set of statistical anomaly-scoring **window functions** that compute a numeric score reflecting how anomalous each row is relative to its window of values.
All three functions must be used with an `OVER` clause (window function syntax).

:::tip
These functions return `NULL` when the window does not contain enough valid (non-NULL) data points.
A score of `0.0` means the value is not anomalous; a larger value indicates a stronger anomaly.
When the spread (stddev / MAD / IQR) is zero but the current value deviates from the window center, the returned score is `+inf`, meaning the deviation is infinitely anomalous.
:::

## `anomaly_score_zscore`

Computes a Z-Score-based anomaly score for each row in a window.

**Formula:** `|x − mean| / stddev`

**Minimum valid samples:** 2 (aligned with `STDDEV_SAMP`)

```sql
anomaly_score_zscore(value) OVER (window_spec)
```

**Arguments:**

- **value**: A numeric column or expression to evaluate.

**Return type:** `DOUBLE`

**Degenerate cases:**

| Condition | Result |
|---|---|
| Fewer than 2 valid points in window | `NULL` |
| `stddev = 0` and `value = mean` | `0.0` |
| `stddev = 0` and `value ≠ mean` | `+inf` |
| Normal case | Finite positive `DOUBLE` |

**Example:**

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

Computes a Median Absolute Deviation (MAD)-based anomaly score for each row in a window.
MAD is more robust than Z-Score because it is not influenced by extreme outliers.

**Formula:** `|x − median| / (MAD × 1.4826)`

The constant 1.4826 is a consistency factor that makes the MAD-based score asymptotically equivalent to the Z-Score for normally distributed data.

**Minimum valid samples:** 3 (with ≤ 2 samples, MAD is almost always 0, which yields spurious `+inf` scores)

```sql
anomaly_score_mad(value) OVER (window_spec)
```

**Arguments:**

- **value**: A numeric column or expression to evaluate.

**Return type:** `DOUBLE`

**Degenerate cases:**

| Condition | Result |
|---|---|
| Fewer than 3 valid points in window | `NULL` |
| `MAD = 0` and `value = median` | `0.0` |
| `MAD = 0` and `value ≠ median` | `+inf` |
| Normal case | Finite positive `DOUBLE` |

**Example:**

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

Computes an IQR (Interquartile Range / Tukey Fences)-based anomaly score for each row in a window.
The score measures the distance of the value beyond the lower fence (`Q1 − k × IQR`) or upper fence (`Q3 + k × IQR`).
Values within the fences receive a score of `0.0`.

**Formula:**
- If `value < Q1 − k × IQR`: score = `(Q1 − k × IQR − value) / IQR`
- If `value > Q3 + k × IQR`: score = `(value − Q3 − k × IQR) / IQR`
- Otherwise: score = `0.0`

**Minimum valid samples:** 3 (linear-interpolated Q1 ≠ Q3 is only possible at n ≥ 3)

```sql
anomaly_score_iqr(value, k) OVER (window_spec)
```

**Arguments:**

- **value**: A numeric column or expression to evaluate.
- **k**: A positive `DOUBLE` multiplier for the IQR fences (e.g., `1.5` for standard Tukey fences, `3.0` for far-out fences).

**Return type:** `DOUBLE`

**Degenerate cases:**

| Condition | Result |
|---|---|
| Fewer than 3 valid points in window | `NULL` |
| `IQR = 0` and value is within fences | `0.0` |
| `IQR = 0` and value is outside fences | `+inf` |
| Normal case | Finite non-negative `DOUBLE` |

**Example:**

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

## Full Usage Example

This example creates a sample table, inserts time-series data with an injected outlier, and then uses all three anomaly functions together.

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
    ('web-1', 80.0, '2025-01-01 00:04:00'),  -- outlier
    ('web-1', 10.3, '2025-01-01 00:05:00'),
    ('web-1', 11.2, '2025-01-01 00:06:00');
```

Use a shared named window and round results for readability:

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

The outlier row (`val = 80.0`) will produce significantly higher scores across all three metrics.

### Filter Anomalous Rows

You can wrap the window query in a subquery to keep only rows whose score exceeds a threshold:

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
