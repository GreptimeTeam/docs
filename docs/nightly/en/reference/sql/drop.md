# DROP

## DROP TABLE

`DROP TABLE` removes tables from the database. It will remove the table definition and all table data, indexes, rules, and constraints for that table.

### Syntax

```sql
DROP TABLE [ IF EXISTS ] table_name [, ...]
```

- `IF EXISTS`: Do not throw an error if the table does not exist.
- `table_name`: The name of the table to remove.


### Examples

To destroy two tables, `monitor` and `system_metrics`:
  
```sql
DROP TABLE monitor, system_metrics;
```
