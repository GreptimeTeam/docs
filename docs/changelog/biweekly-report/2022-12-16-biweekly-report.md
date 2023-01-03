# 2022.11.24 ~ 2022.12.9 —— Allowing S3 Storage

December 15, 2022 · 6 min read

>Since open-sourced on Nov.15, the GreptimeDB community has merged 21 PRs from 10 contributors. That's nearly 25% of the whole project. What a productive month! This article updates two of the good first issues that we are working on and two of the highlighted features.

## Introduction

It's only been three weeks and the community has already received lots of attentions and powerful support from developers around the world. Their talent and passion took us by surprise and strengthened our belief in open source.

*Biweekly Reports* will be a series of quick reports that update our progress regularly. We hope, in this way, members and friends could understand what the project is doing and how they would participate in the GreptimeDB community.

Here are also some good examples of our issue pools. They would be perfect for newcomers, so please have faith in yourself and join us right away!

Join us at [github.com](https://github.com/GreptimeTeam/greptimedb)

## Contributors list: (In alphabetical order)

[@azhsmesos](https://github.com/azhsmesos) [@DiamondMofeng](https://github.com/DiamondMofeng) [@dongxuwang](https://github.com/dongxuwang)

[@e1ijah1](https://github.com/e1ijah1) [@francis-du](https://github.com/francis-du) [@lbt05](https://github.com/lbt05)

[@lizhemingi](https://github.com/lizhemingi) [@morigs](https://github.com/morigs) [@SSebo](https://github.com/SSebo) [@Xuanwo](https://github.com/Xuanwo)

A big THANK YOU for the generous and brilliant contributions! It is people like you who are making GreptimeDB a great product. Let's keep up with the wonderful work!

Join us at [github.com](https://github.com/GreptimeTeam/greptimedb)

## Good first issue

### Issue #667 (Closed)

Link：https://github.com/GreptimeTeam/greptimedb/issues/667

Issue description:

When we define `TIME INDEX` column,
for example `CREATE TABLE` SQL:

```SQL
CREATE TABLE system_metrics (
    host STRING,
    idc STRING,
    ts TIMESTAMP NOT NULL,
    PRIMARY KEY(host, idc),
    TIME INDEX(ts)
);
```

there are two special column specifications: `PRIMARY KEY` and `TIME INDEX`. The first one is used to define primary keys (or tags in some systems), and the second is to define which column is the special timestamp column.

For `TIMESTAMP` column, a simplification is to change the grammar to:

```SQL
ts TIMESTAMP TIME INDEX,
```

By doing so, it

- does not need to write `NOT NULL`, this is implied by `TIME INDEX` keywords
- does not need to specify `TIME INDEX` in another line

GreptimeDB now supports both of these two grammar rules. Users can choose one of them according to their preference.

### Issue #602 (**Help Wanted**)

Link:  https://github.com/GreptimeTeam/greptimedb/issues/602

Issue description:

Add system tables for inner metrics.
It's good to have a metrics table like the one in [Databend](https://databend.rs/doc/sql-reference/system-tables/system-metrics) or [ClickHouse](https://clickhouse.com/docs/en/operations/system-tables/metrics/). Users can easily "select" on the metrics table to see DB's important running status. We are also working on the integration of the metrics table with other visualization tools (like Grafana) or dashboards that support SQL to enable users to interact efficiently and find more insights from their time series data.  
1. In datanode, create a new table called `metrics`, with a schema including at least `metric`, `value`, and `description`, and also feel free to add other columns when necessary. Register it into the default catalog as our `ScriptsTable` does.
2. Implement "select" for the metrics table. Instead of actually storing the metrics, call the `render()` method of `PROMETHEUS_HANDLE`, and parse the result (Prometheus lines) as table output.
3. In frontend, create the same metrics table as well. Unlike `DistTable`, the metrics table cannot execute distributed queries.

## Highlights of Recent PR

### What's cooking on DB's develop branch

[#694](https://github.com/GreptimeTeam/greptimedb/pull/694)

Remove the gRPC invocations between frontend and datanode in standalone mode. This avoids unnecessary network transfers and serialization/deserialization of data in standalone mode, reducing the overhead of frontend calls to the datanode. (Contributor: [MichaelScofield](https://github.com/MichaelScofield))

[#641](https://github.com/GreptimeTeam/greptimedb/pull/641)

MySQL and PostgreSQL can use the same port for both plain-text connections and secure ones. Unlike http or gRPC transports, database protocols have their own TLS handshake process. So we might not be able to utilize haproxy or cloud load balancer for TLS termination. We have to implement Tls support in the database. (Contributor: [SSebo](https://github.com/SSebo))

[#656](https://github.com/GreptimeTeam/greptimedb/pull/656)

GreptimeDB is using OpenDAL as the object storage service, so theoretically, S3 storage should be a piece of cake. (Contributor: [killme2008](https://github.com/killme2008))

[#558](https://github.com/GreptimeTeam/greptimedb/pull/558)

GreptimeDB now supports syntax like `DESC[RIBE] TABLE <name>;` to describe the structure of a table, as well as the default values. (Contributor: [morigs](https://github.com/morigs))

### New things

- In the latest [release of gtctl](https://github.com/GreptimeTeam/gtctl/releases/tag/v0.1.0-alpha.7), users can customize mirror repository.
- We are now developing a dashboard for GreptimeDB. It's still at a very early stage and has a basic UI. Feel free to have a go. Visit https://github.com/GreptimeTeam/dashboard

## Recent Blog Recommendations

[Have a Grep Time, Making the Most of 2023 - GreptimeDB Roadmap for Next Year | Greptime Blog](https://greptime.com/blogs/2022-11-29-have-a-grep-time-making-the-most-of-2023.html)

This roadmap presents goals our team is working on and concepts we have for our shared community. It gives people a sense of what to expect in GreptimeDB over the next 6 months. Furthermore, it provides a "starting points" for how to get involved, and a sense of what kind of projects we are looking for.

[This Time, for Real: GreptimeDB is now open source | Greptime Blog](https://greptime.com/blogs/2022-11-15-this-time-for-real.html)

This is the very first article that says hello to the world for us. Learn how and why we built Greptime and try creating on your own.
