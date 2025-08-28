---
keywords: [ES, Elasticsearch, GreptimeDB, QueryDSL]
description: GreptimeDB 企业版所支持的 QueryDSL 语法
---

# 聚合查询

## 指标聚合

在 GreptimeDB 中，指标聚合用于对数值字段进行统计计算，例如求和、平均值、最大值、最小值等。

### sum

在 GreptimeDB 中，`sum` 聚合用于计算数值字段的总和。

### avg

在 GreptimeDB 中，`avg` 聚合用于计算数值字段的平均值。

### max

在 GreptimeDB 中，`max` 聚合用于计算数值字段的最大值。

### min

在 GreptimeDB 中，`min` 聚合用于计算数值字段的最小值。

## 桶聚合

在 GreptimeDB 中，桶聚合用于对文档进行分组，例如按时间、地理位置等字段进行分桶。

### date_histogram

在 GreptimeDB 中，`date_histogram` 聚合用于对时间字段进行分桶。

### terms

在 GreptimeDB 中，`terms` 聚合用于对指定字段的值进行分组。
