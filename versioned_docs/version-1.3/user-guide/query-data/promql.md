---
keywords: [PromQL, Prometheus Query Language, HTTP API, SQL extensions, Grafana, Prometheus compatibility]
description: Guide on using Prometheus Query Language (PromQL) in GreptimeDB, including HTTP API compatibility, SQL extensions, and supported features and limitations.
---

# Prometheus Query Language

GreptimeDB implements PromQL in Rust and exposes it through the Prometheus HTTP API, the GreptimeDB HTTP API, and SQL. Grafana can connect through its Prometheus data source. See [Limitations](#limitations) for supported features and known differences.

## Prometheus' HTTP API

<!-- Maybe add a section to introduce the simulated interfaces, when there is more than one supported -->

GreptimeDB has implemented a set of Prometheus compatible APIs under HTTP
context `/v1/prometheus/`:

- Instant queries `/api/v1/query`
- Range queries `/api/v1/query_range`
- Series `/api/v1/series`
- Label names `/api/v1/labels`
- Label values `/api/v1/label/<label_name>/values`

These endpoints use Prometheus HTTP API request and response formats. In Grafana,
set the Prometheus data source URL to `http://localhost:4000/v1/prometheus/`.

Consult [Prometheus
documents](https://prometheus.io/docs/prometheus/latest/querying/api) for usage
of these API.

You can use additional query parameter `db` to specify GreptimeDB database name.

For example, the following query will return the CPU usage of the `process_cpu_seconds_total` metric in the `public` database:

```shell
curl -X POST \
    -H 'Authorization: Basic <base64-encoded-credentials>' \
    --data-urlencode 'query=irate(process_cpu_seconds_total[1h])' \
    --data-urlencode 'start=2024-11-24T00:00:00Z' \
    --data-urlencode 'end=2024-11-25T00:00:00Z' \
    --data-urlencode 'step=1h' \
    'http://localhost:4000/v1/prometheus/api/v1/query_range?db=public'
```
If authentication is enabled in GreptimeDB, the authentication header is required. Refer to the [authentication documentation](/user-guide/protocols/http.md#authentication) for more details.
You need to either set it in the HTTP URL query param `db` like the example above, or set it using `--header 'x-greptime-db-name: <database name>'` as HTTP header.

The query string parameters for the API are identical to those of the original [Prometheus API](https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries), with the exception of the additional `db` parameter, which specifies the GreptimeDB database name.

The output format is compatible with the Prometheus API:

```json
{
  "status": "success",
  "data": {
    "resultType": "matrix",
    "result": [
      {
        "metric": {
          "job": "node",
          "instance": "node_exporter:9100",
          "__name__": "process_cpu_seconds_total"
        },
        "values": [
          [
            1732618800,
            "0.0022222222222222734"
          ],
          [
            1732622400,
            "0.0009999999999999788"
          ],
          [
            1732626000,
            "0.0029999999999997585"
          ],
          [
            1732629600,
            "0.002222222222222175"
          ]
        ]
      }
    ]
  }
}
```

## SQL

GreptimeDB also extends SQL grammar to support PromQL. You can start with the `TQL` (Time-series Query Language) keyword to write parameters and queries. The grammar looks like this:

```sql
TQL [EVAL|EVALUATE] (<START>, <END>, <STEP>) <QUERY>
```

`<START>` specifies the query start range and `<END>` specifies the end time. `<STEP>` identifies the query resolution step width. All of them can either be an unquoted number (represent UNIX timestamp for `<START>` and `<END>`, and duration in seconds for `<STEP>`), or a quoted string (represent an RFC3339 timestamp for `<START>` and `<END>`, and duration in string format for `<STEP>`).

For example:

```sql
TQL EVAL (1676738180, 1676738780, '10s') sum(some_metric)
```

You can write the above command in all places that support SQL, including the GreptimeDB HTTP API, SDK, PostgreSQL and MySQL client etc.

## GreptimeDB's extensions to PromQL

### Specifying value field

Based on the table model, GreptimeDB supports multiple fields in a single table(or metric, in the context of Prometheus). Queries will run on every fields by default. Or you can use the special filter `__field__` to query a specific field(s):

```promql
metric{__field__="field1"}
```

Exclude or regex are also supported:

```promql
metric{__field__!="field1"}

metric{__field__=~"field_1|field_2"}

metric{__field__!~"field_1|field_2"}
```

### Cross-database query

Greptime has its own database concept. In order to run cross-database query, you
can use `__database__` matcher to specify the database name.

```promql
metric{__database__="mydatabase"}
```

Note that only `=` is supported for database matcher.

## Limitations

PromQL queries support float samples and native histogram samples. Float metrics use a timestamp column, string labels, and `Double` values. Native histogram support and ingestion requirements are described in [Native histograms](/user-guide/ingest-data/for-observability/prometheus.md#native-histograms).

### v1.3.0 compatibility test results

The [v1.3.0 release measurements](https://github.com/GreptimeTeam/greptimedb/releases/tag/v1.3.0) use [promql-compat revision `1203cd8`](https://github.com/GreptimeTeam/promql-compat/tree/1203cd8d1abec9934830d913a88fa0a9d014a5d1) with Prometheus v3.15.0 as the reference. The target is GreptimeDB v1.3.0.

| Test suite | Cases counted | Cases excluded | Including `__name__` | Ignoring only `__name__` |
| --- | ---: | ---: | ---: | ---: |
| Prometheus test corpus | 852 | 1391 | 53.52% (456/852) | 88.50% (754/852) |
| Prometheus compliance queries | 539 | 0 | 54.17% (292/539) | 94.81% (511/539) |
| Generated queries (seed 1) | 1999 | 1 | 63.83% (1276/1999) | 93.35% (1866/1999) |

Percentages are test-case pass rates, with excluded cases omitted from the denominators; the last column ignores differences only in `__name__`. See the [promql-compat methodology](https://github.com/GreptimeTeam/promql-compat/blob/1203cd8d1abec9934830d913a88fa0a9d014a5d1/README.md#report).

### Known differences in v1.3.0

| Query behavior | Example | Difference from Prometheus |
| --- | --- | --- |
| Metric-name labels in function and aggregation results | `rate(x[1m])`, `avg_over_time(x[5m])`, `abs(x)`, `sum(rate(x[1m]))` | GreptimeDB retains `__name__` in these results; Prometheus removes it. This also affects `histogram_quantile` results, Grafana legends, and labels consumed by alerting and recording rules. The behavior also exists in v1.2.1. |
| Date functions with an argument | `year(vector(1136239445))` | Uses sample timestamps instead of sample values. At a query time in 2026, this returns `2026`; Prometheus interprets the value as Unix seconds and returns `2006`. The same issue affects `month`, `day_of_month`, `day_of_week`, `day_of_year`, `days_in_month`, `hour`, and `minute`. |
| Selectors without a metric name | `{job="demo"}` | Returns `Expect a metric matcher, but not found`. A metric name or an explicit `__name__` matcher is required. |
| `vector(time())` | `vector(time())` | Fails with `Invalid function argument for unknown` in both instant and range queries, including when used alone. |
| `absent_over_time` | `absent_over_time(nonexistent_metric[5m])` | Some queries return different series than Prometheus: expected series can be missing, or extra series can appear. This example returns no series; Prometheus returns a series with value `1`. |
| Dynamic scalar parameters | `topk(scalar(foo), x)`, `quantile_over_time(scalar(foo), x[5m])` | Some uses of `scalar()` as a parameter fail planning. |
| `first_over_time` | `first_over_time(x[5m])` | Returns `Unsupported expr type`; the function is not implemented. |
| Duplicate label sets | `ceil({__name__=~"testmetric1\|testmetric2"})`, `-{__name__=~"testmetric1\|testmetric2"}` | Prometheus rejects duplicate label sets after removing metric names. GreptimeDB can retain the names or return duplicate label sets without an error. |
| Duplicate vector matches | `scalar_metric > on() dup_metric` | Can return a result when Prometheus rejects duplicate matches. With `scalar_metric{} = 3` and two `dup_metric` series with different labels and values `1` and `2`, GreptimeDB returns `{} => 3`. |
| Reversed `clamp` bounds | `clamp(x, 10, 1)` | Returns an execution error; Prometheus returns an empty result. |
| UTF-8 destination labels | `label_replace(x, "~invalid", "v", "__name__", ".*")` | Rejects the destination label name; Prometheus 3 accepts it as a UTF-8 label name. |

Examples using `x` require an existing float metric with samples in the queried interval; `foo` has one series. The duplicate-label examples use `testmetric1` and `testmetric2` with identical labels other than `__name__` and samples at the same timestamp. `nonexistent_metric` must not exist.

### Literal

Both string and float literals are supported, with the same [rule](https://prometheus.io/docs/prometheus/latest/querying/basics/#literals) as PromQL.

### Selector

Instant and range selectors require a metric name or an explicit `__name__` matcher. A selector with only ordinary labels, such as `{job="demo"}`, returns an error. Metric-name matching has the following restrictions:

- In [`TQL`](#sql), only equal-matching is supported, for example `{__name__="request_count"}`.
- The [Prometheus HTTP API](#prometheus-http-api) also supports regex-matching and negative matching, for example `{__name__=~"request_.*"}` or `{__name__!="request_count", host="h1"}`. These matchers only match tables created by the metric engine, such as tables written through Prometheus Remote Write.

Time duration, offset, and `@` modifier (including `@ start()` and `@ end()`) are supported.

Subqueries support an explicit step; an omitted step defaults to one minute, independently of the outer query step. Use `[range:step]` for another interval. Instant queries can return range vectors; range queries reject a range-vector root expression.

When selecting non-existent columns, they will be treated as columns filled with empty string values (`""`). This behavior aligns with both Prometheus and VictoriaMetrics.

### Timestamp precision

PromQL evaluation times and steps use millisecond precision. Sample selection preserves stored microsecond or nanosecond timestamps; `timestamp()` converts the selected sample timestamp to milliseconds, then returns floating-point seconds.

### Binary

- Supported:
    | Operator |
    | :------- |
    | `+` |
    | `-` |
    | `*` |
    | `/` |
    | `%` |
    | `==` |
    | `!=` |
    | `>` |
    | `<` |
    | `>=` |
    | `<=` |
    | `^` |
    | atan2    |
    | and      |
    | or       |
    | unless   |

Vector matching supports `on`, `ignoring`, `group_left`, and `group_right`. Some duplicate matches and duplicate label sets are not rejected; see [Known differences in v1.3.0](#known-differences-in-v130) for examples.

### Aggregators

- Supported:
    | Aggregator   | Example                                      |
    | :----------- | :------------------------------------------- |
    | group        | `group by (foo)(metric)` |
    | sum          | `sum by (foo)(metric)`                       |
    | avg          | `avg by (foo)(metric)`                       |
    | min          | `min by (foo)(metric)`                       |
    | max          | `max by (foo)(metric)`                       |
    | stddev       | `stddev by (foo)(metric)`                    |
    | stdvar       | `stdvar by (foo)(metric)`                    |
    | topk         | `topk(3, rate(instance_cpu_time_ns[5m]))`    |
    | bottomk      | `bottomk(3, rate(instance_cpu_time_ns[5m]))` |
    | count_values | `count_values("version", build_version)`     |
    | count        | `count (metric)`                             |
    | quantile     | `quantile(0.9, cpu_usage)`                   |

### Instant Functions

The following functions are implemented; behavior differences and argument limits are listed under [Known differences in v1.3.0](#known-differences-in-v130). `histogram_count`, `histogram_sum`, `histogram_avg`, `histogram_stddev`, and `histogram_stdvar` operate on native histogram samples.

- Supported:
    | Function           | Example                           |
    | :----------------- | :-------------------------------- |
    | round | `round(metric)` |
    | vector | `vector(1)` |
    | time | `time()` |
    | year | `year()` |
    | month | `month()` |
    | day_of_month | `day_of_month()` |
    | day_of_week | `day_of_week()` |
    | day_of_year | `day_of_year()` |
    | days_in_month | `days_in_month()` |
    | hour | `hour()` |
    | minute | `minute()` |
    | abs                | `abs(metric)`                     |
    | ceil               | `ceil(metric)`                    |
    | exp                | `exp(metric)`                     |
    | ln                 | `ln(metric)`                      |
    | log2               | `log2(metric)`                    |
    | log10              | `log10(metric)`                   |
    | sqrt               | `sqrt(metric)`                    |
    | acos               | `acos(metric)`                    |
    | asin               | `asin(metric)`                    |
    | atan               | `atan(metric)`                    |
    | sin                | `sin(metric)`                     |
    | cos                | `cos(metric)`                     |
    | tan                | `tan(metric)`                     |
    | acosh              | `acosh(metric)`                   |
    | asinh              | `asinh(metric)`                   |
    | atanh              | `atanh(metric)`                   |
    | sinh               | `sinh(metric)`                    |
    | cosh               | `cosh(metric)`                    |
    | scalar             | `scalar(metric)`                  |
    | tanh               | `tanh(metric)`                    |
    | timestamp          | `timestamp(metric)`               |
    | sort               | `sort(http_requests_total)`       |
    | sort_desc          | `sort_desc(http_requests_total)`  |
    | histogram_fraction | `histogram_fraction(0, 1, request_duration)` |
    | histogram_count | `histogram_count(request_duration)` |
    | histogram_sum | `histogram_sum(request_duration)` |
    | histogram_avg | `histogram_avg(request_duration)` |
    | histogram_stddev | `histogram_stddev(request_duration)` |
    | histogram_stdvar | `histogram_stdvar(request_duration)` |
    | histogram_quantile | `histogram_quantile(phi, metric)` |
    | predict_linear     | `predict_linear(metric[5m], 120)` |
    | absent             | `absent(nonexistent{job="myjob"})`|
    | sgn                | `sgn(metric)`                     |
    | pi                 | `pi()`                            |
    | deg                | `deg(metric)`                     |
    | rad                | `rad(metric)`                     |
    | floor              | `floor(metric)`                   |
    | clamp              | `clamp(metric, 0, 12)`            |
    | clamp_max          | `clamp_max(metric, 12)`           |
    | clamp_min          | `clamp_min(metric, 0)`            |

### Range Functions

See [Known differences in v1.3.0](#known-differences-in-v130) for `absent_over_time` behavior and the unimplemented `first_over_time`.

- Supported:
    | Function           | Example                        |
    | :----------------- | :----------------------------- |
    | idelta             | `idelta(metric[5m])`           |
    | avg_over_time | `avg_over_time(metric[5m])` |
    | min_over_time | `min_over_time(metric[5m])` |
    | max_over_time | `max_over_time(metric[5m])` |
    | sum_over_time | `sum_over_time(metric[5m])` |
    | count_over_time | `count_over_time(metric[5m])` |
    | last_over_time | `last_over_time(metric[5m])` |
    | present_over_time | `present_over_time(metric[5m])` |
    | quantile_over_time | `quantile_over_time(0.9, metric[5m])` |
    | stddev_over_time   | `stddev_over_time(metric[5m])` |
    | stdvar_over_time   | `stdvar_over_time(metric[5m])` |
    | changes            | `changes(metric[5m])`          |
    | delta              | `delta(metric[5m])`            |
    | rate               | `rate(metric[5m])`             |
    | deriv              | `deriv(metric[5m])`            |
    | increase           | `increase(metric[5m])`         |
    | irate              | `irate(metric[5m])`            |
    | resets             | `resets(metric[5m])`           |

### Label & Other Functions

- Supported:
    | Function      | Example                                                                                           |
    | :------------ | :------------------------------------------------------------------------------------------------ |
    | label_join    | `label_join(up{job="api-server",src1="a",src2="b",src3="c"}, "foo", ",", "src1", "src2", "src3")` |
    | label_replace | `label_replace(up{job="api-server",service="a:c"}, "foo", "$1", "service", "(.*):.*")`            |
    | sort_by_label | `sort_by_label(metric, "foo", "bar")`            |
    | sort_by_label_desc | `sort_by_label_desc(metric, "foo", "bar")`            |
