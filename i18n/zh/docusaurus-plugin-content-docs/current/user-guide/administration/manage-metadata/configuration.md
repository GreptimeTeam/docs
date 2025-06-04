---
keywords: [GreptimeDB, 元数据存储, 配置, etcd, MySQL, PostgreSQL, metasrv, 存储后端设置]
description: GreptimeDB metasrv 组件中配置元数据存储后端（etcd、MySQL、PostgreSQL）的综合指南，包括设置说明和最佳实践。
---

# 元数据存储配置

本节介绍如何为 GreptimeDB Metasrv 组件配置不同的元数据存储后端。元数据存储用于存储关键的系统信息，包括 catalog、schema、table、region 以及其他对 GreptimeDB 运行至关重要的元数据。

## 可用存储后端

GreptimeDB 支持以下元数据存储后端：

- **etcd**：开发和测试环境的默认推荐后端，提供简单性和易用性
- **MySQL/PostgreSQL**：适合生产环境的后端选择，能够无缝对接现有的数据库基础设施和云服务商提供的 RDS 服务

如果你使用 Helm Chart 部署 GreptimeDB，可以参考 [Common Helm Chart Configurations](/user-guide/deployments/deploy-on-kubernetes/common-helm-chart-configurations.md#configuring-metasrv-backend-storage) 了解更多详情。

## 使用 etcd 作为元数据存储

虽然 etcd 适合开发和测试环境，但对于需要高可用性和可扩展性的生产环境来说可能并不是最佳选择。

配置 metasrv 组件使用 etcd 作为元数据存储：

```toml
# metasrv 组件的元数据存储后端
backend = "etcd_store"

# 存储服务器地址
# 可以指定多个 etcd 端点以实现高可用性
store_addrs = ["127.0.0.1:2379"]
```

### 最佳实践

虽然 etcd 可以用作元数据存储，但我们不建议在生产环境中使用它，除非你对 etcd 的操作和维护有丰富的经验。有关 etcd 管理的详细指南，包括安装、备份和维护程序，请参阅[管理 etcd](/user-guide/administration/manage-metadata/manage-etcd.md)。

使用 etcd 作为元数据存储时：

- 在不同可用区部署多个端点以实现高可用性
- 配置适当的自动压缩设置以管理存储增长
- 实施定期维护程序：
- 定期运行 `Defrag` 命令以回收磁盘空间
- 监控 etcd 集群健康指标
- 根据使用模式审查和调整资源限制


## 使用 MySQL 作为元数据存储

MySQL 可作为一种可行的元数据存储后端选项。特别是在需要与现有 MySQL 基础设施集成，或存在特定 MySQL 相关需求的场景下，这一选择尤为适用。对于生产环境部署，我们强烈建议使用各大云服务商提供的关系型数据库服务（RDS），以获得更高的可靠性和托管服务带来的便利。

配置 metasrv 组件以使用 MySQL 作为元数据存储：

```toml
# metasrv 组件的元数据存储后端
backend = "mysql_store"

# 存储服务器地址
# 格式：mysql://user:password@ip:port/dbname
store_addrs = ["mysql://user:password@ip:port/dbname"]

# 可选：自定义元数据存储表名
# 默认值: greptime_metakv
meta_table_name = "greptime_metakv"
```

当多个 GreptimeDB 集群共享同一个 MySQL 实例时，必须为每个 GreptimeDB 集群设置一个唯一的 `meta_table_name` 以避免元数据冲突。

## 使用 PostgreSQL 作为元数据存储

PostgreSQL 可作为一种可行的元数据存储后端选项。特别是在需要与现有 PostgreSQL 基础设施集成，或存在特定 PostgreSQL 相关需求的场景下，这一选择尤为适用。对于生产环境部署，我们强烈建议使用各大云服务商提供的关系型数据库服务（RDS），以获得更高的可靠性和托管服务带来的便利。

配置 metasrv 组件以使用 PostgreSQL 作为元数据存储：

```toml
# metasrv 组件的元数据存储后端
backend = "postgres_store"

# 存储服务器地址
# 格式: password=password dbname=postgres user=postgres host=localhost port=5432
store_addrs = ["password=password dbname=postgres user=postgres host=localhost port=5432"]

# 可选：自定义元数据存储表名
# 默认值: greptime_metakv
meta_table_name = "greptime_metakv"

# 可选: 用于选举的 Advisory lock ID
# 默认值: 1
meta_election_lock_id = 1
```
当多个 GreptimeDB 集群共享同一个 PostgreSQL 实例或与其他应用程序共享时，必须配置两个唯一标识符以防止冲突：

1. 为每个 GreptimeDB 集群设置唯一的 `meta_table_name` 以避免元数据冲突
2. 为每个 GreptimeDB 集群分配唯一的 `meta_election_lock_id` 以防止与使用同一 PostgreSQL 实例的其他应用程序发生 advisory lock 冲突