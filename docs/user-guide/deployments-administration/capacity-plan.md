---
keywords: [GreptimeDB capacity planning, CPU requirements, memory requirements, storage requirements, data retention policy]
description: Provides guidelines for CPU, memory, and storage requirements for GreptimeDB based on data points processed per second, query requests per second, data volume, and data retention policy. Includes an example scenario.
---

# Capacity Plan

This guide provides general advice on the CPU, memory, and storage requirements for GreptimeDB.

GreptimeDB is designed to be lightweight upon startup,
which allows for the database to be initiated with minimal server resources.
However, when configuring your server capacity for a production environment,
there are several key considerations:

- Data points processed per second
- Query requests per second
- Data volume
- Data retention policy
- Hardware costs

To monitor the various metrics of GreptimeDB, please refer to [Monitoring](/user-guide/administration/monitoring/export-metrics.md).

## CPU

Generally, applications that handle many concurrent queries, process large amounts of data,
or perform other compute-intensive operations will require more CPU cores.

Here are some recommendations for CPU resource usage,
but the actual number of CPUs you should use depends on your workload.

Consider allocating 30% of your CPU resources for data ingestion,
with the remaining 70% to querying and analytics.

A recommended guideline for resource allocation is to maintain a CPU to memory ratio of 1:4 (for instance, 8 core to 32 GB).
However, if your workload consists primarily of data ingestion with few queries,
a ratio of 1:2 (8 core to 16 GB) can also be acceptable.

## Memory

In general, the more memory you have, the faster your queries will run.
For basic workloads, it's recommended to have at least 8 GB of memory, and 32 GB for more advanced ones.

## Storage

GreptimeDB features an efficient data compaction mechanism that reduces the original data size to about 1/8 to 1/10 of its initial volume.
This allows GreptimeDB to store large amounts of data in a significantly smaller space.

Data can be stored either in a local file system or in cloud storage, such as AWS S3.
FOr more information on storage options,
please refer to the [storage configuration](/user-guide/deployments/configuration.md#storage-options) documentation.

Cloud storage is highly recommended for data storage due to its simplicity in managing storage.
With cloud storage, only about 200GB of local storage space is needed for query-related caches and Write-Ahead Log (WAL).

In order to manage the storage costs effectively, 
it is recommended setting a [retention policy](/user-guide/concepts/features-that-you-concern.md#can-i-set-ttl-or-retention-policy-for-different-tables-or-measurements).

## Example

Consider a scenario where your database handles a query rate of about 200 simple queries per second (QPS) and an ingestion rate of approximately 300k data points per second, using cloud storage for data.

Given the high ingestion and query rates,
here's an example of how you might allocate resources:

- CPU: 8 cores
- Memory: 32 GB
- Storage: 200 GB

Such an allocation is designed to optimize performance,
ensuring smooth data ingestion and query processing without system overload.
However, remember these are just guidelines,
and actual requirements may vary based on specific workload characteristics and performance expectations.
