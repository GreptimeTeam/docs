---
keywords: [PromQL, Prometheus 查询语言, HTTP API, SQL 扩展, Grafana, Prometheus 替代品]
description: 介绍 GreptimeDB 对 Prometheus 查询语言（PromQL）的支持，包括 HTTP API 和 SQL 扩展。
---

# Prometheus Query Language

GreptimeDB 可以作为 Grafana 中 Prometheus 的替代品，因为 GreptimeDB 支持 PromQL（Prometheus Query Language）。GreptimeDB 在 Rust 中重新实现了 PromQL，并通过接口将能力开放，包括 Prometheus 的 HTTP API、GreptimeDB 的 HTTP API 和 SQL 接口。

## Prometheus 的 HTTP API

<!-- Maybe add a section to introduce the simulated interfaces, when there is -->
<!-- more than one supported -->

GreptimeDB 实现了兼容 Prometheus 的一系列 API，通过 `/v1/prometheus` 路径对外提
供服务：

- Instant queries `/api/v1/query`
- Range queries `/api/v1/query_range`
- Series `/api/v1/series`
- Label names `/api/v1/labels`
- Label values `/api/v1/label/<label_name>/values`

这些接口的输入和输出与原生的 Prometheus HTTP API 相同，用户可以把 GreptimeDB 当
作 Prometheus 的直接替换。例如，在 Grafana 中我们可以设置
`http://localhost:4000/v1/prometheus/` 作为其 Prometheus 数据源的地址。

访问 [Prometheus 文档](https://prometheus.io/docs/prometheus/latest/querying/api)
获得更详细的说明。

你可以通过设置 HTTP 请求的 `db` 参数来指定 GreptimeDB 中的数据库名。

例如，以下查询将返回 `public` 数据库中 `process_cpu_seconds_total` 指标的 CPU 使用率：

```shell
curl -X POST \
    -H 'Authorization: Basic {{authorization if exists}}' \
    --data-urlencode 'query=irate(process_cpu_seconds_total[1h])' \
    --data-urlencode 'start=2024-11-24T00:00:00Z' \
    --data-urlencode 'end=2024-11-25T00:00:00Z' \
    --data-urlencode 'step=1h' \
    --data-urlencode 'db=public' \
    http://localhost:4000/v1/prometheus/api/v1/query_range
```

如果你使用启用了身份验证的 GreptimeDB，则需要 Authorization header，请参阅[鉴权](/user-guide/protocols/http.md#鉴权)。
该 API 的查询字符串参数与原始 [Prometheus API](https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries) 的查询字符串参数相同，但额外的 `db` 参数除外，该参数指定了 GreptimeDB 数据库名称。

输出格式与 Prometheus API 完全兼容：

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

GreptimeDB 还扩展了 SQL 语法以支持 PromQL。可以用 `TQL`（Time-series Query Language）为关键字开始写入参数和进行查询。该语法如下：

```sql
TQL [EVAL|EVALUATE] (<START>, <END>, <STEP>) <QUERY>
```

`<START>` 指定查询开始时间范围，`<END>` 指定查询结束时间。 `<STEP>` 识别查询步幅。它们均可为无引号数字（表示`<START>`和`<END>`的 UNIX 时间戳，以及`<STEP>`的秒数持续时间），或带引号的字符串（表示`<START>`和`<END>`的 RFC3339 时间戳，以及`<STEP>`的字符串格式的持续时间）。

例如：

```sql
TQL EVAL (1676738180, 1676738780, '10s') sum(some_metric)
```

你可以在所有支持 SQL 的地方编写上述命令，包括 GreptimeDB HTTP API、SDK、PostgreSQL 和 MySQL 客户端等。

## GreptimeDB 的扩展

### 指定数值列

基于表模型，GreptimeDB 支持在单个表（或在 Prometheus 中称为指标）中查询多个字段。默认情况下，查询将应用于每个值字段 (field)。或者也可以使用特殊的过滤器 `__field__` 来查询特定的字段：

```promql
metric{__field__="field1"}
```

反选或正则表达式也都支持

```promql
metric{__field__!="field1"}

metric{__field__=~"field_1|field_2"}

metric{__field__!~"field_1|field_2"}
```

### 指定数据库

不同于 Prometheus，GreptimeDB 包含数据库概念。如果要进行跨数据库的 PromQL 查询，
可以使用 `__database__` 来指定数据库名称。

```promql
metric{__database__="mydatabase"}
```

注意 `__database__` 仅支持 `=` 匹配。

## 局限

尽管 GreptimeDB 支持丰富的数据类型，但 PromQL 的实现仍然局限于以下类型：

- timestamp: `Timestamp`
- tag: `String`
- value: `Double`

GreptimeDB 目前已实现了大部分（超过 90%）的 PromQL 功能。您可以在下方查看详细的兼容性列表，或者通过此 [issue](https://github.com/GreptimeTeam/greptimedb/issues/1042) 了解我们最新的功能支持情况。

### 字符（Literal）

支持字符串和浮点数，与 PromQL 的[规则](https://prometheus.io/docs/prometheus/latest/querying/basics/#literals)相同。

### 选择器

Instant 选择器和 Range 选择器均已支持。需要注意的是，在 Prometheus 和 GreptimeDB 中，指标名称的标签匹配有一个特殊限制：不支持反向匹配（例如 `{__name__!="request_count"}`）。但其他匹配方式，如等值匹配和正则匹配都是完全支持的。

时间区间和时间偏移修饰符均已支持，但目前尚未支持 `@` 修饰符。

当选择不存在的列时，它们将被视为一个所有值都为 `""` 的列。该行为与 Prometheus 和 VictoriaMetrics 一致。

### 时间精度

PromQL 的时间戳精度受制于查询语法的限制，最高只支持毫秒级精度的计算。然而，GreptimeDB 支持存储微秒和纳秒等高精度时间。在使用 PromQL 进行计算时，这些高精度时间将被隐式转换为毫秒精度进行计算。

### Binary

- 支持：
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

- 不支持：

无

### Aggregators

- 支持：
    | Aggregator   | Example                                      |
    | :----------- | :------------------------------------------- |
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

- 不支持：
    | Aggregator | Progress |
    | :--------- | :------- |
    | count      | TBD      |
    | grouping   | TBD      |

### Instant Functions

- 支持：
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
    | clamp              | `clamp(metric, 0, 1)`             |

- 不支持：
    | Function                   | Progress |
    | :------------------------- | :------- |
    | absent                     | TBD      |
    | sgn                        | TBD      |
    | deg                        | TBD      |
    | rad                        | TBD      |
    | *other multiple input fns* | TBD      |

### Range Functions

- 支持：
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

- 不支持：

无

### 其他函数

- 支持：
    | Function      | Example                                                                                           |
    | :------------ | :------------------------------------------------------------------------------------------------ |
    | label_join    | `label_join(up{job="api-server",src1="a",src2="b",src3="c"}, "foo", ",", "src1", "src2", "src3")` |
    | label_replace | `label_replace(up{job="api-server",service="a:c"}, "foo", "$1", "service", "(.*):.*")`            |

- 不支持：
    | Function           | Example |
    | :----------------- | :------ |
    | sort_by_label      | TBD     |
    | sort_by_label_desc | TBD     |
