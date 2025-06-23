---
keywords: [GreptimeDB CLI, 元数据交互, 键值操作, 表元数据, 存储后端]
description: 使用 CLI 与 GreptimeDB 元数据交互的指南，包括键值操作、表元数据检索和删除。
---

# 元数据交互

`greptime` 命令可以用于与 GreptimeDB 集群的元数据进行交互。


## 公共选项

| Option                                  | 描述                                                                                                                                                                                                                                                                                                                  | 默认值         | 值                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------- |
| `--store-addrs <STORE_ADDRS>...`        | 存储端点。可以是 etcd、postgres 或 mysql。 <br/>对于 postgres 存储，格式为：`"password=password dbname=postgres user=postgres host=localhost port=5432"`。  <br/>对于 etcd 存储，格式为：`"127.0.0.1:2379"`。 <br/>对于 mysql 存储，格式为：`"mysql://user:password@ip:port/dbname"` | -               | -                                                     |
| `--max-txn-ops <MAX_TXN_OPS>`           | 单个事务中操作的最大数量。仅在使用 [etcd-store] 时使用                                                                                                                                                                                                                                                                    | 128             | -                                                     |
| `--backend <BACKEND>`                   | 元数据存储后端                                                                                                                                                                                                                                                                                                        | etcd-store      | etcd-store, memory-store, postgres-store, mysql-store |
| `--store-key-prefix <STORE_KEY_PREFIX>` | 元数据存储键前缀                                                                                                                                                                                                                                                                                                      | -               | -                                                     |
| `--meta-table-name <META_TABLE_NAME>`   | 在 RDS 中存储元数据的表名。仅在使用 [postgres-store] 或 [mysql-store] 时使用                                                                                                                                                                                                                                     | greptime_metakv | -                                                     |



## 获取键值对

### 命令语法

```bash
greptime cli meta get key [OPTIONS] [KEY]
```

### 选项

| Option            | 描述                                                                                                        | 默认值 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ | ------- |
| `--prefix`        | 是否执行前缀查询。如果为 true，则返回所有键值对，其中键以给定的前缀开头 | false   |
| `--limit <LIMIT>` | 返回的最大键值对数量。如果为 0，则返回所有键值对                                 | 0       |

## 获取表元数据

### 命令语法

```bash
greptime cli meta get table [OPTIONS]
```

### 选项

| Option                          | 描述                      | 默认值  |
| ------------------------------- | -------------------------------- | -------- |
| `--table-id <TABLE_ID>`         | 通过表 ID 获取表元数据   | -        |
| `--table-name <TABLE_NAME>`     | 通过表名获取表元数据 | -        |
| `--schema-name <SCHEMA_NAME>`   | 表的架构名称     | public   |
| `--catalog-name <CATALOG_NAME>` | 表的目录名称    | greptime |
| `--pretty`                      | 美化输出          | -        |


## 删除键值对

### 命令语法

```bash
greptime cli meta del key [OPTIONS] [KEY]
```

### 选项


| Option     | 描述                                   | 默认值 |
| ---------- | --------------------------------------------- | ------- |
| `--prefix` | 删除具有给定前缀的键值对。 | false   |


## 删除表元数据

### 命令语法

```bash
greptime cli meta del table [OPTIONS]
```

#### 选项

| Option                          | Description                      | Default  |
| ------------------------------- | -------------------------------- | -------- |
| `--table-id <TABLE_ID>`         | 通过表 ID 获取表元数据   | -        |
| `--table-name <TABLE_NAME>`     | 通过表名获取表元数据 | -        |
| `--schema-name <SCHEMA_NAME>`   | 表的架构名称     | public   |
| `--catalog-name <CATALOG_NAME>` | 表的目录名称    | greptime |


## 示例

### 获取单个键值对

```bash
greptime cli meta get key --store-addrs=$ENDPOINT \
    --backend=postgres-store \
    __table_name/greptime/public/metric_table_2
```

输出: 

```json
__table_name/greptime/public/metric_table_2
{"table_id":1059}
```

### 获取所有具有给定前缀的键值对

输出:
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

### 通过表 ID 获取表元数据

```bash
greptime cli meta get table --table-id=1059 \
    --store-addrs=$ENDPOINT \
    --backend=postgres-store
```

输出: 

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

### 通过表名获取表元数据

```bash
greptime cli meta get table --table-name=metric_table_2 \
    --schema-name=public \
    --store-addrs=$ENDPOINT \
    --backend=postgres-store
```

输出: 与上述命令的输出相同。

## 删除不存在的键值对

```bash
greptime cli meta del key  --store-addrs=$ENDPOINT \
    --backend=postgres-store \
    non_existent_key
```

输出(返回删除的键值对数量):
```bash
0
```

## 删除键值对

```bash
greptime cli meta del key  --store-addrs=$ENDPOINT \
    --backend=postgres-store \
    __table_name/greptime/public/metric_table_3
```

输出(返回删除的键值对数量):
```bash
1
```

## 删除表元数据

```bash
greptime cli meta del table --table-id=1059 \
    --store-addrs=$ENDPOINT \
    --backend=postgres-store
```

输出:
```bash
Table(1059) deleted
```
