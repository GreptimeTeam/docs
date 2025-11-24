---
keywords: [创建数据库, 创建表, CREATE 语句, SQL 创建, 数据库选项, 表选项]
description: CREATE 用于创建新的数据库或表，支持指定列、主键、时间索引、存储引擎和其他选项。
---

# CREATE

`CREATE` 用于创建新的数据库或者表。

## CREATE DATABASE

### Syntax

创建新数据库：

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [WITH <options>]
```

如果 `db_name` 数据库已经存在，`CREATE` 语句的行为如下：

- 不会创建新的数据库。
- 当 `IF NOT EXISTS` 子句被指定时，不会返回错误。
- 否则，返回错误。

数据库也可以通过使用 `WITH` 关键字配置与 `CREATE TABLE` 语句类似的选项。数据库支持以下选项：

- `ttl` - 数据库中所有表的数据存活时间（不能设置为 `instant`）
- `memtable.type` - 内存表类型（`time_series`、`partition_tree`）
- `append_mode` - 数据库中的表是否为仅追加模式（`true`/`false`）
- `merge_mode` - 合并重复行的策略（`last_row`、`last_non_null`）
- `skip_wal` - 是否为数据库中的表禁用预写日志（`'true'`/`'false'`）
- `compaction.*` - 压缩相关设置（如 `compaction.type`、`compaction.twcs.time_window`）

阅读更多关于[表选项](#表选项)的信息。

:::note 重要的行为差异
数据库选项的行为有所不同：

- **TTL**：此选项具有**持续影响**。没有指定 TTL 的表会持续继承这个数据库级别的值。更改数据库 TTL 会立即影响所有没有明确自行设置 TTL 的表。

- **其他选项**（`memtable.type`、`append_mode`、`merge_mode`、`skip_wal`、`compaction.*`）：这些选项充当**模板变量**，仅在创建新表时应用。更改这些数据库级别的选项不会影响已存在的表——它们仅作为新创建表的默认值。
:::

在创建表时，如果未提供相应的表选项，将使用在数据库级别配置的选项或者默认值。

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

创建一个具有 7 天 `TTL`（数据存活时间）的数据库，也就是该数据库中的所有表如果没有单独设置 TTL 选项，都将继承此选项值。

```sql
CREATE DATABASE test WITH (ttl='7d');
```

创建一个带有多个选项的数据库，包括仅追加模式和自定义内存表类型：

```sql
CREATE DATABASE test WITH (
  ttl='30d',
  'memtable.type'='partition_tree',
  'append_mode'='true'
);
```

创建一个禁用预写日志并设置自定义合并模式的数据库：

```sql
CREATE DATABASE test WITH (
  'skip_wal'='true',
  'merge_mode'='last_non_null'
);
```


## CREATE TABLE

### Syntax

在 `db` 或当前数据库中创建新表：

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

表 schema 由 `ENGINE` 之前的括号指定，表 schema 是列的定义和表的约束。
列定义包括列名称和数据类型，以及可选的 `NULL`、`NOT NULL`、`DEFAULT` 等。

关于 `engine` 选项和表引擎的选择，请阅读[表引擎](/reference/about-greptimedb-engines.md)介绍。

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

#### 索引


GreptimeDB 提供了丰富的索引实现来加速查询，请在[索引](/user-guide/manage-data/data-index.md)章节查看更多信息。

### 表选项

用户可以使用 `WITH` 添加表选项。有效的选项包括以下内容：

| 选项                                        | 描述                                     | 值                                                                                                                                                                       |
| ------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ttl`                                       | 表数据的存储时间                         | 一个时间范围字符串，例如 `'60m'`, `'1h'` 代表 1 小时， `'14d'` 代表 14 天等。支持的时间单位有：`s` / `m` / `h` / `d`                                                     |
| `storage`                                   | 自定义表的存储引擎，存储引擎提供商的名字 | 字符串，类似 `S3`、`Gcs` 等。必须在 `[[storage.providers]]` 列表里配置，参考 [configuration](/user-guide/deployments-administration/configuration.md#存储引擎提供商)。                 |
| `compaction.type`                           | Compaction 策略                          | 字符串值。只支持 `twcs`。你可以阅读这篇[文章](https://cassandra.apache.org/doc/latest/cassandra/managing/operating/compaction/twcs.html)来了解 `twcs` compaction 策略    |
| `compaction.twcs.trigger_file_num`   | 某个窗口内触发 compaction 的最小文件数量阈值           | 字符串值，如 '8'。只在 `compaction.type` 为 `twcs` 时可用                                                                                                                |
| `compaction.twcs.time_window`               | Compaction 时间窗口                      | 字符串值，如 '1d' 表示 1 天。该表会根据时间戳将数据分区到不同的时间窗口中。只在 `compaction.type` 为 `twcs` 时可用                                                       |
| `compaction.twcs.max_output_file_size`      | TWCS compaction 的最大输出文件大小          | 字符串值，如 '1GB'、'512MB'。设置 TWCS compaction 产生的文件的最大大小。只在 `compaction.type` 为 `twcs` 时可用                                                        |
| `memtable.type`                             | memtable 的类型                          | 字符串值，支持 `time_series`，`partition_tree`                                                                                                                           |
| `append_mode`                               | 该表是否时 append-only 的                | 字符串值。默认值为 'false'，根据 'merge_mode' 按主键和时间戳删除重复行。设置为 'true' 可以开启 append 模式和创建 append-only 表，保留所有重复的行                        |
| `merge_mode`                                | 合并重复行的策略                         | 字符串值。只有当 `append_mode` 为 'false' 时可用。默认值为 `last_row`，保留相同主键和时间戳的最后一行。设置为 `last_non_null` 则保留相同主键和时间戳的最后一个非空字段。 |
| `sst_format`                                | SST 文件的格式                            | 字符串值，支持 `primary_key`，`flat`。默认为 `primary_key`。`flat` 格式建议用于具有高基数主键的表。   |
| `comment`                                   | 表级注释                                 | 字符串值。                                                                                                                                                               |
| `index.type`                                | Index 类型                               | **仅用于 metric engine**  字符串值，支持 `none`, `skipping`.                                                                                                             |
| `skip_wal`                                | 是否关闭表的预写日志                               | 字符串类型。当设置为 `'true'` 时表的写入数据将不会持久化到预写日志，可以避免存储磨损同时提升写入吞吐。但是当进程重启时，尚未 flush 的数据会丢失。请仅在数据源本身可以确保可靠性的情况下使用此功能。 |

#### 创建指定 TTL 的表
例如，创建一个存储数据 TTL(Time-To-Live) 为七天的表：

```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
) with(ttl='7d');
```
`ttl` 值是一个字符串，支持以下类型的值：

- [时间范围字符串](/reference/time-durations.md)，如 `1hour 12min 5s`。
- `forever`, `NULL`, `0s` （或任何长度为 0 的时间范围，如 `0d`）或空字符串 `''`，表示数据永远不会被删除。
- `instant`, 注意数据库的 TTL 不能设置为 `instant`。`instant` 表示数据在插入时立即删除，如果你想将输入发送到流任务而不保存它，可以使用 `instant`，请参阅[流管理文档](/user-guide/flow-computation/manage-flow.md#manage-flows)了解更多细节。
- 未设置，可以使用 `ALTER TABLE <table-name> UNSET 'ttl'` 来取消表的 `ttl` 设置，这样表将继承数据库的 `ttl` 策略（如果有的话）。

如果一张表有自己的 TTL 策略，那么它将使用该 TTL 策略。否则，数据库的 TTL 策略将被应用到表上。

比如说，如果表的 TTL 设置为 `forever`，那么无论数据库的 TTL 是什么，数据都不会被删除。但是如果你取消表的 TTL 设置：
```sql
ALTER TABLE <table-name> UNSET 'ttl';
```
那么数据库的 TTL 将会被应用到表上。

请注意表和数据库的默认 TTL 策略都是未设置，也就是没有设置 TTL，代表着数据永远不会删除。

#### 创建自定义存储的表
或者创建一个表单独将数据存储在 Google Cloud Storage 服务上：

```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
) with(ttl='7d', storage="Gcs");
```

#### 创建自定义 compaction 参数的表
创建带自定义 twcs compaction 参数的表。这个表会尝试根据数据的时间戳将数据按 1 天的时间窗口分区，并会在最新时间窗口内的文件超过 8 个时合并该窗口的文件

```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
)
with(
  'compaction.type'='twcs',
  'compaction.twcs.time_window'='1d',
  'compaction.twcs.trigger_file_num'='8',
  'compaction.twcs.max_output_file_size'='1GB'
);
```

#### 创建 Append-Only 表
创建一个 append-only 表来关闭去重
```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
) with('append_mode'='true');
```

#### 创建带有 merge 模式的表

创建一个带有 `last_row` merge 模式的表，这是默认的 merge 模式。

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

在 `last_row` 模式下，表会通过保留最新的行来合并具有相同主键和时间戳的行。

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


创建带有 `last_non_null` merge 模式的表。

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

在 `last_non_null` 模式下，表会通过保留每个字段的最新非 NULL 值来合并具有相同主键和时间戳的行。

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

#### 创建 metric engine 的物理表

metric engine 使用合成物理宽表来存储大量的小表数据，实现重用相同列和元数据的效果。详情请参考 [metric engine 文档](/contributor-guide/datanode/metric-engine)和[表引擎](/reference/about-greptimedb-engines.md)介绍。

创建一个使用 metric engine 的物理表。
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

#### 创建一个带有跳数索引的物理表

默认情况下，metric engine 不会为列创建索引。你可以通过设置 `index.type` 为 `skipping` 来设置索引类型。

创建一个带有跳数索引的物理表。所有自动添加的列都将应用跳数索引。

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

#### 创建指定 SST 格式的表

创建一个使用 `flat` SST 格式的表。

```sql
CREATE TABLE IF NOT EXISTS metrics(
    host string,
    ts timestamp,
    cpu double,
    memory double,
    TIME INDEX (ts),
    PRIMARY KEY(host)
)
with('sst_format'='flat');
```

`flat` 格式是一种针对高基数主键优化的新格式。为了向后兼容，默认情况下表的 SST 格式为 `primary_key`。一旦 `flat` 格式稳定，默认格式将变为 `flat`。


### 列选项

GreptimeDB 支持以下列选项：

| 选项              | 描述                                                     |
| ----------------- | -------------------------------------------------------- |
| NULL              | 列值可以为 `null`                                        |
| NOT NULL          | 列值不能为 `null`                                        |
| DEFAULT `expr`    | 该列的默认值是 `expr`，其类型必须是该列的类型            |
| COMMENT `comment` | 列注释，必须为字符串类型                                 |
| FULLTEXT INDEX    | 创建全文索引，可以加速全文搜索操作。仅适用于字符串类型列 |
| SKIPPING INDEX    | 创建跳数索引，可以加速查询稀疏数据。                     |
| INVERTED INDEX    | 创建倒排索引，可以加速查询稠密数据。                     |

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

#### `INDEX` 列选项

更多关于索引配置、性能对比和使用指南的信息，请参考[索引](/user-guide/manage-data/data-index.md)章节。

### Region 分区规则

请参考 [分区](/contributor-guide/frontend/table-sharding.md#partition) 章节。

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
  [,ENABLE_VIRTUAL HOST_STYLE = { TRUE | FALSE }]
  [,SESSION_TOKEN = token ]
  ...
)
```

### 表选项

| 选项       | 描述                                                               | 是否必需 |
| ---------- | ------------------------------------------------------------------ | -------- |
| `LOCATION` | 外部表的位置，例如 `s3://<bucket>[<path>]`, `/<path>/[<filename>]` | **是**   |
| `FORMAT`   | 目标文件的格式，例如 JSON，CSV，Parquet, ORC                       | **是**   |
| `PATTERN`  | 使用正则来匹配文件，例如 `*_today.parquet`                         | 可选     |

#### S3

| 选项                        | 描述                                                            | 是否必需 |
| --------------------------- | --------------------------------------------------------------- | -------- |
| `REGION`                    | AWS region 名称，例如 us-east-1                                 | **是**   |
| `ENDPOINT`                  | The bucket endpoint                                             | 可选     |
| `ACCESS_KEY_ID`             | 用于连接 AWS S3 兼容对象存储的访问密钥 ID                       | 可选     |
| `SECRET_ACCESS_KEY`         | 用于连接 AWS S3 兼容对象存储的秘密访问密钥                      | 可选     |
| `ENABLE_VIRTUAL HOST_STYLE` | 如果你想要使用 virtual hosting 来定位 bucket，将其设置为 `true` | 可选     |
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

## 创建 Flow

```sql
CREATE [OR REPLACE] FLOW [ IF NOT EXISTS ] <flow-name>
SINK TO <sink-table-name>
[ EXPIRE AFTER <expr> ]
[ COMMENT '<string>' ]
AS
<SQL>;
```

用于创建或更新 Flow 任务，请阅读[Flow 管理文档](/user-guide/flow-computation/manage-flow.md#创建-flow)。

## 创建 View

```sql
CREATE [OR REPLACE] VIEW [ IF NOT EXISTS ] <view-name>
AS select_statement
```

用于创建或更新视图，请阅读[视图用户指南](/user-guide/query-data/view.md#视图)。

## 创建 Trigger

请参考 [CREATE TRIGGER](/reference/sql/trigger-syntax.md#create-trigger) 文档。
