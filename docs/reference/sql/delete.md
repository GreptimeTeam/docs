The `DELETE` keyword removes rows from table.

# Syntax

```sql
DELETE FROM [db.]table WHERE expr
```

It will removes rows from table `[db.]table` that satisfy the expression `expr` after `WHERE`. The removed rows are marked immediately and can't be retrieved by all subsequent queries.
 
 **NOTE: The GreptimeDB 0.1 only supports deleting rows matches primary key and timestamp index.We will support deleting rows by any `WHERE` expression ASAP.**
 
# Example
For example,there is a table with primary key `host`:
```sql
CREATE TABLE monitor ( host STRING, ts TIMESTAMP, cpu DOUBLE DEFAULT 0, memory DOUBLE, TIME INDEX (ts), PRIMARY KEY(host)) ;
```

Delete a row from it by primary key `host` and timestamp index `ts`:
```sql
DELETE FROM monitor WHERE host = 'host1' and ts = 1655276557000;
```