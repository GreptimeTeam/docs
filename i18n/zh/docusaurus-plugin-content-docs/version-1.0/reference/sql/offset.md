---

keywords: [SQL OFFSET 子句, 数据检索, 跳过行]
description: 描述 SQL 中的 OFFSET 子句，该子句指定在开始从查询返回行之前要跳过的行数。
---

# OFFSET

`OFFSET` 子句指定查询在返回结果前要跳过的行数，通常与 `LIMIT` 结合用于分页。

例如：
```sql
SELECT *
FROM system_metrics
ORDER BY cpu_util DESC
LIMIT 10
OFFSET 10;
```

它从 `system_metrics` 表中选择按降序 `cpu_util` 排序的第 11 到 20 行的所有列。

页数增加时，`OFFSET` 需要跳过的行数也会增加。对于大型结果集，应使用能唯一标识每一行的排序键进行 keyset pagination。多行可能具有相同时间戳，因此只记录时间戳并不可靠。

## 使用时间戳的高效分页
假设 `(ts, host, idc)` 可以唯一排序 `system_metrics` 中的数据行。查询时对这三列排序，并记录每页最后一行的对应值。

第一页（最新的 10 条记录）：
```sql
SELECT *
FROM system_metrics
ORDER BY ts DESC, host DESC, idc DESC
LIMIT 10;
```

如果第一页的最后一行为 `('2024-07-01 16:03:00', 'host2', 'idc_b')`，使用复合游标获取下一页：

```sql
SELECT *
FROM system_metrics
WHERE ts < '2024-07-01 16:03:00'
   OR (ts = '2024-07-01 16:03:00' AND host < 'host2')
   OR (ts = '2024-07-01 16:03:00' AND host = 'host2' AND idc < 'idc_b')
ORDER BY ts DESC, host DESC, idc DESC
LIMIT 10;
```

游标列必须能稳定且唯一地排序查询结果。如果 `(ts, host, idc)` 不唯一，需要在 `ORDER BY` 和游标条件中加入另一个 tie-breaker 列。这种方法避免反复扫描并跳过前面页面的数据，在大型结果集上分页效率更高。
