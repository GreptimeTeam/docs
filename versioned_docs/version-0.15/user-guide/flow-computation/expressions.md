---
keywords: [expressions, aggregate functions, scalar functions, data transformation, SQL functions]
description: Lists supported aggregate and scalar functions in GreptimeDB's flow, including count, sum, avg, min, max, and various scalar functions. It provides links to detailed documentation for each function.
---

# Expressions

## Aggregate functions

Flow support all aggregate functions that a normal sql query supports such as `COUNT`, `SUM`, `MIN`, `MAX`, etc. For a detailed list, please refer to [Aggregate Functions](/reference/sql/functions/df-functions.md#aggregate-functions).


## Scalar functions

Flow support all scalar functions that a normal sql query supports in our [SQL reference](/reference/sql/functions/overview.md).

And here are some of the most commonly used scalar functions in flow:

- [`date_bin`](/reference/sql/functions/df-functions.md#date_bin): calculate time intervals and returns the start of the interval nearest to the specified timestamp.
- [`date_trunc`](/reference/sql/functions/df-functions.md#date_trunc): truncate a timestamp value to a specified precision.
- [`trunc`](/reference/sql/functions/df-functions.md#trunc): truncate a number to a whole number or truncated to the specified decimal places.
