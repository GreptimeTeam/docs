# Frequently Asked Questions

### What would be the use cases for a time-series database?

Common use cases for time-series database include but are not limited to the following four scenarios:

1. Monitor applications and infrastructure
2. Store and access IoT data
3. Process self-driving vehicle data
4. Understand financial trends

### TSDB features that you concern

Please refer to [features that you concern](/user-guide/concepts/features-that-you-concern.md).

### How is GreptimeDB's performance compared to other solutions?

GreptimeDB has released v0.8, with functionalities set to improve progressively. For detailed TSBS test results, refer to the link [here](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/benchmarks/tsbs/v0.8.0.md).

### How is the performance of GreptimeDB when used for non-time-series DB tables?

GreptimeDB supports SQL and can deal with non-time-series data, especially efficient for high concurrent and throughput data writing. However, we develop GreptimeDB for a specific domain (time-series scenarios), and it doesn't support transactions and can't delete data efficiently.

### Does GreptimeDB have a Go driver?

Yes, you can find our Go SDK here: https://github.com/GreptimeTeam/greptimedb-ingester-go.

Currently, we support MySQL protocol, you can check it out on the [user guide](/user-guide/clients/mysql).

HTTP API is also available, please see [this article](/user-guide/clients/http-api) for more information.

### Can GreptimeDB be used as a Rust alternative to Prometheus in the observable area?

GreptimeDB has initially implemented native support for PromQL, with compatibility in GreptimeDB v0.7 surpassing 80%, making it comparable to VictoriaMetrics.

### Is GreptimeDB compatible with Grafana?

Yes, It's compatible with Grafana.

