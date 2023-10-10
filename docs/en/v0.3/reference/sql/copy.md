# COPY

## COPY TO

`COPY TO` is used to export the contents of a table to a file.

The syntax for using `COPY TO` is as follows:

```sql
COPY tbl TO '/xxx/xxx/output.parquet' WITH (FORMAT = 'parquet');
```

The command starts with the keyword `COPY`, followed by the name of the table you want to export data from (`tbl` in this case).

`TO` specifies the file path and name to save the exported
data (`/xxx/xxx/output.parquet` in this case).

`WITH` adds options such as the file `FORMAT` which specifies the format of the exported file. In this example, the format is Parquet; it is a columnar storage format used for big data processing. Parquet efficiently compresses and encodes columnar data for big data analytics.

## COPY FROM

`COPY FROM` is used to import data from a file into a table.

The syntax for using `COPY FROM` is as follows:

```sql
COPY [<db>.]<table_name>
FROM { '<path>/[<filename>]' }
[ [ WITH ]
 (
   [ FORMAT =  { parquet } ]
   [ PATTERN = '<regex_pattern>' ]
 )
]
```

The command starts with the keyword `COPY`, followed by the name of the table you want to import data into.

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

### WITH Options

| Option  | Description  | Required |
|---|---|---|
| `FORMAT` | Target file(s) format, e.g., JSON, CSV, Parquet  | **Required** |
| `PATTERN` | Use regex to match files. e.g., `*_today.parquet` | Optional |

### Connection Options

#### S3

When you try to copy data from(to) S3:

```sql
COPY tbl FROM '<url>' WITH (FORMAT = 'parquet') CONNECTION(BUCKET = 'us-west-2');. 
```

##### URL

Notes: You should specify a file using `S3://bucket/key-name`. The following example shows the correct format.

```
S3://my-bucket/data.parquet
```

Another way is using Virtual-hosted–style. The following example shows the correct format.

```
https://bucket-name.s3.region-code.amazonaws.com/key-name
```

##### CONNECTION

You can set the following **CONNECTION** options:

| Option  | Description  | Required |
|---|---|---|
| `REGION` | AWS region name.  e.g., us-east-1.  | **Required** |
| `ENDPOINT`  | The bucket endpoint  | Optional |
| `ACCESS_KEY_ID` | ACCESS_KEY_ID Your access key ID for connecting the AWS S3 compatible object storage.  | Optional |
| `SECRET_ACCESS_KEY` | Your secret access key for connecting the AWS S3 compatible object storage.  | Optional |
| `ENABLE_VIRTUAL_HOST_STYLE` | If you use virtual hosting to address the bucket, set it to "true".| Optional |
| `SESSION_TOKEN` | Your temporary credential for connecting the AWS S3 service. | Optional |
