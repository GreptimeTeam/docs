The `DROP TABLE [db.]table` drops the table in `db` or the current database when `db` is not specified.

## Examples
Drop the table `test` in the current database:
```sql
DROP TABLE test;
```
```sql
Query OK, 1 row affected (0.01 sec)
```
**Note: The GreptimeDB 0.1 drops the table logically,it doesn't delete the table data actually.We will fix it ASAP.**


