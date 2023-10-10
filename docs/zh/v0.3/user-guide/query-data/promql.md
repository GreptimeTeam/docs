# Prometheus Query Language

GreptimeDB 可以作为 Grafana 中 Prometheus 的替代品，因为 GreptimeDB 支持 PromQL（Prometheus Query Language）。GreptimeDB 在 Rust 中重新实现了 PromQL，并通过接口将能力开放，包括 Prometheus 的 HTTP API、GreptimeDB 的 HTTP API 和 SQL 接口。

## Prometheus 的 HTTP API

<!-- Maybe add a section to introduce the simulated interfaces, when there is -->
<!-- more than one supported -->

GreptimeDB 实现了兼容 Prometheus 的一系列 API ，通过 `/v1/prometheus` 路径对外提
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

## GreptimeDB 的 HTTP API

GreptimeDB 同样暴露了一个自己的 HTTP API 用于 PromQL 查询，即在当前的 API 路径 `/v1` 的后方拼接 `/promql`，如下示例：

```shell
curl -X GET \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -G \
  --data-urlencode 'db=public' \
  --data-urlencode 'query=avg(system_metrics{idc="idc_a"})' \
  --data-urlencode 'start=1667446797' \
  --data-urlencode 'end=1667446799' \
  --data-urlencode 'step=1s' \
  http://localhost:4000/v1/promql
```

接口中的参数和 Prometheus' HTTP API 的 [`range_query`](https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries) 接口相似：

- `db=<database>`：在使用 GreptimeDB 进行鉴权操作时必填。
- `query=<string>`：必填。Prometheus 表达式查询字符串。
- `start=<rfc3339 | unix_timestamp>`：必填。开始时间戳，包含在内。它用于设置 `TIME INDEX` 列中的时间范围。
- `end=<rfc3339 | unix_timestamp>`：必填。结束时间戳，包含在内。它用于设置 `TIME INDEX` 列中的时间范围。
- `step=<duration | float>`：必填。查询步长，可以使用持续时间格式或秒数的浮点数。

以下是每种参数的类型的示例：

- rfc3339
  - `2015-07-01T20:11:00Z` (default to seconds resolution)
  - `2015-07-01T20:11:00.781Z` (with milliseconds resolution)
  - `2015-07-02T04:11:00+08:00` (with timezone offset)
- unix timestamp
  - `1435781460` (default to seconds resolution)
  - `1435781460.781` (with milliseconds resolution)
- duration
  - `1h` (1 hour)
  - `5d1m` (5 days and 1 minute)
  - `2` (2 seconds)
  - `2s` (also 2 seconds)

