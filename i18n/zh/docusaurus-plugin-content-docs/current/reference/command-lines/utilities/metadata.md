---
keywords: [备份, 恢复, 导出工具, 导入工具, 数据库元信息备份, 数据恢复, 命令行工具, GreptimeDB CLI, 灾难恢复]
description: 介绍 GreptimeDB 的元信息导出和导入工具，用于数据库元信息的备份和恢复，包括命令语法、选项。
---

# 元数据导出和导入

元数据导出和导入工具提供了备份和恢复 GreptimeDB 元信息的功能。这些工具允许进行元信息备份和恢复操作。

## 导出工具

### 命令语法

```bash
greptime cli meta snapshot save [OPTIONS]
```

### 选项

| 选项               | 是否必需 | 默认值            | 描述                                                                                                   |
| ------------------ | -------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| --store-addrs      | 是       | -                 | 要连接的元数据存储服务地址（仅支持 etcd、MySQL、PostgreSQL），格式与 Metasrv 配置中的 store-addrs 一致 |
| --backend          | 是       | -                 | 元数据存储后端类型，支持 `etcd-store`、`postgres-store`、`mysql-store`                                 |
| --store-key-prefix | 否       | ""                | 元数据存储前缀，参考 Metasrv 配置                                                                      |
| --meta-table-name  | 否       | greptime_metakv   | 当后端为 `postgres-store` 或 `mysql-store` 时，元数据存储的表名                                        |
| --max-txn-ops      | 否       | 128               | 最大事务操作数                                                                                         |
| --file-name        | 否       | metadata_snapshot | 元数据导出的文件名，会自动添加 `.metadata.fb` 后缀                                                     |
| --output-dir       | 否       | ""                | 存储导出数据的目录                                                                                     |
| --s3               | 否       | false             | 是否导出至 s3 云存储                                                                                   |
| --s3-bucket        | 否       | -                 | 当 s3 为 true 时，s3 桶名                                                                              |
| --s3-region        | 否       | -                 | 当 s3 为 true 时，s3区域名称                                                                           |
| --s3-access-key    | 否       | -                 | 当 s3 为 true 时，访问 s3 的访问密钥 ID名                                                              |
| --s3-secret-key    | 否       | -                 | 当 s3 为 true 时，访问 s3 的访问密钥                                                                   |
| --s3-endpoint      | 否       | -                 | 当 s3 为 true 时有效，s3 endpoint 的名称，默认会根据 s3 桶名称、区域得出，一般不需要设置要             |

## 导入工具

### 命令语法

```bash
greptime cli meta snapshot restore [OPTIONS]
```

### 选项

| Option             | Required | Default                       | Description                                                                                            |
| ------------------ | -------- | ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| --store-addrs      | 是       | -                             | 要连接的元数据存储服务地址（仅支持 etcd、MySQL、PostgreSQL），格式与 Metasrv 配置中的 store-addrs 一致 |
| --backend          | 是       | -                             | 元数据存储后端类型，支持 `etcd-store`、`postgres-store`、`mysql-store`                                 |
| --store-key-prefix | 否       | ""                            | 元数据存储的 key 前缀，参考 Metasrv 配置                                                               |
| --meta-table-name  | 否       | greptime_metakv               | 当后端为 `postgres-store` 或 `mysql-store` 时，元数据存储的表名                                        |
| --max-txn-ops      | 否       | 128                           | 最大事务操作数                                                                                         |
| --file-name        | 否       | metadata_snapshot.metadata.fb | 元数据导出的文件名，会自动添加 `.metadata.fb` 后缀                                                     |
| --input-dir        | 否       | ""                            | 存储导出数据的目录                                                                                     |
| --s3               | 否       | false                         | 是否导入 s3 云存储                                                                                     |
| --s3-bucket        | 否       | -                             | 当 s3 为 true 时，s3 桶名                                                                              |
| --s3-region        | 否       | -                             | 当 s3 为 true 时，s3区域名称                                                                           |
| --s3-access-key    | 否       | -                             | 当 s3 为 true 时，访问 s3 的访问密钥 ID名                                                              |
| --s3-secret-key    | 否       | -                             | 当 s3 为 true 时，访问 s3 的访问密钥                                                                   |
| --s3-endpoint      | 否       | -                             | 当 s3 为 true 时有效，s3 endpoint 的名称，默认会根据 s3 桶名称、区域得出，一般不需要设置要             |
| --force            | 否       | false                         | 是否强制导入，当目标后端检测包含旧数据时，默认无法导入数据，若想强制导入则可开启此标志                 |
