---
keywords: [GreptimeDB CLI, logical table repair, metadata repair, table metadata, storage backend]
description: Guide for using CLI to repair logical tables in GreptimeDB cluster, including metadata consistency repair.
---

# Repair logical tables

The `greptime cli meta repair logical-tables` command can be used to repair logical tables for GreptimeDB cluster. In some cases, the logical tables metadata may be inconsistent with metadata stored in the metadata store. This command can be used to repair the logical tables metadata.

:::tip
The tool needs to connect to both the metadata store and datanode. Ensure that the cluster is running and the tool can communicate with the datanode.
:::

## Command syntax

```bash
greptime cli meta repair logical-tables [OPTIONS]
```

## Options

| Option                                                        | Description                                                                                                                                                                                                                                                                                                         | Default         | Values                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------- |
| `--store-addrs <STORE_ADDRS>...`                              | The endpoint of store. One of etcd, postgres or mysql. <br/>For postgres store, the format is: `"password=password dbname=postgres user=postgres host=localhost port=5432"`.  <br/>For etcd store, the format is: `"127.0.0.1:2379"`. <br/>For mysql store, the format is: `"mysql://user:password@ip:port/dbname"` | -               | -                                                     |
| `--max-txn-ops <MAX_TXN_OPS>`                                 | The maximum number of operations in a transaction. Only used when using [etcd-store]                                                                                                                                                                                                                                | 128             | -                                                     |
| `--backend <BACKEND>`                                         | The metadata store backend                                                                                                                                                                                                                                                                                          | etcd-store      | etcd-store, memory-store, postgres-store, mysql-store |
| `--store-key-prefix <STORE_KEY_PREFIX>`                       | The key prefix of the metadata store                                                                                                                                                                                                                                                                                | -               | -                                                     |
| `--meta-table-name <META_TABLE_NAME>`                         | The table name in RDS to store metadata. Only used when using [postgres-store] or [mysql-store]                                                                                                                                                                                                                     | greptime_metakv | -                                                     |
| `--table-names <TABLE_NAMES>`                                 | The names of the tables to repair, separated by comma                                                                                                                                                                                                                                                               | -               |
| `--table-ids <TABLE_IDS>`                                     | The id of the table to repair, separated by comma                                                                                                                                                                                                                                                                   | -               |
| `--schema-name <SCHEMA_NAME>`                                 | The schema of the tables to repair                                                                                                                                                                                                                                                                                  | public          |
| `--catalog-name <CATALOG_NAME>`                               | The catalog of the tables to repair                                                                                                                                                                                                                                                                                 | greptime        |
| `--fail-fast`                                                 | Whether to fail fast if any repair operation fails                                                                                                                                                                                                                                                                  | -               |
| `--client-timeout-secs <CLIENT_TIMEOUT_SECS>`                 | The timeout for the client to operate the datanode                                                                                                                                                                                                                                                                  | 30              |
| `--client-connect-timeout-secs <CLIENT_CONNECT_TIMEOUT_SECS>` | The timeout for the client to connect to the datanode                                                                                                                                                                                                                                                               | 3               |


## Examples

### Repair logical tables by table names

```bash
greptime cli meta repair logical-tables --store-addrs=$ENDPOINT \
    --backend=postgres-store \
    --table-names=metric_table_1,metric_table_2 \
    --schema-name=public \
    --catalog-name=greptime
```

Output:
```bash
2025-06-20T08:31:43.904497Z  INFO cli::metadata::repair: All alter table requests sent successfully for table: greptime.public.metric_table_1
2025-06-20T08:31:43.904499Z  INFO cli::metadata::repair: All alter table requests sent successfully for table: greptime.public.metric_table_2
2025-06-20T08:31:43.904539Z  INFO cli::metadata::repair: Repair logical tables result: 2 tables repaired, 0 tables skipped
```