---

keywords: [SQL HAVING 子句, 数据检索, 过滤聚合函数行]
description: 描述 SQL 中的 HAVING 子句，该子句用于过滤聚合函数的行。
---

# HAVING

`WHERE` 在分组前过滤输入行，`HAVING` 在分组后过滤分组或聚合结果。

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