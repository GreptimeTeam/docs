---
keywords: [备份, 恢复, 导出工具, 导入工具, 数据库元信息备份, 数据恢复, 命令行工具]
description: 介绍 GreptimeDB 的元数据导出和导入工具，用于数据库元信息的备份和恢复，包括命令语法、选项、常见使用场景
---

# GreptimeDB 元信息导出和导入工具

本指南描述了如何使用 GreptimeDB 的元信息导出和导入工具进行元数据库备份和恢复。

导出和导入工具提供了备份和恢复 GreptimeDB 元信息的功能。

## 导出工具

### 命令语法

```bash
greptime cli meta-snapshot [OPTIONS]
```

### 选项

| 选项               | 是否必需 | 默认值            | 描述                                                                                                 |
| ------------------ | -------- | ----------------- | ---------------------------------------------------------------------------------------------------- |
| --store-addrs      | 是       | -                 | 要连接的元数据存储服务地址（仅仅支持 etcd MySQL PostgreSQL）格式与 metasrv 配置中的 store-addrs 一致 |
| --backend          | 是       | -                 | 元数据存储后端的类型，为 `etcd-store`, `postgres-store`, `mysql-store` 中之一                        |
| --store-key-prefix | 否       | ""                | metasrv 中的数据的统一前缀，可参考 metasrv 配置                                                      |
| --meta-table-name  | 否       | greptime_metakv   | 当 backend 为 `postgres-store`, `mysql-store` 之一时，存储元数据的表的名称                           |
| --max-txn-ops      | 否       | 128               | 最大 txn 数量                                                                                        |
| --file-name        | 否       | metadata_snapshot | 元数据导出的文件名称，会自动添加 `.metadata.fb` 后缀                                                 |
| --output-dir       | 否       | ""                | 存储导出数据的目录                                                                                   |
| --s3               | 否       | false             | 是否使用 s3 作为导出数据存放介质                                                                     |
| --s3-bucket        | 否       | -                 | 当 s3 为 true 时有效，s3 bucket 名称                                                                 |
| --s3-region        | 否       | -                 | 当 s3 为 true 时有效，s3 region 名称                                                                 |
| --s3-access-key    | 否       | -                 | 当 s3 为 true 时有效，s3 access key 的名称                                                           |
| --s3-secret-key    | 否       | -                 | 当 s3 为 true 时有效，s3 secret key 的名称                                                           |
| --s3-endpoint      | 否       | -                 | 当 s3 为 true 时有效，s3 endpoint 的名称，默认会根据 bucket region 得出，一般不需要设置              |

### 示例

从 PostgreSQL 中导出元数据到 s3 。此命令会导出到 `ap-southeast-1-test-bucket` 的 `metadata_snapshot.metadata.fb` 文件中：

```bash
greptime cli meta-snapshot --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' --backend postgres-store --s3 --s3-bucket ap-southeast-1-test-bucket --s3-region ap-southeast-1 --s3-access-key <s3-access-key> --s3-secret-key <s3-secret-key>
```

从 PostgreSQL 导出元数据到本地目录。此命令会导出到当前目录下的 `metadata_snapshot.metadata.fb` 文件中：

```bash
greptime cli meta-snapshot --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' --backend postgres-store
```

从 etcd 导出元数据到本地目录。此命令会导出到当前目录下的 `metadata_snapshot.metadata.fb` 文件中：

```bash
greptime cli meta-snapshot --store-addrs 127.0.0.1:2379 --backend etcd-store
```

## 导入工具

### 命令语法

```bash
greptime cli meta-restore [OPTIONS]
```

### 选项

| 选项               | 是否必需 | 默认值                        | 描述                                                                                                 |
| ------------------ | -------- | ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| --store-addrs      | 是       | -                             | 要连接的元数据存储服务地址（仅仅支持 etcd MySQL PostgreSQL）格式与 metasrv 配置中的 store-addrs 一致 |
| --backend          | 是       | -                             | 元数据存储后端的类型，为 `etcd-store`, `postgres-store`, `mysql-store` 中之一                        |
| --store-key-prefix | 否       | ""                            | metasrv 中的数据的统一前缀，可参考 metasrv 配置                                                      |
| --meta-table-name  | 否       | greptime_metakv               | 当 backend 为 `postgres-store`, `mysql-store` 存储元数据的表的名称                                   |
| --max-txn-ops      | 否       | 128                           | 最大 txn 数量                                                                                        |
| --file-name        | 否       | metadata_snapshot.metadata.fb | 要导入的元数据导出的文件名称，会自动添加 `.metadata.fb` 后缀                                         |
| --input-dir        | 否       | ""                            | 存储导出数据的目录                                                                                   |
| --s3               | 否       | false                         | 是否使用 s3 作为导出数据存放介质                                                                     |
| --s3-bucket        | 否       | -                             | 当 s3 为 true 时有效，s3 bucket 名称                                                                 |
| --s3-region        | 否       | -                             | 当 s3 为 true 时有效，s3 region 名称                                                                 |
| --s3-access-key    | 否       | -                             | 当 s3 为 true 时有效，s3 access key 的名称                                                           |
| --s3-secret-key    | 否       | -                             | 当 s3 为 true 时有效，s3 secret key 的名称                                                           |
| --s3-endpoint      | 否       | -                             | 当 s3 为 true 时有效，s3 endpoint 的名称，默认会根据 bucket region 得出，一般不需要设置              |
| --force            | 否       | false                         | 是否强制导入，当检测到目标 backend 不是干净的状态时，默认无法导入，如果想强制导入可开启此标志        |

### 示例

将导出的元数据从 s3 导入到 PostgreSQL 存储后端。此命令会导入 `ap-southeast-1-test-bucket` 的 `metadata_snapshot.metadata.fb` 文件中的数据：

```bash
greptime cli meta-restore --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' --backend postgres-store --s3 --s3-bucket ap-southeast-1-test-bucket --s3-region ap-southeast-1 --s3-access-key <s3-access-key> --s3-secret-key <s3-secret-key>
```

将导出的元数据从本地文件导入到 PostgreSQL 存储后端。此命令会导入当前目录下的 `metadata_snapshot.metadata.fb` 文件中的数据：

```bash
greptime cli meta-restore --store-addrs 'password=password dbname=postgres user=postgres host=localhost port=5432' --backend postgres-store
```

将导出的元数据从本地文件导入到 etcd 存储后端。此命令会导入当前目录下的 `metadata_snapshot.metadata.fb` 文件的数据：

```bash
greptime cli meta-restore --store-addrs 127.0.0.1:2379 --backend etcd-store
```

### 注意事项

- 一般情况下，请确认导入的目标 backend 是干净的状态，即没有任何数据。如果目标 backend 中已经存在数据，导入操作可能会污染数据
