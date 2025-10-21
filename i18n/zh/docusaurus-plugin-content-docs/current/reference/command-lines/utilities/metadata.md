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

#### 存储后端选项

| 选项               | 是否必需 | 默认值            | 描述                                                                                                   |
| ------------------ | -------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| --store-addrs      | 是       | -                 | 要连接的元数据存储服务地址（仅支持 etcd、MySQL、PostgreSQL），格式与 Metasrv 配置中的 store-addrs 一致 |
| --backend          | 是       | -                 | 元数据存储后端类型，支持 `etcd-store`、`postgres-store`、`mysql-store`                                 |
| --store-key-prefix | 否       | ""                | 元数据存储前缀，参考 Metasrv 配置                                                                      |
| --meta-table-name  | 否       | greptime_metakv   | 当后端为 `postgres-store` 或 `mysql-store` 时，元数据存储的表名                                        |
| --max-txn-ops      | 否       | 128               | 最大事务操作数                                                                                         |

#### 文件选项

| 选项        | 是否必需 | 默认值            | 描述                                               |
| ----------- | -------- | ----------------- | -------------------------------------------------- |
| --file-name | 否       | metadata_snapshot | 元数据导出的文件名，会自动添加 `.metadata.fb` 后缀 |
| --dir       | 否       | ""                | 存储导出数据的目录                                 |

#### 对象存储选项

要使用对象存储来存储导出的元数据，请启用以下任一提供商并配置其连接参数：

##### S3

| 选项                           | 是否必需 | 默认值 | 描述                                        |
| ------------------------------ | -------- | ------ | ------------------------------------------- |
| --enable-s3                    | 否       | false  | 是否使用 S3 作为导出数据的存储介质          |
| --s3-bucket                    | 否       | -      | S3 桶名                                     |
| --s3-root                      | 否       | -      | S3 桶中的根路径                             |
| --s3-access-key-id             | 否       | -      | S3 访问密钥 ID                              |
| --s3-secret-access-key         | 否       | -      | S3 访问密钥                                 |
| --s3-region                    | 否       | -      | S3 区域名称                                 |
| --s3-endpoint                  | 否       | -      | S3 端点 URL（可选，默认根据桶区域确定）     |
| --s3-enable-virtual-host-style | 否       | false  | 为 S3 API 请求启用虚拟主机样式              |

##### OSS（阿里云）

| 选项                    | 是否必需 | 默认值 | 描述                               |
| ----------------------- | -------- | ------ | ---------------------------------- |
| --enable-oss            | 否       | false  | 是否使用 OSS 作为导出数据的存储介质 |
| --oss-bucket            | 否       | -      | OSS 桶名                           |
| --oss-root              | 否       | -      | OSS 桶中的根路径                   |
| --oss-access-key-id     | 否       | -      | OSS 访问密钥 ID                    |
| --oss-access-key-secret | 否       | -      | OSS 访问密钥                       |
| --oss-endpoint          | 否       | -      | OSS 端点 URL                       |

##### GCS（谷歌云存储）

| 选项                  | 是否必需 | 默认值 | 描述                               |
| --------------------- | -------- | ------ | ---------------------------------- |
| --enable-gcs          | 否       | false  | 是否使用 GCS 作为导出数据的存储介质 |
| --gcs-bucket          | 否       | -      | GCS 桶名                           |
| --gcs-root            | 否       | -      | GCS 桶中的根路径                   |
| --gcs-scope           | 否       | -      | GCS 服务范围                       |
| --gcs-credential-path | 否       | -      | GCS 凭证文件路径                   |
| --gcs-credential      | 否       | -      | GCS 凭证内容                       |
| --gcs-endpoint        | 否       | -      | GCS 端点 URL                       |

##### Azure Blob 存储

| 选项                  | 是否必需 | 默认值 | 描述                                     |
| --------------------- | -------- | ------ | ---------------------------------------- |
| --enable-azblob       | 否       | false  | 是否使用 Azure Blob 作为导出数据的存储介质 |
| --azblob-container    | 否       | -      | Azure Blob 容器名称                      |
| --azblob-root         | 否       | -      | 容器中的根路径                           |
| --azblob-account-name | 否       | -      | Azure Blob 账户名称                      |
| --azblob-account-key  | 否       | -      | Azure Blob 账户密钥                      |
| --azblob-endpoint     | 否       | -      | Azure Blob 端点 URL                      |
| --azblob-sas-token    | 否       | -      | Azure Blob SAS 令牌                      |

