# ALTER

`ALTER` can be used to modify any table settings or data within the table:

* Add/Drop/Modify a column
* Rename a table

## Syntax

```sql
ALTER TABLE [db.]table
   [ADD COLUMN name type [options]
    | DROP COLUMN name
    | MODIFY COLUMN name type
    | RENAME name
   ]
```

## Examples

### Add column

Adds a new column to the table:

```sql
ALTER TABLE monitor ADD COLUMN load_15 double;
```

Definition of column is the same as in [CREATE](./create.md).

We can set the new column's location. In first position for example:

```sql
ALTER TABLE monitor ADD COLUMN load_15 double FIRST;
```

After an existing column:

```sql
ALTER TABLE monitor ADD COLUMN load_15 double AFTER memory;
```

Adds a new column as a tag(primary key) with a default value:
```sql
ALTER TABLE monitor ADD COLUMN app STRING DEFAULT 'shop' PRIMARY KEY;
```

### Remove column

Removes a column from the table:

```sql
ALTER TABLE monitor DROP COLUMN load_15;
```

The removed column can't be retrieved immediately by all subsequent queries.

### Modify column type

Modify the date type of a column

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 STRING;
```

The modified column cannot be a tag (primary key) or time index, and it must be nullable to ensure that the data can be safely converted (returns `NULL` on cast failures).

### Rename table

Renames the table:

```sql
ALTER TABLE monitor RENAME monitor_new;
```

This command only renames the table; it doesn't modify the data within the table.
