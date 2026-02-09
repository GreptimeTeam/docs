---
keywords: [GreptimeDB CLI, partition column repair, metadata repair, partition mismatch, table metadata]
description: Guide for using CLI to repair partition columns mismatch in GreptimeDB cluster, fixing inconsistencies in partition column definitions.
---

# Repair partition columns

The `greptime cli meta repair partition-column` command is used to repair partition columns mismatch for tables in a GreptimeDB cluster. This command fixes inconsistencies between the partition column definitions stored in the metadata store and those stored on datanodes.

:::tip
The tool needs to connect to both the metadata store and datanode. Ensure that the cluster is running and the tool can communicate with the datanode.
:::

## Command syntax

```bash
greptime cli meta repair partition-column [OPTIONS]
```

## Options

| Option                                                        | Description                                                                                                                                                                                                                                                                                                         | Default         | Values                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------- |
| `--store-addrs <STORE_ADDRS>...`                              | The endpoint of store. One of etcd, postgres or mysql. <br/>For postgres store, the format is: `"password=password dbname=postgres user=postgres host=localhost port=5432"`.  <br/>For etcd store, the format is: `"127.0.0.1:2379"`. <br/>For mysql store, the format is: `"mysql://user:password@ip:port/dbname"` | -               | -                                                     |
| `--max-txn-ops <MAX_TXN_OPS>`                                 | The maximum number of operations in a transaction. Only used when using [etcd-store]                                                                                                                                                                                                                                | 128             | -                                                     |
| `--backend <BACKEND>`                                         | The metadata store backend                                                                                                                                                                                                                                                                                          | etcd-store      | etcd-store, memory-store, postgres-store, mysql-store |
| `--store-key-prefix <STORE_KEY_PREFIX>`                       | The key prefix of the metadata store                                                                                                                                                                                                                                                                                | -               | -                                                     |
| `--meta-table-name <META_TABLE_NAME>`                         | The table name in RDS to store metadata. Only used when using [postgres-store] or [mysql-store]                                                                                                                                                                                                                     | greptime_metakv | -                                                     |
| `--table-names <TABLE_NAMES>`                                 | The names of the tables to repair, separated by comma                                                                                                                                                                                                                                                               | -               | -                                                     |
| `--table-ids <TABLE_IDS>`                                     | The id of the table to repair, separated by comma                                                                                                                                                                                                                                                                   | -               | -                                                     |
| `--schema-name <SCHEMA_NAME>`                                 | The schema of the tables to repair                                                                                                                                                                                                                                                                                  | public          | -                                                     |
| `--catalog-name <CATALOG_NAME>`                               | The catalog of the tables to repair                                                                                                                                                                                                                                                                                 | greptime        | -                                                     |
| `--fail-fast`                                                 | Whether to fail fast if any repair operation fails                                                                                                                                                                                                                                                                  | -               | -                                                     |
| `--client-timeout-secs <CLIENT_TIMEOUT_SECS>`                 | The timeout for the client to operate the datanode                                                                                                                                                                                                                                                                  | 30              | -                                                     |
| `--client-connect-timeout-secs <CLIENT_CONNECT_TIMEOUT_SECS>` | The timeout for the client to connect to the datanode                                                                                                                                                                                                                                                               | 3               | -                                                     |


## Examples

### Repair partition columns by table names

```bash
greptime cli meta repair partition-column --store-addrs=$ENDPOINT \
    --backend=postgres-store \
    --table-names=metric_table_1,metric_table_2 \
    --schema-name=public \
    --catalog-name=greptime
```

### Repair partition columns by table IDs

```bash
greptime cli meta repair partition-column --store-addrs=$ENDPOINT \
    --backend=etcd-store \
    --table-ids=1024,1025
```

## When to use this command

Use this command when:

- You encounter partition column mismatch errors in your GreptimeDB cluster
- There are inconsistencies between the partition column definitions in the metadata store and datanodes
- After a cluster upgrade or migration, partition column metadata needs to be synchronized
- Diagnostic tools indicate partition column configuration issues

This command will synchronize the partition column definitions across the cluster, ensuring consistency between the metadata store and all datanodes.