GreptimeDB has an official Grafana plugin: [greptimedb-grafana-datasource](https://github.com/GreptimeTeam/greptimedb-grafana-datasource/)

GreptimeDB also supports MySQL and PostgreSQL protocol, so you can use [MySQL or PG grafana
plugin](https://grafana.com/docs/grafana/latest/datasources/mysql/) to config GreptimeDB as a datasource. Then you can use SQL to query the data.

Also, we are implementing PromQL natively which is frequently used with Grafana.

### How does this compare to Loki? Is there a crate with Rust bindings available, preferably as tracing or logging subscriber?

GreptimeDB has primarily focused on metrics, but will soon offer log storage and full-text search capabilities for logs. These features are expected to be available in version 0.9, which is anticipated to be released in early July.

### When will GreptimeDB release its first GA version?

The current version has not yet reached General Availability version standards. In line with our Greptime 2024 Roadmap, we plan to achieve a production-level version with the update to v1.0 in August. More details: https://github.com/GreptimeTeam/greptimedb/issues/3412.

### Are there any plans/works done for the official UI for GreptimeDB so that it would be possible to check cluster status, list of tables, statistics etc？

Yes, we open sourced the dashboard for users to query and visualize their data.
Please check out our initial version on [GitHub Repo](https://github.com/GreptimeTeam/dashboard).

### Does GreptimeDB support schemaless?

Yes, GreptimeDB is a schemaless database without need for creating tables in advance. The table and columns will be created automatically when writing data with protocol gRPC, InfluxDB, OpentsDB, Prometheus remote write.

For more information, refer to [this document](/user-guide/table-management#create-table).

### How do you measure the passing rate of PromQL compatibility tests? Is there any testing framework？

There’s [an issue](https://github.com/GreptimeTeam/greptimedb/issues/1042) to track the PromQL compatibility tests passing rate. It's based on Prometheus's compliance test.

### Where’s the name “Greptime” coming from?

Because `grep` is the most useful command line tool on \*nix platform to search data, and time means time series. So Greptime is to help everybody to search/find value in time series data.

### Is there any good first issue that can help beginners get started quickly?

Yes, beginners can filter issues with ["good first issue"](https://github.com/GreptimeTeam/greptimedb/issues?q=label%3A%22good+first+issue%22) label. Additionally, more good first issues will be released on a rolling basis, so stay tuned!

### Does GreptimeDB support dumping table-level data to S3?

You can use the [`COPY TO` command](/reference/sql/copy#s3) to dump table-level data to S3.

### Can <https://n9e.github.io/> now be directly integrated with GreptimeDB? How is its compatibility?

Currently, GreptimeDB's compatibility efforts are primarily focused on the implementation of native PromQL. Going forward, we will continue to enhance compatibility with MetricQL's extended syntax.

### If I delete the database, can I use the `DROP DATABASE` command?

Yes, the `DROP DATABASE` command has been implemented in version 0.8. You can refer to the official documentation for usage: [`Drop Database`](https://docs.greptime.com/reference/sql/drop#drop).

### Are there any retention policy? 

We have implemented table level Time-To-Live (TTL) in [this PR](https://github.com/GreptimeTeam/greptimedb/pull/1052). You can refer to the TTL option of the table build statement [here](/user-guide/concepts/features-that-you-concern#can-i-set-ttl-or-retention-policy-for-different-tables-or-measurements).

And since 0.8, GreptimeDB already supports database level `TTL` too, read the [CREATE DATABASE](/reference/sql/create#create-database).

### What are the main differences between Greptime and another time-series database built on DataFusion like InfluxDB?

At GreptimeDB, we share some technical similarities with InfluxDB, both using Datafusion, Arrow, Parquet, and built on object storage. However, we differ in several key aspects:

- Open-Source Strategy: Unlike InfluxDB, which only open-sources its standalone version, our entire distributed cluster version is open-source. Our architecture can even run on edge Android systems.
- Distributed Architecture: Our architecture is more aligned with HBase's Region/RegionServer design. Our Write-Ahead Log (WAL) uses Kafka, and we're exploring a quorum-based implementation in the future.
- Workload and Services: We focus on a hybrid workload combining time series and analytics. This integration aims to enhance resource efficiency and real-time performance for users. We also offer [GreptimeCloud](https://greptime.com/product/cloud), a commercial cloud service.
- Storage Engine Design: Our pluggable storage engine is versatile. For scenarios with many small data tables, like in Prometheus, we have a dedicated Metrics storage engine.
- Query Language Support: We support PromQL for observability and SQL for data analysis, and incorporate Python for complex data processing. InfluxDB, on the other hand, uses InfluxQL and SQL.

We're a young, rapidly evolving project and always looking to improve. For more details, visit [our Blog](https://greptime.com/blogs/) and [Contributor Guide](https://docs.greptime.com/contributor-guide/overview). We welcome your interest and contributions!

### As a first-timer looking to contribute to GreptimeDB, where can I find a comprehensive guide to get started?

Welcome! Please refer to our [contribution guide](https://github.com/GreptimeTeam/greptimedb/blob/main/CONTRIBUTING.md). For those new to GreptimeDB, we have a selected collection of [good first issues](https://github.com/GreptimeTeam/greptimedb/issues?q=is%3Aopen+is%3Aissue+label%3A%22Good+first+issue%22). Feel free to reach us in Slack channel anytime!

### Can GreptimeDB be used for a large-scale internal metrics collection system similar to Fb's Gorilla or Google's Monarch, with a preference for in-memory data and high availability? Are there plans for asynchronous WAL or optional disk storage, and how is data replication handled without WAL?

GreptimeDB supports asynchronous WAL and is developing a per-table WAL toggle for more control. A tiered storage approach, starting with in-memory caching, is also in development. For data replication, data flushed to remote stores like S3 is replicated independently of WAL. The details for tiered storage are tracked in issue [db#2516](https://github.com/GreptimeTeam/greptimedb/issues/2516). A remote WAL implementation based on Apache Kafka ensures the durability of unflushed data in cluster mode.

### Does GreptimeDB have a way to handle absolute counters that can reset, like InfluxDB's non-negative differential? How do aggregations work with these counters, and is PromQL preferred over SQL for them? Also, is there a plan to integrate PromQL functions into SQL, similar to InfluxDB v3?

GreptimeDB, like Prometheus, handles counters effectively. Functions like` reset()`, `rate()`, or `delta()` in GreptimeDB are designed to automatically detect and adjust for counter resets. While it's not recommended to use the `deriv()` function on a counter since it's meant for gauges, you can apply `rate()` to your counter and then use `deriv()`. PromQL is indeed more suitable for operations involving counters, given its origin in Prometheus. However, we are exploring the integration of PromQL functions into SQL for greater flexibility. If you're interested in implementing functions into GreptimeDB, we have documentation available which you can check out: [Greptime Documentation](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-write-aggregate-function.md).

### What are the feature differences between the open-source version and the cloud version of GreptimeDB?

Thank you for asking, here are some key points:

- **Foundational Features**: The foundational features, including the ingestion protocol, SQL capabilities, and storage functions, are largely identical between the two versions. However, GreptimeCloud offers advanced SQL functions and additional features.
- **Fully Managed Service**: GreptimeCloud is a fully managed service that supports multi-tenancy, data encryption, and security audits for compliance, which are not available in the open-source version.
- **Enhanced Dashboard**: Another significant advantage of GreptimeCloud is its superior dashboard, which is more user-friendly and includes a unique Prometheus workbench. This workbench facilitates online editing of Prometheus dashboards and alert rules, as well as GitOps integration.
- **Specialized Solutions**: GreptimeCloud introduces specialized solutions like GreptimeAI, which leverages DBaaS technology. We are also expanding our offerings to include more innovative solutions, such as those for IoT.

As mentioned, the cloud version offers more ready-to-use features to help you get started quickly. The core features are almost identical, especially on our dedicated plan.

### What should I do if the region becomes `DOWNGRADED` and the tables on that node become read-only after the datanode restarts? Is there a way to automatically reactivate it?

According to your configuration, the failover in metasrv, which may mark the region as `DOWNGRADED`, is disabled. Another procedure that may mark a region as `DOWNGRADED` is the region migration procedure. Please try running the region migration procedure and provide feedback for further assistance.

### Is there a guide or suggestions for compiling GreptimeDB into a standalone binary with only the necessary modules and features for an embedded environment?

We have prebuilt binaries for Android ARM64 platforms, which have been successfully used in some enterprise projects. However, these binaries are not available for bare metal devices, as some fundamental components of GreptimeDB require a standard library.

### Is there a built-in SQL command like 'compaction table t1' that can be used for manual compaction?

Of course, please use the `compact_table` function:

```sql
-- Schedule a compaction for table test --
select compact_table("test");
```

There are many [administration functions](/reference/sql/functions/overview#admin-functions) for database management.

### Can GreptimeDB be used to store logs?

- The current columnar storage structure can be used to store logs. For example, by setting a column's type to string (non-primary key), logs can be stored. Logs can be written and queried using the supported protocols, and the data can be stored in object storage (OSS/S3) with distributed scalability.

- If logs can be parsed into structured dimensions, they can also be stored as tags (primary key). These tags can then be used for dimensional queries.

- However, there are still a few key features missing. Firstly, full-text indexing (currently, LIKE queries can be used as a substitute). Secondly, specific syntax or SQL functions for log queries. Lastly, support for some unique log ingestion protocols. These features are under active development and are expected to be supported in version 0.9, anticipated for release in early July. However, it may not be a simple replacement for Elasticsearch (ES) since its query syntax needs further exploration. Currently, SQL is the primary query language.

### How is the query performance for non-primary key fields? Can inverted indexes be set? Will the storage cost be lower compared to Elasticsearch?

Currently, non-primary key fields (or non-tag fields) do not have default inverted indexes, and we have not yet provided a `CREATE INDEX` syntax. Inverted index support will be released in an upcoming iteration along with full-text indexing. Without indexes, queries rely on MPP brute-force scanning. Although there is some parallel processing, the efficiency may not be optimal.

As for storage costs, they will certainly be lower. You can use containers and object storage directly without relying on disks, using small local disks for buffering/caching to speed up performance. GreptimeDB employs a tiered storage architecture. For more details, please refer to our documentation on architecture and storage location.

### Is the Log-Structured Merge-Tree engine similar to Kafka's engine model?

From a technical storage perspective, they are similar. However, the actual data formats differ: GreptimeDB reads and writes Parquet format, while Kafka uses its own RecordBatch format. To analyze time-series data temporarily stored in Kafka, it needs to be written into GreptimeDB first.

You can replace Kafka with EMQX, which is also a message queue. Here is a reference example: [EMQX Data Integration with GreptimeDB](https://www.emqx.com/en). The process of writing data from Kafka to GreptimeDB is quite similar.

As mentioned, to analyze the data, it must be written into GreptimeDB first. Consume Kafka messages and write them into GreptimeDB using the provided protocols. If analyzing data directly in Kafka is necessary, you might consider the KSQL project: [KSQL GitHub Repository](https://github.com/confluentinc/ksql). However, our past attempts with KSQL encountered several issues.

We are also working on releasing a Kafka consumer component that will automate the consumption and writing process.

### Are there limitations on the number of tables or columns in GreptimeDB? Does having many columns affect read and write performance?

Generally, there are no strict limitations. With a few hundred tables, as long as there aren't many primary key columns, the impact on write performance is minimal (measured by the number of points written per second, not rows).

Similarly, for reads, if queries only involve a subset of columns, the memory and computational load will not be significantly high.

### Can tables be dynamically partitioned by day based on timestamps, or is this unnecessary because the timestamp field already has an index?

GreptimeDB's data is distributed in timestamp order, so there is no need to additionally shard/partition by timestamp. It is recommended to shard by primary key instead.

### How many servers are generally needed to set up a reliable GreptimeDB cluster, and how should Frontend, Datanode, and Metasrv be deployed? Should each node run all three services regardless of the number of nodes?

A minimum of 3 nodes is required, with each node running the 3 services: metasrv, frontend, and datanode. However, the exact number of nodes depends on the scale of data being handled.

It is not necessary to deploy all three services on each node. A small-sized cluster can be set up with 3 nodes dedicated to metasrv. Frontend and datanode can be deployed on equal nodes, with one container running two processes.

For more general advice for deployment, please read [Capacity Plan](/user-guide/operations/capacity-plan).

### Does GreptimeDB support inverted indexes, and does it use Tantivy?

Since v0.7, GreptimeDB supports inverted indexes which are designed by ourselves, read the [Contributor Guide](/contributor-guide/datanode/data-persistence-indexing#inverted-index) for more information.

We plan to integrate Tantivy into the upcoming 0.9 release for full-text search functionality, although we are not currently using it.

### In v0.8, does the Flow Engine (pre-computation) feature support PromQL syntax for calculations?

This is a good suggestion. Currently, the Flow Engine does not support PromQL syntax for calculations. We will evaluate this, as it seems theoretically feasible.

### Will Metasrv support storage backends like MySQL or PostgreSQL?

We have developed an abstraction layer for Metasrv, but it does not yet support RDBMS backends. Support for MySQL and PostgreSQL is planned. For further suggestions, please open an issue on our GitHub repository.

### What is the best way to downsample interface traffic rates (maximum rate within every hour) from multiple NICs(network interface controller) across thousands of computers every 30 seconds, so that the data can be kept for many years?

Using a flow table is the appropriate tool for this task. A simple flow task should suffice. The output of a flow task is stored in a normal table, allowing it to be kept indefinitely.

### Why is there a performance drop in query response times after upgrading or restarting?

Currently, GreptimeDB only builds indexes for persistent data. Therefore, query performance might improve after flushing buffered input data. The in-memory page cache for persistent files also needs to be warmed up by queries after restarting the instance.

- Persistence Mechanism: Data is flushed periodically or when the buffered data size reaches a threshold.
- Cache Warm-up: Query performance improves as the in-memory page cache warms up.

These mechanisms help stabilize and improve query performance after an upgrade.