## 导入工具

### 命令语法

```bash
greptime cli meta snapshot restore [OPTIONS]
```

### 选项

#### 存储后端选项

| 选项               | 是否必需 | 默认值          | 描述                                                                                                   |
| ------------------ | -------- | --------------- | ------------------------------------------------------------------------------------------------------ |
| --store-addrs      | 是       | -               | 要连接的元数据存储服务地址（仅支持 etcd、MySQL、PostgreSQL），格式与 Metasrv 配置中的 store-addrs 一致 |
| --backend          | 是       | -               | 元数据存储后端类型，支持 `etcd-store`、`postgres-store`、`mysql-store`                                 |
| --store-key-prefix | 否       | ""              | 元数据存储的 key 前缀，参考 Metasrv 配置                                                               |
| --meta-table-name  | 否       | greptime_metakv | 当后端为 `postgres-store` 或 `mysql-store` 时，元数据存储的表名                                        |
| --max-txn-ops      | 否       | 128             | 最大事务操作数                                                                                         |

#### 文件选项

| 选项        | 是否必需 | 默认值                        | 描述                                                                                   |
| ----------- | -------- | ----------------------------- | -------------------------------------------------------------------------------------- |
| --file-name | 否       | metadata_snapshot.metadata.fb | 元数据导出的文件名                                                                     |
| --dir       | 否       | "."                           | 存储导出数据的目录                                                                     |
| --force     | 否       | false                         | 是否强制导入，当目标后端检测包含旧数据时，默认无法导入数据，若想强制导入则可开启此标志 |

#### 对象存储选项

要使用对象存储来导入元数据，请启用以下任一提供商并配置其连接参数：

##### S3

| 选项                           | 是否必需 | 默认值 | 描述                                        |
| ------------------------------ | -------- | ------ | ------------------------------------------- |
| --enable-s3                    | 否       | false  | 是否使用 S3 作为导出数据的存储介质          |
| --s3-bucket                    | 否       | -      | S3 桶名                                     |
| --s3-root                      | 否       | -      | S3 桶中的根路径                             |
| --s3-access-key-id             | 否       | -      | S3 访问密钥 ID                              |
| --s3-secret-access-key         | 否       | -      | S3 访问密钥                                 |
| --s3-region                    | 否       | -      | S3 区域名称                                 |
| --s3-endpoint                  | 否       | -      | S3 端点 URL（可选，默认根据桶区域确定）     |
| --s3-enable-virtual-host-style | 否       | false  | 为 S3 API 请求启用虚拟主机样式              |

##### OSS（阿里云）

| 选项                    | 是否必需 | 默认值 | 描述                               |
| ----------------------- | -------- | ------ | ---------------------------------- |
| --enable-oss            | 否       | false  | 是否使用 OSS 作为导出数据的存储介质 |
| --oss-bucket            | 否       | -      | OSS 桶名                           |
| --oss-root              | 否       | -      | OSS 桶中的根路径                   |
| --oss-access-key-id     | 否       | -      | OSS 访问密钥 ID                    |
| --oss-access-key-secret | 否       | -      | OSS 访问密钥                       |
| --oss-endpoint          | 否       | -      | OSS 端点 URL                       |

##### GCS（谷歌云存储）

| 选项                  | 是否必需 | 默认值 | 描述                               |
| --------------------- | -------- | ------ | ---------------------------------- |
| --enable-gcs          | 否       | false  | 是否使用 GCS 作为导出数据的存储介质 |
| --gcs-bucket          | 否       | -      | GCS 桶名                           |
| --gcs-root            | 否       | -      | GCS 桶中的根路径                   |
| --gcs-scope           | 否       | -      | GCS 服务范围                       |
| --gcs-credential-path | 否       | -      | GCS 凭证文件路径                   |
| --gcs-credential      | 否       | -      | GCS 凭证内容                       |
| --gcs-endpoint        | 否       | -      | GCS 端点 URL                       |

##### Azure Blob 存储

