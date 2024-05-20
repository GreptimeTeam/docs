# 管理

本文件介绍了在 GreptimeDB 系统运维和部署中使用的策略和实践。

## 数据库/集群管理

* GreptimeDB 的 [安装](/getting-started/installation/overview.md) 和 [g-t-control](./gtctl.md) 命令行工具。
* 数据库配置，请阅读 [配置](./configuration.md) 参考。
* GreptimeDB 的 [监控](./monitoring.md) 和 [链路追踪](./tracing.md)。
* GreptimeDB 的 [备份与恢复方法](./back-up-\&-restore-data.md)。

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

## 数据管理

* [存储位置说明](/user-guide/concepts/storage-location.md)。
* 通过 [设置Remote WAL](./remote-wal/quick-start.md) 实现 GreptimeDB 的集群容灾。
* [Table 和 Region 的 Flush 和 Compaction](/reference/sql/functions#admin-functions)。
* 通过 Region 对表进行分区，请阅读 [表的分片](/contributor-guide/frontend/table-sharding.md) 参考。
  * [迁移 Region](./region-migration.md) 以实现负载均衡。
* [通过设置 TTL 过期数据](/user-guide/concepts/features-that-you-concern#can-i-set-ttl-or-retention-policy-for-different-tables-or-measurements)。

## 最佳实践

TODO