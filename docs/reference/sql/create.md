---
keywords: [create statement, SQL, create database, create table, create view, create flow]
description: Explains the SQL CREATE statement for creating databases, tables, external tables, flows, and views in GreptimeDB, including syntax, table constraints, options, and examples.
---

# CREATE

`CREATE` is used to create new databases or tables.

## CREATE DATABASE

### Syntax

Creates a new database:

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [WITH <options>]
```

If the `db_name` database already exists, then GreptimeDB has the following behaviors:

- Doesn't create a new database.
- Doesn't return an error when the clause `IF NOT EXISTS` is presented.
- Otherwise, returns an error.

The database can also carry options similar to the `CREATE TABLE` statement by using the `WITH` keyword. All options available in [Table Options](#table-options) can be utilized here as well (one exception is that database's TTL can't be `instant`). When creating a table, if the corresponding table options are not provided, the options configured at the database level will be applied.

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

Create a database with a `TTL` (Time-To-Live) of seven days, which means all the tables in this database will inherit this option if they don't have their own `TTL` setting:

```sql
CREATE DATABASE test with(ttl='7d');
```

## CREATE TABLE

### Syntax

Creates a new table in the `db` database or the current database in use:

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    column1 type1 [NULL | NOT NULL] [DEFAULT expr1] [TIME INDEX] [PRIMARY KEY] [indexes] [COMMENT comment1],
    column2 type2 [NULL | NOT NULL] [DEFAULT expr2] [TIME INDEX] [PRIMARY KEY] [indexes] [COMMENT comment2],
    ...
    [TIME INDEX (column)],
    [PRIMARY KEY(column1, column2, ...)],
)
[
  PARTITION ON COLUMNS(column1, column2, ...) (
    <PARTITION EXPR>,
    ...
  )
]
ENGINE = engine WITH([TTL | storage | ...] = expr, ...)
```

The table schema is specified by the brackets before the `ENGINE`. The table schema is a list of column definitions and table constraints.

For information on the `engine` option and table engine selection, please refer to the [Table Engines](/reference/about-greptimedb-engines.md) guide.

A column definition includes the column `column_name`, `type`, and options such as nullable or default values, etc. Please see below.

### Table constraints

The table constraints contain the following:

- `TIME INDEX` specifies the time index column, which always has one and only one column. It indicates the `Timestamp` type in the [data model](/user-guide/concepts/data-model.md) of GreptimeDB.
- `PRIMARY KEY` specifies the table's primary key column, which indicates the `Tag` type in the [data model](/user-guide/concepts/data-model.md) of GreptimeDB. It cannot include the time index column, but it always implicitly adds the time index column to the end of keys.
- The Other columns are `Field` columns in the [data model](/user-guide/concepts/data-model.md) of GreptimeDB.

:::tip NOTE
The `PRIMARY KEY` specified in the `CREATE` statement is **not** the primary key in traditional relational databases.
Actually, The `PRIMARY KEY` in traditional relational databases is equivalent to the combination of `PRIMARY KEY` and `TIME INDEX` in GreptimeDB. In other words, the `PRIMARY KEY` and `TIME INDEX` together constitute the unique identifier of a row in GreptimeDB.
:::

The statement won't do anything if the table already exists and `IF NOT EXISTS` is presented; otherwise returns an error.

#### Indexes

GreptimeDB provides various type of indexes to accelerate query. Please refer to [Data Index](/user-guide/manage-data/data-index.md) for more details.

### Table options

Users can add table options by using `WITH`. The valid options contain the following:

