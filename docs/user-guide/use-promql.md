# Use PromQL

## Introduction

There are various ways to invoke PromQL (Prometheus Query Language) in GreptimeDB.

GreptimeDB has reimplemented PromQL natively in Rust and exposes the ability to several interfaces, including the HTTP API of Prometheus, the HTTP API of GreptimeDB, and the SQL interface.

## Via Prometheus' HTTP API

<!-- Maybe add a section to introduce the simulated interfaces, when there is more than one supported -->

Prometheus server has a bunch of HTTP APIs (see their [official document](https://prometheus.io/docs/prometheus/latest/querying/api)), and GreptimeDB has implemented the [`range_query`](https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries) interface, which allows you to query the data in a given time range with PromQL.

We keep the setting of the path and parameter the same with that in Prometheus, so you can use the same client to query GreptimeDB.

## Via GreptimeDB's HTTP API

GreptimeDB also exposes an HTTP API for querying with PromQL. You can find it on `/promql` path under the current stable API version `/v1`, in **GreptimeDB HTTP API Port**. For example:

```shell
curl --location --request GET 'http://localhost:4000/v1/promql?query=sum(some_metric)&start=1676738180&end=1676738780&step=10s'
```

The input parameters are similar to the [`range_query`](https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries) in Prometheus' HTTP API:

- `query=<string>`: Prometheus expression query string
- `start=<rfc3339 | unix_timestamp>`: start timestamp, inclusive
- `end=<rfc3339 | unix_timestamp>`: end timestamp, inclusive
- `step=<duration | float>`: query resolution step width in duration format or float number of seconds

The result format is the same as `/sql` interface described [here](supported-protocols/http-api.md#sql).

## Via SQL

GreptimeDB also extends SQL grammar to support PromQL. You can start with the `TQL` (Time-series Query Language) keyword to write parameters and query. The grammar looks like this:

```sql
TQL [EVAL|EVALUATE] (<START>, <END>, <STEP>) <QUERY>
```

`<START>` specifies the query start range and `<END>` specifies the end time. `<STEP>` indentifies the query resolution step width. All of them can either be an unquoted number (represent UNIX timestamp for `<START>` and `<END>`, and duration in seconds for `<STEP>`), or a quoted string (represent an RFC3339 timestamp for `<START>` and `<END>`, and duration in string format for `<STEP>`).

For example:

```sql
TQL EVAL (1676738180, 1676738780, '10s') sum(some_metric)
```

You can write the above command in all places that support SQL, including the GreptimeDB HTTP API, SDK, PostgreSQL and MySQL client etc.