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

`PATTERN` option can be used with wildcard characters like * to specify multiple input files that 
match a certain pattern. For example, you can use the following syntax to import all files in the 
directory(which must be an absolute path) "/path/to/folder" with the filename that contains `parquet`:

```sql
COPY tbl FROM '/path/to/folder/' WITH (FORMAT = 'parquet', PATTERN = '.*parquet.*');
```

Specifically, if you only have one file to import, you can use the following syntax:

```sql
COPY tbl FROM '/path/to/folder/xxx.parquet' WITH (FORMAT = 'parquet');
```
