---
keywords: [TRUNCATE TABLE, SQL 删除, 高效删除, 数据库操作, SQL 示例]
description: 介绍保留表定义并高效删除全部数据行的 `TRUNCATE TABLE` 语句。
---

# TRUNCATE

`TRUNCATE TABLE` 删除表中的所有数据行，但保留表定义。它比 `DELETE FROM table` 高效得多。

## 语法

```sql
TRUNCATE TABLE table_name [ WITH (option = value, ...) ]
```

- `table_name`：要清空的表名。
- `WAIT`：是否等待操作完成，默认为 `true`。设为 `true` 时，语句会等待操作完成，并报告受影响行数为 0。设为 `false` 时，提交成功后会返回仅包含 `Procedure ID` 列的结果集，操作则在后台继续执行。可将返回的 `procedure_id` 传入 `ADMIN procedure_state(procedure_id)` 查询状态（参见 [ADMIN](/reference/sql/admin.md)）。
- `TIMEOUT`：元数据检查和提交操作的总时限，默认为 `'60s'`。当 `WAIT` 为 `true` 时，等待操作完成的时间也计入该时限。它不限制清空操作本身的执行时长。超时后，语句会返回错误；已经提交的操作不会被取消，仍会在后台继续执行。

## 示例

清空表 `monitor` 并等待操作完成：

```sql
TRUNCATE TABLE monitor;
```

```sql
Query OK, 0 rows affected (0.02 sec)
```

提交操作后立即返回，不等待完成，并将元数据检查和提交操作的总时限设为 30 秒：

```sql
TRUNCATE TABLE monitor WITH (WAIT = false, TIMEOUT = '30s');
```
