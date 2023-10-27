# 管理表

GreptimeDB 通过 SQL 提供了表管理的功能，下面通过 [MySQL Command-Line Client](https://dev.mysql.com/doc/refman/8.0/en/mysql.html) 来演示它。

## 创建数据库

默认的数据库是 `public`，可以手动创建一个数据库。

```sql
CREATE DATABASE test;
```

```sql
Query OK, 1 row affected (0.05 sec)
```
