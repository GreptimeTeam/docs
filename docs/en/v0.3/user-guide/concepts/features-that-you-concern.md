# Features that You Concern

## Does GreptimeDB support updates?

Sort of. The updates can be effectively performed by insertions. If the primary keys have identical column values, the old data will be replaced with the new one. The primary keys in GreptimeDB are mostly like the series in other TSDBs.

The performance of updates is the same as insertion, but too many updates may hurt query performance.

## Does GreptimeDB support deletion?

Yes, it does. It can delete the data by its primary keys effectively, but also may hurt query performance when too many.

Deleting data using other queries is not an efficient operation, as it requires two steps: querying the data and then deleting it by primary keys.

## Can I set TTL or retention policy for different tables or measurements?

Of course, you can set TTL for every table when creating it:

```sql
CREATE TABLE IF NOT EXISTS temperatures(
  ts TIMESTAMP TIME INDEX,
  temperature DOUBLE DEFAULT 10,
) engine=mito with(ttl='7d', regions=10);
```

The TTL of temperatures is set to be seven days. If you want to set the global TTL of all tables, you can configure it in the configuration file:

```toml
[storage]
global_ttl = "7d"
```

You can refer to the TTL option of the table create statement [here](/en/v0.3/reference/sql/create).

## What are the compression rates of GreptimeDB?

The answer is it depends.
GreptimeDB uses the columnar storage layout, and compresses time series data by best-in-class algorithms.
And it will select the most suitable compression algorithm based on the column data's statistics and distribution.
GreptimeDB will provide rollups that can compress data more compactly but lose accuracy.

Therefore, the data compression rate of GreptimeDB may be between 2 and 60 times, depending on the characteristics of your data and whether you can accept accuracy loss.

## How does GreptimeDB address the high cardinality issue?

GreptimeDB resolves this issue by:

- **Sharding**: It distributes the data and index between different region servers. Read the [architecture](./architecture.md) of GreptimeDB.
- **Smart Indexing**: It doesn't create the inverted index for every tag mandatorily, but chooses a proper index type based on the tag column's statistics and query workload. Find more explanation in this [blog](https://greptime.com/blogs/2022-12-21-storage-engine-design#smart-indexing).
- **MPP**: When the query engine doesn't find or choose an index, it will use the vectorize execution query engine to execute the query in parallel and distributed.

## Does GreptimeDB support continuous aggregate or downsampling?

It doesn't, but we have a plan to support it.

## Can I store data in object storage in the cloud?

Yes, GreptimeDB's data access layer is based on [OpenDAL](https://github.com/apache/incubator-opendal), which supports most kinds of object storage services.
The data can be stored in cost-effective cloud storage services such as AWS S3 or Azure Blob Storage, please refer to storage configuration guide [here](./../operations/configuration.md#storage-options).

GreptimeDB also offers a fully-managed cloud service [GreptimeCloud](https://greptime.com/product/cloud) to help you manage data in the cloud.
