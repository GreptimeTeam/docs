---

keywords: [SQL HAVING 子句, 数据检索, 过滤聚合函数行]
description: 描述 SQL 中的 HAVING 子句，该子句用于过滤聚合函数的行。
---

# HAVING

`HAVING` 子句允许你过滤分组（聚合）结果——它的作用类似于 `WHERE`，但是在分组发生之后才起作用。 `HAVING` 子句被添加到 SQL 中，是因为 `WHERE` 子句不能与聚合函数一起使用。

## 例子

查找平均 CPU 利用率超过 80% 的日期窗口：
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

查找错误日志数量大于 100 的小时窗口：
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