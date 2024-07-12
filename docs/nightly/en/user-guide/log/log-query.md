# Log Query

This document provides a guide on how to use GreptimeDB's query language for effective searching and analysis of log data.

## Overview

GreptimeDB allows for flexible querying of data using SQL statements. This section introduces specific search functions and query statements designed to enhance your log querying capabilities.

## Full-Text Search Using the `MATCHES` Function

In SQL statements, you can use the `MATCHES` function to perform full-text searches, which is especially useful for log analysis. The `MATCHES` function supports full-text searches on `String` type columns. Here’s an example of how it can be used:

```sql
SELECT * FROM logs WHERE MATCHES(message, 'error OR fail');
```

The `MATCHES` function is designed for full-text search and accepts two parameters:

- `column_name`: The column to perform the full-text search on, which should contain textual data of type `String`.
- `search_query`: A string containing query statement which you want to search for. See the [Query Statements](#query-statements) section below for more details.

## Query Statements

### Simple Term

Simple term searches are straightforward:

```sql
SELECT * FROM logs WHERE MATCHES(message, 'Barack Obama');
```

The value `Barack Obama` in the `search_query` parameter of the `MATCHES` function will be considered as two separate terms: `Barack` and `Obama`. This means the query will match all rows containing either `Barack` or `Obama`, equivalent to using `OR`:

```sql
SELECT * FROM logs WHERE MATCHES(message, 'Barack OR Obama');
```

### Negative Term

Prefixing a term with `-` excludes rows containing that term. For instance, to find rows containing `apple` but not `fruit`:

```sql
SELECT * FROM logs WHERE MATCHES(message, 'apple -fruit');
```

### Must Term

Prefixing a term with `+` specifies that it must be included in the results. For example, to query rows containing both `apple` and `fruit`:

```sql
SELECT * FROM logs WHERE MATCHES(message, '+apple +fruit');
```

### Boolean Operators

Boolean operators can specify logical conditions for the search. For example, the `AND` operator requires all specified terms to be included, while the `OR` operator requires at least one term to be included. The `AND` operator takes precedence over `OR`, so the expression `a AND b OR c` is interpreted as `(a AND b) OR c`. For example:

```sql
SELECT * FROM logs WHERE MATCHES(message, 'a AND b OR c');
```

This matches rows containing both `a` and `b`, or rows containing `c`. Equivalent to:

```sql
SELECT * FROM logs WHERE MATCHES(message, '(+a +b) c');
```

### Phrase Term

A phrase term is enclosed within quotes `" "` and matches the exact sequence of words. For example, to match rows containing `Barack` followed directly by `Obama`:

```sql
SELECT * FROM logs WHERE MATCHES(message, '"Barack Obama"');
```

To include quotes within a phrase, use a backslash `\` to escape them:

```sql
SELECT * FROM logs WHERE MATCHES(message, '"He said \"hello\""');
```

## Full-Text Index for Accelerated Search

A full-text index is essential for full-text search, especially when dealing with large datasets. Without a full-text index, the search operation could be very slow, impacting the overall query performance and user experience. By configuring a full-text index within the Pipeline, you can ensure that search operations are performed efficiently, even with significant data volumes.

### Configuring Full-Text Index

In the Pipeline configuration, you can [specify a column to use a full-text index](./log-pipeline.md#index-field). Below is a configuration example where the `message` column is set with a full-text index:

```yaml
processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true

transform:
  - field: message
    type: string
    index: fulltext
  - field: time
    type: time
    index: timestamp
```

### Viewing Table Schema

After data is written, you can use an SQL statement to view the table schema and confirm that the `message` column is set for full-text indexing:

```sql
SHOW CREATE TABLE many_logs\G
*************************** 1. row ***************************
       Table: many_logs
Create Table: CREATE TABLE IF NOT EXISTS `many_logs` (
  `host` STRING NULL,
  `log` STRING NULL FULLTEXT WITH(analyzer = 'English', case_sensitive = 'false'),
  `ts` TIMESTAMP(9) NOT NULL,
  TIME INDEX (`ts`),
  PRIMARY KEY (`host`)
)

ENGINE=mito
WITH(
  append_mode = 'true'
)
```
