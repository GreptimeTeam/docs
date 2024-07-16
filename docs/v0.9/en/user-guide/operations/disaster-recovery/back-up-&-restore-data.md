# Back up and Restore Data

It is crucial to back up your databases to ensure that you can recover your data and quickly resume operations in the event of problems such as system crashes, hardware failures, or accidental data deletion by users.

This document provides instructions on how to back up and restore data using the [Greptime command line](/reference/command-lines.md) and the SQL [`COPY` command](/reference/sql/copy.md).

## Back up and restore schemas

Before backing up and restoring data for tables or databases,
it is necessary to back up and restore the schemas.

### Back up schemas

The following example command line connects to the GreptimeDB server at `127.0.0.1:4000` and exports the `CREATE TABLE` SQL statements to the folder `/home/backup/schema/`:

```shell
greptime cli export --addr '127.0.0.1:4000' --output-dir /home/backup/schema/ --target create-table
```

### Restore schemas

To restore the schema to a specified database, use the PostgreSQL client.
For example,
the following command line runs the `CREATE TABLE` SQL statements in the file `greptime-public.sql` and creates table to the `public` database:

```shell
psql -h 127.0.0.1 -p 4003 -d public -f /home/backup/schema/greptime-public.sql
```

## Back up and restore tables

Before restoring data, ensure that the table exists in the database.
To avoid missing the table schema,
you can also back up the table schemas when backing up the table data.
Restore the schemas before restoring the data.

### Back up tables

The following SQL command backs up the `monitor` table in `parquet` format to the file `/home/backup/monitor/monitor.parquet`:

```sql
COPY monitor TO '/home/backup/monitor/monitor.parquet' WITH (FORMAT = 'parquet');
```

To back up the data within a specific time range, you can specify the `START_TIME` and `END_TIME` options.
For example, the following command exports the data for the date `2024-05-18`.

```sql
COPY monitor TO '/home/backup/monitor/monitor_20240518.parquet' WITH (FORMAT = 'parquet', START_TIME='2024-05-18 00:00:00', END_TIME='2024-05-19 00:00:00');
```

### Restore tables

The following SQL command restores the `monitor` table:

```sql
COPY monitor FROM '/home/backup/monitor/monitor.parquet' WITH (FORMAT = 'parquet');
```

If you have exported the data incrementally,
where each file has a different name but is located in the same folder,
you can restore them using the `PATTERN` option:

```sql
COPY monitor FROM '/home/backup/monitor/' WITH (FORMAT = 'parquet', PATTERN = '.*parquet');
```

## Back up and restore databases

Before restoring data, ensure that the database and tables exist in the database.
If the database does not exist, create it first using the following SQL command:

```sql
CREATE DATABASE <dbname>;
```

To avoid missing the table schema, you can also back up the table schemas when backing up the database data. Restore the schemas before restoring the data.

### Back up databases

The following SQL command backs up the `public` database in `parquet` format to the folder `/home/backup/public/`:

```sql
COPY DATABASE public TO '/home/backup/public/' WITH (FORMAT='parquet');
```

When you look at the folder `/home/backup/public/`, you will find that each table is exported as a separate file.

### Restore a database

To restore the `public` database from the folder `/home/backup/public/`, use the following SQL command:

```sql
COPY DATABASE public FROM '/home/backup/public/' WITH (FORMAT='parquet');
```

