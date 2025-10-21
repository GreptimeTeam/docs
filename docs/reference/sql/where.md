---
keywords: [SQL WHERE clause, filtering data, logical operators, comparison operators, list search]
description: Explains the WHERE clause in SQL for filtering data based on conditions, including syntax, examples with logical and comparison operators, and list search functionalities.
---

# WHERE

`WHERE` clause allows to filter the data by specifying conditions.

## Syntax

```sql
SELECT *
FROM table_name
WHERE condition;
```

If there is a `WHERE` clause, it must contain an expression with the Boolean type. This is usually
an expression with comparison and logical operators. Rows where this expression evaluates to false are
excluded from further transformations or result.

## Examples

### Logical operators

Supports `AND`, `OR` as logical operators and can assemble conditions using brackets ().

```sql
SELECT * FROM system_metrics
WHERE idc = 'idc0' AND (host = 'host1' OR host = 'host2');
```

### Numeric

Supports `=`, `!=`, `>`, `>=`, `<`, `<=` as comparison operators.

```sql
SELECT * FROM system_metrics WHERE cpu_util = 20.0;
SELECT * FROM system_metrics WHERE cpu_util != 20.0;
SELECT * FROM system_metrics WHERE cpu_util > 20.0;
SELECT * FROM system_metrics WHERE cpu_util >= 20.0;
SELECT * FROM system_metrics WHERE cpu_util < 20.0;
SELECT * FROM system_metrics WHERE cpu_util <= 20.0;
```

### List search

Evaluates match or mismatch against a list of elements.

### List match

```sql
SELECT * FROM system_metrics WHERE idc IN ('idc_a', 'idc_b');
```

### List mismatch

```sql
SELECT * FROM system_metrics WHERE idc NOT IN ('idc_a', 'idc_b');
```

### String

For string columns, we can use  the `LIKE` operator to  search for a specified pattern in a column. There are two wildcards often used in conjunction with the LIKE operator:
* The percent sign `%` represents zero, one, or multiple characters
* The underscore sign `_` represents a single character

Select all records that the `host` column starts with the letter "a":
```sql
SELECT * FROM system_metrics WHERE host LIKE 'a%';
```

 Selects all records from the `go_info` table where the instance column matches the pattern `'localhost:____'`, meaning `'localhost:'` followed by exactly four characters.

```sql
SELECT * FROM go_info
WHERE instance LIKE 'localhost:____';
```

For searching terms in logs, please read [Fulltext Search](/user-guide/logs/fulltext-search.md).
