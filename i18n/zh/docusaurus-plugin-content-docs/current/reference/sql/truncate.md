---
keywords: [TRUNCATE TABLE, SQL 删除, 高效删除, 数据库操作, SQL 示例]
description: 介绍保留表定义并高效删除全部数据行的 `TRUNCATE TABLE` 语句。
---

# TRUNCATE

`TRUNCATE TABLE` 删除表中的所有数据行，但保留表定义。它比 `DELETE FROM table` 高效得多。

默认情况下，`TRUNCATE TABLE` 会等待操作完成，超时时间为 60 秒。可以使用 `WITH` 设置 `wait` 和 `timeout` 选项：

```sql
TRUNCATE TABLE monitor WITH (wait = false, timeout = '30s');
```

- `wait` 默认为 `true`。设为 `true` 时，语句会等待操作完成，并返回 `Affected Rows: 0`。设为 `false` 时，操作成功提交后会返回 Procedure ID，操作则在后台继续执行。
- `timeout` 用于限制元数据检查、提交操作以及（`wait` 为 `true` 时）等待操作完成的总时长，默认为 `60s`。如果超时，语句会返回超时错误，但已提交的操作不会取消，仍会在后台继续执行。

```sql
TRUNCATE TABLE monitor;
```

```sql
Query OK, 0 rows affected (0.02 sec)
```
