# Biweekly Report (Aug.14 - Aug.27) – Support starting GreptimeDB clusters with KubeBlocks

August 30, 2023

## Summary

Together with all our contributors worldwide, we are glad to see GreptimeDB making remarkable progress for the better. In the past two weeks, a total of **112 PRs** were merged for our program. Below are some highlights:

- Support starting GreptimeDB clusters with KubeBlocks
- Enrich sqlness test scenarios
- Support gRPC row format write protocol
- Optimize `DESC TABLE` experience

## Contributor list: (in alphabetical order)

For the past two weeks, our community has been super active with a total of **4 PRs from 2 contributors** merged successfully and lots pending to be merged.
Congrats on becoming our most active contributors in the past 2 weeks:

- [@NiwakaDev](https://github.com/NiwakaDev) ([db#2150](https://github.com/GreptimeTeam/greptimedb/pull/2150) [db#2209](https://github.com/GreptimeTeam/greptimedb/pull/2209))
- [@Taylor-lagrange](https://github.com/Taylor-lagrange) ([db#2138](https://github.com/GreptimeTeam/greptimedb/pull/2138) [db#2229](https://github.com/GreptimeTeam/greptimedb/pull/2229))

A big THANK YOU for the generous and brilliant contributions! It is people like you who are making GreptimeDB a great product. Let's build an even greater community together.

## Highlights of Recent PR

### [Support starting GreptimeDB clusters with KubeBlocks](https://github.com/apecloud/kubeblocks/pull/4822)

We now support starting GreptimeDB clusters with KubeBlocks.

### [Enrich sqlness test scenarios](https://github.com/GreptimeTeam/greptimedb/pull/2073)

We have enriched the sqlness test scenarios by adding test cases for the following three data types: `timestamp`, `float`, and `string`, with reference to DuckDB's test cases.

### [Support gRPC row format write protocol](https://github.com/GreptimeTeam/greptimedb/pull/2188)

Until now, GreptimeDB has only provided support for the gRPC protocol in columnar format. Constructing data in columnar format is less client (SDK) friendly than in row format, which poses an additional burden on the development of cross-multilingual SDKs.

At the same time, the GreptimeDB-compatible InfluxDB Line Protocol and Prometheus Write Protocol both build data based on "rows". Based on these factors, we decided to support for the gRPC row format write protocol. We will provide a more user-friendly data format without compromising performance. Related PRs also include [#2189](https://github.com/GreptimeTeam/greptimedb/pull/2189), [#2231](https://github.com/GreptimeTeam/greptimedb/pull/2231) and [#2263](https://github.com/GreptimeTeam/greptimedb/pull/2263).

### [Optimize `DESC TABLE` experience](https://github.com/GreptimeTeam/greptimedb/pull/2256)

We optimized the `DESC TABLE` experience in [#2256](https://github.com/GreptimeTeam/greptimedb/pull/2256) and [#2272](https://github.com/GreptimeTeam/greptimedb/pull/2272):

- Add a `Key` column to describe the primary key information (both `Tag` and `Timestamp` are considered as primary key).

In the current output, the primary key information is stored in the Semantic Type column, which is inconsistent with the Semantic Type (Tag, Field, Timestamp) in the gRPC Protocol, so the optimization proposes a separate column `Key` to describe the primary key, and the Semantic Type column remains the same as in the gRPC Protocol.

Before:

```rust
+-----------+----------------------+------+---------+---------------+
| Field     | Type                 | Null | Default | Semantic Type |
+-----------+----------------------+------+---------+---------------+
| ts        | TimestampMillisecond | NO   |         | TIME INDEX    |
| collector | String               | YES  |         | PRIMARY KEY   |
| host      | String               | YES  |         | PRIMARY KEY   |
| val       | Float64              | YES  |         | FIELD         |
+-----------+----------------------+------+---------+---------------+
```

After:

```rust
+-----------+----------------------+-----+------+---------+---------------+
| Field     | Type                 | Key | Null | Default | Semantic Type |
+-----------+----------------------+-----+------+---------+---------------+
| ts        | TimestampMillisecond | PRI | NO   |         | TIMESTAMP     |
| collector | String               | PRI | YES  |         | TAG           |
| host      | String               | PRI | YES  |         | TAG           |
| val       | Float64              |     | YES  |         | FIELD         |
+-----------+----------------------+-----+------+---------+---------------+
```

- Field to Column

In the output of the `DESC TABLE`, we use the name Field (following the MySQL specification), but our time series data model also contains Field (Tag, Field, Timestamp), which can be confusing for users. So we change it to Column.

Before:

```rust
+-----------+----------------------+-----+------+---------+---------------+
| Field     | Type                 | Key | Null | Default | Semantic Type |
+-----------+----------------------+-----+------+---------+---------------+
| ts        | TimestampMillisecond | PRI | NO   |         | TIMESTAMP     |
| collector | String               | PRI | YES  |         | TAG           |
| host      | String               | PRI | YES  |         | TAG           |
| val       | Float64              |     | YES  |         | FIELD         |
+-----------+----------------------+-----+------+---------+---------------+
```

After:

```rust
+-----------+----------------------+-----+------+---------+---------------+
| Column    | Type                 | Key | Null | Default | Semantic Type |
+-----------+----------------------+-----+------+---------+---------------+
| ts        | TimestampMillisecond | PRI | NO   |         | TIMESTAMP     |
| collector | String               | PRI | YES  |         | TAG           |
| host      | String               | PRI | YES  |         | TAG           |
| val       | Float64              |     | YES  |         | FIELD         |
+-----------+----------------------+-----+------+---------+---------------+
```

## New Things

### Vector 0.32 has been released

A built-in GreptimeDB sink is now available, and visit <https://vector.dev/releases/0.32.0/> for more details.

### GreptimeDB gets 3000 stars on GitHub

[GreptimeDB](https://github.com/GreptimeTeam/greptimedb) has reached a significant milestone of 3000 stars and 191 forks on GitHub! In the past few months, GreptimeDB has released v0.1 through v0.3, with v0.4 coming soon, and GreptimeCloud has been officially announced in public beta, with an updated release on the horizon. We also have got two external committers. All of these achievements would be impossible without the hard work of our team members and the support of our external contributors, and we would like to express our sincere thanks to all of you once again for your contributions!
