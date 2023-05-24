# SHOW

The `SHOW` keyword provides database and table information.

## SHOW DATABASES

Show all databases:
```sql
SHOW DATABASES;
```
```sql
+---------+
| Schemas |
+---------+
| public  |
+---------+
1 row in set (0.01 sec)
```

Show databases by `LIKE` pattern:
```sql
SHOW DATABASES LIKE 'p%';
```

## SHOW TABLES 

Show all tables:
```sql
SHOW TABLES;
```
```sql
+---------+
| Tables  |
+---------+
| numbers |
| scripts |
+---------+
2 rows in set (0.00 sec)
```

Show tables in the `test` database:
```sql
SHOW TABLES FROM test;
```

Show tables by `like` pattern:
```sql
SHOW TABLES like '%prometheus%';
```

## SHOW CREATE TABLE

Shows the `CREATE TABLE` statement that creates the named table:

```sql
SHOW CREATE TABLE [table]
```

For example:
```sql
SHOW CREATE TABLE system_metrics;
```

```sql
+----------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table          | Create Table                                                                                                                                                                                                                                                                                            |
+----------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| system_metrics | CREATE TABLE IF NOT EXISTS system_metrics (
  host STRING NULL,
  idc STRING NULL,
  cpu_util DOUBLE NULL,
  memory_util DOUBLE NULL,
  disk_util DOUBLE NULL,
  ts TIMESTAMP(3) NOT NULL DEFAULT current_timestamp(),
  TIME INDEX (ts),
  PRIMARY KEY (host, idc)
)
ENGINE=mito
WITH(
  regions = 1
) |
+----------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```