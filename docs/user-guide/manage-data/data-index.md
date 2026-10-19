---
keywords: [index, inverted index, skipping index, full-text index, query performance]
description: Learn about different types of indexes in GreptimeDB, including inverted index, skipping index, and full-text index, and how to use them effectively to optimize query performance.
---

# Data Index

GreptimeDB provides various indexing mechanisms to accelerate query performance. Indexes are essential database structures that help optimize data retrieval operations by creating efficient lookup paths to specific data.

## Overview

Indexes in GreptimeDB are specified during table creation and are designed to improve query performance for different types of data and query patterns. The database currently supports these types of indexes:

- Inverted Index
- Skipping Index
- Fulltext Index

Notice that in this chapter we are narrowing the word "index" to those related to data value indexing. PRIMARY KEY and TIME INDEX can also be treated as index in some scenarios, but they are not covered here.

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

Skipping index suits for columnar data systems like GreptimeDB. It maintains metadata about value ranges within data blocks, allowing the query engine to skip irrelevant data blocks during range queries efficiently. This index also has smaller size compare to others.

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

Skipping index can't handle complex filter conditions, and usually has a lower filtering performance compared to inverted index or full-text index.

### Full-Text Index

Full-text index is designed for text search operations on string columns. It enables efficient searching of text content using word-based matching and text search capabilities. You can query text data with flexible keywords, phrases, or pattern matching queries.

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
  - On the `bloom` backend, both settings use word boundaries aligned with `matches_term` and adjacent Han-character pairs (bigrams). Chinese text does not require a different analyzer. The `tantivy` backend uses the selected language analyzer.

- `case_sensitive`: Determines whether the full-text index is case-sensitive
  - Supported values: `true`, `false`
  - Default: `false`
  - This setting does not change the matching semantics of `matches_term` or `LIKE`. `matches_term(lower(column), ...)` and `lower(column) LIKE ...` can use the Bloom full-text index only when `case_sensitive=false`.

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

GreptimeDB provides two full-text index backends for efficient log searching:

:::note
The index sizes below come from Greptime's testing.
Use them to compare the two backends against each other, not as absolute figures
for your data: selectivity, term distribution, and cache state all move these
numbers.
:::

1. **Bloom Backend**
   - Best for: General-purpose log searching
   - Features:
     - Uses Bloom filter for efficient filtering
     - Lower storage overhead
     - Consistent performance across different query patterns
   - Limitations:
     - Slightly slower for high-selectivity queries
   - Storage Cost Example:
     - Original data: ~10GB
     - Bloom index: ~1GB

2. **Tantivy Backend**
   - Best for: High-selectivity queries (e.g., unique values like TraceID)
   - Features:
     - Uses inverted index for fast exact matching
     - Excellent performance for high-selectivity queries
   - Limitations:
     - Higher storage overhead (close to original data size)
     - Slower performance for low-selectivity queries
   - Storage Cost Example:
     - Original data: ~10GB
     - Tantivy index: ~10GB

| Backend | Supported queries |
| --- | --- |
| `bloom` | `matches_term` and `LIKE` predicates with extractable index terms. The index skips blocks that cannot match; remaining rows are evaluated against the original predicate. |
| `tantivy` | `matches()` queries. `matches_term` does not use the Tantivy index and executes by scanning. |

#### Performance Comparison

Index effectiveness depends on the predicate and the distribution of terms across data blocks. Predicates without extractable index terms do not use Bloom full-text pruning. Use `EXPLAIN ANALYZE` to inspect the rows scanned and filtered.

#### LIKE queries

Ordinary `LIKE` queries do not yet use the Bloom full-text index for acceleration.

The Bloom full-text index supports case-sensitive, non-negated `LIKE` predicates with the default backslash (`\`) escape character. The pattern must contain a complete term or Han bigram that every matching value contains. For example:

```sql
SELECT * FROM logs WHERE message LIKE '%disk quota exceeded%';
SELECT * FROM logs WHERE message LIKE '%手机%';
SELECT * FROM logs WHERE lower(message) LIKE '%disk quota exceeded%';
```

The first pattern contains the complete middle term `quota`; the second contains the Han bigram `手机`. Index support for the third requires `case_sensitive=false`.
`LIKE '%error%'` has no guaranteed word boundaries and does not use Bloom full-text pruning. `ILIKE` and `NOT LIKE` do not use this index either.
These restrictions affect index use, not query results.

#### Rebuild Bloom full-text indexes after upgrading

Legacy Bloom full-text indexes are no longer used for pruning. Existing SST files remain readable, but queries scan them without Bloom full-text pruning until compaction rewrites the files or the indexes are rebuilt manually:

```sql
ADMIN BUILD_INDEX('logs');
```

This command also rebuilds Bloom full-text indexes with an outdated format version. See [Build Index](/reference/sql/admin.md#build-index) for details.

#### Examples

**Creating a Table with Full-Text Index**

```sql
-- Using Bloom backend (recommended for most cases)
CREATE TABLE logs (
    `timestamp` TIMESTAMP(9) TIME INDEX,
    `message` STRING FULLTEXT INDEX WITH (
        backend = 'bloom',
        analyzer = 'English',
        case_sensitive = 'false'
    )
);

-- Using Tantivy backend for matches() queries
CREATE TABLE logs (
    `timestamp` TIMESTAMP(9) TIME INDEX,
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
ALTER TABLE monitor 
MODIFY COLUMN load_15 
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

Fulltext index usually comes with following drawbacks:

- Additional storage for index data
- Increased flush and compaction latency as each text document needs to be tokenized and indexed
- May not be optimal for simple prefix or suffix matching operations

## Modify indexes

You can always change the index type of columns by the `ALTER TABLE` statement, read the [reference](/reference/sql/alter.md#alter-table) for more info.

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
