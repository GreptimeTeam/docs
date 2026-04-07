---

keywords: [SQL OFFSET 子句, 数据检索, 跳过行]
description: 描述 SQL 中的 OFFSET 子句，该子句指定在开始从查询返回行之前要跳过的行数。
---

# OFFSET

`OFFSET` 子句指定在开始从查询返回行之前要跳过的行数。它通常与 LIMIT 结合使用，用于对大型结果集进行分页。

例如：
```sql
SELECT *
FROM system_metrics
ORDER BY cpu_util DESC
LIMIT 10
OFFSET 10;
```

它从 `system_metrics` 表中选择按降序 `cpu_util` 排序的第 11 到 20 行的所有列。

虽然将 `OFFSET` 和 `LIMIT` 与 `ORDER BY` 子句结合使用可以实现分页，但这种方法效率不高。我们建议记录每页返回的最后一条记录的时间索引（时间戳），并使用该值来过滤和限制后续页面的数据。这种方法提供了更好的分页性能。

## 使用时间戳的高效分页
假设您的 `system_metrics` 表有一个作为时间索引（时间戳）的 `ts` 列。您可以使用上一页最后一条记录的时间戳来高效地获取下一页。

第一页（最新的 10 条记录）：
```sql
SELECT *
FROM system_metrics
ORDER BY ts DESC
LIMIT 10;
```

第二页（使用上一页的最后一个时间戳），如果第一页的最后一条记录的 `ts` 值为 `'2024-07-01 16:03:00'`，您可以这样获取下一页：

```sql
SELECT *
FROM system_metrics
WHERE ts < '2024-07-01 16:03:00'
ORDER BY ts DESC
LIMIT 10;
```

每次查询后，记录最后一行的 `ts` 值并将其用于下一个查询的过滤器。
这种方法消除了扫描和跳过行（如使用 OFFSET）的需要，从而使分页效率更高，尤其是在大型表中。