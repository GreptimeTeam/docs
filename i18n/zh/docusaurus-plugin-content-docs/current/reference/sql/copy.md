---
keywords: [数据导入, 数据导出, COPY 语句, SQL COPY, 数据库复制, 表复制]
description: COPY 语句用于导入和导出表或数据库的数据。
---

# COPY

## COPY TABLE
### COPY TO

`COPY TO` 被用来将表的内容导出到文件中，其语法如下：

```sql
COPY tbl TO '/xxx/xxx/output.parquet' WITH (FORMAT = 'parquet');
```

命令以 `COPY` 关键字开始，后面跟着要导出数据的表名（本例中为 `tbl`）。
`TO` 指定导出数据的文件路径和名称（本例中为 `/xxx/xxx/output.parquet`）。

例如，可以使用自定义时间戳和日期格式导出数据到 CSV 文件：

```sql
COPY tbl TO '/path/to/file.csv' WITH (
  FORMAT = 'csv',
  TIMESTAMP_FORMAT = '%Y/%m/%d %H:%M:%S',
  DATE_FORMAT = '%Y-%m-%d'
);
```

#### `WITH` 选项

`WITH` 可以添加一些选项，比如文件的 `FORMAT` 用来指定导出文件的格式。本例中的格式为 Parquet，它是一种用于大数据处理的列式存储格式。Parquet 为大数据分析高效地压缩和编码列式数据。

| 选项  | 描述  | 是否必需 |
|---|---|---|
| `FORMAT` | 目标文件格式，例如 JSON, CSV, Parquet  | **是** |
| `START_TIME`/`END_TIME`| 需要导出数据的时间范围，时间范围为左闭右开 | 可选 |
| `TIMESTAMP_FORMAT` | 导出 CSV 格式时自定义时间戳列的格式。使用 [strftime](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) 格式说明符（例如 `'%Y-%m-%d %H:%M:%S'`）。仅支持 CSV 格式。 | 可选 |
| `DATE_FORMAT` | 导出 CSV 格式时自定义日期列的格式。使用 [strftime](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) 格式说明符（例如 `'%Y-%m-%d'`）。仅支持 CSV 格式。 | 可选 |
| `TIME_FORMAT` | 导出 CSV 格式时自定义时间列的格式。使用 [strftime](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) 格式说明符（例如 `'%H:%M:%S'`）。仅支持 CSV 格式。 | 可选 |

#### `CONNECTION` 选项

