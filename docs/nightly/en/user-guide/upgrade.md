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
        --addr <ADDR>                  Server address to connect
        --database <DATABASE>          The name of the catalog to export. Default to "greptime-*""
                                       [default: ]
    -h, --help                         Print help information
    -j, --export-jobs <EXPORT_JOBS>    Parallelism of the export [default: 1]
        --max-retry <MAX_RETRY>        Max retry times for each job [default: 3]
        --output-dir <OUTPUT_DIR>      Directory to put the exported data. E.g.:
                                       /tmp/greptimedb-export
    -t, --target <TARGET>              Things to export [possible values: create-table, table-data]
```

Here explains the meaning of some important options

- `--addr`: The gRPC address of the Frontend node or Standalone process.
- `--output-dir`: The directory to put the exported data. Give a path at your current machine. The exported SQL files will be put in that directory.
- `--target`: The things to export. `create-table` can export the `CREATE TABLE` clause for each table. `table-data` can export the data of each table alone with `COPY FROM` clause.

For a complete upgrade, you will need to execute this tools twice with each target options.

## Upgrade from 0.7.x

Here is a complete example for upgrading from `v0.7.x` to `v0.8.0`.

### Export `CREATE TABLE`

Assuming the HTTP service port of the old database is `4000`.

```shell
v0.8.0/greptime cli export --addr '127.0.0.1:4000' --output-dir /tmp/greptimedb-export --target create-table
```

If success, you will see something like this

```log
2023-10-20T09:41:06.500390Z  INFO cmd::cli::export: finished exporting greptime.public with 434 tables
2023-10-20T09:41:06.500482Z  INFO cmd::cli::export: success 1/1 jobs
```

And now the output directory structure is

```plaintext
/tmp/greptimedb-export
└── greptime-public.sql
```

### Handle Breaking Changes
:::warning NOTICE
There are known breaking changes when attempting to upgrade from version 0.7.x.
**You need to manually edit the exported SQL files (i.e., `/tmp/greptimedb-export/greptime-public.sql`). **
:::

#### Remove `regions` option in `WITH` clause

Before:
```sql
CREATE TABLE foo (
    host string,
    ts timestamp DEFAULT '2023-04-29 00:00:00+00:00',
    TIME INDEX (ts),
    PRIMARY KEY(host)
) ENGINE=mito 
WITH( # Delete 
    regions=1
);
```

After:
```sql
CREATE TABLE foo (
    host string,
    ts timestamp DEFAULT '2023-04-29 00:00:00+00:00',
    TIME INDEX (ts),
    PRIMARY KEY(host)
) ENGINE=mito;
```

#### Rewrite the partition rule

Before:
```sql
PARTITION BY RANGE COLUMNS (n) (
     PARTITION r0 VALUES LESS THAN (1),
     PARTITION r1 VALUES LESS THAN (10),
     PARTITION r2 VALUES LESS THAN (100),
     PARTITION r3 VALUES LESS THAN (MAXVALUE),
)
```

After:
```sql
PARTITION ON COLUMNS (n) (
     n < 1,
     n >= 1 AND n < 10,
     n >= 10 AND n < 100,
     n >= 100
)
```

#### Remove the internal columns

Before:
```sql
CREATE TABLE IF NOT EXISTS "phy" (
  "ts" TIMESTAMP(3) NOT NULL,
  "val" DOUBLE NULL,
  "__table_id" INT UNSIGNED NOT NULL,
  "__tsid" BIGINT UNSIGNED NOT NULL,
  "host" STRING NULL,
  "job" STRING NULL,
  PRIMARY KEY ("__table_id", "__tsid", "host", "job") # Modify this line
)
ENGINE=metric
WITH(
  physical_metric_table = '',
  regions = 1
);
```

After:
```sql
CREATE TABLE IF NOT EXISTS "phy" (
  "ts" TIMESTAMP(3) NOT NULL,
  "val" DOUBLE NULL,
  "host" STRING NULL,
  "job" STRING NULL,
  PRIMARY KEY ("host", "job")
)
ENGINE=metric
WITH(
  physical_metric_table = ''
);
```

#### Add missing Time Index constraint

Before:
```sql
CREATE TABLE IF NOT EXISTS "phy" (
  "ts" TIMESTAMP(3) NOT NULL,
  "val" DOUBLE NULL,
  "host" STRING NULL,
  "job" STRING NULL,
  PRIMARY KEY ("host", "job")
)
ENGINE=metric
WITH(
  physical_metric_table = ''
);
```

After:
```sql
CREATE TABLE IF NOT EXISTS "phy" (
  "ts" TIMESTAMP(3) NOT NULL,
  "val" DOUBLE NULL,
  "host" STRING NULL,
  "job" STRING NULL,
  PRIMARY KEY ("host", "job")
  TIME INDEX ("ts") # Add this line
)
ENGINE=metric
WITH(
  physical_metric_table = ''
);
```

#### Update the create table statement for tables written using the InfluxDB protocol

Related [issue](https://github.com/GreptimeTeam/greptimedb/pull/3794)

Before:
```sql
CREATE TABLE IF NOT EXISTS "phy" (
  "ts" TIMESTAMP(6) NOT NULL, # Modify this line
  "val" DOUBLE NULL,
  "host" STRING NULL,
  "job" STRING NULL,
  PRIMARY KEY ("host", "job"),
  TIME INDEX ("ts")
)
ENGINE=mito;
```

After:
```sql
CREATE TABLE IF NOT EXISTS "phy" (
  "ts" TIMESTAMP(9) NOT NULL,
  "val" DOUBLE NULL,
  "host" STRING NULL,
  "job" STRING NULL,
  PRIMARY KEY ("host", "job"),
  TIME INDEX ("ts")
)
ENGINE=mito;
```

### Export table data

```shell
v0.8.0/greptime cli export --addr '127.0.0.1:4000' --database greptime-public --output-dir /tmp/greptimedb-export --target table-data
```

The log output is similar to the previous one. And the output directory structure is

```plaintext
/tmp/greptimedb-export
├── greptime-public
│   ├── up.parquet
│   └── other-tables.parquet
├── greptime-public_copy_from.sql
└── greptime-public.sql
```

New files are `greptime-public_copy_from.sql` and `greptime-public`. The former one contains the `COPY FROM` clause for each table. The latter one contains the data of each table.

### Import table schema and data

Then you need to execute SQL files generated by the previous step. First is `greptime-public.sql`. SQL generated in previous step is in PostgreSQL dialect, we will use [PG protocol](/user-guide/clients/postgresql.md) in the following steps. This document assumes the client is `psql`.

:::tip NOTICE
From this step, all the operation is done in the new version of GreptimeDB.

The default port of PostgreSQL protocol is `4003`.
:::

Before executing the following command, you need first to create the corresponding database in your new deployment (but in this example, the database `greptime-public` is the default one).

This command will create all the tables in the new version of GreptimeDB.

```shell
psql -h 127.0.0.1 -p 4003 -d public -f /tmp/greptime-public.sql
```

And then import the data

```shell
psql -h 127.0.0.1 -p 4003 -d public -f /tmp/greptime-public_copy_from.sql
```

### Clean up

At this step all the data is migrated. You can check the data in the new cluster.

After confirming that the data is correct, you can clean up the old cluster and the temporary `--output-dir`. `/tmp/greptimedb-export` at this example.

## Recommended overall process

This section gives a recommended overall process for upgrading GreptimeDB smoothly. You can skip this section if your environment can go offline on the upgrade progress.

1. Create a brand new v0.4 cluster
2. Export and import `create-table`
3. Switch workload to the new cluster
4. Export and import table data

Caveats
- Changes to table structure between step 2 and 3 will be lost
- Old data is invisible in new cluster until step 4 is done
