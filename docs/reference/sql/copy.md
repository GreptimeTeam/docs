# COPY TO
The command `COPY TO` used to export the contents of a table to a file.
The syntax for using `COPY TO` is as follows:

```sql
COPY tbl TO '/xxx/xxx/output.parquet' WITH (FORMAT = 'parquet');
```

The command starts with the keyword `COPY`, followed by the name of the table you want to export data
from (tbl in this case). The `TO` keyword specifies the file path and filename to save the exported
data to ('/xxx/xxx/output.parquet' in this case). The `WITH` keyword is used to provide options for
the export process, such as the file format.

The `FORMAT` option is used to specify the file format to use for the export. In this case, the format
is set to Parquet, which is a columnar storage format used for big data processing. Parquet is designed
to provide efficient compression and encoding of columnar data, making it well-suited for big data
analytics workloads.

# COPY FROM
// TODO
