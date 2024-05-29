# Capacity Plan

This guide provides general advice on the CPU, memory, and storage requirements for GreptimeDB.

GreptimeDB is designed to be lightweight upon startup,
which allows for the database to be initiated with minimal server resources.
However, when configuring your server capacity for a production environment,
there are several key considerations:

- Row processed per second
- Query requests per second
- Data volume
- Data retention policy
- Hardware costs

To monitor the various metrics of GreptimeDB, please refer to [Monitoring](./monitoring.md).

## CPU

Generally, applications that handle many concurrent queries, process large amounts of data,
or perform other compute-intensive operations will require more CPU cores.

Here are some recommendations for CPU resource usage,
but the actual number of CPUs you should use depends on your workload.

Consider allocating 30% of your CPU resources for data ingestion,
with the remaining 70% to querying and analytics.

A recommended guideline for resource allocation is to maintain a CPU to memory ratio of 1:4 (for instance, 2 core to 8 GB).
However, if your workload consists primarily of data ingestion with few queries,
a ratio of 1:2 can also be acceptable.

## Memory

In general, the more memory you have, the faster your queries will run.
For basic workloads, it's recommended to have at least 8 GB of memory, and 32 GB for more advanced ones.

If you are using the [continuous aggregation](../continuous-aggregation/overview.md) feature,
keep in mind that the Flow engine stores data used for aggregation in memory.
Therefore, it is crucial to allocate enough memory to accommodate all unexpired data within the Flow engine.
To conserve memory, it is recommended to set an [`EXPIRE AFTER`](../continuous-aggregation/manage-flow.md#expire-after-clause) policy.

## Storage

Data can be stored either in a local file system or in cloud storage, such as AWS S3.
FOr more information on storage options,
please refer to the [storage configuration](./configuration.md#storage-options) documentation.

Cloud storage is highly recommended for data storage due to its simplicity in managing storage.
With cloud storage, only about 200GB of local storage space is needed for the Write-Ahead Log (WAL) caching data.

However, if you prefer using a local file system for data storage,
you need to consider the volume of data.
For example, if your data ingestion rage is 300k data points per second,
each data point is about 1kb in size,
then you will need to add approximately 420GB of storage space per day.

Regardless of whether you choose cloud or local storage,
setting a [retention policy](/user-guide/concepts/features-that-you-concern#can-i-set-ttl-or-retention-policy-for-different-tables-or-measurements) is recommended to manage storage costs effectively.

## Example

Consider a scenario where your database handles a query rate of about 200 simple queries per second (qps) and an ingestion rate of approximately 300k data points per second, using cloud storage for data.

Given the high ingestion and query rates,
here's an example of how you might allocate resources:

- CPU: 8 cores.
- Memory: 32 GB.
If you are using [continuous aggregation](../continuous-aggregation/overview.md) with a policy to expire data after 1 day,
an additional about 420 GB of memory will be required for the Flow engine.
- Storage: 200 GB.

Such an allocation is designed to optimize performance,
ensuring smooth data ingestion and query processing without system overload.
However, remember these are just guidelines,
and actual requirements may vary based on specific workload characteristics and performance expectations.
