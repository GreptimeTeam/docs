---
keywords: [GreptimeDB CLI, 分区列修复, 元数据修复, 表元数据, 存储后端]
description: 使用 CLI 修复 GreptimeDB 集群分区列的指南，包括表元数据一致性修复。
---

# 修复分区列

`greptime cli meta repair partition-column` 命令可用于修复 GreptimeDB 集群的分区列。

## 何时使用此工具

在 [PR-6494](https://github.com/GreptimeTeam/greptimedb/pull/6494) 之前，表元数据中的分区列可能会引用到无效的列。例如，当在分区列之前向表中添加新列时，可能会导致分区列偏移。

如果您发现由于分区列错误导致读取或写入失败，可以使用此工具。该工具将扫描所有表的元数据，并将分区列设置为正确的列。

## 命令语法

```bash
greptime cli meta repair partition-column [OPTIONS]
```

## 选项

| 选项 | 描述 | 默认值 | 值 |
| - | - | - | - |
| `--store-addrs <STORE_ADDRS>` | 元数据的存储后端地址。可以是 etcd、postgres 或 mysql 之一。<br/>对于 postgres 存储，格式为：`"password=password dbname=postgres user=postgres host=localhost port=5432"`。<br/>对于 etcd 存储，格式为：`"127.0.0.1:2379"`。<br/>对于 mysql 存储，格式为：`"mysql://user:password@ip:port/dbname"` | | 字符串 |
| `--backend <BACKEND>` | 元数据存储后端类型 | `etcd-store` | 以下其一：<br>`etcd-store`<br>`memory-store`<br>`postgres-store`<br>`mysql-store` |
| `--max-txn-ops <MAX_TXN_OPS>` | 事务中的最大操作数。仅在使用 `etcd-store` 时使用。 | `128` | 数字 |
| `--store-key-prefix <STORE_KEY_PREFIX>` | 元数据存储的键前缀 | "" | 字符串 |
| `--meta-table-name <META_TABLE_NAME>` | RDS 中存储元数据的表名。仅在使用 `postgres-store` 或 `mysql-store` 时使用。 | `greptime_metakv` | 字符串 |
| `--dry-run <DRY_RUN>` | 如果存在此选项，该工具将不会对表元数据进行任何更改。相反，它只会报告（通过向标准输出打印日志）无效的分区列。建议在第一次运行此工具时添加此选项，并手动验证结果。 | `false` | 以下其一：<br>`true`<br>`false` | 
| `--update-limit <N>` | 该工具对表元数据执行更改的最大次数。此选项可用于逐步更新表元数据。 | 无限制 | 数字 |

## 示例

```bash
greptime cli meta repair partition-column \
    --store-addrs=$ENDPOINT \
    --backend=postgres-store \
    --dry-run true \
    --update-limit 1
```