`COPY TO` 支持导出数据到云存储上，比如 S3。详情请参考 [连接 S3](#连接-s3)。


### COPY FROM

`COPY FROM` 被用来将文件中的数据导入到表中，其语法如下：

```sql
COPY [<db>.]<table_name>
FROM { '<path>/[<filename>]' }
[ [ WITH ]
 (
   [ FORMAT =  { 'CSV' | 'JSON' | 'PARQUET' | 'ORC' } ]
   [ PATTERN = '<regex_pattern>' ]
 )
]
[LIMIT NUM]
```

命令以 `COPY` 关键字开始，后面跟着要导入数据的表名。

#### `WITH` 选项

`FORMAT` 指定导入文件的格式，本例中为 Parquet。

选项 `PATTERN` 允许使用通配符（如 *）指定匹配某种模式的多个输入文件。例如，你可以使用以下语法导入目录（必须是绝对路径）"/path/to/folder" 中文件名包含 `parquet` 的所有文件：

```sql
COPY tbl FROM '/path/to/folder/' WITH (FORMAT = 'parquet', PATTERN = '.*parquet.*');
```

例如，如果你只有一个文件需要导入，可以使用下方的语法：

```sql
COPY tbl FROM '/path/to/folder/xxx.parquet' WITH (FORMAT = 'parquet');
```

| 选项  | 描述  | 是否必需 |
|---|---|---|
| `FORMAT` | 目标文件格式，例如 JSON, CSV, Parquet, ORC  | **是** |
| `PATTERN` | 使用正则匹配文件，例如 `*_today.parquet` | 可选 |

:::tip NOTE
CSV 文件必须带有 header，包含表的列名。
:::

#### Connection 选项

`COPY FROM` 同样支持从云存储上导入数据，比如 S3。详情请参考 [连接 S3](#连接-s3)。

#### LIMIT 选项

可以通过 `LIMIT` 手动限制一次插入的最大行数。

### 连接 S3

你可以从 S3 导入/导出数据

```sql
-- COPY FROM
COPY tbl FROM '<URL>' WITH (FORMAT = 'parquet') CONNECTION(REGION = 'us-west-2');

-- COPY TO
COPY tbl TO '<URL>' WITH (FORMAT = 'parquet') CONNECTION(REGION = 'us-west-2');
```

#### URL

注意：你应该使用 `S3://bucket/key-name` 指定文件。下方的例子展示了正确的格式：

```
S3://my-bucket/data.parquet
```

另一种方式是使用 Virtual-hosted–style（`ENABLE_VIRTUAL_HOST_STYLE` 需要设置成 `true`），例如：

```
https://bucket-name.s3.region-code.amazonaws.com/key-name
```

:::tip NOTE
可以在 S3 控制台上点击 `Copy S3 URI` 或者 `COPY URL` 直接获取对应的 URL/HTTP 前缀或者完整路径。
:::

#### 选项

你可以设置这些 **CONNECTION** 选项：

| 选项  | 描述  | 是否必需  |
|---|---|---|
| `REGION` | AWS region 名称，例如 `us-west-2` | **是** |
| `ENDPOINT`  | The bucket endpoint，例如 `s3.us-west-2.amazonaws.com`  | 可选 |
| `ACCESS_KEY_ID` | 用于连接 AWS S3 兼容的对象存储的访问密钥 ID | 可选 |
| `SECRET_ACCESS_KEY` | 用于连接 AWS S3 兼容的对象存储的秘密访问密钥  | 可选 |
| `ENABLE_VIRTUAL_HOST_STYLE` | 如果你使用 virtual hosting 的方式来定位 bucket，将该选项设置为 "true" | 可选 |
| `SESSION_TOKEN` | 用于连接 AWS S3 服务的临时凭证。 | 可选 |

## COPY 查询结果

你可以使用 `COPY` 语句将查询结果导出到文件中。语法如下：

```sql
COPY (<QUERY>) TO '<PATH>' WITH (FORMAT = { 'CSV' | 'JSON' | 'PARQUET' });
```

| 选项  | 描述  | 是否必需 |
|---|---|---|
| `QUERY` | 要执行的 SQL SELECT 语句 | **是** |
| `PATH` | 输出文件的路径 | **是** |
| `FORMAT` | 输出文件格式：'CSV'、'JSON' 或 'PARQUET' | **是** |
| `TIMESTAMP_FORMAT` | 导出 CSV 格式时自定义时间戳列的格式。使用 [strftime](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) 格式说明符。仅支持 CSV 格式。 | 可选 |
| `DATE_FORMAT` | 导出 CSV 格式时自定义日期列的格式。使用 [strftime](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) 格式说明符。仅支持 CSV 格式。 | 可选 |
| `TIME_FORMAT` | 导出 CSV 格式时自定义时间列的格式。使用 [strftime](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) 格式说明符。仅支持 CSV 格式。 | 可选 |

例如，以下语句将查询结果导出到 CSV 文件中：

```sql
COPY (SELECT * FROM tbl WHERE host = 'host1') TO '/path/to/file.csv' WITH (FORMAT = 'csv');
```

也可以在导出到 CSV 时指定自定义日期和时间格式：

```sql
COPY (SELECT * FROM tbl WHERE host = 'host1') TO '/path/to/file.csv' WITH (
  FORMAT = 'csv',
  TIMESTAMP_FORMAT = '%m-%d-%Y %H:%M:%S',
  DATE_FORMAT = '%Y/%m/%d'
);
```

## COPY DATABASE

`COPY` 语句除可以导入/导出表之外，也可以导入/导出指定的数据库，其语法如下：

```sql
COPY DATABASE <db_name> 
  [TO | FROM] '<PATH>' 
  WITH (
    FORMAT =  { 'CSV' | 'JSON' | 'PARQUET' } 
    START_TIME = "<START TIMESTAMP>",
    END_TIME = "<END TIMESTAMP>"
  ) 
  [CONNECTION(
    REGION = "<REGION NAME>",
    ENDPOINT = "<ENDPOINT>",
    ACCESS_KEY_ID = "<ACCESS KEY>",
    SECRET_ACCESS_KEY = "<SECRET KEY>",
    ENABLE_VIRTUAL_HOST_STYLE = "[true | false]",
  )]
```

| 选项  | 描述  | 是否必需 |
|---|---|---|
| `FORMAT` | 目标文件格式，例如 JSON, CSV, Parquet  | **是** |
| `START_TIME`/`END_TIME`| 需要导出数据的时间范围，时间范围为左闭右开 | 可选 |

> - 当导入/导出表时，`<PATH>` 参数必须以 `/` 结尾；
> - COPY DATABASE 同样可以通过 `CONNECTION` 参数将数据导入/导出的路径指向 S3 等对象存储


### 示例

```sql
-- 将 public 数据库中所有数据导出到 /tmp/export/ 目录下
COPY DATABASE public TO '/tmp/export/' WITH (FORMAT='parquet');

-- 将 public 数据库中时间范围在 2022-04-11 08:00:00 到 2022-04-11 09:00:00 之间的数据导出到 /tmp/export/ 目录下
COPY DATABASE public TO '/tmp/export/' WITH (FORMAT='parquet', START_TIME='2022-04-11 08:00:00', END_TIME='2022-04-11 09:00:00');

-- 从 /tmp/export/ 目录恢复 public 数据库的数据
COPY DATABASE public FROM '/tmp/export/' WITH (FORMAT='parquet');
```

## Windows 平台上的路径

请注意，在 Windows 平台上执行 `COPY`/`COPY DATABASE` 语句时，请使用 `/` 代替 `<PATH>` 中的 `\`，如 `C:/some_dir/output.parquet`。

```sql
-- 下列语句将会报错
COPY tbl TO 'C:\xxx\xxx\output.parquet' WITH (FORMAT = 'parquet');

-- 下列语句能够正常执行
COPY tbl TO 'C:/xxx/xxx/output.parquet' WITH (FORMAT = 'parquet');
```
