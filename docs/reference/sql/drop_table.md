`DROP TABLE [db.]table` is used to drop the table in `db` or the current database in-use.

## Examples
Drop the table `test` in the current database:
```sql
DROP TABLE test;
```
```sql
Query OK, 1 row affected (0.01 sec)
```
**Note: GreptimeDB V0.1 drops the table at the conceptual level, without actually deleting the content of the table. We will fix it ASAP.**


