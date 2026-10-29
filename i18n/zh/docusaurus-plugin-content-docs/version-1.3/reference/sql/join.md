---
keywords: [SQL JOIN 子句, 表连接, INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, SQL 示例]
description: JOIN 用于组合两个或多个表中基于相关列的行，支持 INNER JOIN、LEFT JOIN、RIGHT JOIN 和 FULL OUTER JOIN。
---

# JOIN

`JOIN` 用于组合两个或多个表中基于相关列的行。
它允许你从多个表中提取数据，并将其呈现为单个结果集。

JOIN 语法有以下类型：

- INNER JOIN：仅返回两个表中具有匹配值的行。
- LEFT JOIN：返回左表中的所有行和右表中的匹配行。
- RIGHT JOIN：返回右表中的所有行和左表中的匹配行。
- FULL OUTER JOIN：返回两个表中的所有行。

## 示例

下面是使用 JOIN 子句的一些示例：

```sql
-- Select all rows from the system_metrics table and idc_info table where the idc_id matches
SELECT a.*
FROM system_metrics a
JOIN idc_info b
ON a.idc = b.idc_id;

-- Select all rows from the idc_info table and system_metrics table where the idc_id matches, and include null values for idc_info without any matching system_metrics
SELECT a.*
FROM idc_info a
LEFT JOIN system_metrics b
ON a.idc_id = b.idc;

-- Select all rows from the system_metrics table and idc_info table where the idc_id matches, and include null values for idc_info without any matching system_metrics
SELECT b.*
FROM system_metrics a
RIGHT JOIN idc_info b
ON a.idc = b.idc_id;
```
