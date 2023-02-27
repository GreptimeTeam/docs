# Java SDK

## Introduction

Various ways to invoke PromQL (Prometheus Query Language) in GreptimeDB.

GreptimeDB has reimplemented PromQL natively in Rust, and exposes the ability to several interfaces including Prometheus' HTTP API, GreptimeDB's HTTP API and the SQL interface.

## via Prometheus' HTTP API

<!-- Maybe add a section to introduce the simulated interfaces, when there is more than one supported -->

Prometheus server has a bunch of HTTP APIs (see their [official document](https://prometheus.io/docs/prometheus/latest/querying/api)), and GreptimeDB has implemented the [`range_query`](https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries) interface, which allows you to query the data in a given time range with PromQL.

We keep the path and parameter set the same as Prometheus, so you can use the same client to query GreptimeDB.

## via GreptimeDB's HTTP API

GreptimeDB also exposes an HTTP API for querying with PromQL. It's available on `/promql` path under the current stable API version `/v1`, in **GreptimeDB HTTP API Port**. For example:

```shell
curl --location --request GET 'http://localhost:4000/v1/promql?query=sum(some_metric)&start=1676738180&end=1676738780&step=10s'
```

The input parameters are similar to the [`range_query`](https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries) in Prometheus' HTTP API:

- `query=<string>`: Prometheus expression query string.
- `start=<rfc3339 | unix_timestamp>`: Start timestamp, inclusive.
- `end=<rfc3339 | unix_timestamp>`: End timestamp, inclusive.
- `step=<duration | float>`: Query resolution step width in duration format or float number of seconds.

And the result format is the same as `/sql` interface described [here](supported-protocols/http-api.md#sql).

## via SQL

GreptimeDB also extends SQL grammar to support PromQL. You can start with the `TQL` (Time-series Query Language) keyword, and then write parameters and query. The grammar looks like this:

```sql
TQL [EVAL|EVALUATE] (<START>, <END>, <STEP>) <QUERY>
```

`<START>` specify the query start range, and `<END>` for end time. `<STEP>` is the query resolution step width. All of them can either be an unquoted number (represent UNIX timestamp for `<START>` and `<END>`, and duration in seconds for `<STEP>`), or a quoted string (represent an RFC3339 timestamp for `<START>` and `<END>`, and duration in string format for `<STEP>`).

For example:

```sql
TQL EVAL (1676738180, 1676738780, '10s') sum(some_metric)
```

You can write this in all the places that support SQL, including the GreptimeDB HTTP API, SDK, PostgreSQL and MySQL client etc.