| Option                                      | Description                                                     | Value                                                                                                                                                                                                                                                       |
| ------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ttl`                                       | The storage time of the table data                              | A time duration string such as `'60m'`, `'1h'` for one hour, `'14d'` for 14 days etc. Supported time units are: `s` / `m` / `h` / `d`.                                                                                                                      |
| `storage`                                   | The name of the table storage engine provider                   | String value, such as `S3`, `Gcs`, etc. It must be configured in `[[storage.providers]]`, see [configuration](/user-guide/deployments/configuration.md#storage-engine-provider).                                                                            |
| `compaction.type`                           | Compaction strategy of the table                                | String value. Only `twcs` is allowed.                                                                                                                                                                                                                       |
| `compaction.twcs.max_active_window_files`   | Max num of files that can be kept in active writing time window | String value, such as '8'. Only available when `compaction.type` is `twcs`. You can refer to this [document](https://cassandra.apache.org/doc/latest/cassandra/managing/operating/compaction/twcs.html) to learn more about the `twcs` compaction strategy. |
| `compaction.twcs.max_inactive_window_files` | Max num of files that can be kept in inactive time window.      | String value, such as '1'. Only available when `compaction.type` is `twcs`.                                                                                                                                                                                 |
| `compaction.twcs.time_window`               | Compaction time window                                          | String value, such as '1d' for 1 day. The table usually partitions rows into different time windows by their timestamps. Only available when `compaction.type` is `twcs`.                                                                                   |
| `memtable.type`                             | Type of the memtable.                                           | String value, supports `time_series`, `partition_tree`.                                                                                                                                                                                                     |
| `append_mode`                               | Whether the table is append-only                                | String value. Default is 'false', which removes duplicate rows by primary keys and timestamps according to the `merge_mode`. Setting it to 'true' to enable append mode and create an append-only table which keeps duplicate rows.                         |
| `merge_mode`                                | The strategy to merge duplicate rows                            | String value. Only available when `append_mode` is 'false'. Default is `last_row`, which keeps the last row for the same primary key and timestamp. Setting it to `last_non_null` to keep the last non-null field for the same primary key and timestamp.   |
| `comment`                                   | Table level comment                                             | String value.                                                                                                                                                                                                                                               |
| `skip_wal`                                | Whether to disable Write-Ahead-Log for this table                               | Boolean type. When set to `true`, the data written to the table will not be persisted to the write-ahead log, which can avoid storage wear and improve write throughput. However, when the process restarts, any unflushed data will be lost. Please use this feature only when the data source itself can ensure reliability. |
| `index.type`                                | Index type                                                      | **Only for metric engine** String value, supports `none`, `skipping`.                                                                                                                                                                                       |

#### Create a table with TTL
For example, to create a table with the storage data TTL(Time-To-Live) is seven days:

```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
) with(ttl='7d');
```

The `ttl` value can be one of the following:

- A [duration](/reference/time-durations.md) like `1hour 12min 5s`.
- `forever`, `NULL`, an empty string `''` and `0s` (or any zero length duration, like `0d`), means the data will never be deleted.
- `instant`, note that database's TTL can't be set to `instant`. `instant` means the data will be deleted instantly when inserted, useful if you want to send input to a flow task without saving it, see more details in [flow management documents](/user-guide/flow-computation/manage-flow.md#manage-flows).
- Unset, `ttl` can be unset by using `ALTER TABLE <table-name> UNSET 'ttl'`, which means the table will inherit the database's ttl policy (if any).
  
If a table has its own TTL policy, it will take precedence over the database TTL policy.
Otherwise, the database TTL policy will be applied to the table. 

So if table's TTL is set to `forever`, no matter what the database's TTL is, the data will never be deleted. But if you unset table TTL using:
```sql
ALTER TABLE <table-name> UNSET 'ttl';
```
Then the database's TTL will be applied to the table. 

Note that the default TTL setting for table and database is unset, which also means the data will never be deleted.

#### Create a table with custom storage
Create a table that stores the data in Google Cloud Storage:

```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
) with(ttl='7d', storage="Gcs");
```

#### Create a table with custom compaction options
Create a table with custom compaction options. The table will attempt to partition data into 1-day time window based on the timestamps of the data.
- It merges files within the latest time window if they exceed 8 files
- It merges files within inactive windows into a single file

```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
)
with(
  'compaction.type'='twcs',
  'compaction.twcs.time_window'='1d',
  'compaction.twcs.max_active_window_files'='8',
  'compaction.twcs.max_inactive_window_files'='1',
);
```

#### Create an append-only table
Create an append-only table which disables deduplication.
```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
) with('append_mode'='true');
```

#### Create a table with merge mode
Create a table with `last_row` merge mode, which is the default merge mode.
```sql
create table if not exists metrics(
    host string,
    ts timestamp,
    cpu double,
    memory double,
    TIME INDEX (ts),
    PRIMARY KEY(host)
)
with('merge_mode'='last_row');
```

Under `last_row` mode, the table merges rows with the same primary key and timestamp by only keeping the latest row.
```sql
INSERT INTO metrics VALUES ('host1', 0, 0, NULL), ('host2', 1, NULL, 1);
INSERT INTO metrics VALUES ('host1', 0, NULL, 10), ('host2', 1, 11, NULL);

