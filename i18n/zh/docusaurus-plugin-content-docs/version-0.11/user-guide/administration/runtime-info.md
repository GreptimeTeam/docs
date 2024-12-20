---
keywords: [运行时信息, INFORMATION_SCHEMA, 系统元数据, 集群拓扑, Region 分布, 查询示例, 元数据访问]
description: 介绍如何通过 INFORMATION_SCHEMA 数据库访问系统元数据，并提供查询集群拓扑信息和表的 Region 分布的示例。
---

# 运行时信息

`INFORMATION_SCHEMA` 数据库提供了对系统元数据的访问，如数据库或表的名称、列的数据类型等。

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

请阅读[参考文档](/reference/sql/information-schema/overview.md)获取更多关于 `INFORMATION_SCHEMA` 数据库的信息。
