---
keywords: [SQL DISTINCT 语句, 唯一值选择, 数据去重, SQL 示例, 数据分析]
description: SELECT DISTINCT 用于从一组数据中选择唯一值，可以与过滤条件结合使用。
---

# DISTINCT

`SELECT DISTINCT` 用于从一组数据中选择唯一值，从查询的输出中返回唯一值，其基本语法如下：

```sql
SELECT DISTINCT idc
FROM system_metrics;
```

`SELECT DISTINCT` 可以与 filter 结合使用：

```sql
SELECT DISTINCT idc, host
FROM system_metrics
WHERE host != 'host2';
```

`SELECT DISTINCT` 是 GreptimeDB SQL 中一个简单但功能强大的命令，它允许用户将数据压缩成唯一值的综合。它可以用于一个或多个列，使其在数据分析和报告中非常灵活。使用 `SELECT DISTINCT` 是获取表中存储的数据类型概述的好方法。
