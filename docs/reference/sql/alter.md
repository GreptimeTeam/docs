The keyword `ALERT` modifies the table settings or data:
* Add/Drop Columns
* Rename table

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

The column definition is the same as in [CREATE](./create.md).

## Remove column
Removes a column from the table:
```sql
ALTER TABLE monitor DROP COLUMN load_15;
```

The removed column can't be retrieved immediately by all subsequent queries.

## Rename table
Rename the table:
```sql
ALTER TABLE monitor RENAME monitor_new;
```

It just renames the table and doesn't modify the table data at all.
