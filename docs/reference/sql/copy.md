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
[ [ CONNECTION ]
 (
   [ ENDPOINT = '<uri>' ]
   [ ACCESS_KEY_ID = '<key_id>' ]
   [ SECRET_ACCESS_KEY = '<access_key>' ]
   [ SESSION_TOKEN = '<token>' ]
   [ REGION = '<region>' ]
   [ ENABLE_VIRTUAL_HOST_STYLE = '<boolean>']
   ..
 )
]
```

The command starts with the keyword `COPY`, followed by the name of the table you want to import data into.

`FORMAT` specifies the file format of the imported file. In this example, the format is Parquet.

`PATTERN` option can be used with wildcard characters like * to specify multiple input files that 
match a certain pattern. For example, you can use the following syntax to import all files in the 
directory "/path/to/folder" with the name who contains `parquet`:

```sql
COPY tbl FROM '/path/to/folder/' WITH (PATTERN = '.*parquet.*');
```

`CONNECTION` options are used when importing data from cloud storage services such as AWS S3. These options include:

- `ENDPOINT` specifies the endpoint URL of the cloud storage service.
- `ACCESS_KEY_ID` specifies the access key ID required to access the cloud storage service.
- `SECRET_ACCESS_KEY` specifies the secret access key required to access the cloud storage service.
- `SESSION_TOKEN` specifies the session token required to access the cloud storage service.
- `REGION` specifies the region of the cloud storage service.
- `ENABLE_VIRTUAL_HOST_STYLE` is a Boolean parameter that is used when accessing cloud storage 
services over a virtual hosted-style endpoint. This parameter should be set to true when 
accessing cloud storage services over virtual hosted-style endpoints, and to false when accessing
cloud storage services over path-style endpoints.
