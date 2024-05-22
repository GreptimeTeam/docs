# DROP

## DROP DATABASE

`DROP DATABASE` drops a database. It removes the catalog entries for the database and deletes the directory containing the data.
It cannot be executed while you are connected to the target database.
Also, if anyone else is connected to the target database, this command will fail unless you use the `FORCE` option described below.

:::danger Danger

`DROP DATABASE` cannot be undone. Use it with care!

:::

### Syntax

```sql
DROP DATABASE [ IF EXISTS ] db_name
```

- `IF EXISTS`: Do not throw an error if the database does not exist.
- `db_name`: The name of the database to remove.

### Examples

To drop a database named `test`:

```sql
DROP DATABASE test;
```


## DROP TABLE

`DROP TABLE` removes tables from the database. It will remove the table definition and all table data, indexes, rules, and constraints for that table.

:::danger Danger

`DROP TABLE` cannot be undone. Use it with care!

:::

### Syntax

```sql
DROP TABLE [ IF EXISTS ] table_name
```

- `IF EXISTS`: Do not throw an error if the table does not exist.
- `table_name`: The name of the table to remove.


### Examples

Drop the table `monitor` in the current database:
  
```sql
DROP TABLE monitor;
```
