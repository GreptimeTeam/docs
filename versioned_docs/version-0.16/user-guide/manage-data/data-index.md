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

Fulltext index supports options by `WITH`:
* `analyzer`: Sets the language analyzer for the fulltext index. Supported values are `English` and `Chinese`. Default to `English`.
* `case_sensitive`: Determines whether the fulltext index is case-sensitive. Supported values are `true` and `false`. Default to `false`.
* `backend`: Sets the backend for the fulltext index. Supported values are `bloom` and `tantivy`. Default to `bloom`.
* `granularity`: (For `bloom` backend) The size of data chunks covered by each filter. A smaller granularity improves filtering but increases index size. Default is `10240`.
* `false_positive_rate`: (For `bloom` backend) The probability of misidentifying a block. A lower rate improves accuracy (better filtering) but increases index size. Value is a float between `0` and `1`. Default is `0.01`.

For example:

```sql
CREATE TABLE logs (
    message STRING FULLTEXT INDEX WITH(analyzer='English', case_sensitive='true', backend='bloom', granularity=1024, false_positive_rate=0.01),
    `level` STRING PRIMARY KEY,
    `timestamp` TIMESTAMP TIME INDEX,
);
```

Fulltext index usually comes with following drawbacks:

- Higher storage overhead compared to regular indexes due to storing word tokens and positions
- Increased flush and compaction latency as each text document needs to be tokenized and indexed
- May not be optimal for simple prefix or suffix matching operations

Consider using fulltext index only when you need advanced text search capabilities and flexible query patterns.

For more detailed information about fulltext index configuration and backend selection, please refer to the [Full-Text Index Configuration](/user-guide/logs/fulltext-index-config.md) guide.

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
