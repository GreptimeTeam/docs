# SHOW

`SHOW` 关键字提供数据库和表信息。

## SHOW DATABASES

展示所有数据库：

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

展示名称符合 `LIKE` 模式的数据库：

```sql
SHOW DATABASES LIKE 'p%';
```
根据 `where` 表达式展示数据库：
```sql
SHOW DATABASES WHERE Schemas='test_public_schema';
```

## SHOW TABLES 

展示所有表：
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

展示 `test` 数据库中的所有表：
```sql
SHOW TABLES FROM test;
```

展示名称符合 `LIKE` 模式的表：

```sql
SHOW TABLES like '%prometheus%';
```
根据 `where` 表达式展示表：
```sql
SHOW TABLES FROM test WHERE Tables='numbers';
```

## SHOW CREATE TABLE

展示创建指定表的 `CREATE TABLE` 语句：

```sql
SHOW CREATE TABLE [table]
```

例如：

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
