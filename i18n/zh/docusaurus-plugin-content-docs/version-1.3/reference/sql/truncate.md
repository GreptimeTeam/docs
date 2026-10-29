---
keywords: [TRUNCATE TABLE, SQL 删除, 高效删除, 数据库操作, SQL 示例]
description: 介绍保留表定义并高效删除全部数据行的 `TRUNCATE TABLE` 语句。
---

# TRUNCATE

`TRUNCATE TABLE` 删除表中的所有数据行，但保留表定义。它比 `DELETE FROM table` 高效得多。

```sql
TRUNCATE TABLE monitor;
```

```sql
Query OK, 0 rows affected (0.02 sec)
```
