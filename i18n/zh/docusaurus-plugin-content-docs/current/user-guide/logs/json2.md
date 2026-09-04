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

```sql
CREATE TABLE application_logs (
    ts TIMESTAMP TIME INDEX,
    app_name STRING,
    log_level STRING,
    `message` STRING,
    attrs JSON2,
) WITH (
    'append_mode' = 'true'
);
```

### 写入 JSON 数据

写入 JSON2 列时，可以写入 JSON object，包括空对象（`{}`）。SQL `NULL` 和省略 JSON2 列也可以正常写入，且两者与空对象的语义不同。目前不支持以 array、标量 JSON 值或 JSON literal `null` 作为 root。下面的数据包含一次成功请求、一次慢请求和一次失败请求：

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

自定义 pipeline 也可以在 transform 配置中使用 `type: json2` 写入 JSON2 列。
支持的 type hint 选项请参考 [pipeline 配置](/reference/pipeline/pipeline-config.md#type-字段)。

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
| 1970-01-01 00:00:00.001 | checkout | 8f3a1c | Alice | 200 | 42.8 | NULL |
| 1970-01-01 00:00:00.002 | checkout | 8f3a1d | Bob | 200 | 386.4 | NULL |
| 1970-01-01 00:00:00.003 | checkout | 8f3a1e | NULL | 500 | 71.2 | true |

也可以直接查询完整的 JSON2 值：

```sql
SELECT ts, attrs
FROM application_logs
ORDER BY ts;
```

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
| /v1/orders | 200 | 386.4 | NULL |
| /v1/orders | 500 | 71.2 | true |

你也可以对字段做聚合，例如统计每个 API 路径的请求量、错误数和平均延迟：

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

### JSON 字段 Type hint

JSON2 支持使用 type hint 为指定的子路径声明确定的数据类型。对于类型已知且稳定、需要频繁查询的子路径，建议使用 type hint。这些子路径会按指定类型存储，从而获得接近普通列的查询性能。JSON2 还会在写入时校验这些子路径的值。Type hint 是可选的。对于未声明 type hint 的子路径，JSON2 会根据写入列中的值推断其类型。

声明 type hint 的语法如下：

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

可以直接在 `CREATE TABLE` 语句中声明 type hint。下面的示例为 `attrs` 列中经常查询的子路径定义了 type hint：

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

### `json_get` UDF

`json_get` 用于按路径读取 JSON2 中的嵌套字段。默认返回字符串类型；如果希望直接指定返回类型，可以在函数后使用类型转换。

`json_get` 的语法如下：

```sql
json_get(json_column, 'path.to.field')::TYPE
```

`json_get` 可以用于 `SELECT`、`WHERE`、`GROUP BY` 等接受表达式的 SQL 子句。例如：

```sql
SELECT
    json_get(attrs, 'trace_id')::STRING AS trace_id,
    json_get(attrs, 'http.status')::BIGINT AS status,
    json_get(attrs, 'latency_ms')::DOUBLE AS latency_ms
FROM application_logs
WHERE json_get(attrs, 'http.status')::BIGINT >= 500;
```

类型明确的提取函数 `json_get_string`、`json_get_int`、`json_get_float` 和 `json_get_bool` 也支持 JSON2 值。详细说明请参考 [JSON 函数](/reference/sql/functions/json.md#提取)。

### 点号语法

可以直接通过点号语法读取 JSON2 中的子路径，并通过从 0 开始的下标访问 array 元素：

```sql
json_column.path.to.field
json_column.path[0].field
```

点号语法可以用于 `SELECT`、`WHERE`、`GROUP BY` 等接受表达式的 SQL 子句。例如：

```sql
SELECT
    attrs.trace_id,
    attrs.http.status,
    attrs.latency_ms,
    attrs.items[0].name
FROM application_logs
WHERE attrs.http.status >= 500;
```

路径不存在、下标越界或类型不匹配时返回 `NULL`。

### 在 SQL 函数中使用路径

JSON2 路径可以直接传给 scalar、aggregate 和 window function。GreptimeDB 会根据函数期望的 SQL 类型转换兼容的值；无法转换为期望类型的值返回 `NULL`。

```sql
SELECT ABS(attrs.latency_ms) AS latency_ms
FROM application_logs;

SELECT SUM(attrs.latency_ms) AS total_latency_ms
FROM application_logs;

SELECT LAG(attrs.latency_ms) OVER (ORDER BY ts) AS previous_latency_ms
FROM application_logs;
```

如果上下文无法提供所需类型，可以显式转换，例如 `attrs.latency_ms::DOUBLE`。

### 控制路径自动展开

JSON2 默认最多将 100 个未声明 type hint 的 leaf path 自动存储为结构化列。可以通过 `max_auto_expanded_paths` 调整这一数量：

```sql
CREATE TABLE application_logs (
    ts TIMESTAMP TIME INDEX,
    attrs JSON2 (
        max_auto_expanded_paths = 20,
        trace_id STRING
    )
) WITH (
    'append_mode' = 'true'
);
```

将该选项设为 `0` 可以关闭自动展开。声明了 type hint 的路径不占用这一数量。超出限制的字段仍会保留在特殊的 `remainder` 字段中并可正常查询，因此该选项控制的是存储布局和性能，而不是 JSON 的逻辑 schema。

<AnchorAlias id="未来规划" />

## 当前限制

JSON2 目前处于 Beta 阶段，存在以下限制：

- JSON2 列只能用于 append-only 表。
- JSON root 必须是 object，不支持以 array、string、number、boolean 或 JSON literal `null` 作为 root。
- Type hint 仅支持上文列出的类型，且路径不能穿过 array。
- 结构化展开和 type hint path 最多支持 50 层嵌套。更深且未声明 type hint 的值仍保留在特殊的 `remainder` 字段中并可查询。
