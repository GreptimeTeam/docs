---
keywords: [index, inverted index, skipping index, fulltext index, query performance]
description: Learn about different types of indexes in GreptimeDB, including inverted index, skipping index, and fulltext index, and how to use them effectively to optimize query performance.
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
    region STRING PRIMARY KEY INVERTED INDEX,
    cpu_usage DOUBLE,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

However, when you have a large number of unique tag values (Cartesian product among all columns indexed by inverted index), the inverted index may not be the best choice due to the overhead of maintaining the index. It may bring high memory consumption and large index size. In this case, you may consider using the skipping index.

### Skipping Index

Skipping index suits for columnar data systems like GreptimeDB. It maintains metadata about value ranges within data blocks, allowing the query engine to skip irrelevant data blocks during range queries efficiently. This index also has smaller size compare to others.

**Use Cases:**
- When certain values are sparse, such as MAC address codes in logs.
- Querying specific values that occur infrequently within large datasets

Example:
```sql
CREATE TABLE sensor_data (
    domain STRING PRIMARY KEY,
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
    domain STRING PRIMARY KEY,
    device_id STRING SKIPPING INDEX WITH(type='BLOOM', granularity=1024, false_positive_rate=0.01),
    temperature DOUBLE,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

Skipping index can't handle complex filter conditions, and usually has a lower filtering performance compared to inverted index or fulltext index.

### Fulltext Index

Fulltext index is designed for text search operations on string columns. It enables efficient searching of text content using word-based matching and text search capabilities. You can query text data with flexible keywords, phrases, or pattern matching queries.

**Use Cases:**
- Text search operations
- Pattern matching queries
- Large text filtering

Example:
```sql
CREATE TABLE logs (
    message STRING FULLTEXT INDEX,
    `level` STRING PRIMARY KEY,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

#### Configuration Options

When creating or modifying a full-text index, you can specify the following options using `FULLTEXT INDEX WITH`:

- `analyzer`: Sets the language analyzer for the full-text index
  - Supported values: `English`, `Chinese`
  - Default: `English`
  - Note: The Chinese analyzer requires significantly more time to build the index due to the complexity of Chinese text segmentation. Consider using it only when Chinese text search is a primary requirement.

- `case_sensitive`: Determines whether the full-text index is case-sensitive
  - Supported values: `true`, `false`
  - Default: `false`
  - Note: Setting to `true` may slightly improve performance for case-sensitive queries, but will degrade performance for case-insensitive queries. This setting does not affect the results of `matches_term` queries.

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

#### Performance Comparison

The following table shows the performance comparison between different query methods (using Bloom as baseline):

| Query Type | High Selectivity (e.g., TraceID) | Low Selectivity (e.g., "HTTP") |
|------------|----------------------------------|--------------------------------|
| LIKE       | 50x slower                      | 1x                            |
| Tantivy    | 5x faster                       | 5x slower                     |
| Bloom      | 1x (baseline)                   | 1x (baseline)                 |

Key observations:
- For high-selectivity queries (e.g., unique values), Tantivy provides the best performance
- For low-selectivity queries, Bloom offers more consistent performance
- Bloom has significant storage advantage over Tantivy (1GB vs 10GB in test case)

#### Examples

**Creating a Table with Full-Text Index**

```sql
-- Using Bloom backend (recommended for most cases)
CREATE TABLE logs (
    timestamp TIMESTAMP(9) TIME INDEX,
    message STRING FULLTEXT INDEX WITH (
        backend = 'bloom',
        analyzer = 'English',
        case_sensitive = 'false'
    )
);

-- Using Tantivy backend (for high-selectivity queries)
CREATE TABLE logs (
    timestamp TIMESTAMP(9) TIME INDEX,
    message STRING FULLTEXT INDEX WITH (
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

- Higher storage overhead compared to regular indexes due to storing word tokens and positions
- Increased flush and compaction latency as each text document needs to be tokenized and indexed
- May not be optimal for simple prefix or suffix matching operations

Consider using fulltext index only when you need advanced text search capabilities and flexible query patterns.

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