结果格式与[HTTP 协议](sql.md#http-api)中描述的 `/sql` 接口相同。

```json
{
  "code": 0,
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "ts",
              "data_type": "TimestampMillisecond"
            },
            {
              "name": "AVG(system_metrics.cpu_util)",
              "data_type": "Float64"
            },
            {
              "name": "AVG(system_metrics.memory_util)",
              "data_type": "Float64"
            },
            {
              "name": "AVG(system_metrics.disk_util)",
              "data_type": "Float64"
            }
          ]
        },
        "rows": [
          [
            1667446798000,
            80.1,
            70.3,
            90
          ],
          [
            1667446799000,
            80.1,
            70.3,
            90
          ]
        ]
      }
    }
  ],
  "execution_time_ms": 5
}
```
<!-- TODO New paths that compatible with Promethues APIs -->

## SQL

GreptimeDB 还扩展了 SQL 语法以支持 PromQL。可以用 `TQL`（Time-series Query Language）为关键字开始写入参数和进行查询。该语法如下：

```sql
TQL [EVAL|EVALUATE] (<START>, <END>, <STEP>) <QUERY>
```

`<START>` 指定查询开始时间范围，`<END>` 指定查询结束时间。 `<STEP>` 识别查询步幅。它们均可为无引号数字（表示`<START>`和`<END>`的 UNIX 时间戳，以及`<STEP>`的秒数持续时间），或带引号的字符串（表示`<START>`和`<END>`的 RFC3339 时间戳，以及`<STEP>`的字符串格式的持续时间）。

例如:

```sql
TQL EVAL (1676738180, 1676738780, '10s') sum(some_metric)
```

你可以在所有支持 SQL 的地方编写上述命令，包括 GreptimeDB HTTP API、SDK、PostgreSQL 和 MySQL 客户端等。

## 局限

尽管 GreptimeDB 支持丰富的数据类型，但 PromQL 的实现仍然局限于以下类型：

- timestamp: `Timestamp`
- tag: `String`
- value: `Double`

目前 GreptimeDB 只支持 PromQL 的一个子集，下方附上了兼容性列表。你也可以在[跟踪问题](https://github.com/GreptimeTeam/greptimedb/issues/1042)中查看我们最新的兼容性报告。

### 字符（Literal）

支持字符串和浮点数，与 PromQL 的[规则](https://prometheus.io/docs/prometheus/latest/querying/basics/#literals)相同。

### 选择器

- 支持即时和范围选择器，但唯独不支持 `label` 和指标名字的不匹配判断，例如 `{__name__!="request_count}"`，等价匹配的情况是支持的，例如 `{__name__="request_count}"`。
- 支持时间长度和偏移量，但不支持 `@` 修改器。

### Binary

*目前还不支持像 `1+1` 这样纯粹的 binary 表达式。*

- 支持:
    | Operator | Example  |
    | :------- | :------- |
    | add      | `a + b`  |
    | sub      | `a - b`  |
    | mul      | `a * b`  |
    | div      | `a / b`  |
    | mod      | `a % b`  |
    | eqlc     | `a == b` |
    | neq      | `a != b` |
    | gtr      | `a > b`  |
    | lss      | `a < b`  |
    | gte      | `a >= b` |
    | lte      | `a <= b` |

- 不支持:
    | Operator | Progress |
    | :------- | :------- |
    | power    | TBD      |
    | atan2    | TBD      |
    | and      | TBD      |
    | or       | TBD      |
    | unless   | TBD      |

### Aggregators

- 支持:
    | Aggregator | Example                   |
    | :--------- | :------------------------ |
    | sum        | `sum by (foo)(metric)`    |
    | avg        | `avg by (foo)(metric)`    |
    | min        | `min by (foo)(metric)`    |
    | max        | `max by (foo)(metric)`    |
    | stddev     | `stddev by (foo)(metric)` |
    | stdvar     | `stdvar by (foo)(metric)` |

- 不支持:
    | Aggregator   | Progress |
    | :----------- | :------- |
    | count        | TBD      |
    | grouping     | TBD      |
    | topk         | TBD      |
    | bottomk      | TBD      |
    | count_values | TBD      |
    | quantile     | TBD      |

### Instant Functions

- 支持:
    | Function | Example         |
    | :------- | :-------------- |
    | abs      | `abs(metric)`   |
    | ceil     | `ceil(metric)`  |
    | exp      | `exp(metric)`   |
    | ln       | `ln(metric)`    |
    | log2     | `log2(metric)`  |
    | log10    | `log10(metric)` |
    | sqrt     | `sqrt(metric)`  |
    | acos     | `acos(metric)`  |
    | asin     | `asin(metric)`  |
    | atan     | `atan(metric)`  |
    | sin      | `sin(metric)`   |
    | cos      | `cos(metric)`   |
    | tan      | `tan(metric)`   |

- 不支持:
    | Function                   | Progress |
    | :------------------------- | :------- |
    | absent                     | TBD      |
    | scalar                     | TBD      |
    | sgn                        | TBD      |
    | sort                       | TBD      |
    | sort_desc                  | TBD      |
    | timestamp                  | TBD      |
    | acosh                      | TBD      |
    | asinh                      | TBD      |
    | atanh                      | TBD      |
    | sinh                       | TBD      |
    | cosh                       | TBD      |
    | tanh                       | TBD      |
    | deg                        | TBD      |
    | rad                        | TBD      |
    | *other multiple input fns* | TBD      |

### Range Functions

- 支持:
    | Function           | Example                       |
    | :----------------- | :---------------------------- |
    | idelta             | `idelta(metric[5m])`          |
    | \<aggr\>_over_time | `count_over_time(metric[5m])` |

- 不支持:
    | Function         | Example |
    | :--------------- | :------ |
    | stddev_over_time | TBD     |
    | stdvar_over_time | TBD     |
    | changes          | TBD     |
    | delta            | TBD     |
    | rate             | TBD     |
    | deriv            | TBD     |
    | increase         | TBD     |
    | idelta           | TBD     |
    | irate            | TBD     |
    | reset            | TBD     |
