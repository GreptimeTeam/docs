---
keywords: [CASE statement, SQL, conditional logic, query, syntax, examples]
description: Describes the `CASE` statement used for conditional logic within queries, including syntax and examples for usage in `SELECT`, `WHERE`, `GROUP BY`, and `ORDER BY` clauses.
---

# CASE

The `CASE` statement allows you to perform conditional logic within your queries,
similar to an IF-THEN-ELSE structure in programming languages.
It enables you to return specific values based on evaluated conditions,
making data retrieval and manipulation more dynamic.

## Syntax

```sql
CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ...
    ELSE result
END
```

- `condition1`, `condition2`, ...: The conditions to evaluate against the expression.
- `result1`, `result2`, ...: The values to return when the corresponding condition is met.
- `result`: The value to return when none of the conditions are met (optional).


## Examples

The `CASE` statement can be used in various clauses, such as `SELECT`, `WHERE`, `ORDER BY` and `GROUP BY`.

### Use `CASE` in `SELECT`

In the `SELECT` clause, you can use the `CASE` statement to create new columns based on conditions.
please see [the example](/user-guide/query-data/sql.md#case) in the query data guide.

You can also use `CASE` with functions like `SUM` to conditionally aggregate data.
for example, you can calculate the total number of logs with status 200 and 404:

```sql
SELECT
    SUM(CASE WHEN status_code = '200' THEN 1 ELSE 0 END) AS status_200_count,
    SUM(CASE WHEN status_code = '404' THEN 1 ELSE 0 END) AS status_404_count
FROM nginx_logs;
```

### Use `CASE` in `WHERE`

In the `WHERE` clause, you can filter rows based on conditions.
For example, the following query retrieves data from the `monitor` table based on the `ts` condition:

```sql
SELECT * 
FROM monitor 
WHERE host = CASE 
                  WHEN ts > '2023-12-13 02:05:46' THEN '127.0.0.1' 
                  ELSE '127.0.0.2' 
              END;
```

### Use `CASE` in `GROUP BY`

The `CASE` statement can be utilized in the `GROUP BY` clause to categorize data based on specific conditions. For instance, the following query groups data by the `host` column and classifies the `cpu` column into three categories: 'high', 'medium', and 'low':

```sql
SELECT
    host,
    COUNT(*) AS count,
    CASE
        WHEN cpu > 0.5 THEN 'high'
        WHEN cpu > 0.3 THEN 'medium'
        ELSE 'low'
    END AS cpu_status
FROM monitor
GROUP BY 
    host, cpu_status;
```

### Use `CASE` in `ORDER BY`

According to GreptimeDB's [data model](/user-guide/concepts/data-model.md),
the `Tag` columns are indexed and can be used in the `ORDER BY` clause to enhance query performance.
For instance, if the `status_code` and `http_method` columns in the `nginx_logs` table are `Tag` columns storing string values,
you can utilize the `CASE` statement to sort the data based on these columns as follows:

```sql
SELECT *
FROM nginx_logs
ORDER BY
    CASE
        WHEN status_code IS NOT NULL THEN status_code
        ELSE http_method
    END;
```

