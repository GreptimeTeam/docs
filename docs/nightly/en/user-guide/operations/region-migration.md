# Region Migration

Region Migration allows users to move regions between the Datanode.

:::warning Warning
This feature is only available on GreptimeDB running on cluster mode and 
- Using Kafka WAL
- Using [shared storage](/user-guide/operations/configuration.md#storage-options) (e.g., AWS S3)

Otherwise, you can't perform a region migration.
:::


## Figure out the region distribution of the table.
You need to first query the region distribution of the table, i.e., find out on which Datanode the Regions in the table are located.

```sql
select b.peer_id as datanode_id,
       a.greptime_partition_id as region_id
from information_schema.partitions a left join information_schema.region_peers b
on a.greptime_partition_id = b.region_id where a.table_name='migration_target' order by datanode_id asc;
```

For example, have the following region distribution:

```sql
+-------------+---------------+
| datanode_id | region_id     |
+-------------+---------------+
|           1 | 4398046511104 |
+-------------+---------------+
1 row in set (0.01 sec)
```


For more info about the `region_peers` table, please read the [reference](/reference/sql/information-schema/cluster-info.md).

## Select a Datanode as the migration destination.
:::warning Warning
The region migration won't be performed if the `from_peer_id` equals the `to_peer_id`.
:::

Remember, if you deploy the cluster via the GreptimeDB operator, the `peer_id` of Datanode always starts from 0. For example, if you have a 3 Datanode GreptimeDB cluster, the available `peer_id` will be 0,1,2.

Finally, you can do a Region migration request via the following SQL:

```sql
select migrate_region(4398046511104, 1, 2, 60);
```

The parameters of `migrate_region`：

```sql
select migrate_region(region_id, from_peer_id, to_peer_id, replay_timeout);
```

| Option           | Description                                                                                                                                                                               | Required     |     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --- |
| `region_id`      | The region id.                                                                                                                                                                            | **Required** |     |
| `from_peer_id`   | The peer id of the migration source(Datanode).                                                                                                                                            | **Required** |     |
| `to_peer_id`     | The peer id of the migration destination(Datanode).                                                                                                                                       | **Required** |     |
| `replay_timeout` | The timeout(secs) of replay data. If the new Region fails to replay the data within the specified timeout,  the migration will fail, however the data in the old Region will not be lost. | Optional     |     |
