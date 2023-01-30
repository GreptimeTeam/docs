# PromQL

## Introduction

PromQL is the query language for Prometheus. It is a powerful and flexible language that can be used to retrieve data for alerting, graphing, and analysis.

GreptimeDB has reimplemented PromQL in Rust, here is the compatibility list.

## Compatibility List

### Overview

- Basics
  - [Literal](#literal)
  - [Selector](#selector)
  - Subquery (unsupport)
- Operators
  - [Binary Operators](#binary-operators)
  - Vector Matching (unsupport)
  - [Aggregation Operators](#aggregators)
- Funtions
  - [Instant Functions](#instant-functions)
  - [Range Functions](#range-functions)
  - Others (unsupport)


### Literal

Both string and float literals are supported, with the same [rule](https://prometheus.io/docs/prometheus/latest/querying/basics/#literals) as PromQL.

### Selector

Both instant and range selector are supported. The only unsupported exception is the label matching on metric name, e.g.: `__name__!="request_count"` (but the equal-matching case is supported: `__name__="request_count"`). Time duration and offset are supported, but `@` modifier is not supported yet.

### Binary 

*Pure literal binary-expr like `1+1` is not supported yet. `promql-parser` has some issues about grammar conflict between binary-expr and unary-expr.*

- Supported:
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

- Unsupported:
    | Operator | Progress |
    | :------- | :------- |
    | power    | TBD      |
    | atan2    | TBD      |
    | and      | TBD      |
    | or       | TBD      |
    | unless   | TBD      |

### Aggregators

- Supported:
    | Aggregator | Example                   |
    | :--------- | :------------------------ |
    | sum        | `sum by (foo)(metric)`    |
    | avg        | `avg by (foo)(metric)`    |
    | min        | `min by (foo)(metric)`    |
    | max        | `max by (foo)(metric)`    |
    | stddev     | `stddev by (foo)(metric)` |

- Unsupported:
    | Aggregator   | Progress |
    | :----------- | :------- |
    | count        | TBD      |
    | grouping     | TBD      |
    | stdvar       | TBD      |
    | topk         | TBD      |
    | bottomk      | TBD      |
    | count_values | TBD      |
    | quantile     | TBD      |

### Instant Functions

- Supported:
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

- Unsupported:
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

- Supported:
    | Function | Example                |
    | :------- | :--------------------- |
    | increase | `increase(metric[5m])` |
    | irate    | `irate(metric[5m])`    |
    | idelta   | `idelta(metric[5m])`   |

