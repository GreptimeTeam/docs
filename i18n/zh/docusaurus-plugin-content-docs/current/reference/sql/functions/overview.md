import TOCInline from '@theme/TOCInline';

# 概述

<TOCInline toc={toc} />

<!--
The outling of this document is a little strange, as the content is classified by company functions and feature functions. We plan to tidy up the content in the future when out functions are more stable.
-->

## Datafusion 函数

由于 GreptimeDB 的查询引擎是基于 Apache Arrow DataFusion 构建的，GreptimeDB 继承了 DataFusion 中所有内置的函数。这些函数包括：

* **聚合函数**: 如 `COUNT`、`SUM`、`MIN`、`MAX` 等。详细列表请参阅 [聚合函数](./df-functions.md#aggregate-functions)
* **标量函数**: 如 `ABS`、`COS`、`FLOOR` 等。详细列表请参阅 [标量函数](./df-functions.md#scalar-functions)
* **窗口函数**: 对相关的一组行记录执行计算。详细列表请参阅 [窗口函数](./df-functions.md#window-functions)

要查看所有 DataFusion 函数，请参阅 [DataFusion 函数](./df-functions)。

### `arrow_cast`

`arrow_cast` 函数来自 DataFusion 的 [`arrow_cast`](./df-functions.md#arrow-cast)。其用法如下：

```sql
arrow_cast(expression, datatype)
```

其中 `datatype` 可以是此 [列表](https://arrow.apache.org/datafusion/user-guide/sql/data_types.html) 中的任何有效 Arrow 数据类型。四种时间戳类型是：

- Timestamp(Second, None)
- Timestamp(Millisecond, None)
- Timestamp(Microsecond, None)
- Timestamp(Nanosecond, None)

（注意 `None` 表示时间戳不考虑时区）

## GreptimeDB 函数

### 字符串函数

DataFusion [字符串函数](./df-functions.md#string-functions)。GreptimeDB 提供：
* `matches(expression, pattern)` 用于全文检索。

阅读[查询日志](/user-guide/logs/query-logs.md)文档获取更多详情。

### 数学函数

DataFusion [数学函数](./df-functions.md#math-functions)。GreptimeDB 额外提供：
* `clamp(value, lower, upper)` 将给定值限制在上下界之间：
```sql
SELECT CLAMP(10, 0, 1);

+------------------------------------+
| clamp(Int64(10),Int64(0),Int64(1)) |
+------------------------------------+
|                                  1 |
+------------------------------------+
```

```sql
SELECT CLAMP(0.5, 0, 1);

+---------------------------------------+
| clamp(Float64(0.5),Int64(0),Int64(1)) |
+---------------------------------------+
|                                   0.5 |
+---------------------------------------+
```

* `mod(x, y)` 获取一个数除以另一个数的余数：
```sql
SELECT mod(18, 4);

+-------------------------+
| mod(Int64(18),Int64(4)) |
+-------------------------+
|                       2 |
+-------------------------+
```

* `pow(x, y)` 获取一个数的幂值：
```sql
SELECT pow(2, 10);

+-------------------------+
| pow(Int64(2),Int64(10)) |
+-------------------------+
|                    1024 |
+-------------------------+
```

### 日期和时间函数

DataFusion [时间和日期函数](./df-functions.md#time-and-date-functions)。GreptimeDB 额外提供：

*  `date_add(expression, interval)` 向 Timestamp、Date 或 DateTime 添加一个间隔值：

```sql
SELECT date_add('2023-12-06'::DATE, '3 month 5 day');
```

```
+----------------------------------------------------+
| date_add(Utf8("2023-12-06"),Utf8("3 month 5 day")) |
+----------------------------------------------------+
| 2024-03-11                                         |
+----------------------------------------------------+
```

* `date_sub(expression, interval)` 从 Timestamp、Date 或 DateTime 减去一个间隔值：

```sql
SELECT date_sub('2023-12-06 07:39:46.222'::TIMESTAMP_MS, INTERVAL '5 day');
```

```
+-----------------------------------------------------------------------------------------------------------------------------------------+
| date_sub(arrow_cast(Utf8("2023-12-06 07:39:46.222"),Utf8("Timestamp(Millisecond, None)")),IntervalMonthDayNano("92233720368547758080")) |
+-----------------------------------------------------------------------------------------------------------------------------------------+
| 2023-12-01 07:39:46.222000                                                                                                              |
+-----------------------------------------------------------------------------------------------------------------------------------------+
```

* `date_format(expression, fmt)` 将 Timestamp、Date 或 DateTime格式化：

```sql
SELECT date_format('2023-12-06 07:39:46.222'::TIMESTAMP, '%Y-%m-%d %H:%M:%S:%3f');
```

```
+-----------------------------------------------------------------------------------------------------------------------------+
| date_format(arrow_cast(Utf8("2023-12-06 07:39:46.222"),Utf8("Timestamp(Millisecond, None)")),Utf8("%Y-%m-%d %H:%M:%S:%3f")) |
+-----------------------------------------------------------------------------------------------------------------------------+
| 2023-12-06 07:39:46:222                                                                                                     |
+-----------------------------------------------------------------------------------------------------------------------------+
```

支持的格式化符号请参阅 [chrono::format::strftime](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) 模块。

* `to_unixtime(expression)` 将表达式转换为 Unix 时间戳（秒）。参数可以是整数（毫秒 Unix 时间戳）、Timestamp、Date、DateTime 或字符串类型。如果参数是字符串类型，函数将首先尝试将其转换为 DateTime、Timestamp 或 Date。

```sql
select to_unixtime('2023-03-01T06:35:02Z');
```

```
+-------------------------------------------+
| to_unixtime(Utf8("2023-03-01T06:35:02Z")) |
+-------------------------------------------+
|                                1677652502 |
+-------------------------------------------+
```

```sql
select to_unixtime('2023-03-01'::date);
```

```
+---------------------------------+
| to_unixtime(Utf8("2023-03-01")) |
+---------------------------------+
|                      1677628800 |
+---------------------------------+
```

* `timezone()` 查询当前会话时区：

```sql
select timezone();
```

```
+------------+
| timezone() |
+------------+
| UTC        |
+------------+
```

### 系统函数

* `isnull(expression)` 检查表达式是否为 `NULL`：
```sql
 SELECT isnull(1);

 +------------------+
| isnull(Int64(1)) |
+------------------+
|                0 |
+------------------+
```

```sql
SELECT isnull(NULL);

+--------------+
| isnull(NULL) |
+--------------+
|            1 |
+--------------+
```

* `build()` 查询 GreptimeDB 构建信息。
* `version()` 查询 GreptimeDB 版本信息。
* `database()` 查询当前会话数据库：

```sql
select database();

+------------+
| database() |
+------------+
| public     |
+------------+
```

### 管理函数

GreptimeDB 提供了 `ADMIN` 语句来执行管理函数，请阅读 [ADMIN](/reference/sql/admin.md) 文档。

### JSON 函数

GreptimeDB 提供了以下 JSON 相关函数来处理 JSON 类型的数据：

* `parse_json(string)` 尝试将字符串解析为 JSON 类型。非法的 JSON 字符串将返回错误。
* `json_to_string(json)` 将 JSON 类型的值转换为字符串。

```sql
SELECT json_to_string(parse_json('{"a": 1, "b": 2}'));

+----------------------------------------------------------+
| json_to_string(parse_json(Utf8("{\"a\": 1, \"b\": 2}"))) |
+----------------------------------------------------------+
| {"a":1,"b":2}                                            |
+----------------------------------------------------------+
```

* `json_get_bool(json, path)` 按照路径 `path` 从 JSON 中获取布尔值。
* `json_get_int(json, path)` 按照路径 `path` 从 JSON 中获取整数值。布尔值将被转换为整数。
* `json_get_float(json, path)` 按照路径 `path` 从 JSON 中获取浮点数值。布尔值、整数值将被转换为浮点数。
* `json_get_string(json, path)` 按照路径 `path` 从 JSON 中获取字符串。所有类型的 JSON 值都将被转换为字符串，包括数组、对象和 null。

`path` 是一个用于从 JSON 值中选择和提取元素的字符串。`path` 中支持的操作符有：

| 操作符                    | 描述                                                          | 示例                |
|--------------------------|--------------------------------------------------------------|--------------------|
| `$`                      | 根元素                                                        | `$`                |
| `@`                      | 过滤表达式中的当前元素                                           | `$.event?(@ == 1)` |
| `.*`                     | 选择对象中的所有元素                                             | `$.*`             |
| `.<name>`                | 选择对象中匹配名称的元素                                          | `$.event`         |
| `:<name>`                | `.<name>` 的别名                                              | `$:event`          |
| `["<name>"]`             | `.<name>` 的别名                                              | `$["event"]`       |
| `[*]`                    | 选择数组中的所有元素                                             | `$[*]`             |
| `[<pos>, ..]`            | 选择数组中基于0的第 `n` 个元素                                    | `$[1, 2]`         |
| `[last - <pos>, ..]`     | 选择数组中最后一个元素之前的第 `n` 个元素                           | `$[0, last - 1]`   |
| `[<pos1> to <pos2>, ..]` | 选择数组中某个范围内的所有元素                                     | `$[1 to last - 2]` |
| `?(<expr>)`              | 选择所有匹配过滤表达式的元素                                      | `$?(@.price < 10)` |

如果 `path` 是无效的，函数将返回 `NULL`。

```sql
SELECT json_get_int(parse_json('{"a": {"c": 3}, "b": 2}'), 'a.c');

+-----------------------------------------------------------------------+
| json_get_int(parse_json(Utf8("{"a": {"c": 3}, "b": 2}")),Utf8("a.c")) |
+-----------------------------------------------------------------------+
|                                                                     3 |
+-----------------------------------------------------------------------+
```

* `json_is_null(json)` 检查 JSON 中的值是否为 `NULL`。
* `json_is_bool(json)` 检查 JSON 中的值是否为布尔值。
* `json_is_int(json)` 检查 JSON 中的值是否为整数。
* `json_is_float(json)` 检查 JSON 中的值是否为浮点数。
* `json_is_string(json)` 检查 JSON 中的值是否为字符串。
* `json_is_array(json)` 检查 JSON 中的值是否为数组。
* `json_is_object(json)` 检查 JSON 中的值是否为对象。

```sql
SELECT json_is_array(parse_json('[1, 2, 3]'));

+----------------------------------------------+
| json_is_array(parse_json(Utf8("[1, 2, 3]"))) |
+----------------------------------------------+
|                                            1 |
+----------------------------------------------+

SELECT json_is_object(parse_json('1'));

+---------------------------------------+
| json_is_object(parse_json(Utf8("1"))) |
+---------------------------------------+
|                                     0 |
+---------------------------------------+
```

* `json_path_exists(json, path)` 检查 JSON 中是否存在指定的路径。

如果 `path` 是无效的，函数将返回错误。

如果 `path` 或 `json` 是 `NULL`，函数将返回 `NULL`。

```sql
SELECT json_path_exists(parse_json('{"a": 1, "b": 2}'), 'a');

+------------------------------------------------------------------+
| json_path_exists(parse_json(Utf8("{"a": 1, "b": 2}")),Utf8("a")) |
+------------------------------------------------------------------+
|                                                                1 |
+------------------------------------------------------------------+

SELECT json_path_exists(parse_json('{"a": 1, "b": 2}'), 'c.d');

+--------------------------------------------------------------------+
| json_path_exists(parse_json(Utf8("{"a": 1, "b": 2}")),Utf8("c.d")) |
+--------------------------------------------------------------------+
|                                                                  0 |
+--------------------------------------------------------------------+

SELECT json_path_exists(parse_json('{"a": 1, "b": 2}'), NULL);

+-------------------------------------------------------------+
| json_path_exists(parse_json(Utf8("{"a": 1, "b": 2}")),NULL) |
+-------------------------------------------------------------+
|                                                        NULL |
+-------------------------------------------------------------+
```

### 地理函数

[了解 GreptimeDB 中轨迹、地理编码相关的地理函数](./geo.md)。

### 向量函数

[了解 GreptimeDB 中向量相关的函数](./vector.md)。
