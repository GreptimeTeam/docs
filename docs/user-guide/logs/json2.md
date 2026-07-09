---
keywords: [JSON2, JSON, logs, structured logs, type hints, json_get]
description: 介绍 GreptimeDB 中 JSON2 类型的使用方式，包括建表、type hint、JSON 字段读取以及当前限制。
---

# JSON2 类型

JSON2 是 GreptimeDB 为日志和半结构化数据设计的 JSON 类型。
它会将 JSON 中的字段以结构化、列式的方式存储，使常用字段能够像普通列一样被高效读取、过滤和聚合，同时保留 JSON 对动态结构的表达能力。

:::note
JSON2 目前处于 Beta 阶段，部分功能仍在持续完善中。
:::

## 快速入门

下面的示例创建一张 API 访问日志表，写入几条请求日志，并查询 JSON2 中的字段。固定字段放在普通列中，结构可能变化但经常查询的字段放在 JSON2 列 `attrs` 中。

### 创建表

在建表时，可以使用 `JSON2` 类型声明 JSON2 列。
当前 JSON2 只能在 append-only 表中使用，因此建表时需要设置 `'append_mode' = 'true'`。

JSON2 支持 type hint，用于为子路径声明确定的数据类型。声明后，这些子路径会按指定类型存储，从而获得接近普通列的查询性能，并在写入时进行类型校验。下面的 `attrs` 列为 `http.status`、`latency_ms`、`error` 等常用路径定义了 type hint。

```sql
CREATE TABLE application_logs (
    ts TIMESTAMP TIME INDEX,
    app_name STRING,
    log_level STRING,
    `message` STRING,
    attrs JSON2 (
        trace_id STRING,
        user.id BIGINT,
        user.name STRING DEFAULT 'anonymous',
        http.method STRING,
        http.path STRING,
        http.status BIGINT,
        latency_ms DOUBLE,
        error BOOLEAN DEFAULT false
    )
) WITH (
    'append_mode' = 'true'
);
```

例如，`user.name STRING DEFAULT 'anonymous'` 表示当写入的 JSON 中缺少 `user.name` 时，查询结果使用默认值 `anonymous`。`error BOOLEAN DEFAULT false` 表示缺少 `error` 字段的日志会被视为非错误日志。

### 写入 JSON 数据

写入 JSON2 列时，可以写入 JSON object。下面的数据包含一次成功请求、一次慢请求和一次失败请求：

```sql
INSERT INTO application_logs
VALUES
    (
        1,
        'checkout',
        'INFO',
        'request completed',
        '{"trace_id":"8f3a1c","user":{"id":1001,"name":"Alice"},"http":{"method":"POST","path":"/v1/orders","status":200},"latency_ms":42.8}'
    ),
    (
        2,
        'checkout',
        'WARN',
        'slow request',
        '{"trace_id":"8f3a1d","user":{"id":1002,"name":"Bob"},"http":{"method":"POST","path":"/v1/orders","status":200},"latency_ms":386.4}'
    ),
    (
        3,
        'checkout',
        'ERROR',
        'request failed',
        '{"trace_id":"8f3a1e","user":{"id":1003},"http":{"method":"POST","path":"/v1/orders","status":500},"latency_ms":71.2,"error":true}'
    );
```

### 查询 JSON 字段

可以直接通过点号路径读取 JSON2 中的字段：

```sql
SELECT
    ts,
    app_name,
    attrs.trace_id AS trace_id,
    attrs.user.name AS user_name,
    attrs.http.status AS status,
    attrs.latency_ms AS latency_ms,
    attrs.error AS error
FROM application_logs
ORDER BY ts;
```

查询结果如下：

| ts | app_name | trace_id | user_name | status | latency_ms | error |
| --- | --- | --- | --- | --- | --- | --- |
| 1970-01-01 00:00:00.001 | checkout | 8f3a1c | Alice | 200 | 42.8 | false |
| 1970-01-01 00:00:00.002 | checkout | 8f3a1d | Bob | 200 | 386.4 | false |
| 1970-01-01 00:00:00.003 | checkout | 8f3a1e | anonymous | 500 | 71.2 | true |

也可以使用 JSON 函数直接指定返回类型：

