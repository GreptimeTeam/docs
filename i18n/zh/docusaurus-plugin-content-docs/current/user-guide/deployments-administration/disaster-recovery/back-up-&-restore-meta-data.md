---
keywords: [备份, 恢复, 元数据快照, etcd, MySQL, PostgreSQL, RaftEngine, 灾难恢复]
description: 使用 greptime CLI 备份、检查和恢复 GreptimeDB 元数据后端。
---

# 备份和恢复元数据

元数据快照命令从 GreptimeDB 元数据后端导出 Key-Value 记录。它**不会**导出表数据、SST 文件或 WAL Entry。如果恢复方案还需要表数据，请使用 [Export/Import V2](./export-import-v2.md)。

CLI 支持 etcd、PostgreSQL、MySQL 和 RaftEngine 元数据后端，源端和目标端可以使用不同的后端。

## 创建快照前

元数据快照与数据导出相互独立。为避免在 DDL 或 Region Procedure 变更元数据时创建快照：

1. 停止 Schema 变更和自动放置操作。
2. [暂停 Procedure Manager](/user-guide/deployments-administration/maintenance/prevent-metadata-changes.md)。
3. 等待已有 Procedure 执行完毕。
4. 保存元数据快照，然后恢复 Procedure Manager。

元数据快照可能包含 Catalog 定义、连接配置和其他运维元数据，应按敏感数据管理。

## 保存到本地文件

默认输出文件是当前目录中的 `metadata_snapshot.metadata.fb`。使用 `--file-path` 指定其他路径。

PostgreSQL：

```bash
greptime cli meta snapshot save \
  --backend postgres-store \
  --store-addrs 'password=PASSWORD dbname=greptime user=greptime host=127.0.0.1 port=5432' \
  --file-path /backup/prod-metadata.metadata.fb
```

MySQL：

```bash
greptime cli meta snapshot save \
  --backend mysql-store \
  --store-addrs 'mysql://greptime:PASSWORD@127.0.0.1:3306/greptime' \
  --file-path /backup/prod-metadata.metadata.fb
```

etcd：

```bash
greptime cli meta snapshot save \
  --backend etcd-store \
  --store-addrs 127.0.0.1:2379 \
  --file-path /backup/prod-metadata.metadata.fb
```

Standalone 运行时，RaftEngine 会锁定元数据目录。保存或恢复 RaftEngine 元数据前先停止 Standalone 实例：

```bash
greptime cli meta snapshot save \
  --backend raft-engine-store \
  --store-addrs 'raftengine:///var/lib/greptimedb/metadata' \
  --file-path /backup/prod-metadata.metadata.fb
```

如果源部署自定义了 `--store-key-prefix`，以及 MySQL 或 PostgreSQL 的 `--meta-table-name`，创建快照时应使用相同的值。

## 保存到 S3 兼容存储

必须显式启用一个对象存储后端。下面的命令将快照对象 `snapshots/prod-metadata.metadata.fb` 写入 S3：

```bash
greptime cli meta snapshot save \
  --backend postgres-store \
  --store-addrs 'password=PASSWORD dbname=greptime user=greptime host=127.0.0.1 port=5432' \
  --file-path snapshots/prod-metadata.metadata.fb \
  --s3 \
  --s3-bucket greptime-backups \
  --s3-region us-west-2
```

使用 MinIO 或其他 S3 兼容服务时，还要设置 `--s3-endpoint` 和所需凭证。OSS、GCS 和 Azure Blob Storage 使用对应的 CLI 后端参数。完整参数参见[命令行参考](/reference/command-lines/utilities/metadata.md)。

## 检查快照

安排恢复任务前先检查文件：

```bash
greptime cli meta snapshot info \
  --file-path /backup/prod-metadata.metadata.fb \
  --limit 20
```

该命令会解析并打印元数据记录，但不能证明快照与另一份数据导出一致。记录中可能包含敏感值，应限制命令输出的访问权限。

## 恢复快照

:::warning

恢复目标必须是空的元数据后端，恢复期间不能有 GreptimeDB 组件向其中写入。`--force` 只会跳过非空后端检查：它写入快照中的 Key，但不会删除目标端已有的多余 Key。因此不能用 `--force` 代替清理或重建目标后端。

:::

将本地快照恢复到 PostgreSQL：

```bash
greptime cli meta snapshot restore \
  --backend postgres-store \
  --store-addrs 'password=PASSWORD dbname=greptime user=greptime host=127.0.0.1 port=5432' \
  --file-path /backup/prod-metadata.metadata.fb
```

从 S3 恢复时，使用与保存命令相同的 `--file-path` 和对象存储参数：

```bash
greptime cli meta snapshot restore \
  --backend postgres-store \
  --store-addrs 'password=PASSWORD dbname=greptime user=greptime host=127.0.0.1 port=5432' \
  --file-path snapshots/prod-metadata.metadata.fb \
  --s3 \
  --s3-bucket greptime-backups \
  --s3-region us-west-2
```

恢复完成后，重启使用目标元数据后端的全部 GreptimeDB 组件。按照[元数据备份、恢复和迁移](/user-guide/deployments-administration/manage-metadata/restore-backup.md)检查 Next Table ID，并根据恢复后的数据对账表元数据。
