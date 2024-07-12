# Log Query

This document provides an overview of how to utilize GreptimeDB's query language for searching and analyzing log data.

## Query Overview

In GreptimeDB, you can perform flexible data queries using SQL statements. This section will introduce specific search functions and query statements that help optimize your log queries.

## Full-Text Search Using the `MATCHES` Function

You can use the `MATCHES` function in SQL statements to perform full-text searches, which is particularly useful for log analysis. The `MATCHES` function supports full-text search on `String` type columns. Here is a typical usage example:

```sql
SELECT * FROM logs WHERE MATCHES(message, 'error OR fail');
```

The `MATCHES` function is designed for full-text search and accepts two parameters:

- `column_name`: The column to perform the full-text search on, which should contain textual data of type `String`.
- `search_query`: A string containing query statement which you want to search for.

## Query Statements

### Simple Term

A simple term search works as follows:

```sql
SELECT * FROM logs WHERE MATCHES(message, 'Barack Obama');
```

This query treats `Barack` and `Obama` as two independent terms. It matches all rows that contain either `Barack` or `Obama`, equivalent to using the `OR` operator:

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

## Full-Text Index for Accelerated Full-Text Search

To enhance the efficiency of full-text searches, especially when dealing with large data sets, it is recommended to use a full-text index. A full-text index can significantly speed up search operations, allowing you to quickly locate records containing specific words even in extensive data sets.

### Configuring Full-Text Index

In the Pipeline configuration, you can specify a column to use a full-text index. Here is an example configuration where the `message` column is set for full-text indexing:

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

After data insertion, you can use an SQL statement to view the table schema and confirm that the `message` column is set for full-text indexing:

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

### Importance of Full-Text Index

Full-text indexing is crucial for effective full-text search, especially in scenarios involving large data sets. Without full-text indexing, search operations can be exceedingly slow, negatively impacting overall query performance and user experience. Configuring full-text indexing in the Pipeline ensures search queries are executed efficiently, maintaining good performance even with vast amounts of data.

## Conclusion

With the concepts covered, you should be able to use GreptimeDB's query capabilities to search and analyze log data more effectively. Continue exploring more advanced query functionalities to fully leverage the powerful tools GreptimeDB provides.
