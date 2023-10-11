# CREATE

`CREATE` is used to create new databases or tables.

## CREATE DATABASE

### Syntax

Creates a new database:

```sql
CREATE DATABASE [IF NOT EXISTS] db_name
```

If the `db_name` database already exists, then GreptimeDB has the following behaviors:

- Doesn't create a new database.
- Doesn't return an error when the clause `IF NOT EXISTS` is presented.
- Otherwise, returns an error.

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

Creates a new table in the `db` database or the current database in use:

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

The table schema is specified by the brackets before the `ENGINE`. The table schema is a list of column definitions and table constraints.
A column definition includes the column `name`, `type`, and options such as nullable or default values, etc. Please see below.

### Table constraints

The table constraints contain the following:

- `TIME INDEX` specifies the time index column, which always has one and only one column. It indicates the `Timestamp` type in the [data model](/en/v0.4/user-guide/concepts/data-model.md) of GreptimeDB.
- `PRIMARY KEY` specifies the table's primary key column, which indicates the `Tag` type in the [data model](/en/v0.4/user-guide/concepts/data-model.md) of GreptimeDB. It cannot include the time index column, but it always implicitly adds the time index column to the end of keys.
- The Other columns are `Field` columns in the [data model](/en/v0.4/user-guide/concepts/data-model.md) of GreptimeDB.

:::tip NOTE
The `PRIMARY KEY` specified in the `CREATE` statement is **not** the primary key in traditional relational databases.
Actually, The `PRIMARY KEY` in traditional relational databases is equivalent to the combination of `PRIMARY KEY` and `TIME INDEX` in GreptimeDB. In other words, the `PRIMARY KEY` and `TIME INDEX` together constitute the unique identifier of a row in GreptimeDB.
:::

The statement won't do anything if the table already exists and `IF NOT EXISTS` is presented; otherwise returns an error.

### Table options

Users can add table options by using `WITH`. The valid options contain the following:

| Option              | Description                        | Value                                                                                                                                               |
| ------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ttl`               | The storage time of the table data | String value, such as `'60m'`, `'1h'` for one hour, `'14d'` for 14 days etc. Supported time units are: `s` / `m` / `h` / `d`                        |
| `regions`           | The region number of the table     | Integer value, such as 1, 5, 10 etc.                                                                                                                |
| `write_buffer_size` | Memtable size of the table         | String value representing a valid size, such as `32MB`, `128MB`, etc. The default value of this option is `32MB`. Supported units are: `MB` / `GB`. |

For example, to create a table with the storage data TTL(Time-To-Live) is seven days and region number is 10:

```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
) engine=mito with(ttl='7d', regions=10);
```

### Column options

GreptimeDB supports the following column options:

| Option            | Description                                                                           |
| ----------------- | ------------------------------------------------------------------------------------- |
| NULL              | The column value can be `null`.                                                       |
| NOT NULL          | The column value can't be `null`.                                                     |
| DEFAULT `expr`    | The column's default value is `expr`, which its result type must be the column's type |
| COMMENT `comment` | The column comment. It must be a string value                                         |

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

## CREATE EXTERNAL TABLE

### Syntax

Creates a new file external table in the `db` database or the current database in use:

```sql
CREATE EXTERNAL TABLE [IF NOT EXISTS] [<database>.]<table_name>
[
 (
    <col_name> <col_type> [NULL | NOT NULL] [COMMENT "<comment>"]
 )
]
[ WITH
 (
   LOCATION = 'url'
   [,FORMAT =  { csv | json | parquet } ]
   [,PATTERN = '<regex_pattern>' ]
   [,ENDPOINT = '<uri>' ]
   [,ACCESS_KEY_ID = '<key_id>' ]
   [,SECRET_ACCESS_KEY = '<access_key>' ]
   [,SESSION_TOKEN = '<token>' ]
   [,REGION = '<region>' ]
   [,ENABLE_VIRTUAL_HOST_STYLE = '<boolean>']
   ..
 )
]
```

### Table options

| Option     | Description                                                                     | Required     |
| ---------- | ------------------------------------------------------------------------------- | ------------ |
| `LOCATION` | External files locations, e.g., `s3://<bucket>[<path>]`, `/<path>/[<filename>]` | **Required** |
| `FORMAT`   | Target file(s) format, e.g., JSON, CSV, Parquet                                 | **Required** |
| `PATTERN`  | Use regex to match files. e.g., `*_today.parquet`                               | Optional     |

#### S3

| Option                      | Description                                                                           | Required     |
| --------------------------- | ------------------------------------------------------------------------------------- | ------------ |
| `REGION`                    | AWS region name. e.g., us-east-1.                                                     | **Required** |
| `ENDPOINT`                  | The bucket endpoint                                                                   | Optional     |
| `ACCESS_KEY_ID`             | ACCESS_KEY_ID Your access key ID for connecting the AWS S3 compatible object storage. | Optional     |
| `SECRET_ACCESS_KEY`         | Your secret access key for connecting the AWS S3 compatible object storage.           | Optional     |
| `ENABLE_VIRTUAL_HOST_STYLE` | If you use virtual hosting to address the bucket, set it to "true".                   | Optional     |
| `SESSION_TOKEN`             | Your temporary credential for connecting the AWS S3 service.                          | Optional     |

### Time Index Column

When creating an external table using the `CREATE EXTERNAL TABLE` statement, you are required to use the `TIME INDEX` constraint to specify a time index column.

### Examples

You can create an external table without any columns definitions:

```sql
CREATE EXTERNAL TABLE IF NOT EXISTS city WITH (location='/var/data/city.csv',format='csv');
```

In this example, since we have not explicitly defined the columns of the table, the `CREATE EXTERNAL TABLE` statement will infer the `Time Index` column according to the following rules:

1. If the `Time Index` column can be inferred from the file metadata, then that column will be used as the `Time Index` column.
2. If there is a column named `greptime_timestamp` (the type of this column must be `TIMESTAMP`, otherwise, an error will be thrown), then this column will be used as the `Time Index` column.
3. Otherwise, a column named `greptime_timestamp` will be automatically created as the `Time Index` column, and a `DEFAULT '1970-01-01 00:00:00+0000'` constraint will be added.

Or

```sql
CREATE EXTERNAL TABLE city (
            host string,
            ts timestamp,
            cpu float64 default 0,
            memory float64,
            TIME INDEX (ts),
            PRIMARY KEY(host)
) WITH (location='/var/data/city.csv', format='csv');
```

In this example, we explicitly defined the `ts` column as the `Time Index` column. If there is no suitable `Time Index` column in the file, you can also create a placeholder column and add a `DEFAULT <expr>` constraint.
