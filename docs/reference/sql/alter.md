The keyword `ALERT` modifies table settings or data:
* Add/Drop a column
* Rename a table

# Syntax
```sql
ALTER TABLE [db.]table
   [ADD COLUMN name type ... 
    | DROP COLUMN name
    | RENAME name
   ]
```

# Examples
## Add column
Adds a new column to the table:
```sql
ALTER TABLE monitor ADD COLUMN load_15 double;
```

Definition of column is the same as in [CREATE](./create.md).

## Remove column
Removes a column from the table:
```sql
ALTER TABLE monitor DROP COLUMN load_15;
```

The removed column can't be retrieved immediately by all subsequent queries.

## Rename table
Renames the table:
```sql
ALTER TABLE monitor RENAME monitor_new;
```

This command only renames the table; it doesn't modify the data within the table.
