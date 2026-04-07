---
keywords: [CAST function, SQL, data type conversion, syntax, examples]
description: Describes the `CAST` function used to convert an expression of one data type to another, including syntax and examples.
---

# CAST

`CAST` is used to convert an expression of one data type to another.

## Syntax

```sql
CAST (expression AS data_type)
```

## Parameters

- expression: the expression to be converted.
- data_type: the data type to convert the expression to.

# Examples

 Convert a string to an integer:

```sql
 SELECT CAST('123' AS INT) ;
```

```sql
+-------------+
| Utf8("123") |
+-------------+
|         123 |
+-------------+
```
