---
keywords: [GreptimeDB 函数, 字符串函数, 数学函数, 时间函数, 管理函数]
description: GreptimeDB 特有的 SQL 函数以及在 DataFusion 之上的扩展。
---

import TOCInline from '@theme/TOCInline';

# GreptimeDB 函数

<TOCInline toc={toc} />

## 字符串函数

DataFusion [字符串函数](./df-functions.md#string-functions)。

GreptimeDB 提供：
* `matches_term(expression, term)` 用于全文检索。阅读[查询日志](/user-guide/logs/fulltext-search.md)文档获取更多详情。
* `regexp_extract(str, regexp)` 提取字符串中与正则表达式匹配的第一个子串。如果没有找到匹配项则返回 `NULL`。

**MySQL 兼容的字符串函数：**

GreptimeDB 还提供以下 MySQL 兼容的字符串函数：
* `locate(substr, str[, pos])` - 返回子串第一次出现的位置
* `elt(N, str1, str2, ...)` - 返回列表中第 N 个字符串
* `field(str, str1, str2, ...)` - 返回第一个匹配的字符串的索引
* `insert(str, pos, len, newstr)` - 在指定位置插入子串
* `space(N)` - 返回包含 N 个空格的字符串
* `format(X, D)` - 使用千位分隔符格式化数字，并保留 D 位小数

### regexp_extract

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

### locate

返回子串 `substr` 在字符串 `str` 中第一次出现的位置。可选参数 `pos` 指定搜索起始位置。如果未找到子串则返回 0。

```sql
locate(substr, str[, pos])
```

**参数：**

- **substr**: 要搜索的子串。
- **str**: 要搜索的字符串。
- **pos**（可选）: 开始搜索的位置（从 1 开始）。如果省略，则从头开始搜索。

**示例：**

```sql
SELECT locate('world', 'hello world');
-- 返回: 7

SELECT locate('o', 'hello world', 6);
-- 返回: 8 (找到第二个 'o')

SELECT locate('xyz', 'hello world');
-- 返回: 0 (未找到)
```

### elt

从字符串列表中返回第 N 个字符串。如果 N 小于 1、大于字符串数量或为 `NULL`，则返回 `NULL`。

```sql
elt(N, str1, str2, str3, ...)
```

**参数：**

- **N**: 要返回的字符串的索引（从 1 开始）。
- **str1, str2, str3, ...**: 字符串列表。

**示例：**

```sql
SELECT elt(2, 'apple', 'banana', 'cherry');
-- 返回: banana

SELECT elt(0, 'apple', 'banana', 'cherry');
-- 返回: NULL
```

### field

返回 `str` 在列表中第一次出现的索引（从 1 开始）。如果未找到匹配项或 `str` 为 `NULL`，则返回 0。

```sql
field(str, str1, str2, str3, ...)
```

**参数：**

- **str**: 要搜索的字符串。
- **str1, str2, str3, ...**: 要搜索的字符串列表。

**示例：**

```sql
SELECT field('banana', 'apple', 'banana', 'cherry');
-- 返回: 2

SELECT field('grape', 'apple', 'banana', 'cherry');
-- 返回: 0 (未找到)
```

### insert

在字符串的指定位置插入子串，替换指定数量的字符。

```sql
insert(str, pos, len, newstr)
```

**参数：**

- **str**: 原始字符串。
- **pos**: 开始插入的位置（从 1 开始）。
- **len**: 要替换的字符数。
- **newstr**: 要插入的字符串。

**示例：**

```sql
SELECT insert('Quadratic', 3, 4, 'What');
-- 返回: QuWhattic

SELECT insert('Quadratic', 3, 100, 'What');
-- 返回: QuWhat (替换到字符串末尾)
```

### space

返回由 N 个空格字符组成的字符串。

```sql
space(N)
```

**参数：**

- **N**: 要返回的空格数。如果 N 为负数，则返回空字符串。

**示例：**

```sql
SELECT space(5);
-- 返回: '     ' (5 个空格)

SELECT concat('hello', space(3), 'world');
-- 返回: 'hello   world'
```

### format

使用千位分隔符格式化数字，并保留指定的小数位数。

```sql
format(X, D)
```

**参数：**

- **X**: 要格式化的数字。
- **D**: 小数位数（0-30）。

**示例：**

```sql
SELECT format(1234567.891, 2);
-- 返回: 1,234,567.89

SELECT format(1234567.891, 0);
-- 返回: 1,234,568
```

## 数学函数

DataFusion [数学函数](./df-functions.md#math-functions)。GreptimeDB 额外提供：

* `clamp(value, lower, upper)` 限制给定值在上下限之间：

```sql
SELECT CLAMP(10, 0, 1);

+------------------------------------+
| clamp(Int64(10),Int64(0),Int64(1)) |
+------------------------------------+
|                                  1 |
+------------------------------------+
```

```sql
SELECT CLAMP(0.5, 0, 1)

+---------------------------------------+
| clamp(Float64(0.5),Int64(0),Int64(1)) |
+---------------------------------------+
|                                   0.5 |
+---------------------------------------+
```

* `mod(x, y)` 计算除法的余数：
```sql
SELECT mod(18, 4);

+-------------------------+
| mod(Int64(18),Int64(4)) |
+-------------------------+
|                       2 |
+-------------------------+
```

## 日期与时间函数

DataFusion [时间函数](./df-functions.md#time-and-date-functions)。
GreptimeDB 提供：

* [date_add](#data_add)
* [date_sub](#data_sub)
* [date_format](#date_format)
* [to_unixtime](#to_unixtime)
* [timezone](#timezone)

### date_add

*  `date_add(expression, interval)` 为 Timestamp、Date 或 DateTime 增加一个区间值

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

### data_sub

* `date_sub(expression, interval)` 为 Timestamp、Date 或 DateTime 减去一个区间值

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

### date_format

* `date_format(expression, fmt)` 根据格式将 Timestamp、Date 或 DateTime 转为字符串：

支持 `Date32`、`Date64` 以及所有 `Timestamp` 类型。

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

支持的格式化符号请参考 [chrono::format::strftime](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) 模块。

### to_unixtime

* `to_unixtime(expression)` 将表达式转换为秒级 Unix 时间戳。参数可以是整数（毫秒级时间戳）、Timestamp、Date、DateTime 或字符串。如果参数是字符串类型，函数会先尝试解析为 DateTime、Timestamp 或 Date。

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

### timezone

* `timezone()` 获取当前会话时区：

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

## 系统函数

* `isnull(expression)` 判断表达式是否为 `NULL`：
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


* `build()` 返回 GreptimeDB 构建信息。
* `version()` 返回 GreptimeDB 版本信息。
* `database()` 返回当前会话数据库：

```sql
select database();

+------------+
| database() |
+------------+
| public     |
+------------+
```

## 管理函数

GreptimeDB 提供 `ADMIN` 语句来运行管理函数，详见 [ADMIN](/reference/sql/admin.md) 文档。

## JSON 函数

GreptimeDB 提供 JSON 相关函数，[了解更多](./json.md)。

## 地理空间函数

GreptimeDB 提供地理索引与轨迹分析函数，[了解更多](./geo.md)。

## 向量函数

GreptimeDB 支持向量操作函数，如距离计算、相似度度量等，[了解更多](./vector.md)。

## 近似函数

GreptimeDB 支持近似分析函数，如近似去重计数（hll）、近似分位数（uddsketch）等，[了解更多](./approximate.md)。
