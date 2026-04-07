---
keywords: [repartition, table sharding, GC, object storage, GreptimeDB, Helm Chart]
description: Explains GreptimeDB repartitioning, including prerequisites, hot partition detection, partition rules, and common Helm Chart configurations.
---

# Repartition

Repartition lets you adjust partition rules after a table has been created.
GreptimeDB does this through `ALTER TABLE` partition split and merge operations; see [ALTER TABLE](/reference/sql/alter.md#split-or-merge-partitions) for the syntax.

Repartition is only supported in distributed clusters.

## How it works

The core idea is to adjust partition rules and Region routing online instead of manually moving data into a new table.
GreptimeDB switches to the new partition layout by updating manifest file references for each Region, so the rules can better match the current data distribution.

This approach is useful when traffic patterns change over time and you want to keep partition rules aligned with the workload without rebuilding the table.

During repartitioning, writes may be briefly affected, so client-side retries are recommended.

## When to repartition

Consider repartitioning when:

- Some regions are consistently hotter than others.
- Your data distribution changes and the current partition boundaries no longer fit.
- Some regions become very small and cold, and you want to reduce resource usage by merging them.
- You want to further split a partition to improve write concurrency or query performance.

In general, when partition rules no longer reflect the current data distribution well, it is worth considering repartitioning.

## How to identify hot partitions

Before repartitioning, confirm which regions are hot.
Join region statistics with partition metadata to find the hottest rules:

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

If some regions have a much higher `written_bytes_since_open` value over time, that partition rule is usually a good candidate for splitting.

Also check whether the region peers are healthy so node issues are not mistaken for hotspots:

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

If the nodes are healthy and the hotspot signal persists, you can move on to designing the repartition plan.

## Prerequisites

:::warning Warning
This feature is only available in distributed clusters and requires:

- Using [shared object storage](/user-guide/deployments-administration/configuration.md#storage-options) (e.g., AWS S3)
- Using [GC](/user-guide/deployments-administration/manage-data/gc.md) on both metasrv and all datanodes

Otherwise, you can't perform repartitioning.
:::

GreptimeDB supports repartitioning through repeated `SPLIT PARTITION` and `MERGE PARTITION` operations.
The most common cases are 1-to-2 splits and 2-to-1 merges.
More complex changes can also be done step by step.

Object storage stores region files, while GC reclaims old files only after references are released.
This helps prevent accidental deletion of data still in use.

### Through GreptimeDB Operator

If you deploy GreptimeDB with the GreptimeDB Operator, refer to [Common Helm Chart Configurations](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md) for GC and object storage setup.

## Example

You can repartition a table by merging existing partitions and then splitting them with new rules.
The following example changes the `area` partition key from `South` to `North` for devices with `device_id < 100`:

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

## Further reading

For a step-by-step tutorial with more background and examples, see [How to Split and Merge Partitions Online in GreptimeDB](https://greptime.com/blogs/2026-03-19-greptimedb-repartition-guide).
