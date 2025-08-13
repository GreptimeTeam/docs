---
keywords: [SQL JOIN, INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, SQL examples, SQL syntax]
description: Explains the usage of SQL JOIN clauses to combine rows from multiple tables based on related columns, including INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN, with examples.
---

# JOIN

`JOIN` is used to combine rows from two or more tables based on a related column between them.
It allows you to extract data from multiple tables and present it as a single result set.

There are several types of JOIN clauses:

- INNER JOIN: Returns only the rows that have matching values in both tables.
- LEFT JOIN: Returns all the rows from the left table and the matching rows from the right table.
- RIGHT JOIN: Returns all the rows from the right table and the matching rows from the left table.
- FULL OUTER JOIN: Returns all the rows from both tables.

## Examples

Here are some examples of using JOIN clauses:

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
