---
keywords: [PromQL, Prometheus Query Language, HTTP API, SQL extensions, Grafana, Prometheus compatibility]
description: Guide on using Prometheus Query Language (PromQL) in GreptimeDB, including HTTP API compatibility, SQL extensions, and supported features and limitations.
---

# Prometheus Query Language

GreptimeDB can be used as a drop-in replacement for Prometheus in Grafana, because GreptimeDB supports PromQL (Prometheus Query Language). GreptimeDB has reimplemented PromQL natively in Rust and exposes the ability to several interfaces, including the HTTP API of Prometheus, the HTTP API of GreptimeDB, and the SQL interface.

## Prometheus' HTTP API

<!-- Maybe add a section to introduce the simulated interfaces, when there is more than one supported -->

GreptimeDB has implemented a set of Prometheus compatible APIs under HTTP
context `/v1/prometheus/`:

- Instant queries `/api/v1/query`
- Range queries `/api/v1/query_range`
- Series `/api/v1/series`
- Label names `/api/v1/labels`
- Label values `/api/v1/label/<label_name>/values`

It shares same input and output format with original Prometheus HTTP API. You
can also use GreptimeDB as an in-place replacement of Prometheus. For example in
Grafana Prometheus data source, set `http://localhost:4000/v1/prometheus/` as
context root of Prometheus URL.

Consult [Prometheus
documents](https://prometheus.io/docs/prometheus/latest/querying/api) for usage
of these API.

You can use additional query parameter `db` to specify GreptimeDB database name.

For example, the following query will return the CPU usage of the `process_cpu_seconds_total` metric in the `public` database:

```shell
curl -X POST \
    -H 'Authorization: Basic {{authorization if exists}}' \
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

Though GreptimeDB supports a rich set of data types, the PromQL implementation is still limited to the following types:

- timestamp: `Timestamp`
- tag: `String`
- value: `Double`

We have over 90% promql supported in GreptimeDB. Here attaches the compatibility list. You can also check our latest compliance report in this [tracking issue](https://github.com/GreptimeTeam/greptimedb/issues/1042).

### Literal

Both string and float literals are supported, with the same [rule](https://prometheus.io/docs/prometheus/latest/querying/basics/#literals) as PromQL.

### Selector

Both instant and range selector are supported. But notice that in both Prometheus and GreptimeDB, the label matching on metric name is an exception. Negative matching (e.g. `{__name__!="request_count}"`) is not allowed. Others like equal-matching or regex-matching are supported.

Time duration and offset are supported, but `@` modifier is not supported yet.

When selecting non-existent columns, they will be treated as columns filled with empty string values (`""`). This behavior aligns with both Prometheus and VictoriaMetrics.

### Timestamp precision

The timestamp precision in PromQL is limited by its query syntax, only supporting calculations up to millisecond precision. However, GreptimeDB supports storing high-precision timestamps, such as microseconds and nanoseconds. When using PromQL for calculations, these high-precision timestamps are implicitly converted to millisecond precision.

### Binary

- Supported:
    | Operator |
    | :------- |
    | add      |
    | sub      |
    | mul      |
    | div      |
    | mod      |
    | eqlc     |
    | neq      |
    | gtr      |
    | lss      |
    | gte      |
    | lte      |
    | power    |
    | atan2    |
    | and      |
    | or       |
    | unless   |

- Unsupported:

None

### Aggregators

- Supported:
    | Aggregator | Example                   |
    | :--------- | :------------------------ |
    | sum          | `sum by (foo)(metric)`    |
    | avg          | `avg by (foo)(metric)`    |
    | min          | `min by (foo)(metric)`    |
    | max          | `max by (foo)(metric)`    |
    | stddev       | `stddev by (foo)(metric)` |
    | stdvar       | `stdvar by (foo)(metric)` |
    | topk         | `topk(3, rate(instance_cpu_time_ns[5m]))`   |
    | bottomk      | `bottomk(3, rate(instance_cpu_time_ns[5m]))`|
    | count_values | `count_values("version", build_version)`    |
    | quantile     | `quantile(0.9, cpu_usage)` |

- Unsupported:
    | Aggregator   | Progress |
    | :----------- | :------- |
    | count        | TBD      |
    | grouping     | TBD      |

### Instant Functions

- Supported:
    | Function           | Example                           |
    | :----------------- | :-------------------------------- |
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
    | timestamp          | `timestamp()`                     |
    | sort               | `sort(http_requests_total)`       |
    | sort_desc          | `sort_desc(http_requests_total)`  |
    | histogram_quantile | `histogram_quantile(phi, metric)` |

- Unsupported:
    | Function                   | Progress / Example |
    | :------------------------- | :----------------- |
    | absent                     | TBD                |
    | sgn                        | TBD                |
    | deg                        | TBD                |
    | rad                        | TBD                |
    | *other multiple input fns* | TBD                |

### Range Functions

- Supported:
    | Function           | Example                        |
    | :----------------- | :----------------------------- |
    | idelta             | `idelta(metric[5m])`           |
    | \<aggr\>_over_time | `count_over_time(metric[5m])`  |
    | stddev_over_time   | `stddev_over_time(metric[5m])` |
    | stdvar_over_time   | `stdvar_over_time(metric[5m])` |
    | changes            | `changes(metric[5m])`          |
    | delta              | `delta(metric[5m])`            |
    | rate               | `rate(metric[5m])`             |
    | deriv              | `deriv(metric[5m])`            |
    | increase           | `increase(metric[5m])`         |
    | irate              | `irate(metric[5m])`            |
    | reset              | `reset(metric[5m])`            |

- Unsupported:

None

### Other Functions

- Supported:
    | Function           | Example                        |
    | :----------------- | :----------------------------- |
    | label_join             | `label_join(up{job="api-server",src1="a",src2="b",src3="c"}, "foo", ",", "src1", "src2", "src3")`           |
    | label_replace | `label_replace(up{job="api-server",service="a:c"}, "foo", "$1", "service", "(.*):.*")`  |

- Unsupported:
    | Function           | Example                        |
    | :----------------- | :----------------------------- |
    | sort_by_label      | TBD           |
    | sort_by_label_desc | TBD           |
