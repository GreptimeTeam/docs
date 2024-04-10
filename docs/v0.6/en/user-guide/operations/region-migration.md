# Region migration

Region migration allows users to move regions between the Datanode.

:::warning Warning
This feature is only available on GreptimeDB running on cluster mode and 
- Using Kafka WAL
- Using [shared storage](/user-guide/operations/configuration.md#storage-options) (e.g., AWS S3)

Otherwise, you can't perform a region migration.
:::

## Figure out the MetaSrv leader
The region migration procedure is only allowed to submit to the MetaSrv leader; we need to figure out which MetaSrv is a leader.
```bash
curl {YOUR_META_SRV_SERVER}:3002/admin/leader
# 10.244.0.157:3002
```

## Figure out the region distribution of the table.
To figure out a table's region distribution, we need to send a route query to the MetaSrv, using the `YOUR_META_SRV_LEADER_SERVER` address we obtained before.

```bash
curl {YOUR_META_SRV_LEADER_SERVER}:3002/admin/route?table_id={TABLE_ID}

# "{\"type\":\"physical\",\"region_routes\":[{\"region\":{\"id\":4668629450752,\"name\":\"\",\"partition\":{\"column_list\":[],\"value_list\":[\"\\\"MaxValue\\\"\"]},\"attrs\":{}},\"leader_peer\":{\"id\":2,\"addr\":\"greptimedb-datanode-2.greptimedb-datanode.my-greptimedb:4001\"},\"follower_peers\":[]}],\"version\":2}"
```
For example, we have the following region distribution:

| region id     | leader_peer                                                  | leader_peer_id |
|---------------|--------------------------------------------------------------|----------------|
| 4668629450752 | greptimedb-datanode-2.greptimedb-datanode.my-greptimedb:4001 | 2              |

## Select a Datanode as the migration destination.
:::warning Warning
The region migration won't be performed if the `from_peer_id` equals the `to_peer_id`.
:::

Remember, if you deploy the cluster via the GreptimeDB operator, the `peer_id` of Datanode always starts from 0. For example, if you have a 3 Datanode GreptimeDB cluster, the available `peer_id` will be 0,1,2.

Finally, you can do a Region migration request via the following HTTP request:

```bash
curl "{YOUR_META_SRV_LEADER_SERVER}:3002/admin/region-migration?region_id={REGION_ID}&from_peer_id={FROM_PEER_ID}&to_peer_id={TO_PEER_ID}&replay_timeout=5m"
```

| Option           | Description                                                    | Required     |   |
|------------------|----------------------------------------------------------------|--------------|---|
| `region_id`      | The region id.                                                 | **Required** |   |
| `from_peer_id`   | The peer id of the migration source(Datanode).                 | **Required** |   |
| `to_peer_id`     | The peer id of the migration destination(Datanode).            | **Required** |   |
| `replay_timeout` | The timeout of replay data. e.g., 1h30m10s                     | **Required** |   |