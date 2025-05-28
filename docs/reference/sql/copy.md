---
keywords: [copy statement, SQL, export data, import data, file format, cloud storage]
description: Describes the `COPY` statement used to export and import table or database data to and from files, including options for file format, time range, and cloud storage connections.
---

# COPY

## COPY TABLE
### COPY TO

`COPY TO` is used to export the contents of a table to a file.

The syntax for using `COPY TO` is as follows:

```sql
COPY tbl TO '/xxx/xxx/output.parquet' WITH (FORMAT = 'parquet');
```

The command starts with the keyword `COPY`, followed by the name of the table you want to export data from (`tbl` in this case).

`TO` specifies the file path and name to save the exported
data (`/xxx/xxx/output.parquet` in this case).

#### `WITH` Option

`WITH` adds options such as the file `FORMAT` which specifies the format of the exported file. In this example, the format is Parquet; it is a columnar storage format used for big data processing. Parquet efficiently compresses and encodes columnar data for big data analytics.

| Option  | Description  | Required |
|---|---|---|
| `FORMAT` | Target file(s) format, e.g., JSON, CSV, Parquet  | **Required** |
| `START_TIME`/`END_TIME`| The time range within which data should be exported. `START_TIME` is inclusive and `END_TIME` is exclusive. | Optional |

#### `CONNECTION` Option

`COPY TO` supports exporting data to cloud storage services like S3. See [connect-to-s3](#connect-to-s3) for more detail.

### COPY FROM

`COPY FROM` is used to import data from a file into a table.

The syntax for using `COPY FROM` is as follows:

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

The command starts with the keyword `COPY`, followed by the name of the table you want to import data into.

#### `WITH` Option

`FORMAT` specifies the file format of the imported file. In this example, the format is Parquet.

The option `PATTERN` allows the usage of wildcard characters like * to specify multiple input files that
match a certain pattern. For example, you can use the following syntax to import all files in the
directory(which must be an absolute path) "/path/to/folder" with the filename that contains `parquet`:

```sql
COPY tbl FROM '/path/to/folder/' WITH (FORMAT = 'parquet', PATTERN = '.*parquet.*');
```

Specifically, if you only have one file to import, you can use the following syntax:

```sql
COPY tbl FROM '/path/to/folder/xxx.parquet' WITH (FORMAT = 'parquet');
```

| Option  | Description  | Required |
|---|---|---|
| `FORMAT` | Target file(s) format, e.g., JSON, CSV, Parquet, ORC  | **Required** |
| `PATTERN` | Use regex to match files. e.g., `*_today.parquet` | Optional |

:::tip NOTE
The CSV file must have a header row to be imported correctly. The header row should contain the column names of the table.
:::

#### `CONNECTION` Option

`COPY FROM` also supports importing data from cloud storage services like S3. See [connect-to-s3](#connect-to-s3) for more detail.

### Connect to S3

You can copy data from/to S3

```sql
-- COPY FROM
COPY tbl FROM '<URL>' WITH (FORMAT = 'parquet') CONNECTION(REGION = 'us-west-2');

-- COPY TO
COPY tbl TO '<URL>' WITH (FORMAT = 'parquet') CONNECTION(REGION = 'us-west-2');
```

#### URL

Notes: You should specify a file using `S3://bucket/key-name`. The following example shows the correct format.

```
s3://my-bucket/data.parquet
```

Another way is using Virtual-hosted–style(`ENABLE_VIRTUAL_HOST_STYLE` must be set to `true` to enable this). The following example shows the correct format.

```
s3://bucket-name.s3.region-code.amazonaws.com/key-name
```

:::tip NOTE
You can use `Copy S3 URI` or `COPY URL` on S3 console to get S3 URI/HTTP URL prefix or full path.
:::

#### Options

You can set the following **CONNECTION** options:

| Option  | Description  | Required |
|---|---|---|
| `REGION` | AWS region name.  e.g., `us-west-2`  | **Required** |
| `ENDPOINT`  | The bucket endpoint. e.g., `s3.us-west-2.amazonaws.com`  | Optional |
| `ACCESS_KEY_ID` | ACCESS_KEY_ID Your access key ID for connecting the AWS S3 compatible object storage.  | Optional |
| `SECRET_ACCESS_KEY` | Your secret access key for connecting the AWS S3 compatible object storage.  | Optional |
| `ENABLE_VIRTUAL_HOST_STYLE` | If you use virtual hosting to address the bucket, set it to "true".| Optional |
| `SESSION_TOKEN` | Your temporary credential for connecting the AWS S3 service. | Optional |

#### LIMIT

You can use `LIMIT` to restrict maximum number of rows inserted at once.

## COPY DATABASE

Beside copying specific table to/from some path, `COPY` statement can also be used to copy whole database to/from some path. The syntax for copying databases is:

```sql
COPY DATABASE <db_name> 
  [TO | FROM] '<PATH>' 
  WITH (
    FORMAT = { 'CSV' | 'JSON' | 'PARQUET' },
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

| Option  | Description  | Required |
|---|---|---|
| `FORMAT` | Export file format, available options: JSON, CSV, Parquet  | **Required** |
| `START_TIME`/`END_TIME`| The time range within which data should be exported. `START_TIME` is inclusive and `END_TIME` is exclusive. | Optional |

> - When copying databases, `<PATH>` must end with `/`.
> - `CONNECTION` parameters can also be used to copying databases to/from object storage services like AWS S3.

### Examples

```sql
-- Export all tables' data to /tmp/export/
COPY DATABASE public TO '/tmp/export/' WITH (FORMAT='parquet');

-- Export all tables' data within time range 2022-04-11 08:00:00~2022-04-11 09:00:00 to /tmp/export/
COPY DATABASE public TO '/tmp/export/' WITH (FORMAT='parquet', START_TIME='2022-04-11 08:00:00', END_TIME='2022-04-11 09:00:00');

-- Import files under /tmp/export/ directory to database named public.
COPY DATABASE public FROM '/tmp/export/' WITH (FORMAT='parquet');
```

## Special reminder for Windows platforms

Please notice that when executing `COPY`/`COPY DATABASE` statements on Windows platforms, backslashes (`\`) in paths should be replaced with `/` for compatibility.

```sql
-- Won't work
COPY tbl TO 'C:\xxx\xxx\output.parquet' WITH (FORMAT = 'parquet');

-- Correct path:
COPY tbl TO 'C:/xxx/xxx/output.parquet' WITH (FORMAT = 'parquet');
```
