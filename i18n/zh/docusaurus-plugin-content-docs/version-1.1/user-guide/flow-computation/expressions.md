---
keywords: [聚合函数, 标量函数, count, sum, avg, min, max, date_bin, date_trunc, trunc]
description: 列出了 GreptimeDB 中 flow 支持的聚合函数和标量函数。
---

# 表达式

## 聚合函数

Flow 支持 SQL 查询引擎和 Flow 计划所支持的聚合函数，例如 `COUNT`、`SUM`、`MIN` 和 `MAX`。如果查询计划不受支持，Flow 会在创建时失败。有关详细的函数列表，请参阅[聚合函数](/reference/sql/functions/df-functions.md#aggregate-functions)。

## 标量函数

Flow 支持 SQL 查询引擎和 Flow 计划所支持的标量函数。如果查询计划不受支持，Flow 会在创建时失败。详见我们的 [SQL 参考](/reference/sql/functions/overview.md)。

以下是 Flow 中一些常用的标量函数：

- [`date_bin`](/reference/sql/functions/df-functions.md#date_bin): 计算时间间隔，并返回最接近指定时间戳的区间起点。
- [`date_trunc`](/reference/sql/functions/df-functions.md#date_trunc): 将时间戳截断到指定精度。
- [`trunc`](/reference/sql/functions/df-functions.md#trunc): 将数字截断为整数或指定的小数位数。
