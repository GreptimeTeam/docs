---
keywords: [函数概述, Datafusion 函数, GreptimeDB 函数, SQL 查询, 数据库函数]
description: 提供了 GreptimeDB 中函数的概述，包括函数的分类、定义和使用方法。
---

import TOCInline from '@theme/TOCInline';

# 函数

<TOCInline toc={toc} />

<!--
The outling of this document is a little strange, as the content is classified by company functions and feature functions. We plan to tidy up the content in the future when out functions are more stable.
-->

## Datafusion 函数

由于 GreptimeDB 的查询引擎是基于 Apache Arrow DataFusion 构建的，GreptimeDB 继承了 DataFusion 中所有内置的函数。这些函数包括：

* **聚合函数**: 如 `COUNT`、`SUM`、`MIN`、`MAX` 等。详细列表请参阅 [聚合函数](./df-functions.md#aggregate-functions)
* **标量函数**: 如 `ABS`、`COS`、`FLOOR` 等。详细列表请参阅 [标量函数](./df-functions.md#scalar-functions)
* **窗口函数**: 对相关的一组行记录执行计算。详细列表请参阅 [窗口函数](./df-functions.md#window-functions)

要查看所有 DataFusion 函数，请参阅 [DataFusion 函数](df-functions.md)。

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

DataFusion [字符串函数](./df-functions.md#string-functions)。

GreptimeDB 提供：
* `matches_term(expression, term)` 用于全文检索。阅读[查询日志](/user-guide/logs/fulltext-search.md)文档获取更多详情。
* `regexp_extract(str, regexp)` 提取字符串中与正则表达式匹配的第一个子串。如果没有找到匹配项则返回 `NULL`。

#### regexp_extract

提取字符串中与[正则表达式](https://docs.rs/regex/latest/regex/#syntax)匹配的第一个子串。如果没有找到匹配项则返回 `NULL`。

```sql
regexp_extract(str, regexp)
```

**参数：**

- **str**: 要操作的字符串表达式。可以是常量、列或函数，以及运算符的任意组合。
- **regexp**: 要匹配的正则表达式。可以是常量、列或函数。

**关于转义的说明：**

GreptimeDB 在 MySQL 和 PostgreSQL 兼容模式下的正则表达式转义行为有所不同：
- **MySQL 模式**：转义序列需要使用双反斜杠（例如 `\\d`、`\\s`）
- **PostgreSQL 模式**：默认情况下单反斜杠即可（例如 `\d`、`\s`），或者使用 `E''` 前缀以与 MySQL 保持一致（例如 `E'\\d'`）

**示例：**

```sql
SELECT regexp_extract('version 1.2.3', '\d+\.\d+\.\d+');
-- 返回: 1.2.3

SELECT regexp_extract('Phone: 123-456-7890', '\d{3}-\d{3}-\d{4}');
-- 返回: 123-456-7890

SELECT regexp_extract('no match here', '\d+\.\d+\.\d+');
-- 返回: NULL
```

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

### 日期和时间函数

DataFusion [时间和日期函数](./df-functions.md#time-and-date-functions)。GreptimeDB 额外提供：

* [date_add](#data_add)
* [date_sub](#data_sub)
* [date_format](#date_format)
* [to_unixtime](#to_unixtime)
* [timezone](#timezone)

#### date_add

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


#### date_sub

* `date_sub(expression, interval)` 从 Timestamp、Date 或 DateTime 减去一个间隔值：

```sql
SELECT date_sub('2023-12-06 07:39:46.222'::TIMESTAMP_MS, '5 day'::INTERVAL);
```

```
+-----------------------------------------------------------------------------------------------------------------------------------------+
| date_sub(arrow_cast(Utf8("2023-12-06 07:39:46.222"),Utf8("Timestamp(Millisecond, None)")),IntervalMonthDayNano("92233720368547758080")) |
+-----------------------------------------------------------------------------------------------------------------------------------------+
| 2023-12-01 07:39:46.222000                                                                                                              |
+-----------------------------------------------------------------------------------------------------------------------------------------+
```


#### date_format

* `date_format(expression, fmt)` 将 Timestamp、Date 或 DateTime 格式化：

支持 `Date32`、`Date64` 和所有 `Timestamp` 类型。

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

#### to_unixtime

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

#### timezone

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

[了解 GreptimeDB 中 JSON 相关的函数](./json.md)。

### 地理函数

[了解 GreptimeDB 中轨迹、地理编码相关的地理函数](./geo.md)。

### 向量函数

[了解 GreptimeDB 中向量相关的函数](./vector.md)。

### 近似函数

GreptimeDB 支持一些近似函数用于数据分析，例如近似去重计数(hll)、近似分位数(uddsketch)等。[了解 GreptimeDB 中近似函数](./approximate.md)。

