---
keywords: [fulltext index, tantivy, bloom, analyzer, case_sensitive, configuration]
description: Comprehensive guide for configuring full-text index in GreptimeDB, including backend selection and other configuration options.
---

# Full-Text Index Configuration

This document provides a comprehensive guide for configuring full-text index in GreptimeDB, including backend selection and other configuration options.

## Overview

GreptimeDB provides full-text indexing capabilities to accelerate text search operations. You can configure full-text index when creating or altering tables, with various options to optimize for different use cases. For a general introduction to different types of indexes in GreptimeDB, including inverted index and skipping index, please refer to the [Data Index](/user-guide/manage-data/data-index) guide.

## Configuration Options

When creating or modifying a full-text index, you can specify the following options using `FULLTEXT INDEX WITH`:

### Basic Options

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

### Backend Selection

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

### Performance Comparison

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

## Configuration Examples

### Creating a Table with Full-Text Index

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

### Modifying an Existing Table

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
