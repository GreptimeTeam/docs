---
keywords: [GreptimeDB CLI, 逻辑表修复, 元数据修复, 表元数据, 存储后端]
description: 使用 CLI 修复 GreptimeDB 集群逻辑表的指南，包括元数据一致性修复。
---

# 逻辑表修复

`greptime cli meta repair logical-tables` 命令可以用于修复 GreptimeDB 集群的逻辑表。在某些情况下，逻辑表元数据可能与存储在元数据存储中的元数据不一致。此命令可用于修复逻辑表元数据。

:::tip
该工具需要连接到元数据存储和 Datanode。确保集群正在运行且工具可与 Datanode 通信。
:::

## 命令语法

```bash
greptime cli meta repair logical-tables [OPTIONS]
```

## 选项

| 选项                                                          | 描述                                                                                                                                                                                                                                                                                           | 默认值          | 值                                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------- |
| `--store-addrs <STORE_ADDRS>...`                              | 元数据存储服务地址。可以是 etcd、postgres 或 mysql。 <br/>对于 postgres 存储，格式为：`"password=password dbname=postgres user=postgres host=localhost port=5432"`。  <br/>对于 etcd 存储，格式为：`"127.0.0.1:2379"`。 <br/>对于 mysql 存储，格式为：`"mysql://user:password@ip:port/dbname"` | -               | -                                                     |
| `--max-txn-ops <MAX_TXN_OPS>`                                 | 单个事务中操作的最大数量。仅在使用 [etcd-store] 时使用                                                                                                                                                                                                                                         | 128             | -                                                     |
| `--backend <BACKEND>`                                         | 元数据存储后端类型                                                                                                                                                                                                                                                                             | etcd-store      | etcd-store, memory-store, postgres-store, mysql-store |
| `--store-key-prefix <STORE_KEY_PREFIX>`                       | 元数据存储前缀                                                                                                                                                                                                                                                                                 | -               | -                                                     |
| `--meta-table-name <META_TABLE_NAME>`                         | 元数据存储的表名。元数据存储后端为 [postgres-store] 或 [mysql-store] 时使用                                                                                                                                                                                                                    | greptime_metakv | -                                                     |
| `--table-names <TABLE_NAMES>`                                 | 要修复的表名，用逗号分隔                                                                                                                                                                                                                                                                       | -               |
| `--table-ids <TABLE_IDS>`                                     | 要修复的表 ID，用逗号分隔                                                                                                                                                                                                                                                                      | -               |
| `--schema-name <SCHEMA_NAME>`                                 | 要修复的表所属数据库的名称                                                                                                                                                                                                                                                                     | public          |
| `--catalog-name <CATALOG_NAME>`                               | 要修复的表所属 catalog 的名称                                                                                                                                                                                                                                                                  | greptime        |
| `--fail-fast`                                                 | 如果任何修复操作失败，是否立即失败                                                                                                                                                                                                                                                             | -               |
| `--client-timeout-secs <CLIENT_TIMEOUT_SECS>`                 | 客户端操作 Datanode 的超时时间                                                                                                                                                                                                                                                                 | 30              |
| `--client-connect-timeout-secs <CLIENT_CONNECT_TIMEOUT_SECS>` | 客户端连接 Datanode 的超时时间                                                                                                                                                                                                                                                                 | 3               |


## 示例

### 通过表名修复逻辑表

```bash
greptime cli repair logical-tables --store-addrs=$ENDPOINT \
    --backend=postgres-store \
    --table-names=metric_table_1,metric_table_2 \
    --schema-name=public \
    --catalog-name=greptime
```

输出:
```bash
2025-06-20T08:31:43.904497Z  INFO cli::metadata::repair: All alter table requests sent successfully for table: greptime.public.metric_table_1
2025-06-20T08:31:43.904499Z  INFO cli::metadata::repair: All alter table requests sent successfully for table: greptime.public.metric_table_2
2025-06-20T08:31:43.904539Z  INFO cli::metadata::repair: Repair logical tables result: 2 tables repaired, 0 tables skipped
```