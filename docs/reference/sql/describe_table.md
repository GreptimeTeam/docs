# DESCRIBE TABLE

`DESCRIBE TABLE [db.]table` describes the table structure in the `db` or the current database in-use.

## Examples
Describes the table `monitor`:
```sql
DESCRIBE TABLE monitor;
```
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

* `Field`: the column names
* `Type`: the column types
* `Null`:  `yes` means nullable, otherwise `no`
* `Default`: default value of the column
* `Semantic Type`: This column indicates the semantic type of the column, which can be `TAG`, `FIELD`, or `TIMESTAMP`.
