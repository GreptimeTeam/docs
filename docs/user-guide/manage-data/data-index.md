---
keywords: [index, inverted index, skipping index, full-text index, query performance]
description: Learn when to use inverted, skipping, and full-text indexes in GreptimeDB and how to configure them.
---

# Data Index

GreptimeDB provides several secondary index types for different predicates and data distributions.

## Overview

Indexes can be defined when a table is created or changed later with `ALTER TABLE`. GreptimeDB supports:

- Inverted Index
- Skipping Index
- Fulltext Index

This page covers indexes on column values. It does not cover the primary key or time index.

## Index Types

### Inverted Index

An inverted index is particularly useful for tag columns. It creates a mapping between unique tag values and their corresponding rows, enabling fast lookups for specific tag values.

The inverted index is not automatically applied to tag columns.
You need to manually create an inverted index by considering the following typical use cases:
- Querying data by tag values
- Filtering operations on string columns
- Point queries on tag columns

Example:
```sql
CREATE TABLE monitoring_data (
    host STRING INVERTED INDEX,
    `region` STRING PRIMARY KEY INVERTED INDEX,
    cpu_usage DOUBLE,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

However, when a column has very high cardinality, the inverted index may not be the best choice due to the overhead of maintaining the index. It may bring high memory consumption and large index size. In this case, you may consider using the skipping index.

### Skipping Index

A skipping index stores a Bloom filter for each configured group of rows. For supported predicates, GreptimeDB can skip groups whose filter proves that the requested value is absent. Bloom filters can return false positives, so matching groups still require normal predicate evaluation.

**Use Cases:**
- When certain values are sparse, such as MAC address codes in logs.
- Querying specific values that occur infrequently within large datasets

Example:
```sql
CREATE TABLE sensor_data (
    `domain` STRING PRIMARY KEY,
    device_id STRING SKIPPING INDEX,
    temperature DOUBLE,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

Skipping index supports options by `WITH`:
* `type`: The index type, only supports `BLOOM` type right now.
* `granularity`: (For `BLOOM` type) The size of data chunks covered by each filter. A smaller granularity improves filtering but increases index size. Default is `10240`.
* `false_positive_rate`: (For `BLOOM` type) The probability of misidentifying a block. A lower rate improves accuracy (better filtering) but increases index size. Value is a float between `0` and `1`. Default is `0.01`.

For example:

```sql
CREATE TABLE sensor_data (
    `domain` STRING PRIMARY KEY,
    device_id STRING SKIPPING INDEX WITH(type='BLOOM', granularity=1024, false_positive_rate=0.01),
    temperature DOUBLE,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

Skipping indexes apply only to predicates that can be converted to membership tests. Verify index pruning for important queries with [`EXPLAIN ANALYZE`](/reference/sql/explain.md).

### Full-Text Index

A full-text index tokenizes a `STRING` column so that `matches_term` and `@@` predicates can skip data that cannot contain the requested terms. See [Full-Text Search](/user-guide/logs/fulltext-search.md) for query semantics.

**Use Cases:**
- Text search operations
- Pattern matching queries
- Large text filtering

Example:
```sql
CREATE TABLE logs (
    `message` STRING FULLTEXT INDEX,
    `level` STRING PRIMARY KEY,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

#### Configuration Options

When creating or modifying a full-text index, you can specify the following options using `FULLTEXT INDEX WITH`:

- `analyzer`: Sets the language analyzer for the full-text index
  - Supported values: `English`, `Chinese`
  - Default: `English`

- `case_sensitive`: Determines whether the full-text index is case-sensitive
  - Supported values: `true`, `false`
  - Default: `false`
  - When `false`, the index analyzer normalizes tokens to lowercase.

- `backend`: Sets the backend for the full-text index
  - Supported values: `bloom`, `tantivy`
  - Default: `bloom`

- `granularity`: (For `bloom` backend) The size of data chunks covered by each filter. A smaller granularity improves filtering but increases index size.
  - Supported values: positive integer
  - Default: `10240`

- `false_positive_rate`: (For `bloom` backend) The probability of misidentifying a block. A lower rate improves accuracy (better filtering) but increases index size.
  - Supported values: float between `0` and `1`
  - Default: `0.01`

#### Backend Selection

GreptimeDB provides two full-text index backends:

- `bloom` stores token Bloom filters by segment. It may read false-positive segments, and its size and pruning precision depend on `granularity` and `false_positive_rate`.
- `tantivy` stores a term index that can locate matching documents directly. It generally uses more index storage and build resources than `bloom`.

The faster backend depends on term frequency, query shape, segment layout, and available cache. Benchmark both backends with representative data before choosing one for a large deployment.

#### Examples

**Creating a Table with Full-Text Index**

```sql
-- Using the Bloom backend
CREATE TABLE logs_bloom (
    timestamp TIMESTAMP(9) TIME INDEX,
    `message` STRING FULLTEXT INDEX WITH (
        backend = 'bloom',
        analyzer = 'English',
        case_sensitive = 'false'
    )
);

-- Using the Tantivy backend
CREATE TABLE logs_tantivy (
    timestamp TIMESTAMP(9) TIME INDEX,
    `message` STRING FULLTEXT INDEX WITH (
        backend = 'tantivy',
        analyzer = 'English',
        case_sensitive = 'false'
    )
);
```

**Modifying an Existing Table**

```sql
-- Enable full-text index on an existing column
ALTER TABLE logs
MODIFY COLUMN message
SET FULLTEXT INDEX WITH (
    analyzer = 'English',
    case_sensitive = 'false',
    backend = 'bloom'
);

-- Change full-text index configuration
ALTER TABLE logs
MODIFY COLUMN message
SET FULLTEXT INDEX WITH (
    analyzer = 'English',
    case_sensitive = 'false',
    backend = 'tantivy'
);
```

Full-text indexes have the following costs:

- Additional storage for token index data
- Increased flush and compaction latency as each text document needs to be tokenized and indexed
- They accelerate term predicates, not arbitrary prefix or suffix matching.

Use a full-text index when the workload contains `matches_term` or `@@` predicates on text columns.

## Modify indexes

You can always change the index type of columns by the `ALTER TABLE` statement, read the [reference](/reference/sql/alter/#alter-table) for more info.

## Best Practices

1. Choose the appropriate index type based on your data type and query patterns
2. Index only the columns that are frequently used in WHERE clauses
3. Consider the trade-off between query performance, ingest performance and resource consumption
4. Monitor index usage and performance to optimize your indexing strategy continuously

## Performance Considerations

While indexes can significantly improve query performance, they come with some overhead:

- Additional storage space required for index structures
- Impact on flush and compaction performance due to index maintenance
- Memory usage for index caching

Choose indexes carefully based on your specific use case and performance requirements.
