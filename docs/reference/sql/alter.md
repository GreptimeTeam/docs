---
keywords: [ALTER statement, SQL, modify database, modify table, alter column, table options]
description: Describes the `ALTER` statement used to modify database options, table options, or metadata, including syntax and examples for altering databases and tables.
---

# ALTER

`ALTER` can be used to modify any database options, table options or metadata of the table, including:

* Modify database options
* Add/Drop/Modify a column
* Set/Drop column default values
* Drop column default values
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
- `ttl`: Specifies the default retention time for data in the database. Data exceeding this retention period will be deleted asynchronously.
   - If `ttl` was not previously set, defining a new `ttl` using `ALTER` will result in the deletion of data that exceeds the specified retention time.
   - If `ttl` was already set, modifying it via `ALTER` will enforce the updated retention time immediately, removing data that exceeds the new retention threshold.
   - If `ttl` was previously set and is unset using `ALTER`, new data will no longer be deleted. However, data that was previously deleted due to the retention policy cannot be restored.
- `compaction.twcs.time_window`: the time window parameter of TWCS compaction strategy. The value should be a [time duration string](/reference/time-durations.md).
- `compaction.twcs.max_output_file_size`: the maximum allowed output file size of TWCS compaction strategy.
- `compaction.twcs.trigger_file_num`: the number of files in a specific time window to trigger a compaction.

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

#### Modify compaction options of database

Change the compaction time window for the database:

```sql
ALTER DATABASE db SET 'compaction.twcs.time_window'='2h';
```

Change the maximum output file size for compaction:

```sql
ALTER DATABASE db SET 'compaction.twcs.max_output_file_size'='500MB';
```

Change the trigger file number for compaction:

```sql
ALTER DATABASE db SET 'compaction.twcs.trigger_file_num'='8';
```

Remove compaction options:

```sql
ALTER DATABASE db UNSET 'compaction.twcs.time_window';
```

## ALTER TABLE

### Syntax

```sql
ALTER TABLE [db.]table
   [ADD COLUMN name1 type1 [options], ADD COLUMN name2 type2 [options], ...
    | DROP COLUMN name
    | MODIFY COLUMN name type
    | MODIFY COLUMN name SET DEFAULT value
    | MODIFY COLUMN name DROP DEFAULT
    | MODIFY COLUMN name SET FULLTEXT INDEX [WITH <options>]
    | MODIFY COLUMN name UNSET FULLTEXT INDEX
    | RENAME name
    | SET <option_name>=<option_value> [, ...]
    | UNSET <option_name>[, ...]
   ]
```


### Add column

Adds a new column to the table:

```sql
ALTER TABLE monitor ADD COLUMN load_15 double;
```

Definition of column is the same as in [CREATE](./create.md).

Also, we can add multiple columns to the table at the same time:

```sql
ALTER TABLE monitor ADD COLUMN disk_usage double, ADD COLUMN disk_free double;
```

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

### Set column default value

Set a default value for an existing column:

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 SET DEFAULT 0.0;
```

Set a string default value:

```sql
ALTER TABLE monitor MODIFY COLUMN `status` SET DEFAULT 'active';
```

The default value will be used for new rows when no explicit value is provided for the column during insertion.

Remove the default value from a column:

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 DROP DEFAULT;
```

After dropping the default value, the column will use `NULL` as the default. The database only allow dropping defaults for nullable columns.

### Alter table options

`ALTER TABLE` statements can also be used to change the options of tables. 

Currently following options are supported:
- `ttl`: the retention time of data in table.
- `compaction.twcs.time_window`: the time window parameter of TWCS compaction strategy. The value should be a [time duration string](/reference/time-durations.md).
- `compaction.twcs.max_output_file_size`: the maximum allowed output file size of TWCS compaction strategy.
- `compaction.twcs.trigger_file_num`: the number of files in a specific time window to trigger a compaction.

```sql
ALTER TABLE monitor SET 'ttl'='1d';

ALTER TABLE monitor SET 'compaction.twcs.time_window'='2h';

ALTER TABLE monitor SET 'compaction.twcs.max_output_file_size'='500MB';

ALTER TABLE monitor SET 'compaction.twcs.trigger_file_num'='8';
```

### Unset table options

```sql
ALTER TABLE monitor UNSET 'ttl';
```

### Create an index for a column

Enable inverted index on a column:

```sql
ALTER TABLE monitor MODIFY COLUMN host SET INVERTED INDEX;
```

Enable fulltext index on a column:

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 SET FULLTEXT INDEX WITH (analyzer = 'Chinese', case_sensitive = 'false', backend = 'bloom', granularity = 1024, false_positive_rate = 0.01);
```

You can specify the following options using `FULLTEXT INDEX WITH` when enabling fulltext options:

- `analyzer`: Sets the language analyzer for the full-text index. Supported values are `English` and `Chinese`. Default is `English`.
- `case_sensitive`: Determines whether the full-text index is case-sensitive. Supported values are `true` and `false`. Default is `false`.
- `backend`: Sets the backend for the full-text index. Supported values are `bloom` and `tantivy`. Default is `bloom`.
- `granularity`: (For `bloom` backend) The size of data chunks covered by each filter. A smaller granularity improves filtering but increases index size. Default is `10240`.
- `false_positive_rate`: (For `bloom` backend) The probability of misidentifying a block. A lower rate improves accuracy (better filtering) but increases index size. Value is a float between `0` and `1`. Default is `0.01`.

For more information on full-text index configuration and performance comparison, refer to the [Full-Text Index Configuration Guide](/user-guide/manage-data/data-index.md#fulltext-index).

If `WITH <options>` is not specified, `FULLTEXT INDEX` will use the default values.

Enable skipping index on a column:

```sql
ALTER TABLE monitor MODIFY COLUMN host SET SKIPPING INDEX WITH(granularity = 1024, type = 'BLOOM', false_positive_rate = 0.01);
```

The valid options for the skipping index include:
* `type`: The index type, only supports `BLOOM` type right now.
* `granularity`: (For `BLOOM` type) The size of data chunks covered by each filter. A smaller granularity improves filtering but increases index size. Default is `10240`.
* `false_positive_rate`: (For `BLOOM` type) The probability of misidentifying a block. A lower rate improves accuracy (better filtering) but increases index size. Value is a float between `0` and `1`. Default is `0.01`.

### Remove index on a column

The syntax is:
```sql
ALTER TABLE [table] MODIFY COLUMN [column] UNSET [INVERTED | SKIPPING | FULLTEXT] INDEX;
```

For example, remove the inverted index:
```sql
ALTER TABLE monitor_pk MODIFY COLUMN host UNSET INVERTED INDEX;
```

Remove the skipping index:
```sql
ALTER TABLE monitor_pk MODIFY COLUMN host UNSET SKIPPING INDEX;
```

Remove the fulltext index:
```sql
ALTER TABLE monitor MODIFY COLUMN load_15 UNSET FULLTEXT INDEX;
```

The column must be a string type to alter the fulltext index.

If the fulltext index has never been enabled, you can enable it and specify the `analyzer` and `case_sensitive` options. When the fulltext index is already enabled on a column, you can disable it but **cannot modify the options, and so does the skipping index**.

### Rename table

Renames the table:

```sql
ALTER TABLE monitor RENAME monitor_new;
```

This command only renames the table; it doesn't modify the data within the table.
