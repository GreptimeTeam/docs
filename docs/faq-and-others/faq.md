# Frequently Asked Questions

## Does GreptimeDB have a Golang driver?

Our Golang SDK is on the to-do list, please subscribe our newsletter to get the latest feature update!
Currently, we support MySQL protocol, you can check it out on the [user guide](https://docs.greptime.com/user-guide/supported-protocols/mysql ). 

HTTP API is also available, please see [this article](https://docs.greptime.com/user-guide/supported-protocols/http-api) for more information. 

## Can GreptimeDB be used as a Rust alternative to Prometheus in the observable area?

We plan to implement PromQL natively in GreptimeDB. 
For details, you can check our progress under [this issue](https://github.com/GreptimeTeam/greptimedb/issues/596).

## Is GreptimeDB compatible with Grafana?

Yes, It's compatible with Grafana. 

GreptimeDB supports MySQL and PostgreSQL protocol, so you can use [MySQL or PG grafana
plugin](https://grafana.com/docs/grafana/latest/datasources/mysql/) to config GreptimeDB as a datasource. Then you can use SQL to query the data. We also plan to implement PromQL natively.

## How does this compare to Loki? Is there a crate with Rust bindings available, preferably as tracing or logging subscriber?

GreptimeDB is focused on time-series data (or metrics) right now. It may support log and tracing storage in the future.
***
## How is GreptimeDB's performance compared to other solutions?
GreptimeDB is still in its early stage and under rapid iterations. We are still optimizing our performance and enriching the features. Performance benchmark will be posted on our website as soon as it's ready. Please stay tuned.
## How is the performance of GreptimeDB when used for non-time-series DB tables?
GreptimeDB supports SQL and can deal with non-time-series data, especially efficient for high concurrent and throughput data writing. However, we develop GreptimeDB for a specific domain ( time-series scenarios), and it doesn't support transactions and can't delete data efficiently.
***
## When will GreptimeDB release its first GA version?
The current version is not at the production level yet and there is a milestone for our future development. 
You can check our milestone [here](https://github.com/GreptimeTeam/greptimedb/milestone/2).

## Are there any plans/works done for the official UI for GreptimeDB so that it would be possible to check cluster status, list of tables, statistics etc？

Yes, we open sourced the dashboard for users to query and visualize their data.
Please check out our initial version on [GitHub Repo](https://github.com/GreptimeTeam/dashboard). 

***

## What would be the use cases for a time-series database?

Common use cases for time-series database include but are not limited to the following four scenarios:
1. Monitor applications and infrastructure
2. Store and access IoT data
3. Process self-driving vehicle data
4. Understand financial trends