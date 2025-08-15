---
keywords: [TRUNCATE TABLE, SQL 删除, 高效删除, 数据库操作, SQL 示例]
description: 介绍了 `TRUNCATE TABLE` 语句的用法，用于高效地删除表中的所有数据。
---

# TRUNCATE

`TRUNCATE TABLE table` 语句用于删除表中的所有数据。它比 `DELETE FROM table` 高效得多。

```sql
TRUNCATE TABLE monitor;
```

```sql
Query OK, 0 rows affected (0.02 sec)
```