```sql
SELECT
    json_get(attrs, 'http.path')::STRING AS path,
    json_get(attrs, 'http.status')::INT8 AS status,
    json_get(attrs, 'latency_ms')::DOUBLE AS latency_ms,
    json_get(attrs, 'error')::BOOLEAN AS error
FROM application_logs
WHERE json_get(attrs, 'http.status')::INT8 >= 500
    OR json_get(attrs, 'latency_ms')::DOUBLE > 300
ORDER BY ts;
```

查询结果如下：

| path | status | latency_ms | error |
| --- | --- | --- | --- |
| /v1/orders | 200 | 386.4 | 0 |
| /v1/orders | 500 | 71.2 | 1 |

你也可以对 type hint 字段做聚合，例如统计每个 API 路径的请求量、错误数和平均延迟：

```sql
SELECT
    json_get(attrs, 'http.path')::STRING AS path,
    COUNT(*) AS requests,
    SUM(CASE WHEN json_get(attrs, 'error')::BOOLEAN THEN 1 ELSE 0 END) AS errors,
    ROUND(AVG(json_get(attrs, 'latency_ms')::DOUBLE), 1) AS avg_latency_ms
FROM application_logs
GROUP BY json_get(attrs, 'http.path')::STRING;
```

查询结果如下：

| path | requests | errors | avg_latency_ms |
| --- | --- | --- | --- |
| /v1/orders | 3 | 1 | 166.8 |

## 语法

### Type hint

Type hint 的基本语法如下：

```sql
json_column JSON2 (
    path.to.field DATA_TYPE [NULL | NOT NULL] [DEFAULT literal]
)
```

Type hint 的路径使用点号分隔，例如 `user.id` 对应 JSON 中的
`{"user":{"id":...}}`。

如果某个 JSON key 本身包含点号，需要用双引号包住该路径段。
例如 `"service.name"` 表示读取 root object 中名为 `service.name`
的 key，而不是读取 `service.name` 这条嵌套路径。

当前 type hint 支持以下类型：

- `STRING`
- `BIGINT`
- `BIGINT UNSIGNED`
- `DOUBLE`
- `BOOLEAN`

Type hint 默认允许 `NULL`。如果设置 `NOT NULL`，写入的 JSON 中必须存在该路径。

### `json_get`

除了点号路径，也可以使用 `json_get` 读取 JSON2 中的嵌套字段：

```sql
SELECT
    json_get(attrs, 'trace_id'),
    json_get(attrs, 'user.name'),
    json_get(attrs, 'http.status'),
    json_get(attrs, 'latency_ms')
FROM application_logs
ORDER BY ts;
```

`json_get` 的基本语法如下：

```sql
json_get(json_column, 'path.to.field')
```

如果希望直接指定返回类型，可以使用类型转换：

例如：

```sql
SELECT
    json_get(attrs, 'http.path')::STRING AS path,
    json_get(attrs, 'http.status')::INT8 AS status,
    json_get(attrs, 'latency_ms')::DOUBLE AS latency_ms,
    json_get(attrs, 'error')::BOOLEAN AS error
FROM application_logs
ORDER BY ts;
```

## 未来规划

JSON2 目前处于 Beta 阶段，仍有以下限制。后续版本会继续完善相关能力：

- 支持在非 append-only 表中使用 JSON2。
- 支持写入 array、string、number、boolean、`null` 和 `{}` 等非 object 或空 object 的 JSON root 值。
- 支持查询 JSON2 root 列本身。目前请查询具体子路径，例如 `attrs.http.status` 或 `json_get(attrs, 'http.status')`。
- 支持通过下标访问 JSON array 中的元素。目前可以查询 `attrs.items`，但暂不支持 `attrs.items[0]` 或 `json_get(attrs, 'items[0]')`。
- 支持 `json_get_string`、`json_get_int`、`json_get_float` 和 `json_get_bool` 等函数处理 JSON2 类型。目前可以使用 `json_get(...)::TYPE` 指定返回类型。
- 扩展 type hint 支持的类型，例如 `TIMESTAMP` 等时间类型。
- 为 type hint 支持 `INVERTED INDEX`、`SKIPPING INDEX` 等索引选项。
