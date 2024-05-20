# Administration

This document addresses strategies and practices used in the operation of GreptimeDB systems and deployments.

## Database/Cluster management

* [Installation](/getting-started/installation/overview.md) for GreptimeDB and the [g-t-control](./gtctl.md) command line tool.
* Database Configuration, please read the [Configuration](./configuration.md) reference.
* [Monitoring](./monitoring.md) and [Tracing](./tracing.md) for GreptimeDB.
* GreptimeDB [Backup & Restore methods](./back-up-\&-restore-data.md).

### Runtime information

* Find the topology information of the cluster though [CLUSTER_INFO](/reference/sql/information-schema/cluster-info.md) table.
* Find the table regions distribution though [PARTITIONS](/reference/sql/information-schema/partitions.md) and [REGION_PEERS](/reference/sql/information-schema/region-peers.md) tables.

For example, find all the region id of a table:

```sql
SELECT greptime_partition_id FROM PARTITIONS WHERE table_name = 'monitor'
```

Find the distribution of all regions in a table:

```sql
SELECT b.peer_id as datanode_id,
       a.greptime_partition_id as region_id
FROM information_schema.partitions a LEFT JOIN information_schema.region_peers b
ON a.greptime_partition_id = b.region_id
WHERE a.table_name='monitor'
ORDER BY datanode_id ASC
```

The `INFORMATION_SCHEMA` database provides access to system metadata, such as the name of a database or table, the data type of a column, etc. Please read the [reference](/reference/sql/information-schema/overview.md).

## Data management

* [The Storage Location](/user-guide/concepts/storage-location.md).
* Cluster Failover for GreptimeDB by [Setting Remote WAL](./remote-wal/quick-start.md).
* [Flush and Compaction for Table & Region](/reference/sql/functions#admin-functions).
* Partition the table by regions, read the [Table Sharding](/contributor-guide/frontend/table-sharding.md) reference.
  * [Migrate the Region](./region-migration.md) for Load Balance.
* [Expire Data by Setting TTL](/user-guide/concepts/features-that-you-concern#can-i-set-ttl-or-retention-policy-for-different-tables-or-measurements).

## Best Practices

TODO