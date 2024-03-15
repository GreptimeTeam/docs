# Frequently Asked Questions

## What would be the use cases for a time-series database?

Common use cases for time-series database include but are not limited to the following four scenarios:

1. Monitor applications and infrastructure
2. Store and access IoT data
3. Process self-driving vehicle data
4. Understand financial trends

## How is GreptimeDB's performance compared to other solutions?

GreptimeDB has released v0.7, with functionalities set to improve progressively. For detailed TSBS test results, refer to the link below: https://github.com/GreptimeTeam/greptimedb/blob/main/docs/benchmarks/tsbs/v0.7.0.md.

## How is the performance of GreptimeDB when used for non-time-series DB tables?

GreptimeDB supports SQL and can deal with non-time-series data, especially efficient for high concurrent and throughput data writing. However, we develop GreptimeDB for a specific domain (time-series scenarios), and it doesn't support transactions and can't delete data efficiently.

## Does GreptimeDB have a Go driver?

Yes, you can find our Go SDK here: https://github.com/GreptimeTeam/greptimedb-ingester-go.

Currently, we support MySQL protocol, you can check it out on the [user guide](/user-guide/clients/mysql).

HTTP API is also available, please see [this article](/user-guide/clients/http-api) for more information.

## Can GreptimeDB be used as a Rust alternative to Prometheus in the observable area?

GreptimeDB has initially implemented native support for PromQL, with compatibility in GreptimeDB v0.7 surpassing 80%, making it comparable to VictoriaMetrics.

## Is GreptimeDB compatible with Grafana?

Yes, It's compatible with Grafana.

GreptimeDB supports MySQL and PostgreSQL protocol, so you can use [MySQL or PG grafana
plugin](https://grafana.com/docs/grafana/latest/datasources/mysql/) to config GreptimeDB as a datasource. Then you can use SQL to query the data.

Also, we are implementing PromQL natively which is frequently used with Grafana.

## How does this compare to Loki? Is there a crate with Rust bindings available, preferably as tracing or logging subscriber?

GreptimeDB is currently focused on the development of Metrics-related features. However, our Greptime 2024 Roadmap has already announced the release plan for the Log Engine, which is expected to be implemented in version 1.1. 

For more information: https://github.com/GreptimeTeam/greptimedb/issues/3412

## When will GreptimeDB release its first GA version?

The current version has not yet reached General Availability version standards. In line with our Greptime 2024 Roadmap, we plan to achieve a production-level version with the update to v1.0 in August. More details: https://github.com/GreptimeTeam/greptimedb/issues/3412.

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

Currently, GreptimeDB's compatibility efforts are primarily focused on the implementation of native PromQL. Going forward, we will continue to enhance compatibility with MetricQL's extended syntax.

## Should I use the command "drop database" to delete a database?

Yes, that is the intended command. However, 'drop database' will be implemented in v0.8. It is expected to be included in the next minor iterative update. As a result, there is no direct way to delete a database at the moment. You may consider creating a new database for testing purposes. If you're working with test data, you also have the option to clear it by deleting the data directory.

## Are there any retention policy? 

We have implemented table level Time-To-Live (TTL) in [this PR](https://github.com/GreptimeTeam/greptimedb/pull/1052). You can refer to the TTL option of the table build statement [here](/user-guide/concepts/features-that-you-concern#can-i-set-ttl-or-retention-policy-for-different-tables-or-measurements).

## I'm considering using GreptimeDB for a large-scale metrics system similar to Facebook's Gorilla or Google's Monarch, with a preference for in-memory data and high availability, possibly at the expense of some data loss. Given GreptimeDB's focus on consistency over in-memory storage, are there plans to introduce options like asynchronous WAL or optional disk storage for flexibility? Also, is there a way to ensure data replication without WAL, and when can we expect documentation and features for tiered storage?

GreptimeDB already supports asynchronous WAL, and we're looking into a per-table WAL toggle for more control. We're also developing a tiered storage approach, starting with in-memory caching. For data replication, we ensure that data flushed to remote stores like S3 is replicated, independent of WAL. The details for tiered storage are tracked in issue [#2516](https://github.com/GreptimeTeam/greptimedb/issues/2516). We provide a remote WAL implementation based on Apache Kafka to ensure the durability of data not being flushed in cluster mode.