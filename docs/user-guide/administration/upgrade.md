---
description: Instructions on upgrading GreptimeDB using the built-in CLI tool, including exporting and importing data and schemas, and a complete example for upgrading.
---

# Upgrade

From `v0.4`, we provide a built-in utility to help upgrade your previous GreptimeDB deployment to the latest version if there are some breaking changes.
It's recommended to use this method to upgrade your GreptimeDB with different versions.

The lowest version that can be upgraded by this tool is `v0.3.0`.

## CLI

This tool is in the `greptime` binary. You need to prepare the corresponding binary of target version before start.

```shell
greptime cli export --help
```

And the help text is as follows:

```shell
greptime-cli-export 

USAGE:
    greptime cli export [OPTIONS] --addr <ADDR> --output-dir <OUTPUT_DIR> --target <TARGET>

OPTIONS:
      --addr <ADDR>
          Server address to connect

      --output-dir <OUTPUT_DIR>
          Directory to put the exported data. E.g.: /tmp/greptimedb-export

      --database <DATABASE>
          The name of the catalog to export
          
          [default: greptime-*]

  -j, --export-jobs <EXPORT_JOBS>
          Parallelism of the export
          
          [default: 1]

      --max-retry <MAX_RETRY>
          Max retry times for each job
          
          [default: 3]

  -t, --target <TARGET>
          Things to export
          
          [default: all]

          Possible values:
          - schema: Export all table schemas, corresponding to `SHOW CREATE TABLE`
          - data:   Export all table data, corresponding to `COPY DATABASE TO`
          - all:    Export all table schemas and data at once

      --log-dir <LOG_DIR>
          

      --start-time <START_TIME>
          A half-open time range: [start_time, end_time). The start of the time range (time-index column) for data export

      --end-time <END_TIME>
          A half-open time range: [start_time, end_time). The end of the time range (time-index column) for data export

      --log-level <LOG_LEVEL>
          

      --auth-basic <AUTH_BASIC>
          The basic authentication for connecting to the server

  -h, --help
          Print help (see a summary with '-h')

  -V, --version
          Print version
```

Here explains the meaning of some important options

- `--addr`: The server address of the Frontend node or Standalone process.
- `--output-dir`: The directory to put the exported data. Give a path at your current machine. The exported SQL files will be put in that directory.
- `-target`: Specifies the data to export. The `schema` option exports the `CREATE TABLE` clause for each table. The `data` option exports the data of each database along with the `COPY FROM` clause. By default, all data is exported for both `schema` and `data`. It is recommended not to specify this option that use the default value to export all data.

For a complete upgrade, you will need to execute this tools twice with each target options.

## Upgrade from 0.8.x

Here is a complete example for upgrading from `v0.8.x` to `v0.9.x`.

### Export `CREATE TABLE`s and table data at once

Assuming the HTTP service port of the old database is `4000`.

```shell
greptime cli export --addr '127.0.0.1:4000' --output-dir /tmp/greptimedb-export
```

If success, you will see something like this

