---
keywords: [SQL HAVING clause, data retrieval, filtering rows for aggregate functions]
description: Describes the HAVING clause in SQL, which is used to filter rows for aggregate functions.
---

# HAVING

The `HAVING` clause allows you to filter grouped (aggregated) results—it works like `WHERE`, but after grouping has taken place. The `HAVING` clause was added to SQL because the `WHERE` clause cannot be used with aggregate functions.


## Examples
Find days where the average CPU utilization exceeded 80%:
```sql
SELECT
  date_trunc('day', ts) AS day,
  AVG(cpu_util) AS avg_cpu_util
FROM
  system_metrics
GROUP BY
  day
HAVING
  avg_cpu_util > 80;
```

Find hours where the number of error logs is greater than 100:
```sql
SELECT
  DATE_TRUNC('hour', log_time) AS hour,
  COUNT(*) AS error_count
FROM
  application_logs
WHERE
  log_level = 'ERROR'
GROUP BY
  hour
HAVING
  error_count > 100;
```