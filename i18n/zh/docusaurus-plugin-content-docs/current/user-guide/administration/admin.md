# 管理

本文件介绍了在 GreptimeDB 系统运维和部署中使用的策略和实践。

## 数据库/集群管理

* GreptimeDB 的 [安装](/getting-started/installation/overview.md) 和 [g-t-control](/reference/gtctl.md) 命令行工具。
* 数据库配置，请阅读 [配置](/user-guide/deployments/configuration.md) 参考。
* GreptimeDB 的 [指标监控](/user-guide/administration/monitoring/export-metrics.md) 和 [链路追踪](/user-guide/administration/monitoring/tracing.md)。
* GreptimeDB 的 [灾难恢复方案](/user-guide/administration/disaster-recovery/overview.md)。
* 通过[设置 Remote WAL](./remote-wal/quick-start.md) 实现 GreptimeDB 的集群容灾。

### 运行时信息

* 通过 [CLUSTER_INFO](/reference/sql/information-schema/cluster-info.md) 表查找集群的拓扑信息。
* 通过 [PARTITIONS](/reference/sql/information-schema/partitions.md) 表和[REGION_PEERS](/reference/sql/information-schema/region-peers.md) 表查找表的 Region 分布。

例如查询一张表的所有 Region Id:

```sql
SELECT greptime_partition_id FROM PARTITIONS WHERE table_name = 'monitor'
```

查询一张表的 region 分布在哪些 datanode 上：

```sql
SELECT b.peer_id as datanode_id,
       a.greptime_partition_id as region_id
FROM information_schema.partitions a LEFT JOIN information_schema.region_peers b
ON a.greptime_partition_id = b.region_id
WHERE a.table_name='monitor'
ORDER BY datanode_id ASC
```

`INFORMATION_SCHEMA` 数据库提供了对系统元数据的访问，如数据库或表的名称、列的数据类型等。请阅读 [参考文档](/reference/sql/information-schema/overview.md)。

## 最佳实践

* [性能调优技巧](/user-guide/administration/performance-tuning-tips.md)