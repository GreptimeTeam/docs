---
keywords: [SQL DESCRIBE TABLE, SQL table structure, SQL syntax, SQL examples, SQL column details]
description: Describes the SQL DESCRIBE TABLE statement to display the structure of a table, including column names, data types, keys, nullability, default values, and semantic types, with examples.
---

# DESCRIBE TABLE

`DESCRIBE [TABLE] [db.]table` describes the table structure in the `db` or the current database in-use.

## Examples

Describes the table `monitor`:

```sql
DESCRIBE TABLE monitor;
```

or

```sql
DESCRIBE monitor;
```

Output:

```sql
+--------+----------------------+------+------+---------------------+---------------+
| Column | Type                 | Key  | Null | Default             | Semantic Type |
+--------+----------------------+------+------+---------------------+---------------+
| host   | String               | PRI  | YES  |                     | TAG           |
| ts     | TimestampMillisecond | PRI  | NO   | current_timestamp() | TIMESTAMP     |
| cpu    | Float64              |      | YES  | 0                   | FIELD         |
| memory | Float64              |      | YES  |                     | FIELD         |
+--------+----------------------+------+------+---------------------+---------------+
4 rows in set (0.00 sec)
```

It produces the table structure:

* `Column`: the column names
* `Type`:  the column data types
* `Key`: `PRI` means the column is in the primary key constraint.
* `Null`:  `YES` means nullable, otherwise `NO`
* `Default`: default value or expression of the column
* `Semantic Type`: This column represents the semantic type, corresponding to `TAG`, `FIELD` or `TIMESTAMP` in the data model.
