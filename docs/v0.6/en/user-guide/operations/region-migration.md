# Region migration

Region 迁移允许用户在 Datanode 间移动 Region 数据。

:::warning 注意
该功能仅在 GreptimeDB 集群模式下可用，并且需要满足以下条件
- 使用 Kafka WAL
- 使用共享存储 (例如：AWS S3)
我们无法在任何上述以外的情况下使用 Region 迁移。
:::

## 寻找 MetaSrv leader
首先我们需要找 MetaSrv Leader 节点，Region 迁移需要在 MetaSrv Leader 上执行。
```bash
curl {YOUR_META_SRV_SERVER}:3002/admin/leader
# 10.244.0.157:3002
```

## 查询 Region 分布

随后我们需要查询一下表的 Region 分布，这里我们使用上一步获取的 MetaSrv Leader 的地址(`YOUR_META_SRV_LEADER_SERVER`) 。
```bash
curl {YOUR_META_SRV_LEADER_SERVER}:3002/admin/route?table_id={TABLE_ID}

# "{\"type\":\"physical\",\"region_routes\":[{\"region\":{\"id\":4668629450752,\"name\":\"\",\"partition\":{\"column_list\":[],\"value_list\":[\"\\\"MaxValue\\\"\"]},\"attrs\":{}},\"leader_peer\":{\"id\":2,\"addr\":\"greptimedb-datanode-2.greptimedb-datanode.my-greptimedb:4001\"},\"follower_peers\":[]}],\"version\":2}"
```
例如：我们有以下的 Region 分布

| region id     | leader_peer                                                  | leader_peer_id |
|---------------|--------------------------------------------------------------|----------------|
| 4668629450752 | greptimedb-datanode-2.greptimedb-datanode.my-greptimedb:4001 | 2              |

## 选择 Region 迁移的目标节点
:::warning Warning
当起始节点等于目标节点时，Region 迁移不会被执行
:::

如果你通过 GreptimeDB operator 部署 DB 集群，Datanode 的 `peer_id` 总是从 0 开始递增。例如，有一个3 Datanode DB 集群，则 `peer_id` 应为 0,1,2。
最后，你可以通过以下 HTTP 请求发起 Region 迁移请求：

```bash
curl "{YOUR_META_SRV_LEADER_SERVER}:3002/admin/region-migration?region_id={REGION_ID}&from_peer_id={FROM_PEER_ID}&to_peer_id={TO_PEER_ID}&replay_timeout=5m"
```

| Option           | Description                                                    | Required     |   |
|------------------|----------------------------------------------------------------|--------------|---|
| `region_id`      | Region Id                                                      | **Required** |   |
| `from_peer_id`   | 迁移起始节点(Datanode) 的 peer id。                               | **Required** |   |
| `to_peer_id`     | 迁移目标节点(Datanode) 的 peer id。                               | **Required** |   |
| `replay_timeout` | 迁移时回放数据的超时时间，例如：1h30m10s                             | **Required** |   |