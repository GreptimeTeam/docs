---
keywords: [Region 迁移, 数据迁移, 负载均衡, 迁移请求, 迁移状态]
description: 介绍 Region 迁移功能及其在 GreptimeDB 中的应用，包括查询 Region 分布、选择迁移目标节点、发起迁移请求和查询迁移状态等内容。
---

# Region Migration

Region 迁移允许用户在 Datanode 间移动 Region 数据。

:::warning 注意
该功能仅在 GreptimeDB 集群模式下可用，并且需要满足以下条件
- 使用共享存储 (例如：AWS S3)

无法在任何上述以外的情况下使用 Region 迁移。
:::


## 查询 Region 分布

首先需要查询该数据表分区（Region）分布情况，即查询数据表中的 Region 分别在哪一些 Datanode 节点上。

```sql
select b.peer_id as datanode_id,
       a.greptime_partition_id as region_id
from information_schema.partitions a left join information_schema.region_peers b
on a.greptime_partition_id = b.region_id where a.table_name='migration_target' order by datanode_id asc;
```

例如：有以下的 Region 分布
```sql
+-------------+---------------+
| datanode_id | region_id     |
+-------------+---------------+
|           1 | 4398046511104 |
+-------------+---------------+
1 row in set (0.01 sec)
```


更多关于 `region_peers`  表的信息，请阅读 [REGION-PEERS](/reference/sql/information-schema/region-peers.md)。

## 选择 Region 迁移的目标节点
:::warning Warning
当起始节点等于目标节点时，Region 迁移不会被执行
:::

如果你通过 GreptimeDB operator 部署 DB 集群，Datanode 的 `peer_id` 总是从 0 开始递增。例如，DB 集群有 3 个 Datanode，则 `peer_id` 应为 0,1,2。
最后，你可以通过以下 SQL 请求发起 Region 迁移请求：

```sql
ADMIN migrate_region(4398046511104, 1, 2, 60);
```

`migrate_region` 参数说明：

```sql
ADMIN migrate_region(region_id, from_peer_id, to_peer_id, replay_timeout);
```

| Option           | Description                                                                                                            | Required     |     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------ | --- |
| `region_id`      | Region Id                                                                                                              | **Required** |     |
| `from_peer_id`   | 迁移起始节点 (Datanode) 的 peer id。                                                                                    | **Required** |     |
| `to_peer_id`     | 迁移目标节点 (Datanode) 的 peer id。                                                                                    | **Required** |     |
| `replay_timeout` | 迁移时回放数据的超时时间（单位：秒）。如果新 Region 未能在指定时间内回放数据，迁移将失败，旧 Region 中的数据不会丢失。 | Optional     |     |

## 查询迁移状态

`migrate_region` 函数将返回执行迁移的 Procedure Id，可以通过它查询过程状态：

```sql
ADMIN procedure_state('538b7476-9f79-4e50-aa9c-b1de90710839')
```

如果顺利完成，将输出 JSON 格式的状态：

```json
 {"status":"Done"}
```

当然，最终可以通过从 `information_schema` 中查询 `region_peers` 和 `partitions` 来确认 Region 分布是否符合预期。
