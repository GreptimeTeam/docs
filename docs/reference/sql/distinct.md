`SELECT DISTINCT` indicates that we want to select unique values from a set of data. This keyword will filter the
results of a query to only return distinct (different) values. 

The basic syntax for a `SELECT DISTINCT` statement is as follows:

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

The `SELECT DISTINCT` keyword is a simple but powerful feature of GreptimeDB SQL that allows us to easily condense
our data into a summary of unique values. It can be used on one column or multiple columns, making it very versatile
for data analysis and reporting. Using "SELECT DISTINCT" is a great way to get an overview of the types of data
stored in our tables.
