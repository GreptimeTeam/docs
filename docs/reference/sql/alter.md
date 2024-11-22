# ALTER

`ALTER` can be used to modify any database options, table options or metadata of the table, including:

* Modify database options
* Add/Drop/Modify a column
* Rename a table
* Modify table options

## ALTER DATABASE

`ALTER DATABASE` statements can be used to modify the options of databases.

### Syntax

```sql
ALTER DATABASE db
   [SET <option_name>=<option_value> [, ...]
    | UNSET <option_name> [, ...]
   ]
```

Currently following options are supported:
- `ttl`: the default retention time of data in database.

### Examples

#### Modify default retention time of data in database

Change the default retention time of data in the database to 1 day:

```sql
ALTER DATABASE db SET 'ttl'='1d';
```

Remove the default retention time of data in the database:

```sql
ALTER DATABASE db UNSET 'ttl';
```

## ALTER TABLE

### Syntax

```sql
ALTER TABLE [db.]table
   [ADD COLUMN name type [options]
    | DROP COLUMN name
    | MODIFY COLUMN name type
    | MODIFY COLUMN name SET FULLTEXT [WITH <options>]
    | MODIFY COLUMN name UNSET FULLTEXT
    | RENAME name
    | SET <option_name>=<option_value> [, ...]
    | UNSET <option_name>[, ...]
   ]
```

### Examples

#### Add column

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

#### Remove column

Removes a column from the table:

```sql
ALTER TABLE monitor DROP COLUMN load_15;
```

The removed column can't be retrieved immediately by all subsequent queries.

#### Modify column type

Modify the date type of a column

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 STRING;
```

The modified column cannot be a tag (primary key) or time index, and it must be nullable to ensure that the data can be safely converted (returns `NULL` on cast failures).

#### Alter table options

`ALTER TABLE` statements can also be used to change the options of tables. 

Currently following options are supported:
- `ttl`: the retention time of data in table.
- `compaction.twcs.time_window`: the time window parameter of TWCS compaction strategy.
- `compaction.twcs.max_output_file_size`: the maximum allowed output file size of TWCS compaction strategy.
- `compaction.twcs.max_active_window_runs`: the maximum allowed sorted runs in the active window of TWCS compaction strategy.
- `compaction.twcs.max_inactive_window_runs`: the maximum allowed sorted runs in the inactive windows of TWCS compaction strategy.
- `compaction.twcs.max_active_window_files`: the maximum allowed number of files in the active window of TWCS compaction strategy.
- `compaction.twcs.max_inactive_window_files`: the maximum allowed number of files in the inactive windows of TWCS compaction strategy.

```sql
ALTER TABLE monitor SET 'ttl'='1d';

ALTER TABLE monitor SET 'compaction.twcs.time_window'='2h';

ALTER TABLE monitor SET 'compaction.twcs.max_output_file_size'='500MB';

ALTER TABLE monitor SET 'compaction.twcs.max_inactive_window_files'='2';

ALTER TABLE monitor SET 'compaction.twcs.max_active_window_files'='2';

ALTER TABLE monitor SET 'compaction.twcs.max_active_window_runs'='6';

ALTER TABLE monitor SET 'compaction.twcs.max_inactive_window_runs'='6';
```

#### Unset options:

```sql
ALTER TABLE monitor UNSET 'ttl';
```

#### Modify column fulltext index options

Enable fulltext index on a column:

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 SET FULLTEXT WITH (analyzer = 'Chinese', case_sensitive = 'false');
```

You can specify the following options using `FULLTEXT WITH` when enabling fulltext options:

- `analyzer`: Sets the language analyzer for the full-text index. Supported values are `English` and `Chinese`. Default is `English`.
- `case_sensitive`: Determines whether the full-text index is case-sensitive. Supported values are `true` and `false`. Default is `false`.

If `WITH <options>` is not specified, `FULLTEXT` will use the default values.

#### Disable fulltext index on a column

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 UNSET FULLTEXT;
```

The column must be a string type to alter the fulltext index.

If the fulltext index has never been enabled, you can enable it and specify the `analyzer` and `case_sensitive` options. When the fulltext index is already enabled on a column, you can disable it but **cannot modify the options**.

#### Rename table

Renames the table:

```sql
ALTER TABLE monitor RENAME monitor_new;
```

This command only renames the table; it doesn't modify the data within the table.
