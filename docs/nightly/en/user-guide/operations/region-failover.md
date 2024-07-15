# Region Failover

Region Failover provides the ability to recover regions from crashed Datanodes without losing data. This is implemented via [Region Migration](/user-guide/operations/region-migration).

## Enable the Region Failover

:::warning Warning
This feature is only available on GreptimeDB running on cluster mode and

- Using Kafka WAL
- Using [shared storage](/user-guide/operations/configuration.md#storage-options) (e.g., AWS S3)
:::

### Via configuration file
Set the `enable_region_failover=true` in [metasrv](/user-guide/operations/configuration.md#metasrv-only-configuration) configuration file.

### Via GreptimeDB Operator

Set the `meta.enableRegionFailover=true`, e.g.,
```bash
helm install greptimedb greptime/greptimedb-cluster \
  --set meta.enableRegionFailover=true \ 
  ...
```

## The recovery time of Region Failover

The recovery time of Region Failover depends on:

- number of regions per Topic.
- the Kafka cluster read throughput performance.

:::tip Note

In best practices, the number of topics/partitions supported by a Kafka cluster is limited (exceeding this number can degrade Kafka cluster performance). Therefore, we allow multiple regions to share a single topic as the WAL.
:::

### The read amplification

The data belonging to a specific region consists of data files plus data in the WAL (typically `WAL[LastCheckpoint...Latest]`). If multiple regions share a single topic, replaying data for a specific region from the Topic requires filtering out unrelated data (i.e., data from other regions). **This means reading more data than the actual data size of the region, a phenomenon known as read amplification**.

Although multiple regions share the same topic, allowing the Datanode to support more regions, the cost of this approach is read amplification during WAL replay.

For example, configure 128 topics for [metasrv](/user-guide/operations/configuration.md#metasrv-only-configuration), and if the whole cluster holds 1024 regions (physical regions), every 8 regions will share one topic.

![Read Amplification](/remote-wal-read-amplification.png)

<p style="text-align: center;"><b>(Figure1: recovery Region 3 need to read 7 times the redundant data)</b></p>

:::warning Note
In actual scenarios, the reading amplification may be larger than this model.
:::

A simple model to estimate the read amplification factor:

- For a single topic, the amplification factor is 1 + 2 + ... + 7 = 28 times.
- When recovering 100 regions (requiring about 12 topics), the amplification factor is approximately 28 \* 12 = 336 times.

| Number of regions per Topic | Number of topics required for 100 Regions | Single topic read amplification factor | Total reading amplification factor | Replay size (GB) |
| --------------------------- | ----------------------------------------- | -------------------------------------- | ---------------------------------- | ---------------- |
| 1                           | 100                                       | 0                                      | 0                                  | 0.5              |
| 2                           | 50                                        | 1                                      | 50                                 | 25.5             |
| 4                           | 25                                        | 6                                      | 150                                | 75.5             |
| 8                           | 13                                        | 28                                     | 364                                | 182.5            |
| 16                          | 7                                         | 120                                    | 840                                | 420.5            |

**If the Kafka cluster can provide 300MB/s read throughput, recovering 100 regions requires approximately 10 minutes (182.5GB/0.3GB = 10m).**

### More examples

| Number of regions per Topic | Replay size (GB) | Kafka throughput 300MB/s- Reovery time (secs) | Kafka throughput 1000MB/s- Reovery time (secs) |
| --------------------------- | ---------------- | --------------------------------------------- | ---------------------------------------------- |
| 1                           | 0.5              | 2                                             | 1                                              |
| 2                           | 25.5             | 85                                            | 26                                             |
| 4                           | 75.5             | 252                                           | 76                                             |
| 8                           | 182.5            | 608                                           | 183                                            |
| 16                          | 420.5            | 1402                                          | 421                                            |

<sub>\*: Assuming the unflushed data size is 0.5GB.</sub>
