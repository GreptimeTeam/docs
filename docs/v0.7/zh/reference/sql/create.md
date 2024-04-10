# CREATE

`CREATE` 用于创建新的数据库或者表。

## CREATE DATABASE

### Syntax

创建新数据库：

```sql
CREATE DATABASE [IF NOT EXISTS] db_name
```

如果 `db_name` 数据库已经存在，`CREATE` 语句的行为如下：

- 不会创建新的数据库。
- 当 `IF NOT EXISTS` 子句被指定时，不会返回错误。
- 否则，返回错误。

### 示例

创建名为 `test` 的数据库：

```sql
CREATE DATABASE test;
```

```sql
Query OK, 1 row affected (0.05 sec)
```

使用 `IF NOT EXISTS` 再次创建：

```sql
CREATE DATABASE IF NOT EXISTS test;
```

## CREATE TABLE

### Syntax

在 `db` 或当前数据库中创建新表：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    column1 type1 [NULL | NOT NULL] [DEFAULT expr1] [TIME INDEX] [PRIMARY KEY] [COMMENT comment1],
    column2 type2 [NULL | NOT NULL] [DEFAULT expr2] [TIME INDEX] [PRIMARY KEY] [COMMENT comment2],
    ...
    [TIME INDEX (column)],
    [PRIMARY KEY(column1, column2, ...)]
) ENGINE = engine WITH([TTL | REGIONS] = expr, ...)
[
  PARTITION BY RANGE COLUMNS(column1, column2, ...) (
    PARTITION r0 VALUES LESS THAN (expr1),
    PARTITION r1 VALUES LESS THAN (expr2),
    ...
  )
]
```

表 schema 由 `ENGINE` 之前的括号指定，表 schema 是列的定义和表的约束。
列定义包括列名称和数据类型，以及可选的 `NULL`、`NOT NULL`、`DEFAULT` 等。

### 表约束

表约束包括以下内容：

- `TIME INDEX` 指定时间索引列，每个表只能有一个时间索引列。它表示 GreptimeDB 的 [数据模型](/user-guide/concepts/data-model.md) 中的 `Timestamp` 类型。
- `PRIMARY KEY` 指定表的主键列，它表示 GreptimeDB 的 [数据模型](/user-guide/concepts/data-model.md) 中的 `Tag` 类型。它不能包含时间索引列，但是它总是隐式地将时间索引列添加到键的末尾。
- 其他列是 GreptimeDB 的 [数据模型](/user-guide/concepts/data-model.md) 中的 `Field` 类型。

:::tip 注意
`CREATE` 语句中指定的 `PRIMARY KEY` **不是** 传统关系数据库中的主键。
实际上，传统关系数据库中的 `PRIMARY KEY` 相当于 GreptimeDB 中的 `PRIMARY KEY` 和 `TIME INDEX` 的组合。
换句话说，`PRIMARY KEY` 和 `TIME INDEX` 一起构成了 GreptimeDB 中行的唯一标识符。
:::

如果表已经存在且创建表时指定了 `IF NOT EXISTS`，`CREATE` 语句不会返回错误；否则返回错误。

### 表选项

用户可以使用 `WITH` 添加表选项。有效的选项包括以下内容：

| 选项                | 描述               | 值                                                                                                         |
| ------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `ttl`               | 表数据的存储时间   | 字符串值，例如 `'60m'`, `'1h'` 代表 1 小时， `'14d'` 代表 14 天等。支持的时间单位有：`s` / `m` / `h` / `d` |
| `regions`           | 表的 region 值     | 整数值，例如 1, 5, 10 etc.                                                                                 |
| `write_buffer_size` | 表的 memtable 大小 | 表示有效大小的字符串值，例如 `32MB`, `128MB` 等。默认值为 `32MB`。支持的单位有：`MB` / `GB`.               |
| `storage` |  自定义表的存储引擎，存储引擎提供商的名字  |  字符串，类似 `S3`、`Gcs` 等。 必须在 `[[storage.providers]]` 列表里配置, 参考 [configuration](/user-guide/operations/configuration#存储引擎提供商)。|

例如，创建一个存储数据 TTL(Time-To-Live) 为七天，region 数为 10 的表：

```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
) engine=mito with(ttl='7d', regions=10);
```

或者创建一个表单独将数据存储在 Google Cloud Storage 服务上：

```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
) engine=mito with(ttl='7d', regions=10, storage="Gcs");
```

### 列选项

GreptimeDB 支持以下列选项：

| 选项              | 描述                                          |
| ----------------- | --------------------------------------------- |
| NULL              | 列值可以为 `null`                             |
| NOT NULL          | 列值不能为 `null`                             |
| DEFAULT `expr`    | 该列的默认值是 `expr`，其类型必须是该列的类型 |
| COMMENT `comment` | 列注释，必须为字符串类型                      |

表约束 `TIME INDEX` 和 `PRIMARY KEY` 也可以通过列选项设置，但是它们只能在列定义中指定一次，在多个列选项中指定 `PRIMARY KEY` 会报错：

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

会得到报错：

```sql
 Illegal primary keys definition: not allowed to inline multiple primary keys in columns options
