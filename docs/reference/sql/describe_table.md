The `DESCRIBE TABLE [db.]table` describes the table structure in the `db` or the current database when `db` is not specified.

## Examples
Describes the table `monitor`:
```sql
DESCRIBE TABLE monitor;
```
```sql
+--------+----------------------+------+---------+---------------+
| Field  | Type                 | Null | Default | Semantic Type |
+--------+----------------------+------+---------+---------------+
| host   | String               | YES  |         | PRIMARY KEY   |
| ts     | TimestampMillisecond | NO   |         | TIME INDEX    |
| cpu    | Float64              | YES  | 0       | VALUE         |
| memory | Float64              | YES  |         | VALUE         |
+--------+----------------------+------+---------+---------------+
4 rows in set (0.00 sec)
```

It outputs the table structure:

* `Field` : the column names.
* `Type`: the column types.
* `Null`:  `yes` means nullable, otherwise `no`.
* `Default`: the column default values.
* `Semantic Type`:  The semantic type of column,  such as `TAG`, `VALUE`,`TIME INDEX` or `PRIMARY KEY`.