| 选项                  | 是否必需 | 默认值 | 描述                                     |
| --------------------- | -------- | ------ | ---------------------------------------- |
| --enable-azblob       | 否       | false  | 是否使用 Azure Blob 作为导出数据的存储介质 |
| --azblob-container    | 否       | -      | Azure Blob 容器名称                      |
| --azblob-root         | 否       | -      | 容器中的根路径                           |
| --azblob-account-name | 否       | -      | Azure Blob 账户名称                      |
| --azblob-account-key  | 否       | -      | Azure Blob 账户密钥                      |
| --azblob-endpoint     | 否       | -      | Azure Blob 端点 URL                      |
| --azblob-sas-token    | 否       | -      | Azure Blob SAS 令牌                      |

## 信息工具

信息工具允许您查看元数据快照的内容而无需恢复它。

### 命令语法

```bash
greptime cli meta snapshot info [OPTIONS]
```

### 选项

#### 文件选项

| 选项          | 是否必需 | 默认值            | 描述                   |
| ------------- | -------- | ----------------- | ---------------------- |
| --file-name   | 否       | metadata_snapshot | 要查看的元数据快照文件名 |
| --dir         | 否       | "."               | 快照文件存储的目录     |
| --inspect-key | 否       | "*"               | 过滤元数据键的查询模式 |
| --limit       | 否       | -                 | 显示的最大条目数       |

#### 对象存储选项

要检查存储在对象存储中的快照，请启用以下任一提供商并配置其连接参数：

##### S3

| 选项                           | 是否必需 | 默认值 | 描述                                    |
| ------------------------------ | -------- | ------ | --------------------------------------- |
| --enable-s3                    | 否       | false  | 是否使用 S3 作为快照的存储介质          |
| --s3-bucket                    | 否       | -      | S3 桶名                                 |
| --s3-root                      | 否       | -      | S3 桶中的根路径                         |
| --s3-access-key-id             | 否       | -      | S3 访问密钥 ID                          |
| --s3-secret-access-key         | 否       | -      | S3 访问密钥                             |
| --s3-region                    | 否       | -      | S3 区域名称                             |
| --s3-endpoint                  | 否       | -      | S3 端点 URL（可选，默认根据桶区域确定） |
| --s3-enable-virtual-host-style | 否       | false  | 为 S3 API 请求启用虚拟主机样式          |

##### OSS（阿里云）

| 选项                    | 是否必需 | 默认值 | 描述                           |
| ----------------------- | -------- | ------ | ------------------------------ |
| --enable-oss            | 否       | false  | 是否使用 OSS 作为快照的存储介质 |
| --oss-bucket            | 否       | -      | OSS 桶名                       |
| --oss-root              | 否       | -      | OSS 桶中的根路径               |
| --oss-access-key-id     | 否       | -      | OSS 访问密钥 ID                |
| --oss-access-key-secret | 否       | -      | OSS 访问密钥                   |
| --oss-endpoint          | 否       | -      | OSS 端点 URL                   |

##### GCS（谷歌云存储）

| 选项                  | 是否必需 | 默认值 | 描述                           |
| --------------------- | -------- | ------ | ------------------------------ |
| --enable-gcs          | 否       | false  | 是否使用 GCS 作为快照的存储介质 |
| --gcs-bucket          | 否       | -      | GCS 桶名                       |
| --gcs-root            | 否       | -      | GCS 桶中的根路径               |
| --gcs-scope           | 否       | -      | GCS 服务范围                   |
| --gcs-credential-path | 否       | -      | GCS 凭证文件路径               |
| --gcs-credential      | 否       | -      | GCS 凭证内容                   |
| --gcs-endpoint        | 否       | -      | GCS 端点 URL                   |

##### Azure Blob 存储

| 选项                  | 是否必需 | 默认值 | 描述                                 |
| --------------------- | -------- | ------ | ------------------------------------ |
| --enable-azblob       | 否       | false  | 是否使用 Azure Blob 作为快照的存储介质 |
| --azblob-container    | 否       | -      | Azure Blob 容器名称                  |
| --azblob-root         | 否       | -      | 容器中的根路径                       |
| --azblob-account-name | 否       | -      | Azure Blob 账户名称                  |
| --azblob-account-key  | 否       | -      | Azure Blob 账户密钥                  |
| --azblob-endpoint     | 否       | -      | Azure Blob 端点 URL                  |
| --azblob-sas-token    | 否       | -      | Azure Blob SAS 令牌                  |
