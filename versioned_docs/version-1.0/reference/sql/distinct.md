---
keywords: [SQL DISTINCT, SQL unique values, SQL syntax, SQL examples, SQL data filtering]
description: Explains the SQL SELECT DISTINCT statement used to retrieve unique values from a dataset, with examples of using DISTINCT with and without filters.
---

# DISTINCT

`SELECT DISTINCT` is used to select unique values from a set of data. This keyword returns distinct values
from the output of the query.

The basic syntax for a `SELECT DISTINCT` statement is as followings:

```sql
SELECT DISTINCT idc
FROM system_metrics;
```

`SELECT DISTINCT` can be used in conjunction with filters.

```sql
SELECT DISTINCT idc, host
FROM system_metrics
WHERE host != 'host2';
```

`SELECT DISTINCT` is a simple but powerful command of GreptimeDB SQL that allows users to easily condense the data into a summary of unique values. It can be used on one column or multiple columns, making it very versatile for data analysis and reporting. Using "SELECT DISTINCT" is a great way to get an overview of the types of data stored in the tables.
