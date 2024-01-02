# Biweekly Report - Explore More SQL Examples in the GreptimeDB Playground

## Summary
Together with our global community of contributors, GreptimeDB continues to evolve and flourish as a growing open-source project. We are grateful to each and every one of you.

In the past two weeks, we have made steady progress. Below are some highlights:

- Complete remote WAL's basic framework;

- HTTP SQL API now features the capability to return SQL query results in the InfluxDB v1 format;

- Support concurrent Parquet acquisition to improve query performance;

- The Inverted Index and Metric Engine are under full development.

## Contributors
For the past two weeks, our community has been super active with a total of 56 PRs merged. 5 PRs from 3 individual contributors merged successfully and lots pending to be merged.

Congrats on becoming our most active contributors in the past 2 weeks:

- @[Dysprosium](https://github.com/Dysprosium0626) ([db#2919](https://github.com/GreptimeTeam/greptimedb/pull/2919))

- @[NiwakaDev](https://github.com/NiwakaDev) ([docs#712](https://github.com/GreptimeTeam/docs/pull/712))

- @[tisonkun](https://github.com/tisonkun) ([db#2906](https://github.com/GreptimeTeam/greptimedb/pull/2906) [db#2898](https://github.com/GreptimeTeam/greptimedb/pull/2898) [db#2896](https://github.com/GreptimeTeam/greptimedb/pull/2896))

👏  Welcome our new contributor @[Dysprosium](https://github.com/Dysprosium0626) to our community, and congratulations on successfully merging his first PR. 

A big THANK YOU to all our members and contributors! It is people like you who are making GreptimeDB a great product. Let's build an even greater community together.

## Highlights of Recent PR
### [#2917](https://github.com/GreptimeTeam/greptimedb/pull/2917) HTTP SQL API now features the capability to return SQL query results in the InfluxDB v1 format
We support returning the query in influxdb v1 result format, for example, we can send the following request: `http://ip:port/v1/sql?db=public&format=influxdb_v1&epoch=ns`.
The epoch precision can be one of `[ns,u,µ,ms,s]`.

### [#2935](https://github.com/GreptimeTeam/greptimedb/pull/2935) Added some tables to `information_schema`
Introduce `information_schema`, which provides an ANSI-standard way of viewing system metadata, and we add `engines`, `column_privileges` and `column_statistics` to `information_schema` now.

For example, we can view the system's engines through the following SQL statement.

```sql
mysql> select * from engines;
+--------+---------+-------------------------------------+--------------+------+------------+
| engine | support | comment                             | transactions | xa   | savepoints |
+--------+---------+-------------------------------------+--------------+------+------------+
| mito   | DEFAULT | Storage engine for time-series data | NO           | NO   | NO         |
+--------+---------+-------------------------------------+--------------+------+------------+
```

### [#2930](https://github.com/GreptimeTeam/greptimedb/pull/2930) Allowed initializing regions in background
This feature allows users to initiate the startup process for all regions in the background, without delaying or blocking the startup process. As a result, users can start using the database more quickly.

### [#2959](https://github.com/GreptimeTeam/greptimedb/pull/2959) Supported concurrent fetching of parquet files with ranges
Previously, we obtained the parquet file sequentially, and now it is optimized for concurrent acquisition. Under TSBS benchmark, some scenarios have an improvement of more than 175%.

## Good first issue
[#2931](https://github.com/GreptimeTeam/greptimedb/issues/2931)
Information_schema improvements

[#2995](https://github.com/GreptimeTeam/greptimedb/issues/2995)
Make the stdout log appender configurable

## New Things
### Play more SQL statements in PLAYGROUND now
The 'Getting Started' documentation has been updated with new data sources, along with the inclusion of new Range Query SQL statements. Additionally, a weather-related example demonstrating the Range Query has been added for enhanced clarity and practical application.

Try now: https://greptime.com/playground/
