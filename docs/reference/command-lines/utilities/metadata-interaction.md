---
keywords: [GreptimeDB CLI, metadata interaction, key-value operations, table metadata, store backends]
description: Guide for interacting with GreptimeDB metadata using the CLI, including key-value, table metadata retrieval, and deletion.
---

# Metadata Interaction

The `greptime` command can be used to interact with the metadata of GreptimeDB cluster.


## Common options

| Option                                  | Description                                                                                                                                                                                                                                                                                                         | Default         | Values                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------- |
| `--store-addrs <STORE_ADDRS>...`        | The endpoint of store. One of etcd, postgres or mysql. <br/>For postgres store, the format is: `"password=password dbname=postgres user=postgres host=localhost port=5432"`.  <br/>For etcd store, the format is: `"127.0.0.1:2379"`. <br/>For mysql store, the format is: `"mysql://user:password@ip:port/dbname"` | -               | -                                                     |
| `--max-txn-ops <MAX_TXN_OPS>`           | The maximum number of operations in a transaction. Only used when using [etcd-store]                                                                                                                                                                                                                                | 128             | -                                                     |
| `--backend <BACKEND>`                   | The metadata store backend                                                                                                                                                                                                                                                                                          | etcd-store      | etcd-store, memory-store, postgres-store, mysql-store |
| `--store-key-prefix <STORE_KEY_PREFIX>` | The key prefix of the metadata store                                                                                                                                                                                                                                                                                | -               | -                                                     |
| `--meta-table-name <META_TABLE_NAME>`   | The table name in RDS to store metadata. Only used when using [postgres-store] or [mysql-store]                                                                                                                                                                                                                     | greptime_metakv | -                                                     |



## Get key-value pair

### Command syntax

```bash
greptime cli meta get key [OPTIONS] [KEY]
```

### Options

| Option            | Description                                                                                                        | Default |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ | ------- |
| `--prefix`        | Whether to perform a prefix query. If true, returns all key-value pairs where the key starts with the given prefix | false   |
| `--limit <LIMIT>` | The maximum number of key-value pairs to return. If 0, returns all key-value pairs                                 | 0       |

## Get table metadata

### Command syntax
```bash
greptime cli meta get table [OPTIONS]
```

### Options

| Option                          | Description                      | Default  |
| ------------------------------- | -------------------------------- | -------- |
| `--table-id <TABLE_ID>`         | Get table metadata by table id   | -        |
| `--table-name <TABLE_NAME>`     | Get table metadata by table name | -        |
| `--schema-name <SCHEMA_NAME>`   | The schema name of the table     | public   |
| `--catalog-name <CATALOG_NAME>` | The catalog name of the table    | greptime |
| `--pretty`                      | Pretty print the output          | -        |


## Delete key-value pair

### Command syntax

```bash
greptime cli meta del key [OPTIONS] [KEY]
```

### Options


| Option     | Description                                   | Default |
| ---------- | --------------------------------------------- | ------- |
| `--prefix` | Delete key-value pairs with the given prefix. | false   |


## Delete table metadata

### Command syntax

```bash
greptime cli meta del table [OPTIONS]
```

#### Options

| Option                          | Description                      | Default  |
| ------------------------------- | -------------------------------- | -------- |
| `--table-id <TABLE_ID>`         | Get table metadata by table id   | -        |
| `--table-name <TABLE_NAME>`     | Get table metadata by table name | -        |
| `--schema-name <SCHEMA_NAME>`   | The schema name of the table     | public   |
| `--catalog-name <CATALOG_NAME>` | The catalog name of the table    | greptime |


## Examples

### Get single key-value pair

```bash
greptime cli meta get key --store-addrs=$ENDPOINT \
    --backend=postgres-store \
    __table_name/greptime/public/metric_table_2
```

Output: 

```json
__table_name/greptime/public/metric_table_2
{"table_id":1059}
```

### Get all key-value pairs with the prefix

Output:
```bash
greptime cli meta get key --prefix \
    --store-addrs=$ENDPOINT \
    --backend=postgres-store \
    __table_name/greptime/public
```

```json
__table_name/greptime/public/greptime_physical_table
{"table_id":1057}
__table_name/greptime/public/metric_table_1
{"table_id":1058}
__table_name/greptime/public/metric_table_2
{"table_id":1059}
```

### Get table metadata by table id

```bash
greptime cli meta get table --table-id=1059 \
    --store-addrs=$ENDPOINT \
    --backend=postgres-store \
    --pretty
```

Output: 

```json
__table_info/1059
{
  "table_info": {
    "ident": {
      "table_id": 1059,
      "version": 0
    },
    "name": "metric_table_2",
    "desc": null,
    "catalog_name": "greptime",
    "schema_name": "public",
    "meta": {
      "schema": {
        "column_schemas": [
          {
            "name": "app",
            "data_type": {
              "String": null
            },
            "is_nullable": true,
            "is_time_index": false,
            "default_constraint": null,
            "metadata": {}
          },
          ...
        ],
        "timestamp_index": 2,
        "version": 0
      },
      "primary_key_indices": [
        0,
        ...
      ],
      "value_indices": [
        3
      ],
      "engine": "metric",
      "next_column_id": 8,
      "region_numbers": [
        0,
        ...
      ],
      "options": {
        "write_buffer_size": null,
        "ttl": null,
        "skip_wal": false,
        "extra_options": {
          "on_physical_table": "greptime_physical_table"
        }
      },
      "created_on": "2025-06-17T14:53:14.639207075Z",
      "partition_key_indices": []
    },
    "table_type": "Base"
  },
  "version": 0
}
__table_route/1059
{
  "type": "logical",
  "physical_table_id": 1057,
  "region_ids": [
    4548370366464,
    4548370366465,
    ...
  ]
}
```

### Get table metadata by table name

```bash
greptime cli meta get table --table-name=metric_table_2 \
    --schema-name=public \
    --store-addrs=$ENDPOINT \
    --backend=postgres-store
```

Output: same as the output of the command above.

## Delete non-existent key-value pair

```bash
greptime cli meta del key  --store-addrs=$ENDPOINT \
    --backend=postgres-store \
    non_existent_key
```

Output(Return deleted key-value pairs count):
```bash
0
```

## Delete a key-value pair

```bash
greptime cli meta del key  --store-addrs=$ENDPOINT \
    --backend=postgres-store \
    __table_name/greptime/public/metric_table_3
```

Output(Return deleted key-value pairs count):
```bash
1
```

## Delete a table metadata

```bash
greptime cli meta del table --table-id=1059 \
    --store-addrs=$ENDPOINT \
    --backend=postgres-store
```

Output:
```bash
Table(1059) deleted
```
