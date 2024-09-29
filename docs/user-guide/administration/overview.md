# Overview

This document addresses strategies and practices used in the administration of GreptimeDB.

* [Installation](/getting-started/installation/overview.md) for GreptimeDB and the [g-t-control](/reference/gtctl.md) command line tool.
* [Capacity Plan](/user-guide/administration/capacity-plan.md) for GreptimeDB based on your workload.
* [Manage Data](/user-guide/administration/manage-data.md) for avoiding data loss, lower cost and better performance.
* Database Configuration, please read the [Configuration](/user-guide/deployments/configuration.md) reference.
* GreptimeDB [Disaster Recovery](/user-guide/administration/disaster-recovery/overview.md).
* Cluster Failover for GreptimeDB by [Setting Remote WAL](./remote-wal/quick-start.md).
* [Monitoring metrics](/user-guide/administration/monitoring/export-metrics.md) and [Tracing](/user-guide/administration/monitoring/tracing.md) for GreptimeDB.
* [Upgrade](/user-guide/administration/upgrade.md) GreptimeDB to a new version.


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

## Best Practices

* [Performance Tuning Tips](/user-guide/administration/performance-tuning-tips.md)