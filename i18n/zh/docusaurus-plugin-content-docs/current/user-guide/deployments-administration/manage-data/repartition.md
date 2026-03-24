---
keywords: [重分区, repartition, GC, 对象存储, GreptimeDB, Helm Chart]
description: 介绍 GreptimeDB 的重分区流程，以及在执行前需要准备的 GC 和对象存储配置，并提供 Helm Chart 的常见配置示例。
---

# Repartition（重分区）

重分区可以在表创建后调整分区规则。GreptimeDB 通过 `ALTER TABLE` 的分区拆分与合并能力来完成重分区，详细语法请参考 [ALTER TABLE](/reference/sql/alter.md#分区拆分与合并)。

重分区仅支持分布式集群。

## 原理

重分区的核心是重新调整分区边界，而不是把数据手工迁移到新的表。
在执行时，GreptimeDB 会先把原有分区合并，再按新的规则拆分，从而让 Region 的划分重新贴合当前的数据分布。

当业务流量模式发生变化时，这种方式可以帮助你继续保持分区规则与负载匹配，而不需要重建整张表。

重分区期间，写入可能会出现短暂波动，建议客户端开启重试机制。

## 什么时候需要重分区

如果出现下面这些情况，就可以考虑重分区：

- 某些 Region 的写入或查询明显更热，负载长期不均衡；
- 业务分布发生变化，原有分区边界已经不再合适；
- 部分 Region 变得很小且很冷，希望通过合并减少资源占用；
- 需要把某个分区进一步细分，以改善写入并发或查询性能。

通常来说，当分区规则已经不能很好地反映当前数据分布时，就值得考虑重分区。

## 如何发现热点分区

在做重分区之前，建议先确认哪些 Region 已经出现热点。
你可以先把 Region 级别的统计信息和分区规则关联起来，找出最热的规则：

```sql
SELECT
  t.table_name,
  r.region_id,
  r.region_number,
  p.partition_name,
  p.partition_description,
  r.region_role,
  r.written_bytes_since_open,
  r.region_rows
FROM information_schema.region_statistics r
JOIN information_schema.tables t
  ON r.table_id = t.table_id
JOIN information_schema.partitions p
  ON p.table_schema = t.table_schema
  AND p.table_name = t.table_name
  AND p.greptime_partition_id = r.region_id
WHERE t.table_schema = 'public'
  AND t.table_name = 'your_table'
ORDER BY r.written_bytes_since_open DESC
LIMIT 10;
```

如果某些 Region 的 `written_bytes_since_open` 长期明显更高，通常就说明这条分区规则比较热，适合优先考虑拆分。

同时也建议检查 Region 对应的节点是否正常，避免把节点抖动误判为热点：

```sql
SELECT
  p.region_id,
  p.peer_addr,
  p.status,
  p.down_seconds
FROM information_schema.region_peers p
WHERE p.table_schema = 'public'
  AND p.table_name = 'your_table'
ORDER BY p.region_id, p.peer_addr;
```

如果节点状态正常，而热点信号持续存在，就可以继续设计重分区方案。

## 前置条件

:::warning 警告
该功能仅在 GreptimeDB 的分布式集群中可用，并且

- 使用[共享存储](/user-guide/deployments-administration/configuration.md#storage-options)（例如 AWS S3）
- 在 metasrv 和所有 datanode 上启用 [GC](/user-guide/deployments-administration/maintenance/gc.md)

否则你无法执行重分区。
:::

当前开源版支持通过多次 `SPLIT PARTITION` / `MERGE PARTITION` 组合完成分区调整，最常见的场景是 1 拆 2 或 2 合 1。对于更复杂的分区变更，也可以通过逐步拆分和合并来完成。

对象存储用于保存 region 文件，GC 则负责在引用释放后再回收旧文件，避免重分区过程中误删仍在使用的数据。

如需了解详细配置，请参考：

- [GC](/user-guide/deployments-administration/maintenance/gc.md)
- [对象存储配置](/user-guide/deployments-administration/configuration.md#storage-options)

### 通过 GreptimeDB Operator

如果你使用 GreptimeDB Operator 部署，可以参考 [常见 Helm Chart 配置项](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md) 快速完成 GC 和对象存储配置。

## 重分区示例

你可以通过先合并现有分区，然后用新规则拆分它们来修改分区规则。下面的示例展示了如何将 `device_id < 100` 的设备的分区键 `area` 从 `South` 更改为 `North`：

```sql
ALTER TABLE sensor_readings MERGE PARTITION (
  device_id < 100 AND area < 'South',
  device_id < 100 AND area >= 'South'
);

ALTER TABLE sensor_readings SPLIT PARTITION (
  device_id < 100
) INTO (
  device_id < 100 AND area < 'North',
  device_id < 100 AND area >= 'North'
);
```

:::caution 注意
重分区仅支持在分布式集群中执行。请确认 GC 与对象存储已正确配置后，再运行相关操作。
:::
