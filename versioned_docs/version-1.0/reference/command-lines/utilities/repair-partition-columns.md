---
keywords: [GreptimeDB CLI, partition column repair, metadata repair, table metadata, storage backend]
description: Guide for using CLI to repair partition columns in GreptimeDB cluster, including table metadata consistency repair.
---

# Repair partition columns

The `greptime cli meta repair partition-column` command can be used to repair partition columns for GreptimeDB cluster.

## When to use this tool

Before the [PR-6494](https://github.com/GreptimeTeam/greptimedb/pull/6494), the columns for table partitioning could refer to invalid ones in the table metadata. For example, when a new column is added into the table before the partition columns.

If you find that the reads or writes are failed because of wrong partition columns, you can use this tool. This tool will scan all the tables' metadata and set the partition columns to the right ones.

## Command syntax

```bash
greptime cli meta repair partition-column [OPTIONS]
```

## Options

| Option | Description | Default | Value |
| - | - | - | - |
| `--store-addrs <STORE_ADDRS>` | The endpoint of store. One of etcd, postgres or mysql. <br/>For postgres store, the format is: `"password=password dbname=postgres user=postgres host=localhost port=5432"`. <br/>For etcd store, the format is: `"127.0.0.1:2379"`. <br/>For mysql store, the format is: `"mysql://user:password@ip:port/dbname"` | | string |
| `--backend <BACKEND>` | The metadata store backend | `etcd-store` | one of:<br>`etcd-store`<br>`memory-store`<br>`postgres-store`<br>`mysql-store` |
| `--max-txn-ops <MAX_TXN_OPS>` | The maximum number of operations in a transaction. Only used when using the `etcd-store`. | `128` | number |
| `--store-key-prefix <STORE_KEY_PREFIX>` | The key prefix of the metadata store | "" | string |
| `--meta-table-name <META_TABLE_NAME>` | The table name in RDS to store metadata. Only used when using `postgres-store` or `mysql-store` | `greptime_metakv` | string |
| `--dry-run <DRY_RUN>` | If this option is present, the tool will do no alternations to the table metadata. Instead, it will only report (by printing some logs to the stdout) the invalid partition columns. We recommend adding this option the first time you run this tool, and manually verify the results. | `false` | one of: `true`<br>`false` | 
| `--update-limit <N>` | The maximum times this tool does the alternations to the table metadata. This option can be used to gradually update the table metadata | unlimited | number |

## Example

```bash
greptime cli meta repair partition-column \
    --store-addrs=$ENDPOINT \
    --backend=postgres-store \
    --dry-run true \
    --update-limit 1
```
