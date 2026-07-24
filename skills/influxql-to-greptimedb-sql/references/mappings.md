# InfluxQL to GreptimeDB SQL Mappings

## Contents

- [Query structure](#query-structure)
- [Time and windows](#time-and-windows)
- [Fill](#fill)
- [Functions](#functions)
- [Regex and identifiers](#regex-and-identifiers)
- [Clauses without direct equivalents](#clauses-without-direct-equivalents)
- [Example](#example)
- [References](#references)

## Query structure

| InfluxQL | GreptimeDB SQL | Notes |
|---|---|---|
| measurement | table | Database, retention policy, and schema/table may not map one-to-one |
| field key | column | Confirm the type from the table schema |
| tag key | column | Use as a regular SQL filter or grouping column |
| `WHERE` | `WHERE` | Replace `time` with the actual `TIME INDEX` column |
| `ORDER BY time` | `ORDER BY <time_index>` | Preserve `ASC` or `DESC` |
| `LIMIT` / `OFFSET` | `LIMIT` / `OFFSET` | InfluxQL applies these per series; SQL applies them to the full result by default |

Do not guess the target of `"database"."retention_policy"."measurement"`. Require a mapping from the user or confirm it from the target schema.

## Time and windows

### Durations

| InfluxQL | SQL interval |
|---|---|
| `10ns` | `'10 nanoseconds'::INTERVAL` |
| `10u` / `10µ` | `'10 microseconds'::INTERVAL` |
| `10ms` | `'10 milliseconds'::INTERVAL` |
| `10s` | `'10 seconds'::INTERVAL` |
| `10m` | `'10 minutes'::INTERVAL` |
| `10h` | `'10 hours'::INTERVAL` |
| `10d` | `'10 days'::INTERVAL` |
| `10w` | `'10 weeks'::INTERVAL` |

Expand compound durations, for example `1h30m` → `'1 hour 30 minutes'::INTERVAL`.

### Time predicates

```sql
-- InfluxQL
SELECT "usage" FROM "cpu" WHERE time >= now() - 1h AND time < now()

-- GreptimeDB SQL, assuming ts is the time index
SELECT usage
FROM cpu
WHERE ts >= now() - '1 hour'::INTERVAL
  AND ts < now();
```

Preserve open and closed bounds. Do not change `<` to `<=`.

InfluxQL `GROUP BY time()` queries without an explicit time predicate stop at `now()` by default. Add `<time_index> <= now()` when exact behavior matters.

### `GROUP BY time()`

Use `date_bin` when no fill behavior is required:

```sql
SELECT
  date_bin('5 minutes'::INTERVAL, ts) AS time_bucket,
  host,
  avg(usage) AS mean_usage
FROM cpu
WHERE ts >= now() - '1 hour'::INTERVAL
GROUP BY time_bucket, host
ORDER BY time_bucket;
```

Represent the offset in `time(5m, 2m)` with an origin:

```sql
date_bin(
  '5 minutes'::INTERVAL,
  ts,
  '1970-01-01T00:02:00Z'::TIMESTAMP
)
```

## Fill

Prefer GreptimeDB Range Query when InfluxQL uses `fill()`. Use the same duration for `RANGE` and `ALIGN` to reproduce non-overlapping windows. Always specify `BY` explicitly to avoid grouping by every primary-key column in the target table.

| InfluxQL | GreptimeDB Range Query |
|---|---|
| `fill(null)` | `FILL NULL` |
| `fill(previous)` | `FILL PREV` |
| `fill(linear)` | `FILL LINEAR` |
| `fill(0)` | `FILL 0` |
| `fill(none)` | Omit `FILL`, or use a `date_bin` query |

```sql
SELECT
  ts,
  host,
  avg(usage) RANGE '5m' FILL PREV AS mean_usage
FROM cpu
WHERE ts >= now() - '1 hour'::INTERVAL
ALIGN '5m' BY (host)
ORDER BY ts;
```

Use `BY ()` when there is no tag grouping. For `time(interval, offset)`, use an RFC3339 string as the alignment point:

```sql
ALIGN '5m' TO '1970-01-01T00:02:00Z' BY (host)
```

Validate offset behavior with boundary data. Do not append a type cast to the `TO` literal.

## Functions

### Direct or simple rewrites

| InfluxQL | GreptimeDB SQL |
|---|---|
| `COUNT(x)` | `count(x)` |
| `COUNT(DISTINCT(x))` | `count(DISTINCT x)` |
| `DISTINCT(x)` | `DISTINCT x`, equivalent only as a value set |
| `MEAN(x)` | `avg(x)` |
| `MEDIAN(x)` | `median(x)` |
| `SPREAD(x)` | `max(x) - min(x)` |
| `STDDEV(x)` | `stddev(x)` |
| `SUM(x)` | `sum(x)` |
| `FIRST(x)` | `first_value(x ORDER BY ts)` |
| `LAST(x)` | `last_value(x ORDER BY ts)` |
| `MAX(x)` | `max(x)` |
| `MIN(x)` | `min(x)` |
| `PERCENTILE(x, 95)` | `percentile_cont(x, 0.95)`, with different algorithms |
| `ABS(x)` | `abs(x)` |
| `CEIL(x)` | `ceil(x)` |
| `FLOOR(x)` | `floor(x)` |
| `LN(x)` | `ln(x)` |
| `LOG2(x)` | `log2(x)` |
| `LOG10(x)` | `log10(x)` |
| `POW(x, y)` | `power(x, y)` |
| `ROUND(x)` | `round(x)` |
| `SQRT(x)` | `sqrt(x)` |

Keep standard trigonometric function names when supported, but confirm them against the target GreptimeDB version.

InfluxQL `PERCENTILE` selects a discrete source field value, while `percentile_cont` may interpolate. Always report this semantic difference. Without time grouping, `FIRST`, `LAST`, `MIN`, `MAX`, and `PERCENTILE` may also carry the selected point's original timestamp or related columns. A regular SQL aggregate guarantees only the aggregate value; use window ordering and filter the selected row when those columns are required.

### Window-function rewrites

Determine the series grouping columns and row order before applying these patterns:

```sql
-- DIFFERENCE(value)
value - lag(value) OVER (PARTITION BY host ORDER BY ts)

-- CUMULATIVE_SUM(value)
sum(value) OVER (
  PARTITION BY host
  ORDER BY ts
  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
)

-- MOVING_AVERAGE(value, 5)
avg(value) OVER (
  PARTITION BY host
  ORDER BY ts
  ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
)
```

`DERIVATIVE`, `NON_NEGATIVE_DERIVATIVE`, and `ELAPSED` must account for the time unit, the first-row `NULL`, and negative-value behavior. Use a CTE to calculate `lag(value)` and `lag(ts)` before deriving the result. Do not use an unverified one-line replacement.

### Functions requiring dedicated rewrites

These functions have no safe, general one-to-one mapping:

- `INTEGRAL`
- `MODE`
- `TOP` / `BOTTOM`
- `SAMPLE`
- `HISTOGRAM`
- `HOLT_WINTERS`
- technical analysis functions

`TOP` and `BOTTOM` can often use `row_number() OVER (PARTITION BY ... ORDER BY value DESC|ASC)` with an outer filter. First confirm the InfluxQL tag arguments, returned columns, and tie behavior.

## Regex and identifiers

Rewrite a value regex as follows:

```sql
-- InfluxQL
"host" =~ /^web-[0-9]+$/

-- GreptimeDB SQL
regexp_like(host, '^web-[0-9]+$')
```

Use `NOT regexp_like(...)` for a negative regex. When InfluxQL uses regex to select columns, measurements, or tag keys in `SELECT`, `FROM`, or `GROUP BY`, expand the matching objects first. Use `UNION ALL` for multiple schema-compatible tables; otherwise require an explicit mapping.

Preserve identifier quoting when required. Use single quotes for SQL strings and double quotes for identifiers.

## Clauses without direct equivalents

- `SLIMIT` and `SOFFSET` limit series, while SQL `LIMIT` and `OFFSET` limit result rows. Define the series key first, then use `dense_rank` or a distinct-series CTE.
- `tz()` changes the timezone offset returned by InfluxQL. Set the GreptimeDB connection session timezone instead of silently dropping the clause.
- InfluxQL applies `LIMIT` per series, which may differ from a global SQL `LIMIT`.
- `SELECT INTO` writes data and is outside a read-only conversion. Generate `INSERT INTO ... SELECT` only when the user explicitly requests it.
- Metadata statements such as `SHOW SERIES` and `SHOW TAG KEYS` are not regular `SELECT` conversions. Design them separately against GreptimeDB information schema.

## Example

Input:

```sql
SELECT MEAN("usage_user"), MAX("usage_system")
FROM "cpu"
WHERE "host" =~ /^web-/ AND time >= now() - 6h
GROUP BY time(10m), "host" fill(previous)
ORDER BY time DESC
LIMIT 100
```

Output, assuming `ts` is the time index:

```sql
SELECT
  ts,
  host,
  avg(usage_user) RANGE '10m' FILL PREV AS mean_usage_user,
  max(usage_system) RANGE '10m' FILL PREV AS max_usage_system
FROM cpu
WHERE regexp_like(host, '^web-')
  AND ts >= now() - '6 hours'::INTERVAL
ALIGN '10m' BY (host)
ORDER BY ts DESC
LIMIT 100;
```

## References

- GreptimeDB Range Query: <https://docs.greptime.com/reference/sql/range/>
- GreptimeDB SQL functions: <https://docs.greptime.com/reference/sql/functions/df-functions/>
- InfluxQL specification: <https://docs.influxdata.com/influxdb/v2/reference/syntax/influxql/spec/>
- InfluxQL functions: <https://docs.influxdata.com/influxdb/v2/query-data/influxql/functions/>