SELECT * from metrics ORDER BY host, ts;

+-------+-------------------------+------+--------+
| host  | ts                      | cpu  | memory |
+-------+-------------------------+------+--------+
| host1 | 1970-01-01T00:00:00     |      | 10.0   |
| host2 | 1970-01-01T00:00:00.001 | 11.0 |        |
+-------+-------------------------+------+--------+
```


Create a table with `last_non_null` merge mode.
```sql
create table if not exists metrics(
    host string,
    ts timestamp,
    cpu double,
    memory double,
    TIME INDEX (ts),
    PRIMARY KEY(host)
)
with('merge_mode'='last_non_null');
```

Under `last_non_null` mode, the table merges rows with the same primary key and timestamp by keeping the latest value of each field.
```sql
INSERT INTO metrics VALUES ('host1', 0, 0, NULL), ('host2', 1, NULL, 1);
INSERT INTO metrics VALUES ('host1', 0, NULL, 10), ('host2', 1, 11, NULL);

SELECT * from metrics ORDER BY host, ts;

+-------+-------------------------+------+--------+
| host  | ts                      | cpu  | memory |
+-------+-------------------------+------+--------+
| host1 | 1970-01-01T00:00:00     | 0.0  | 10.0   |
| host2 | 1970-01-01T00:00:00.001 | 11.0 | 1.0    |
+-------+-------------------------+------+--------+
```

#### Create a physical table with metric engine

The metric engine use synthetic physical wide tables to store a large amount of small table data, achieving effects such as reuse of the same column and metadata. For details, please refer to the [metric engine document](/contributor-guide/datanode/metric-engine) and [Table Engines](/reference/about-greptimedb-engines.md)  introduction.

Create a physical table with the metric engine.
```sql
CREATE TABLE greptime_physical_table (
    greptime_timestamp TIMESTAMP(3) NOT NULL,
    greptime_value DOUBLE NULL,
    TIME INDEX (greptime_timestamp),
) 
engine = metric
with (
    "physical_metric_table" = "",   
);
```

#### Create a physical table with enable skipping index for columns

By default, the metric engine won't create indexes for columns. You can enable it by setting the `index.type` to `skipping`.

Create a physical table with a skipping index; all automatically added columns will have this index applied.

```sql
CREATE TABLE greptime_physical_table (
    greptime_timestamp TIMESTAMP(3) NOT NULL,
    greptime_value DOUBLE NULL,
    TIME INDEX (greptime_timestamp),
) 
engine = metric
with (
    "physical_metric_table" = "",
    "index.type" = "skipping",
);
```



### Column options

GreptimeDB supports the following column options:

| Option            | Description                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| NULL              | The column value can be `null`.                                                                            |
| NOT NULL          | The column value can't be `null`.                                                                          |
| DEFAULT `expr`    | The column's default value is `expr`, which its result type must be the column's type                      |
| COMMENT `comment` | The column comment. It must be a string value                                                              |
| FULLTEXT          | Creates a full-text index to speed up full-text search operations. Applicable only to string-type columns. |

The table constraints `TIME INDEX` and `PRIMARY KEY` can also be set by column option, but they can only be specified once in column definitions. So you can't specify `PRIMARY KEY` for more than one column except by the table constraint `PRIMARY KEY` :

```sql
CREATE TABLE system_metrics (
    host STRING PRIMARY KEY,
    idc STRING PRIMARY KEY,
    cpu_util DOUBLE,
    memory_util DOUBLE,
    disk_util DOUBLE,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
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
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
    PRIMARY KEY(host, idc),
);
```

```sql
Query OK, 0 rows affected (0.01 sec)
```

#### `FULLTEXT` Column Option

The `FULLTEXT` option is used to create a full-text index, accelerating full-text search operations. This option can only be applied to string-type columns.

You can specify the following options using `FULLTEXT INDEX WITH`:

- `analyzer`: Sets the language analyzer for the full-text index. Supported values are `English` and `Chinese`.
- `case_sensitive`: Determines whether the full-text index is case-sensitive. Supported values are `true` and `false`.
- `backend`: Sets the backend for the full-text index. Supported values are `bloom` and `tantivy`.

If `WITH` is not specified, `FULLTEXT` will use the following default values:

- `analyzer`: default is `English`
- `case_sensitive`: default is `false`
- `backend`: default is `bloom`

For example, to create a table with a full-text index on the `log` column, configuring the analyzer to `English`, `case_sensitive` to `false` and `backend` to `bloom`:

```sql
CREATE TABLE IF NOT EXISTS logs(
  host STRING PRIMARY KEY,
  log STRING FULLTEXT INDEX WITH(analyzer = 'English', case_sensitive = 'false', backend = 'bloom'),
  ts TIMESTAMP TIME INDEX
);
```

For comprehensive information on full-text index configuration, performance comparison, and usage guidelines, please refer to the [Full-Text Index Configuration Guide](/user-guide/logs/fulltext-index-config.md) and [Log Query Documentation](/user-guide/logs/query-logs.md).

### Region partition rules

Please refer to [Partition](/contributor-guide/frontend/table-sharding.md#partition) for more details.

## CREATE EXTERNAL TABLE

### Syntax

Creates a new file external table in the `db` database or the current database in use:

```sql
CREATE EXTERNAL TABLE [IF NOT EXISTS] [db.]table_name
[
 (
    column1 type1 [NULL | NOT NULL] [DEFAULT expr1] [TIME INDEX] [PRIMARY KEY] [COMMENT comment1],
    column2 type2 [NULL | NOT NULL] [DEFAULT expr2] [TIME INDEX] [PRIMARY KEY] [COMMENT comment2],
    ...
    [TIME INDEX (column)],
    [PRIMARY KEY(column1, column2, ...)]
 )
] WITH (
  LOCATION = url,
  FORMAT =  { 'CSV' | 'JSON' | 'PARQUET' | 'ORC' }
  [,PATTERN = regex_pattern ]
  [,REGION = region ]
  [,ENDPOINT = uri ]
  [,ACCESS_KEY_ID = key_id ]
  [,SECRET_ACCESS_KEY = access_key ]
  [,ENABLE_VIRTUAL_HOST_STYLE = { TRUE | FALSE }]
  [,SESSION_TOKEN = token ]
  ...
)
```

### Table options

| Option     | Description                                                                     | Required     |
| ---------- | ------------------------------------------------------------------------------- | ------------ |
| `LOCATION` | External files locations, e.g., `s3://<bucket>[<path>]`, `/<path>/[<filename>]` | **Required** |
| `FORMAT`   | Target file(s) format, e.g., JSON, CSV, Parquet, ORC                            | **Required** |
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