```

正确的做法是使用 `PRIMARY KEY()` 来指定多个列作为主键：

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

### Region partition rules

TODO by MichaelScofield

## CREATE EXTERNAL TABLE

### Syntax

在 `db` 或当前数据库中创建新的文件外部表：

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

### 表选项

| 选项       | 描述                                                               | 是否必需 |
| ---------- | ------------------------------------------------------------------ | -------- |
| `LOCATION` | 外部表的位置，例如 `s3://<bucket>[<path>]`, `/<path>/[<filename>]` | **是**   |
| `FORMAT`   | 目标文件的格式，例如 JSON，CSV，Parquet, ORC                         | **是**   |
| `PATTERN`  | 使用正则来匹配文件，例如 `*_today.parquet`                         | 可选     |

#### S3

| 选项                        | 描述                                                            | 是否必需 |
| --------------------------- | --------------------------------------------------------------- | -------- |
| `REGION`                    | AWS region 名称，例如 us-east-1                                 | **是**   |
| `ENDPOINT`                  | The bucket endpoint                                             | 可选     |
| `ACCESS_KEY_ID`             | 用于连接 AWS S3 兼容对象存储的访问密钥 ID                       | 可选     |
| `SECRET_ACCESS_KEY`         | 用于连接 AWS S3 兼容对象存储的秘密访问密钥                      | 可选     |
| `ENABLE_VIRTUAL_HOST_STYLE` | 如果你想要使用 virtual hosting 来定位 bucket，将其设置为 `true` | 可选     |
| `SESSION_TOKEN`             | 用于连接 AWS S3 服务的临时凭证                                  | 可选     |

### 时间索引列

在利用 `CREATE EXTERNAL TABLE` 语句创建外部表时，要求使用 `TIME INDEX` 约束来指定一个时间索引列。

### 示例

你可以在创建外部表时不带有列定义，列定义将会被自动推断：

```sql
CREATE EXTERNAL TABLE IF NOT EXISTS city WITH (location='/var/data/city.csv',format='csv');
```

在这个例子中，我们没有明确定义表的列，为满足外边表必须指定**时间索引列**的要求，`CREATE EXTERNAL TABLE` 语句会依据下述规则推断出时间索引列：

1. 如果可以从文件元数据中推断出时间索引列，那么就用该列作为时间索引列。
2. 如果存在名为 `greptime_timestamp` 的列（该列的类型必须为 `TIMESTAMP`，否则将抛出错误），那么就用该列作为时间索引列。
3. 否则，将自动创建名为 `greptime_timestamp` 的列作为时间索引列，并添加 `DEFAULT '1970-01-01 00:00:00+0000'` 约束。

或者带有列定义：

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

在这个例子中，我们明确定义了 `ts` 列作为时间索引列。如果在文件中没有适合的时间索引列，你也可以创建一个占位符列，并添加 `DEFAULT expr` 约束。
