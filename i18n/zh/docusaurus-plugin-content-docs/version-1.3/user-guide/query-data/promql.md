---
keywords: [PromQL, Prometheus 查询语言, HTTP API, SQL 扩展, Grafana, Prometheus 替代品]
description: 介绍 GreptimeDB 对 Prometheus 查询语言（PromQL）的支持，包括 HTTP API 和 SQL 扩展。
---

# Prometheus Query Language

GreptimeDB 提供基于 Rust 的 PromQL 实现，可通过 Prometheus HTTP API、GreptimeDB HTTP API 和 SQL 接口查询。Grafana 可通过 Prometheus 数据源连接 GreptimeDB。支持范围与已知差异见[局限](#局限)。

<AnchorAlias id="prometheus-http-api" />

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

这些接口使用 Prometheus HTTP API 的请求和响应格式。在 Grafana 中，将
`http://localhost:4000/v1/prometheus/` 设置为 Prometheus 数据源地址。

访问 [Prometheus 文档](https://prometheus.io/docs/prometheus/latest/querying/api)
获得更详细的说明。

你可以通过设置 HTTP 请求的 `db` 参数来指定 GreptimeDB 中的数据库名。

例如，以下查询将返回 `public` 数据库中 `process_cpu_seconds_total` 指标的 CPU 使用率：

```shell
curl -X POST \
    -H 'Authorization: Basic <base64-encoded-credentials>' \
    --data-urlencode 'query=irate(process_cpu_seconds_total[1h])' \
    --data-urlencode 'start=2024-11-24T00:00:00Z' \
    --data-urlencode 'end=2024-11-25T00:00:00Z' \
    --data-urlencode 'step=1h' \
    'http://localhost:4000/v1/prometheus/api/v1/query_range?db=public'
```

如果你使用启用了身份验证的 GreptimeDB，则需要 Authorization header，请参阅[鉴权](/user-guide/protocols/http.md#鉴权)。
该 API 的查询字符串参数与原始 [Prometheus API](https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries) 的查询字符串参数相同。
你需要在 HTTP 的 query param 设置 `db` 参数，或者通过 `--header 'x-greptime-db-name: <database name>'` 设置在 HTTP 请求头中。

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

PromQL 查询支持浮点样本和原生直方图样本。浮点指标使用时间戳列、字符串标签和 `Double` 值。原生直方图的支持范围和写入要求见[原生直方图](/user-guide/ingest-data/for-observability/prometheus.md#原生直方图)。

### v1.3.0 兼容性测试结果

[v1.3.0 发布测试](https://github.com/GreptimeTeam/greptimedb/releases/tag/v1.3.0)使用 [promql-compat `1203cd8`](https://github.com/GreptimeTeam/promql-compat/tree/1203cd8d1abec9934830d913a88fa0a9d014a5d1)，以 Prometheus v3.15.0 为参考。测试对象为 GreptimeDB v1.3.0。

| 测试集 | 计入统计的用例 | 排除的用例 | 比较 `__name__` | 仅忽略 `__name__` 差异 |
| --- | ---: | ---: | ---: | ---: |
| Prometheus 测试用例集 | 852 | 1391 | 53.52% (456/852) | 88.50% (754/852) |
| Prometheus compliance 查询集 | 539 | 0 | 54.17% (292/539) | 94.81% (511/539) |
| 随机生成的查询（seed 1） | 1999 | 1 | 63.83% (1276/1999) | 93.35% (1866/1999) |

百分比表示计入统计的**测试用例通过率**，不是已实现的 PromQL 函数占比。一个用例中的所有检查都通过，才计为通过。Prometheus 用例集采用上游的预期结果，并包含 `@` 变体和范围查询检查。Compliance 查询集将每条查询在三个时刻和两个时间范围内的结果与内嵌 Prometheus 引擎比较；随机查询使用同一引擎和测试数据集。

两种通过率都比较结果类型、时间戳、标签和样本值。「仅忽略 `__name__` 差异」一列只允许指标名称标签 `__name__` 不同，其他标签仍须匹配。查询可能返回相同的数值，但结果标签不同，影响后续按标签匹配和告警输出。

比较允许浮点误差。双方都返回空结果或错误也计为通过；错误消息文本、warning/info 注解和 matrix 中的序列排列顺序不影响通过率。数值容差见[测试工具的比较规则](https://github.com/GreptimeTeam/promql-compat/blob/1203cd8d1abec9934830d913a88fa0a9d014a5d1/README.md#limitations)。

排除的用例不计入任一列的分母。Prometheus 用例集排除了原生直方图、实验性特性、起始时间戳和延迟移除指标名称的相关用例；另有一条随机查询因参考结果在多次运行间不一致而被排除。这些通过率不衡量原生直方图兼容性，也不代表某组仪表盘或告警规则的通过率。

### v1.3.0 已知差异

| 查询行为 | 与 Prometheus 的差异 |
| --- | --- |
| 指标名称标签 | 部分表达式会保留或重新附加 Prometheus 已移除的 `__name__`。例如，`sum(x > 0)` 可能返回 `{__name__="x"}`，而不是 `{}`。 |
| `first_over_time` | 尚未实现。 |
| `absent_over_time` | 已实现，但部分空窗口查询不返回序列，而不是预期的值 `1` 及对应标签。 |
| 嵌套表达式中的 `vector(time())` | 部分组合无法生成执行计划，例如 `sum_over_time(vector(time())[100s:1s] @ 3000)`。 |
| 动态 scalar 参数 | 将 `scalar()` 用作 `quantile_over_time` 或 `topk` 的参数时，部分查询无法生成执行计划。 |

### 字面量

支持字符串和浮点数，与 PromQL 的[规则](https://prometheus.io/docs/prometheus/latest/querying/basics/#literals)相同。

### 选择器

Instant 选择器和 Range 选择器均已支持。指标名称（`__name__`）的标签匹配有以下限制：

- 在 [`TQL`](#sql) 中只支持等值匹配，例如 `{__name__="request_count"}`。
- [Prometheus HTTP API](#prometheus-的-http-api) 还支持正则匹配和反向匹配，例如 `{__name__=~"request_.*"}` 或 `{__name__!="request_count", host="h1"}`。这些匹配只作用于 metric engine 创建的表，例如通过 Prometheus Remote Write 写入的表。

时间区间、时间偏移修饰符和 `@` 修饰符（包括 `@ start()` 和 `@ end()`）均已支持。

子查询支持显式步长；省略步长时使用固定的 1 分钟，与外层查询步长无关。需要其他步长时使用 `[range:step]`。瞬时查询可返回 range vector；范围查询不接受 range-vector 根表达式。

当选择不存在的列时，它们将被视为一个所有值都为 `""` 的列。该行为与 Prometheus 和 VictoriaMetrics 一致。

### 时间精度

PromQL 的求值时刻和步长使用毫秒精度。样本选择保留存储的微秒或纳秒时间戳；`timestamp()` 将选中样本的时间戳转换到毫秒，再以秒为单位返回浮点数。

### Binary

- 支持：
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

支持 `on`、`ignoring`、`group_left` 和 `group_right` 向量匹配修饰符。算术和比较运算会拒绝不允许的多对多匹配，以及产生重复标签集的结果。

### Aggregators

- 支持：
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

以下列表包含已实现的函数；已知组合限制见 [v1.3.0 已知差异](#v130-已知差异)。`histogram_count`、`histogram_sum`、`histogram_avg`、`histogram_stddev` 和 `histogram_stdvar` 用于原生直方图样本。

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

`absent_over_time` 的行为差异和未实现的 `first_over_time` 见 [v1.3.0 已知差异](#v130-已知差异)。

- 支持：
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

### Label 及其他函数

- 支持：
    | Function      | Example                                                                                           |
    | :------------ | :------------------------------------------------------------------------------------------------ |
    | label_join    | `label_join(up{job="api-server",src1="a",src2="b",src3="c"}, "foo", ",", "src1", "src2", "src3")` |
    | label_replace | `label_replace(up{job="api-server",service="a:c"}, "foo", "$1", "service", "(.*):.*")`            |
    | sort_by_label | `sort_by_label(metric, "foo", "bar")`            |
    | sort_by_label_desc | `sort_by_label_desc(metric, "foo", "bar")`            |
