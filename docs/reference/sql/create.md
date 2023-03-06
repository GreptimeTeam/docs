# CREATE

`CREATE` is used to create new databases or tables.

## CREATE DATABASE
### Syntax
Creates a new database:
```sql
CREATE DATABASE [IF NOT EXISTS] db_name
```

If the `db_name` database already exists, then GreptimeDB has the following behaviours:
* Doesn't create a new database.
* Doesn't return an error when the clause `IF NOT EXISTS` is presented.
* Otherwise, returns an error.

### Examples

Creates a `test` database:
```sql
CREATE DATABASE test;
```
```sql
Query OK, 1 row affected (0.05 sec)
```

Creates it again with `IF NOT EXISTS`:
```sql
CREATE DATABASE IF NOT EXISTS test;
```

## CREATE TABLE

### Syntax
Creates a new table in the `db` database or the current database in-use:
```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT expr1] [TIME INDEX] [PRIMARY KEY] COMMENT comment,
    name2 [type2] [NULL|NOT NULL] [DEFAULT expr2] [TIME INDEX] [PRIMARY KEY] COMMENT comment,
    ...,
    [TIME INDEX (name)],
    [PRIMARY KEY(name1, name2,...)]
) ENGINE = engine WITH([ttl | regions] = expr, ...)
[
  PARTITION BY RANGE COLUMNS(name1, name2, ...) (
    PARTITION r0 VALUES LESS THAN (expr1),
    PARTITION r1 VALUES LESS THAN (expr2),
    ...
  )
]
```

The table schema is specified by the brackets following the `engine`. The table schema is a list of column definitions and table constraints.
A column definition includes the column `name`, `type`, and options such as nullable or default values, etc. Please see below.

### Table constraints
The table constraints contain the followings:
*  `TIME INDEX`  specifies the time index column. And it always has one and only one column.
*  `PRIMARY KEY` specifies the table's primary key column. And it can't include the time index column but always implicitly add the time index column to the end of keys.

The statement won't do anything if the table already exists and `IF NOT EXISTS` is presented; otherwise returns an error.

### Table options
Users can add table options by using `WITH`. The valid options contain the followings:

| Option  | Description  | Value |
|---|---|---|
| `ttl`  | The storage time of the table data  |   String value, such as `'60m'`, `'1h'` for one hour, `'14d'` for 14 days etc. |
|  `regions` | The region number of the table  | Integral value, such as 1, 5, 10 etc. |
| `write_buffer_size` | Memtable size of the table | String value representing a valid size, such as `32MB`, `128MB`, etc. The default value of this option is `32MB`. |

For example, to create a table with the storage data TTL(Time-To-Live) is seven days and region number is 10:
```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
) engine=mito with(ttl='7d', regions=10);
```

### Column options

GreptimeDB supports the following column options:

| Option  | Description |
|---|---|
| NULL  | The column value can be `null`.  |
|  NOT NULL | The column value can't be `null`. |
| DEFAULT `expr` | The column's default value is `expr`, which its result type must be the column's type|
|COMMENT `comment` | The column comment. It must be a string value |

The table constraints `TIME INDEX` and `PRIMARY KEY` can also be set by column option, but they can only be specified once in column definitions. So you can't specify `PRIMARY KEY` for more than one column except by the table constraint `PRIMARY KEY` :
```sql
CREATE TABLE system_metrics (
    host STRING PRIMARY KEY,
    idc STRING PRIMARY KEY,
    cpu_util DOUBLE,
    memory_util DOUBLE,
    disk_util DOUBLE,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TIME INDEX(ts)
);
```

Goes wrong:
```sql
 Illegal primary keys definition: not allowed to inline multiple primary keys in columns options
```

```sql
CREATE TABLE system_metrics (
    host STRING,
    idc STRING,
    cpu_util DOUBLE,
    memory_util DOUBLE,
    disk_util DOUBLE,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP TIME INDEX,
    PRIMARY KEY(host, idc),
);
```
```sql
Query OK, 0 rows affected (0.01 sec)
```

### Region partition rules

TODO by MichaelScofield