```log
2024-08-01T06:32:26.547809Z  INFO cmd: Starting app: greptime-cli
2024-08-01T06:32:27.239639Z  INFO cmd::cli::export: Finished exporting greptime.greptime_private with 0 table schemas to path: /tmp/greptimedb-export/greptime/greptime_private/
2024-08-01T06:32:27.540696Z  INFO cmd::cli::export: Finished exporting greptime.pg_catalog with 0 table schemas to path: /tmp/greptimedb-export/greptime/pg_catalog/
2024-08-01T06:32:27.832018Z  INFO cmd::cli::export: Finished exporting greptime.public with 0 table schemas to path: /tmp/greptimedb-export/greptime/public/
2024-08-01T06:32:28.272054Z  INFO cmd::cli::export: Finished exporting greptime.test with 1 table schemas to path: /tmp/greptimedb-export/greptime/test/
2024-08-01T06:32:28.272166Z  INFO cmd::cli::export: Success 4/4 jobs, cost: 1.724222791s
2024-08-01T06:32:28.416532Z  INFO cmd::cli::export: Executing sql: COPY DATABASE "greptime"."greptime_private" TO '/tmp/greptimedb-export/greptime/greptime_private/' WITH (FORMAT='parquet');
2024-08-01T06:32:28.556017Z  INFO cmd::cli::export: Finished exporting greptime.greptime_private data into path: /tmp/greptimedb-export/greptime/greptime_private/
2024-08-01T06:32:28.556330Z  INFO cmd::cli::export: Finished exporting greptime.greptime_private copy_from.sql
2024-08-01T06:32:28.556424Z  INFO cmd::cli::export: Executing sql: COPY DATABASE "greptime"."pg_catalog" TO '/tmp/greptimedb-export/greptime/pg_catalog/' WITH (FORMAT='parquet');
2024-08-01T06:32:28.738719Z  INFO cmd::cli::export: Finished exporting greptime.pg_catalog data into path: /tmp/greptimedb-export/greptime/pg_catalog/
2024-08-01T06:32:28.738998Z  INFO cmd::cli::export: Finished exporting greptime.pg_catalog copy_from.sql
2024-08-01T06:32:28.739098Z  INFO cmd::cli::export: Executing sql: COPY DATABASE "greptime"."public" TO '/tmp/greptimedb-export/greptime/public/' WITH (FORMAT='parquet');
2024-08-01T06:32:28.875600Z  INFO cmd::cli::export: Finished exporting greptime.public data into path: /tmp/greptimedb-export/greptime/public/
2024-08-01T06:32:28.875888Z  INFO cmd::cli::export: Finished exporting greptime.public copy_from.sql
2024-08-01T06:32:28.876005Z  INFO cmd::cli::export: Executing sql: COPY DATABASE "greptime"."test" TO '/tmp/greptimedb-export/greptime/test/' WITH (FORMAT='parquet');
2024-08-01T06:32:29.053681Z  INFO cmd::cli::export: Finished exporting greptime.test data into path: /tmp/greptimedb-export/greptime/test/
2024-08-01T06:32:29.054104Z  INFO cmd::cli::export: Finished exporting greptime.test copy_from.sql
2024-08-01T06:32:29.054162Z  INFO cmd::cli::export: Success 4/4 jobs, costs: 781.98875ms
2024-08-01T06:32:29.054181Z  INFO cmd: Goodbye!
```

And now the output directory structure is

```plaintext
/tmp/greptimedb-export/
├── greptime/public
│   ├── copy_from.sql
│   ├── create_tables.sql
│   ├── up.parquet
│   └── other-tables.parquet
```

The content includes `create_tables.sql`, `copy_from.sql`, and the parquet files for each table in the DB `greptime-public`. The `create_tables.sql` contains the create table statements for all tables in the current DB, while `copy_from.sql` includes a single `COPY DATABASE FROM` statement used to copy data files to the target DB. The remaining parquet files are the data files for each table.

### Import table schema and data

Then you need to execute SQL files generated by the previous step. First is `create_tables.sql`. SQL generated in previous step is in PostgreSQL dialect, we will use [PostgreSQL protocol](/user-guide/protocols/postgresql.md) in the following steps. This document assumes the client is `psql`.

:::tip NOTICE
From this step, all the operation is done in the new version of GreptimeDB.

The default port of PostgreSQL protocol is `4003`.
:::

Before executing the following command, you need first to create the corresponding database in your new deployment (but in this example, the database `greptime-public` is the default one).

This command will create all the tables in the new version of GreptimeDB.

```shell
psql -h 127.0.0.1 -p 4003 -d public -f /tmp/greptimedb-export/greptime/public/create_tables.sql
```

And then import the data

```shell
psql -h 127.0.0.1 -p 4003 -d public -f /tmp/greptimedb-export/greptime/public/copy_from.sql
```

### Clean up

At this step all the data is migrated. You can check the data in the new cluster.

After confirming that the data is correct, you can clean up the old cluster and the temporary `--output-dir`. `/tmp/greptimedb-export` at this example.

## Recommended overall process

This section gives a recommended overall process for upgrading GreptimeDB smoothly. You can skip this section if your environment can go offline on the upgrade progress.

1. Create a brand new v0.9.x cluster.
2. Use the v0.9.x CLI tool to export and import `create-table`.
3. Switch the workload to the new cluster.
4. Use the v0.9.x CLI tool to export and import `database-data`.

Caveats
- Changes to table structure between step 2 and 3 will be lost
- Old data is invisible in new cluster until step 4 is done
