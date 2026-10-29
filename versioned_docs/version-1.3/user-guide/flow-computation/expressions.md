---
keywords: [expressions, aggregate functions, scalar functions, data transformation, SQL functions]
description: Lists supported aggregate and scalar functions in GreptimeDB's flow, including count, sum, avg, min, max, and various scalar functions. It provides links to detailed documentation for each function.
---

# Expressions

## Aggregate functions

Flow supports aggregate functions that are supported by the SQL query engine and the Flow plan, such as `COUNT`, `SUM`, `MIN`, and `MAX`. Unsupported query plans fail when the Flow is created. For a detailed list, please refer to [Aggregate Functions](/reference/sql/functions/df-functions.md#aggregate-functions).


## Scalar functions

Flow supports scalar functions that are supported by the SQL query engine and the Flow plan. Unsupported query plans fail when the Flow is created. See our [SQL reference](/reference/sql/functions/overview.md) for the function catalogue.

Here are some commonly used scalar functions in Flow:

- [`date_bin`](/reference/sql/functions/df-functions.md#date_bin): calculates time intervals and returns the start of the interval nearest to the specified timestamp.
- [`date_trunc`](/reference/sql/functions/df-functions.md#date_trunc): truncate a timestamp value to a specified precision.
- [`trunc`](/reference/sql/functions/df-functions.md#trunc): truncate a number to a whole number or to the specified decimal places.
