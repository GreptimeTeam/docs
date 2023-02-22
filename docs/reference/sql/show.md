The `SHOW` keyword  provides  database and table information.

# Examples

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

