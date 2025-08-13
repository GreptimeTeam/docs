---
keywords: [聚合函数, 标量函数, count, sum, avg, min, max, date_bin, date_trunc, trunc]
description: 列出了 GreptimeDB 中 flow 支持的聚合函数和标量函数。
---

# 表达式

## 聚合函数

Flow 支持标准 SQL 查询所支持的所有聚合函数，例如 `COUNT`、`SUM`、`MIN`、`MAX` 等。

有关详细的函数列表，请参阅 [聚合函数](/reference/sql/functions/df-functions.md#aggregate-functions)。

## 标量函数

Flow 支持标准 SQL 查询所支持的所有标量函数，详见我们的 [SQL 参考](/reference/sql/functions/overview.md)。

以下是一些 flow 中最常用的标量函数：

- [`date_bin`](/reference/sql/functions/df-functions.md#date_bin): calculate time intervals and returns the start of the interval nearest to the specified timestamp.
- [`date_trunc`](/reference/sql/functions/df-functions.md#date_trunc): truncate a timestamp value to a specified precision.
- [`trunc`](/reference/sql/functions/df-functions.md#trunc): truncate a number to a whole number or truncated to the specified decimal places.