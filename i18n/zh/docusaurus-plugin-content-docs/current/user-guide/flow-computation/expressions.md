---
description: 列出了 GreptimeDB 中 flow 支持的聚合函数和标量函数。
---

# 表达式

## 聚合函数

此处列出了 flow 中所有支持的聚合函数。

- `count(column)`: 行数。
- `sum(column)`: 列的和。
- `avg(column)`: 列的平均值。
- `min(column)`: 列的最小值。
- `max(column)`: 列的最大值。

未来将添加更多聚合函数。

## Scalar functions

Flow 支持大多数 datafusion 中的标量函数，有关支持的标量函数的完整列表，请参见[datafusion](/reference/sql/functions/df-functions.md#scalar-functions)。

以下是一些 flow 中最常用的标量函数：

- [`date_bin`](/reference/sql/functions/df-functions.md#date_bin): calculate time intervals and returns the start of the interval nearest to the specified timestamp.
- [`date_trunc`](/reference/sql/functions/df-functions.md#date_trunc): truncate a timestamp value to a specified precision.
- [`trunc`](/reference/sql/functions/df-functions.md#trunc): truncate a number to a whole number or truncated to the specified decimal places.