---
keywords: [内置 pipeline, greptime_identity, JSON 日志, 日志处理, 时间索引, pipeline, GreptimeDB]
description: 了解 GreptimeDB 的内置 pipeline，包括用于处理 JSON 日志的 greptime_identity pipeline，具有自动 schema 创建、类型转换和时间索引配置功能。
---

# 内置 Pipeline

GreptimeDB 提供了常见日志格式的内置 Pipeline，允许你直接使用而无需创建新的 Pipeline。

请注意，内置 Pipeline 的名称以 "greptime_" 为前缀，不可编辑。

## `greptime_identity`

`greptime_identity` Pipeline 适用于写入 JSON 日志，并自动为 JSON 日志中的每个字段创建列。嵌套的 JSON 对象将自动展开为使用点符号的单独列。

- 嵌套对象会被自动展开（例如，`{"a": {"b": 1}}` 变成列 `a.b`）
- 数组会被转换为 JSON 字符串
- 如果相同字段包含不同类型的数据，则会返回错误
- 值为 `null` 的字段将被忽略
- 如果没有手动指定，一个作为时间索引的额外列 `greptime_timestamp` 将被添加到表中，以指示日志写入的时间

### 类型转换规则

- `string` -> `string`
- `number` -> `int64` 或 `float64`
- `boolean` -> `bool`
- `null` -> 忽略
- `array` -> `string`（JSON 字符串格式）
- `object` -> 自动展开为单独的列（参见[展开 JSON 对象](#展开-json-对象)）

例如，如果我们有以下 JSON 数据：

```json
[
    {"name": "Alice", "age": 20, "is_student": true, "score": 90.5,"object": {"a":1,"b":2}},
    {"age": 21, "is_student": false, "score": 85.5, "company": "A" ,"whatever": null},
    {"name": "Charlie", "age": 22, "is_student": true, "score": 95.5,"array":[1,2,3]}
]
```

我们将合并每个批次的行结构以获得最终 schema。注意，嵌套对象会自动展开为单独的列（例如 `object.a`、`object.b`），数组会转换为 JSON 字符串。表 schema 如下所示：

```sql
mysql> desc pipeline_logs;
+--------------------+---------------------+------+------+---------+---------------+
| Column             | Type                | Key  | Null | Default | Semantic Type |
+--------------------+---------------------+------+------+---------+---------------+
| age                | Int64               |      | YES  |         | FIELD         |
| is_student         | Boolean             |      | YES  |         | FIELD         |
| name               | String              |      | YES  |         | FIELD         |
| object.a           | Int64               |      | YES  |         | FIELD         |
| object.b           | Int64               |      | YES  |         | FIELD         |
| score              | Float64             |      | YES  |         | FIELD         |
| company            | String              |      | YES  |         | FIELD         |
| array              | String              |      | YES  |         | FIELD         |
| greptime_timestamp | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
+--------------------+---------------------+------+------+---------+---------------+
9 rows in set (0.00 sec)
```

数据将存储在表中，如下所示：

```sql
mysql> select * from pipeline_logs;
+------+------------+---------+----------+----------+-------+---------+-----------+----------------------------+
| age  | is_student | name    | object.a | object.b | score | company | array     | greptime_timestamp         |
+------+------------+---------+----------+----------+-------+---------+-----------+----------------------------+
|   22 |          1 | Charlie | NULL     | NULL     |  95.5 | NULL    | [1,2,3]   | 2024-10-18 09:35:48.333020 |
|   21 |          0 | NULL    | NULL     | NULL     |  85.5 | A       | NULL      | 2024-10-18 09:35:48.333020 |
|   20 |          1 | Alice   | 1        | 2        |  90.5 | NULL    | NULL      | 2024-10-18 09:35:48.333020 |
+------+------------+---------+----------+----------+-------+---------+-----------+----------------------------+
3 rows in set (0.01 sec)
```

### 自定义时间索引列

每个 GreptimeDB 表中都必须有时间索引列。`greptime_identity` pipeline 不需要额外的 YAML 配置，如果你希望使用写入数据中自带的时间列（而不是日志数据到达服务端的时间戳）作为表的时间索引列，则需要通过参数进行指定。

假设这是一份待写入的日志数据：
```JSON
[
    {"action": "login", "ts": 1742814853}
]
```

设置如下的 URL 参数来指定自定义时间索引列：
```shell
curl -X "POST" "http://localhost:4000/v1/ingest?db=public&table=pipeline_logs&pipeline_name=greptime_identity&custom_time_index=ts;epoch;s" \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic {{authentication}}" \
     -d $'[{"action": "login", "ts": 1742814853}]'
```

取决于数据的格式，`custom_time_index` 参数接受两种格式的配置值：
- Unix 时间戳: `<字段名>;epoch;<精度>`
  - 该字段需要是整数或者字符串
  - 精度为这四种选项之一: `s`, `ms`, `us`, or `ns`.
- 时间戳字符串: `<字段名>;datestr;<字符串解析格式>`
  - 例如输入的时间字段值为 `2025-03-24 19:31:37+08:00`，则对应的字符串解析格式为 `%Y-%m-%d %H:%M:%S%:z`

通过上述配置，结果表就能正确使用输入字段作为时间索引列
```sql
DESC pipeline_logs;
```
```sql
+--------+-----------------+------+------+---------+---------------+
| Column | Type            | Key  | Null | Default | Semantic Type |
+--------+-----------------+------+------+---------+---------------+
| ts     | TimestampSecond | PRI  | NO   |         | TIMESTAMP     |
| action | String          |      | YES  |         | FIELD         |
+--------+-----------------+------+------+---------+---------------+
2 rows in set (0.02 sec)
```

假设时间变量名称为 `input_ts`，以下是一些使用 `custom_time_index` 的示例：
- 1742814853: `custom_time_index=input_ts;epoch;s`
- 1752749137000: `custom_time_index=input_ts;epoch;ms`
- "2025-07-17T10:00:00+0800": `custom_time_index=input_ts;datestr;%Y-%m-%dT%H:%M:%S%z`
- "2025-06-27T15:02:23.082253908Z": `custom_time_index=input_ts;datestr;%Y-%m-%dT%H:%M:%S%.9f%#z`


### 展开 JSON 对象

`greptime_identity` pipeline **自动展开**嵌套的 JSON 对象为单层结构。此行为始终启用，使用点符号（例如 `a.b.c`）为每个嵌套字段创建单独的列。

#### 控制展开深度

你可以使用 `x-greptime-pipeline-params` header 中的 `max_nested_levels` 参数来控制对象展开的深度。默认值为 10 层。

以下是一个示例请求：

```shell
curl -X "POST" "http://localhost:4000/v1/ingest?db=<db-name>&table=<table-name>&pipeline_name=greptime_identity&version=<pipeline-version>" \
     -H "Content-Type: application/x-ndjson" \
     -H "Authorization: Basic {{authentication}}" \
     -H "x-greptime-pipeline-params: max_nested_levels=5" \
     -d "$<log-items>"
```

当达到最大嵌套级别时，任何剩余的嵌套结构都会被转换为 JSON 字符串并存储在单个列中。例如，当 `max_nested_levels=3` 时：

```JSON
{
    "a": {
        "b": {
            "c": {
                "d": [1, 2, 3]
            }
        }
    },
    "e": [
        "foo",
        "bar"
    ],
    "f": {
        "g": {
            "h": 123,
            "i": "hello",
            "j": {
                "k": true
            }
        }
    }
}
```

将被展开为：

```json
{
    "a.b.c": "{\"d\":[1,2,3]}",
    "e": "[\"foo\",\"bar\"]",
    "f.g.h": 123,
    "f.g.i": "hello",
    "f.g.j": "{\"k\":true}"
}
```

注意：
- 任何级别的数组都会被转换为 JSON 字符串（例如，`"e"` 变成 `"[\"foo\",\"bar\"]"`）
- 当达到嵌套级别限制时（此例中为第 3 层），剩余的嵌套对象会被转换为 JSON 字符串（例如 `"a.b.c"` 和 `"f.g.j"`）
- 深度限制内的常规标量值以其原生类型存储（例如 `"f.g.h"` 为整数，`"f.g.i"` 为字符串）

