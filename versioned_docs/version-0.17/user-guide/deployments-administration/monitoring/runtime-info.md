---
keywords: [GreptimeDB runtime information, system metadata, cluster topology, table regions distribution, SQL queries]
description: Provides access to system metadata through the INFORMATION_SCHEMA database, including cluster topology and table regions distribution. Examples of SQL queries to retrieve region IDs and distribution are included.
---

# Runtime Information

The `INFORMATION_SCHEMA` database provides access to system metadata, such as the name of a database or table, the data type of a column, etc.

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

For more information about the `INFORMATION_SCHEMA` database,
Please read the [reference](/reference/sql/information-schema/overview.md).
