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

Show databases by `where` expr:

```sql
SHOW DATABASES WHERE Schemas='test_public_schema';
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

Show tables by `where` expr:

```sql
SHOW TABLES FROM test WHERE Tables='numbers';
```

## SHOW FULL TABLES

```sql
SHOW FULL TABLES [IN | FROM] [DATABASE] [LIKE pattern] [WHERE query]
```

It will list all tables and table types in the database:

```sql
SHOW FULL TABLES;
```

```sql
+---------+------------+
| Tables  | Table_type |
+---------+------------+
| monitor | BASE TABLE |
| numbers | TEMPORARY  |
+---------+------------+
2 rows in set (0.00 sec)
```

* `Tables`: the table names.
* `Table_type`: the table types, such as `BASE_TABLE`, `TEMPORARY`, and  `VIEW` etc.

It supports `like` and `where` query too:

```sql
SHOW FULL TABLES FROM public like '%mo%';
```

```sql
+---------+------------+
| Tables  | Table_type |
+---------+------------+
| monitor | BASE TABLE |
+---------+------------+
1 row in set (0.01 sec)
```

```sql
SHOW FULL TABLES WHERE Table_type='BASE TABLE';
```

```sql
+---------+------------+
| Tables  | Table_type |
+---------+------------+
| monitor | BASE TABLE |
+---------+------------+
1 row in set (0.01 sec)
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
+----------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table          | Create Table                                                                                                                                                                                                                                                                                                                 |
+----------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| system_metrics | CREATE TABLE IF NOT EXISTS `system_metrics` (
  `host` STRING NULL,
  `idc` STRING NULL,
  `cpu_util` DOUBLE NULL,
  `memory_util` DOUBLE NULL,
  `disk_util` DOUBLE NULL,
  `ts` TIMESTAMP(3) NOT NULL DEFAULT current_timestamp(),
  TIME INDEX (`ts`),
  PRIMARY KEY (`host`, `idc`)
)

ENGINE=mito
WITH(
  regions = 1
) |
+----------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

* `Table`: the table name.
* `Create Table`: The SQL to create the table.