When creating an external table using the `CREATE EXTERNAL TABLE` statement, you are required to use the `TIME INDEX` constraint to specify a Time Index column.

### Examples

You can create an external table without columns definitions, the column definitions will be automatically inferred:

```sql
CREATE EXTERNAL TABLE IF NOT EXISTS city WITH (location='/var/data/city.csv',format='csv');
```

In this example, we did not explicitly define the columns of the table. To satisfy the requirement that the external table must specify a **Time Index** column, the `CREATE EXTERNAL TABLE` statement will infer the Time Index column according to the following rules:

1. If the Time Index column can be inferred from the file metadata, then that column will be used as the Time Index column.
2. If there is a column named `greptime_timestamp` (the type of this column must be `TIMESTAMP`, otherwise, an error will be thrown), then this column will be used as the Time Index column.
3. Otherwise, a column named `greptime_timestamp` will be automatically created as the Time Index column, and a `DEFAULT '1970-01-01 00:00:00+0000'` constraint will be added.

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

In this example, we explicitly defined the `ts` column as the Time Index column. If there is no suitable Time Index column in the file, you can also create a placeholder column and add a `DEFAULT expr` constraint.


## CREATE FLOW

```sql
CREATE [OR REPLACE] FLOW [ IF NOT EXISTS ] <flow-name>
SINK TO <sink-table-name>
[ EXPIRE AFTER <expr> ]
[ COMMENT '<string>' ]
AS
<SQL>;
```

For the statement to create or update a flow, please read the [flow management documents](/user-guide/flow-computation/manage-flow.md#create-a-flow).

## CREATE VIEW

```sql
CREATE [OR REPLACE] VIEW [ IF NOT EXISTS ] <view-name>
AS select_statement
```

For the statement to create or update a view, please read the [view user guide](/user-guide/query-data/view.md#view).
