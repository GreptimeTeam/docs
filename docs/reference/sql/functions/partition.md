---
keywords: [partitioning functions, iceberg_hash, hash partitioning, Murmur3, partition rules, hash breakpoints, SQL functions]
description: Describes the iceberg_hash family of partitioning functions used to build hash partition rules, including iceberg_hash, iceberg_hash_bounds, iceberg_hash_breakpoints, and iceberg_hash_ranges_sql.
---

# Partitioning Functions

GreptimeDB can partition a table by the hash of a column with `iceberg_hash` partition rules, as described in [Hash partitioning](/user-guide/deployments-administration/manage-data/table-sharding.md#hash-partitioning). The functions on this page are the SQL forms of that hash. They let you measure what a value hashes to, split the hash space into buckets, and render a complete rule list that can be pasted into `PARTITION ON COLUMNS`:

| Function | Purpose | Result |
| --- | --- | --- |
| [`iceberg_hash(value)`](#iceberg_hash) | Hash of one string or integer value | `INT32` hash, `NULL` for `NULL` |
| [`iceberg_hash_bounds(n)`](#iceberg_hash_bounds) | Breakpoints of an equal-width `n`-bucket split | Comma-separated `INT32` literals |
| [`iceberg_hash_breakpoints(v1, v2, ...)`](#iceberg_hash_breakpoints) | Hashes of the given constant values | Sorted, deduplicated `INT32` literals |
| [`iceberg_hash_ranges_sql(column, n)`](#iceberg_hash_ranges_sql) | Complete partition rule list for `n` buckets | One rule per line, ready to paste |

All four functions are immutable and only produce values or text: none of them creates or changes a partition.

:::note Availability
The functions on this page and `iceberg_hash` partition rules are available in Nightly builds. They are not included in GreptimeDB v1.3.0 or v1.3.1.
:::

## The Iceberg hash

`iceberg_hash` is the 32-bit Murmur3 hash (seed 0) defined by the [Apache Iceberg specification, appendix B](https://iceberg.apache.org/spec/#appendix-b-32-bit-hash-requirements). Strings are hashed over their UTF-8 bytes, integers are hashed as 8-byte little-endian longs, and the result is an `INT32`. The same hash is implemented by Trino and by ClickHouse's `icebergHash`, so a row's bucket can be recomputed outside GreptimeDB.

The SQL function and the partition rule planner share one implementation, so `SELECT iceberg_hash(...)` always agrees with how rows are routed to partitions.

### `iceberg_hash`

`iceberg_hash(value)` returns the hash of one value as `INT32`. The value can be a `STRING` or a signed or unsigned integer (`INT8` through `INT64`, `UINT8` through `UINT64`), the same domain a partition rule accepts. `NULL` hashes to `NULL`.

```sql
SELECT iceberg_hash('iceberg'), iceberg_hash(34), iceberg_hash(NULL);
```

```sql
+-------------------------------+-------------------------+--------------------+
| iceberg_hash(Utf8("iceberg")) | iceberg_hash(Int64(34)) | iceberg_hash(NULL) |
+-------------------------------+-------------------------+--------------------+
| 1210000089                    | 2017239379              |                    |
+-------------------------------+-------------------------+--------------------+
```

Use it to check which bucket a value falls into, or to inspect the hash distribution of an existing column before choosing a bucket layout.

### `iceberg_hash_bounds`

`iceberg_hash_bounds(n)` returns the `n - 1` breakpoints of an equal-width split of the `INT32` hash space, as a comma-separated string. Breakpoint `i` is `INT32_MIN + floor(i * 2^32 / n)`, so each bucket covers an equally wide slice of the hash space. With many distinct keys, the hash usually spreads keys evenly across the buckets, but rows with the same key always share a bucket; hot or frequently repeated keys can still create hot partitions.

The argument must be a constant integer between 2 and 1024; any integer width works.

```sql
SELECT iceberg_hash_bounds(2), iceberg_hash_bounds(4);
```

```sql
+-------------------------------+-------------------------------+
| iceberg_hash_bounds(Int64(2)) | iceberg_hash_bounds(Int64(4)) |
+-------------------------------+-------------------------------+
| 0                             | -1073741824, 0, 1073741824    |
+-------------------------------+-------------------------------+
```

`iceberg_hash_bounds(2)` returns `0` because a single breakpoint splits the hash space into two halves: values whose hash is below `0` fall in the first bucket, the rest in the second.

### `iceberg_hash_breakpoints`

`iceberg_hash_breakpoints(v1, v2, ...)` hashes the given constant values and returns them sorted and deduplicated, as a comma-separated string. Use it to build buckets around known key values—for example, hotspot hosts—instead of around equal widths.

The values must all be constants and must all come from one hash encoding: all strings, or all integers (integer widths may mix). A string and an integer hash through different encodings, so mixing them is rejected. `NULL` is not a valid breakpoint—a `NULL` hash never matches a comparison bound—so it is rejected as well, and at least one value is required.

```sql
SELECT iceberg_hash_breakpoints('iceberg', 'a', 'iceberg');
```

```sql
+---------------------------------------------------------------------+
| iceberg_hash_breakpoints(Utf8("iceberg"),Utf8("a"),Utf8("iceberg")) |
+---------------------------------------------------------------------+
| 1009084850, 1210000089                                              |
+---------------------------------------------------------------------+
```

Duplicate hash values are removed, so the output contains one breakpoint per distinct hash value. Different input values share a breakpoint if their hashes collide.

### `iceberg_hash_ranges_sql`

`iceberg_hash_ranges_sql(column, n)` renders the complete rule list for an equal-width `n`-bucket split of `column`, one rule per line, ready to be pasted into `PARTITION ON COLUMNS`. The column name is rendered as a quoted SQL identifier with embedded quotes escaped, so names that are not plain lowercase identifiers—`host-name`, `HOST`, `a b`—round-trip through the paste.

The first argument is the raw column name as a string; the second is a constant bucket count subject to the same `[2, 1024]` range as `iceberg_hash_bounds`.

```sql
SELECT iceberg_hash_ranges_sql('host-name', 4);
```

```sql
+-----------------------------------------------------------------------------+
| iceberg_hash_ranges_sql(Utf8("host-name"),Int64(4))                         |
+-----------------------------------------------------------------------------+
| iceberg_hash("host-name") < -1073741824,                                    |
| iceberg_hash("host-name") >= -1073741824 AND iceberg_hash("host-name") < 0, |
| iceberg_hash("host-name") >= 0 AND iceberg_hash("host-name") < 1073741824,  |
| iceberg_hash("host-name") >= 1073741824                                     |
+-----------------------------------------------------------------------------+
```

## Build a hash-partitioned table

To create a table partitioned by the hash of a column, generate the rule list, then paste it into the table definition:

```sql
SELECT iceberg_hash_ranges_sql('host', 4);
```

```sql
iceberg_hash("host") < -1073741824,
iceberg_hash("host") >= -1073741824 AND iceberg_hash("host") < 0,
iceberg_hash("host") >= 0 AND iceberg_hash("host") < 1073741824,
iceberg_hash("host") >= 1073741824
```

```sql
CREATE TABLE requests (
  host STRING,
  ts TIMESTAMP DEFAULT current_timestamp() TIME INDEX,
  PRIMARY KEY (host)
)
PARTITION ON COLUMNS (host) (
  iceberg_hash(host) < -1073741824,
  iceberg_hash(host) >= -1073741824 AND iceberg_hash(host) < 0,
  iceberg_hash(host) >= 0 AND iceberg_hash(host) < 1073741824,
  iceberg_hash(host) >= 1073741824
);
```

To build buckets around specific values instead of equal widths, hash the values with `iceberg_hash_breakpoints(...)`, then use each returned hash as an upper bound and add a final rule with no upper bound. For example, the two breakpoints shown above produce three rules:

```sql
iceberg_hash(host) < 1009084850,
iceberg_hash(host) >= 1009084850 AND iceberg_hash(host) < 1210000089,
iceberg_hash(host) >= 1210000089
```

Use the breakpoints in the returned order when writing the rules.

:::tip NOTE
`NULL` hashes to `NULL` and never matches a comparison bound, so rows with `NULL` in the hashed column always land in the first partition (partition `p0`).
:::

:::warning Limitations
- Only `STRING` and integer columns can be hashed; other types fail at execution, as in a partition rule.
- Filters on a hashed partition column do not prune regions. A query such as `WHERE host = 'x'` scans every hash range; only conditions on other columns prune.
:::
