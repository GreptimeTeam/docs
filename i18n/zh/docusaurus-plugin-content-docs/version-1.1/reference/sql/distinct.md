---
keywords: [SQL DISTINCT 语句, 唯一值选择, 数据去重, SQL 示例, 数据分析]
description: SELECT DISTINCT 用于从一组数据中选择唯一值，可以与过滤条件结合使用。
---

# DISTINCT

`SELECT DISTINCT` 用于删除查询结果中的重复行。选择多个表达式时，只有所有选中值都相同的行才视为重复。

以下查询返回不同的 `idc` 值：

```sql
SELECT DISTINCT idc
FROM system_metrics;
```

`DISTINCT` 对满足 `WHERE` 子句的行进行去重：

```sql
SELECT DISTINCT idc, host
FROM system_metrics
WHERE host != 'host2';
```
