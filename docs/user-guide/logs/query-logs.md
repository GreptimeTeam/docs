---
keywords: [query logs, pattern matching, LIKE operator, query statements, log analysis]
description: Provides a guide on using GreptimeDB's query language for effective searching and analysis of log data, including pattern matching and query statements.
---

# Query Logs

This document provides a guide on how to use GreptimeDB's query language for effective searching and analysis of log data.

## Overview

GreptimeDB allows for flexible querying of data using SQL statements. This section introduces specific search functions and query statements designed to enhance your log querying capabilities.

## Pattern Matching Using the `LIKE` Operator

In SQL statements, you can use the `LIKE` operator to perform pattern matching, which is especially useful for log analysis. The `LIKE` operator supports pattern matching on `String` type columns. Here's an example of how it can be used:

```sql
SELECT * FROM logs WHERE message LIKE '%error%' OR message LIKE '%fail%';
```

The `LIKE` operator is designed for pattern matching and uses the following syntax:

- `column_name`: The column to perform the pattern matching on, which should contain textual data of type `String`.
- `pattern`: A string containing the pattern to match, with special wildcard characters:
  - `%`: Matches zero or more characters
  - `_`: Matches exactly one character

## Query Statements

### Simple Pattern Matching

Simple pattern matching searches look for specific substrings:

```sql
SELECT * FROM logs WHERE message LIKE '%Barack Obama%';
```

This query will find all rows where the `message` column contains the exact string "Barack Obama".

### Multiple Term Searches

To search for logs containing either "Barack" or "Obama":

```sql
SELECT * FROM logs WHERE message LIKE '%Barack%' OR message LIKE '%Obama%';
```

### Exclusion Searches

To find rows containing "apple" but not "fruit", you can use a combination of `LIKE` and `NOT LIKE`:

```sql
SELECT * FROM logs WHERE message LIKE '%apple%' AND message NOT LIKE '%fruit%';
```

### Required Term Searches

To query rows containing both "apple" and "fruit":

```sql
SELECT * FROM logs WHERE message LIKE '%apple%' AND message LIKE '%fruit%';
```

### Advanced Pattern Matching

You can combine multiple `LIKE` conditions for more complex searches:

```sql
SELECT * FROM logs WHERE (message LIKE '%a%' AND message LIKE '%b%') OR message LIKE '%c%';
```

This matches rows containing both 'a' and 'b', or rows containing 'c'.
