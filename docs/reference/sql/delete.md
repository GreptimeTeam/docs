# DELETE

`DELETE` is used to remove rows from a table.

## Syntax

```sql
DELETE FROM [db.]table WHERE expr
```

It removes rows from the table `[db.]table` that satisfies the expression `expr` after `WHERE`. The removed rows are marked immediately and can't be retrieved by all subsequent queries.
 
 **NOTE: GreptimeDB 0.1 only supports deleting rows that match the primary key and timestamp index. Later version will soon be able to delete rows by using the `WHERE` expressions.**
 
## Example
For example, there is a table with the primary key `host`:
```sql
CREATE TABLE monitor ( host STRING, ts TIMESTAMP, cpu DOUBLE DEFAULT 0, memory DOUBLE, TIME INDEX (ts), PRIMARY KEY(host)) ;
```

To delete a row from it by primary key `host` and timestamp index `ts`:
```sql
DELETE FROM monitor WHERE host = 'host1' and ts = 1655276557000;
```