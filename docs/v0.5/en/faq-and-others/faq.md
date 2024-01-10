# Frequently Asked Questions

## What would be the use cases for a time-series database?

Common use cases for time-series database include but are not limited to the following four scenarios:

1. Monitor applications and infrastructure
2. Store and access IoT data
3. Process self-driving vehicle data
4. Understand financial trends

## How is GreptimeDB's performance compared to other solutions?

GreptimeDB is still in its early stage and under rapid iterations. We are still optimizing our performance and enriching the features. Performance benchmark will be posted on our website as soon as it's ready. Please stay tuned.

## How is the performance of GreptimeDB when used for non-time-series DB tables?

GreptimeDB supports SQL and can deal with non-time-series data, especially efficient for high concurrent and throughput data writing. However, we develop GreptimeDB for a specific domain (time-series scenarios), and it doesn't support transactions and can't delete data efficiently.

## Does GreptimeDB have a Golang driver?

Yes, you can find our Golang SDK [here](https://github.com/GreptimeTeam/greptimedb-client-go).

Currently, we support MySQL protocol, you can check it out on the [user guide](/user-guide/clients/mysql).

HTTP API is also available, please see [this article](/user-guide/clients/http-api) for more information.

## Can GreptimeDB be used as a Rust alternative to Prometheus in the observable area?

GreptimeDB implements PromQL operator pushdown in our latest distributed version 0.3, enabling distributed PromQL queries.

## Is GreptimeDB compatible with Grafana?

Yes, It's compatible with Grafana.

GreptimeDB supports MySQL and PostgreSQL protocol, so you can use [MySQL or PG grafana
plugin](https://grafana.com/docs/grafana/latest/datasources/mysql/) to config GreptimeDB as a datasource. Then you can use SQL to query the data.

Also, we are implementing PromQL natively which is frequently used with Grafana.

## How does this compare to Loki? Is there a crate with Rust bindings available, preferably as tracing or logging subscriber?

GreptimeDB is focused on time-series data (or metrics) right now. It may support log and tracing storage in the future.

## When will GreptimeDB release its first GA version?

The current version is not at the production level yet and there is a milestone for our future development.
You can check our milestone for GreptimeDB v0.4 [here](https://github.com/GreptimeTeam/greptimedb/milestone/5).

## Are there any plans/works done for the official UI for GreptimeDB so that it would be possible to check cluster status, list of tables, statistics etc？

Yes, we open sourced the dashboard for users to query and visualize their data.
Please check out our initial version on [GitHub Repo](https://github.com/GreptimeTeam/dashboard).

## Does GreptimeDB support schemaless?

Yes, GreptimeDB is a schemaless database without need for creating tables in advance. The table and columns will be created automatically when writing data with protocol gRPC, InfluxDB, OpentsDB, Prometheus remote write.
For more information, refer to [this document](/user-guide/table-management#create-table).

## How do you measure the passing rate of PromQL compatibility tests? Is there any testing framework？

There’s [an issue](https://github.com/GreptimeTeam/greptimedb/issues/1042) to track the PromQL compatibility tests passing rate. It's based on Prometheus's compliance test.

## Where’s the name “Greptime” coming from?

Because “grep” is the most useful command line tool on \*nix platform to search data, and time means time series. So Greptime is to help everybody to search/find value in time series data.

## Is there any good first issue that can help beginners get started quickly?

Yes, beginners can filter issues with ["good first issue"](https://github.com/GreptimeTeam/greptimedb/issues?q=label%3A%22good+first+issue%22) label. Additionally, more good first issues will be released on a rolling basis, so stay tuned!

## Does GreptimeDB support dumping table-level data to S3?

You can use the [`COPY TO` command](/reference/sql/copy#s3) to dump table-level data to S3.

## TSDB features that you concern

Please refer to [features that you concern](/user-guide/concepts/features-that-you-concern.md).

## Can <https://n9e.github.io/> now be directly integrated with GreptimeDB? How is its compatibility?

Theoretically GreptimeDB could replace VictoriaMetrics now since that most protocols are supported, but we hasn't actually tested yet.

## Should I use the command "drop database" to delete a database?

Yes, that is the intended command. However, "drop database" has not been implemented in version 0.4. It is expected to be included in the next minor iterative update. Currently, there is an associated pull request (PR) under review for this feature. As a result, there is no direct way to delete a database at the moment. You may consider creating a new database for testing purposes. If you're working with test data, you also have the option to clear it by deleting the data directory.

## Are there any retention policy? 

We have implemented table level Time-To-Live (TTL) in [this PR](https://github.com/GreptimeTeam/greptimedb/pull/1052). You can refer to the TTL option of the table build statement [here](/user-guide/concepts/features-that-you-concern#can-i-set-ttl-or-retention-policy-for-different-tables-or-measurements).

## What are the main differences between Greptime and another time-series database built on DataFusion like InfluxDB?

At GreptimeDB, we share some technical similarities with InfluxDB, both using Datafusion, Arrow, Parquet, and built on object storage. However, we differ in several key aspects:

- Open-Source Strategy: Unlike InfluxDB, which only open-sources its standalone version, our entire distributed cluster version is open-source. Our architecture can even run on edge Android systems.

- Distributed Architecture: Our architecture is more aligned with HBase's Region/RegionServer design. Our Write-Ahead Log (WAL) uses Kafka, and we're exploring a quorum-based implementation in the future.

- Workload and Services: We focus on a hybrid workload combining time series and analytics. This integration aims to enhance resource efficiency and real-time performance for users. We also offer [GreptimeCloud](https://greptime.com/product/cloud), a commercial cloud service.

- Storage Engine Design: Our pluggable storage engine is versatile. For scenarios with many small data tables, like in Prometheus, we have a dedicated Metrics storage engine.

- Query Language Support: We support PromQL for observability and SQL for data analysis, and incorporate Python for complex data processing. InfluxDB, on the other hand, uses InfluxQL and SQL.

We're a young, rapidly evolving project and always looking to improve. For more details, visit [our Blog](https://greptime.com/blogs/) and [Contributor Guide](https://docs.greptime.com/contributor-guide/overview). We welcome your interest and contributions!
