# Back up & restore data

Use [`COPY` command](/reference/sql/copy.md)to backup and restore data.

## Backup Table

Backup the table `monitor` in `parquet` format to the file `/home/backup/monitor/monitor.parquet`:

```sql
COPY monitor TO '/home/backup/monitor/monitor.parquet' WITH (FORMAT = 'parquet');
```

Backup the data in the time range:

```sql
COPY monitor TO '/home/backup/monitor/monitor_20240518.parquet' WITH (FORMAT = 'parquet', START_TIME='2024-05-18 00:00:00', END_TIME='2025-05-19 00:00:00');
```

The above command will export the data on `2024-05-18`. Use such command to achieve incremental backup.

## Restore Table

Restore the `monitor` table:

```sql
COPY monitor FROM '/home/backup/monitor/monitor.parquet' WITH (FORMAT = 'parquet');
```

If exporting the data every data incrementally, all the files under the same folder but with different file names, we can restore them with `PATTERN` option:

```sql
COPY monitor FROM '/home/backup/monitor/` WITH (FORMAT = 'parquet', PATTERN = '.*parquet')
```

## Backup & Restore Database

It's almost the same as the table:

```sql
-- Backup the database public --
COPY DATABASE public TO '/home/backup/public/' WITH (FORMAT='parquet');

-- Restore the database public --
COPY DATABASE public FROM '/home/backup/public/' WITH (FORMAT='parquet');
```

Look at the folder `/home/backup/public/`, the command exports each table as a separate file.
