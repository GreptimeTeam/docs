# Administration

This document addresses strategies and practices used in the operation of GreptimeDB systems and deployments.

## Database/Cluster management

* [Installation](/getting-started/installation/overview.md) for GreptimeDB and the [g-t-control](./gtctl.md) command line tool.
* Database Configuration, please read the [Configuration](./configuration.md) reference.
* [Monitoring](./monitoring.md) for GreptimeDB.
* GreptimeDB [Backup & Restore methods](./back-up-\&-restore-data.md).

### Runtime information

* Find the topology information of the cluster though [CLUSTER_INFO](/reference/sql/information-schema/cluster-info.md) table.
* Find the table regions distribution though [REGION_PEERS](/reference/sql/information-schema/region-peers.md) table.

`INFORMATION_SCHEMA` provides access to system metadata, such as the name of a database or table, the data type of a column, etc. Please read the [reference](/reference/sql/information-schema/overview).

## Data management

* [The Storage Location](/user-guide/concepts/storage-location.md).
* Flush and Compaction for Table & Region.
* Partition the table by regions, read the [Table Sharding](/contributor-guide/frontend/table-sharding.md) reference.
  * [Migrate the Region](./region-migration.md) for Load Balance.
* [Expire Data by Setting TTL](/user-guide/concepts/features-that-you-concern#can-i-set-ttl-or-retention-policy-for-different-tables-or-measurements).

## Best Practices

TODO