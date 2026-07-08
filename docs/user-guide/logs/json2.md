---
keywords: [JSON2, JSON, logs, structured logs, type hints, json_get]
description: 介绍 GreptimeDB 中 JSON2 类型的使用方式，包括建表、type hint、JSON 字段读取以及当前限制。
---

# JSON2 类型

JSON2 是 GreptimeDB 为日志和半结构化数据设计的 JSON 类型。
它会将 JSON 中的字段以结构化、列式的方式存储，使常用字段能够像普通列一样被高效读取、过滤和聚合，同时保留 JSON 对动态结构的表达能力。

:::note
JSON2 目前处于 Beta 阶段。我们会保持向后兼容，并在后续版本中继续完善功能、改进当前限制。
:::

## 创建 JSON2 列

在建表时，可以使用 `JSON2` 类型声明 JSON2 列。
当前 JSON2 只能在 append-only 表中使用，因此建表时需要设置 `'append_mode' = 'true'`。

```sql
CREATE TABLE application_logs (
    ts TIMESTAMP TIME INDEX,
    message STRING,
    attrs JSON2
) WITH (
    'append_mode' = 'true'
);
```

写入 JSON2 列时，可以写入 JSON 数据。目前暂不支持写入非 object 类型的 JSON 值：

```sql
INSERT INTO application_logs
VALUES
    (
        1,
        'request completed',
        '{"user":{"id":1001},"http":{"status":200},"success":true}'
    ),
    (
        2,
        'request failed',
        '{"user":{"id":1002},"http":{"status":500},"success":false}'
    );
```

## 使用 type hint

Type hint 用于为 JSON2 中的子路径声明确定的数据类型。声明后，这些子路径会按指定类型存储和读取，从而获得接近普通列的查询性能，并在写入时进行类型校验。

当某些 JSON 子路径类型明确，并且会被频繁查询、过滤或聚合时，建议在建表语句中定义 type hint。

```sql
CREATE TABLE application_logs (
    ts TIMESTAMP TIME INDEX,
    message STRING,
    attrs JSON2 (
        user.id BIGINT NOT NULL,
        user.name STRING DEFAULT 'unknown',
        http.status BIGINT,
        success BOOLEAN NULL,
        duration DOUBLE NULL DEFAULT 0.0
    )
) WITH (
    'append_mode' = 'true'
);
```

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

| Type hint 类型 | 说明 |
| --- | --- |
| `STRING` | 字符串类型。`TEXT`、`VARCHAR`、`CHAR` 等别名会归一为 `STRING`。 |
| `BIGINT` | 有符号整数类型。`INT`、`INTEGER`、`SMALLINT` 等整数类型会归一为 `BIGINT`。 |
| `BIGINT UNSIGNED` | 无符号整数类型。无符号整数类型会归一为 `BIGINT UNSIGNED`。 |
| `DOUBLE` | 浮点类型。`FLOAT`、`REAL` 等类型会归一为 `DOUBLE`。 |
| `BOOLEAN` | 布尔类型。 |

Type hint 默认允许 `NULL`。如果设置 `NOT NULL`，写入的 JSON 中必须存在该路径。

## 查询 JSON2 字段

可以使用 `json_get` 读取 JSON2 中的嵌套字段：

```sql
SELECT
    json_get(attrs, 'user.id'),
    json_get(attrs, 'user.name'),
    json_get(attrs, 'http.status'),
    json_get(attrs, 'success')
FROM application_logs;
```

`json_get` 的基本语法如下：

```sql
json_get(json_column, 'path.to.field')
```

如果你希望直接指定返回类型，也可以使用 JSON 函数：

```sql
SELECT
    json_get_int(attrs, 'user.id'),
    json_get_string(attrs, 'user.name'),
    json_get_bool(attrs, 'success'),
    json_get_float(attrs, 'duration')
FROM application_logs;
```

## 未来规划

JSON2 目前处于 Beta 阶段。后续版本会继续完善以下能力：

- 支持在非 append-only 表中使用 JSON2。
- 支持写入 array、string、number、boolean 和 `null` 等非 object 类型的
  JSON root 值。
- 支持通过 `json_get` 查询 JSON2 根列本身。
- 扩展 type hint 支持的类型，例如 `TIMESTAMP` 等时间类型。
- 为 type hint 支持 `INVERTED INDEX`、`SKIPPING INDEX` 等索引选项。
