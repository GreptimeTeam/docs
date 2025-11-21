---
keywords: [SQL 数据类型, 字符串类型, 数值类型, 日期和时间类型, 布尔类型, JSON 类型]
description: SQL 数据类型定义了列可以存储的数据类型，包括字符串、二进制、数值、日期和时间、布尔和 JSON 类型。
---

# 数据类型

SQL 数据类型定义了列可以存储的数据类型。当您运行 `DESC TABLE` 命令时，你可以看到每列的数据类型。

## 字符串和二进制数据类型

| 类型名称 | 描述                                                    | 大小                |
| -------- | ------------------------------------------------------- | ------------------- |
| `String` | UTF-8 编码的字符串。最多可容纳 2,147,483,647 字节的数据 | 字符串的长度        |
| `Binary` | 变长二进制值。最多可容纳 2,147,483,647 字节的数据       | 数据的长度 + 2 字节 |

`String` 和 `Binary` 的最大容量取决于它们的编码方式以及存储引擎如何处理它们。例如，`String` 值被编码为 UTF-8，如果所有字符的长度为 3 个字节，该字段最多可以存储 715,827,882 个字符。对于 `Binary` 类型，它们最多可以存储 2,147,483,647 字节。

## 数值数据类型

| 类型名称  | 描述                                       | 大小   |
| --------- | ------------------------------------------ | ------ |
| `Int8`    | -128 ~ 127                                 | 1 字节 |
| `Int16`   | -32768 ~ 32767                             | 2 字节 |
| `Int32`   | -2147483648 ~ 2147483647                   | 4 字节 |
| `Int64`   | -9223372036854775808 ~ 9223372036854775807 | 8 字节 |
| `UInt8`   | 0 ~ 255                                    | 1 字节 |
| `UInt16`  | 0 ~ 65535                                  | 2 字节 |
| `UInt32`  | 0 ~ 4294967295                             | 4 字节 |
| `UInt64`  | 0 ~ 18446744073709551615                   | 8 字节 |
| `Float32` | 32 位 IEEE 754 浮点数                      | 4 字节 |
| `Float64` | 双精度 IEEE 754 浮点数                     | 8 字节 |

:::tip 注意
这里的描述指的是 GreptimeDB 原生类型信息，这些类型都是以 位（bits） 为单位的。但是，在使用 SQL 时，请遵循 PostgreSQL 和 MySQL 的惯例，其中 `INT2`、`INT4`、`INT8`、`FLOAT4` 和 `FLOAT8` 等类型都是以 字节（bytes） 为单位定义的。
例如，在 SQL 语句中，`INT8` 实际上对应 `BigInt`（8 个字节，64 位）。
:::

## Decimal 类型

GreptimeDB 支持 `decimal` 类型，这是一种定点类型，表示为 `decimal(precision, scale)`，其中 `precision` 是总位数，`scale` 是小数部分的位数。例如，`123.45` 的总位数为 5，小数位数为 2。

- `precision` 可以在 [1, 38] 范围内。
- `scale` 可以在 [0, precision] 范围内。

如果未指定总位数和比例，则默认的十进制数是 `decimal(38, 10)`。

```sql
CREATE TABLE decimals(
    d DECIMAL(3, 2), 
    ts TIMESTAMP TIME INDEX,
);

INSERT INTO decimals VALUES ('0.1',1000), ('0.2',2000);

SELECT * FROM decimals;
```

```sql
+------+---------------------+
| d    | ts                  |
+------+---------------------+
| 0.10 | 1970-01-01T00:00:01 |
| 0.20 | 1970-01-01T00:00:02 |
+------+---------------------+
```

## 日期和时间类型

| 类型名称               | 描述                                                                                            | 大小                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `TimestampSecond`      | 64 位时间戳值，精度为秒，范围：`[-262144-01-01 00:00:00, +262143-12-31 23:59:59]`               | 8 字节                                                                                        |
| `TimestampMillisecond` | 64 位时间戳值，毫秒精度，范围：`[-262144-01-01 00:00:00.000, +262143-12-31 23:59:59.999]`       | 8 字节                                                                                        |
| `TimestampMicroSecond` | 64 位时间戳值，微秒精度，范围：`[-262144-01-01 00:00:00.000000, +262143-12-31 23:59:59.999999]` | 8 字节                                                                                        |
| `TimestampNanosecond`  | 64 位时间戳值，纳秒精度，范围： `[1677-09-21 00:12:43.145225, 2262-04-11 23:47:16.854775807]`   | 8 字节                                                                                        |
| `Interval`             | 时间间隔                                                                                        | 对于 `YearMonth`, 使用 4 字节，对于 `DayTime`, 使用 8 字节，对于 `MonthDayNano`, 使用 16 字节 |

:::tip 注意
使用 MySQL/PostgreSQL 协议写入时间戳字符串字面量时，值的范围限制为 '0001-01-01 00:00:00' 到 '9999-12-31 23:59:59'。
:::

### Interval 类型详解

`Interval` 类型用于需要跟踪和操作时间间隔的场景。它的编写语法如下：

```
QUANTITY UNIT [QUANTITY UNIT...]
```

* `QUANTITY`：是一个数字（可能有符号），
* `UNIT`：时间单位，可以是 `microsecond`（微秒）、`millisecond`（毫秒）、`second`（秒）、`minute`（分钟）、`hour`（小时）、`day`（天）、`week`（周）、`month`（月）、`year`（年）、`decade`（十年）、`century`（世纪）或这些单位的缩写或复数形式；

不同的时间单位将会被计算合并，每个单位的符号决定它是增加还是减少总间隔。例如，“1 年 -2 个月”导致净间隔为 10 个月。
遗憾的是，GreptimeDB 暂时还不支持以 [ISO 8601 时间间隔](https://en.wikipedia.org/wiki/ISO_8601#Time_intervals)格式编写间隔，例如 `P3Y3M700DT133H17M36.789S` 等。但它支持以这种格式输出。

让我们来看一些例子：

```sql
SELECT '2 years 15 months 100 weeks 99 hours 123456789 milliseconds'::INTERVAL;
```

```sql
+---------------------------------------------------------------------+
| Utf8("2 years 15 months 100 weeks 99 hours 123456789 milliseconds") |
+---------------------------------------------------------------------+
| P3Y3M700DT133H17M36.789S                                            |
+---------------------------------------------------------------------+
```

55 分钟前：

```sql
SELECT '-1 hour 5 minute'::INTERVAL;
```

```sql
+--------------------------+
| Utf8("-1 hour 5 minute") |
+--------------------------+
| P0Y0M0DT0H-55M0S         |
+--------------------------+
```

1 小时 5 分钟前：

```sql
SELECT '-1 hour -5 minute'::INTERVAL;
```

```sql
+---------------------------+
| Utf8("-1 hour -5 minute") |
+---------------------------+
| P0Y0M0DT-1H-5M0S          |
+---------------------------+
```

当然，你可以通过算术运算来操作时间间隔。
获取 5 分钟前的时间：

```sql
SELECT now() - '5 minute'::INTERVAL;
```

```sql
+----------------------------------------------+
| now() - IntervalMonthDayNano("300000000000") |
+----------------------------------------------+
| 2024-06-24 21:24:05.012306                   |
+----------------------------------------------+
```

GreptimeDB 还支持类似 `3y2mon4h` 这样不包含空格的简写形式：

```sql
SELECT '3y2mon4h'::INTERVAL;
```

```
+---------------------------------------------------------+
| IntervalMonthDayNano("3010670175542044842954670112768") |
+---------------------------------------------------------+
| P3Y2M0DT4H0M0S                                          |
+---------------------------------------------------------+
```

同样也支持符号数：

```sql
SELECT '-1h5m'::INTERVAL;
```

```
+----------------------------------------------+
| IntervalMonthDayNano("18446740773709551616") |
+----------------------------------------------+
| P0Y0M0DT0H-55M0S                             |
+----------------------------------------------+
```

支持的缩写包括：

| 缩写   | 全称         |
| ------ | ------------ |
| y      | years        |
| mon    | months       |
| w      | weeks        |
| d      | days         |
| h      | hours        |
| m      | minutes      |
| s      | seconds      |
| millis | milliseconds |
| ms     | milliseconds |
| us     | microseconds |
| ns     | nanoseconds  |

#### INTERVAL 关键字

在上述示例中，我们使用了 `cast` 类型转换操作 `'{quantity unit}'::INTERVAL` 来演示 interval 类型。实际上，interval 类型也可以使用 `INTERVAL` 关键字支持的语法，不过不同数据库方言之间的行为有所差异：

1. 在 MySQL 中，语法为 `INTERVAL {quantity} {unit}`，其中 `quantity` 可以是数字或字符串，具体取决于上下文。例如：
```sql
mysql> SELECT INTERVAL 1 YEAR;
+--------------------------------------------------------------------------------------+
| IntervalMonthDayNano("IntervalMonthDayNano { months: 12, days: 0, nanoseconds: 0 }") |
+--------------------------------------------------------------------------------------+
| P1Y0M0DT0H0M0S                                                                       |
+--------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

mysql> SELECT INTERVAL '1 YEAR 2' MONTH;
+--------------------------------------------------------------------------------------+
| IntervalMonthDayNano("IntervalMonthDayNano { months: 14, days: 0, nanoseconds: 0 }") |
+--------------------------------------------------------------------------------------+
| P1Y2M0DT0H0M0S                                                                       |
+--------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

2. 在 PostgreSQL 和默认的 GreptimeDB 方言中，语法为 `INTERVAL '{quantity unit}'`，即 INTERVAL 关键字后跟 interval 字符串：
```sql
public=> SELECT INTERVAL '1 year';
 IntervalMonthDayNano("IntervalMonthDayNano { months: 12, days: 0, nanoseconds: 0 }")
--------------------------------------------------------------------------------------
 1 year
(1 row)

public=> SELECT INTERVAL '1 year 2 month';
 IntervalMonthDayNano("IntervalMonthDayNano { months: 14, days: 0, nanoseconds: 0 }")
--------------------------------------------------------------------------------------
 1 year 2 mons
(1 row)
```

## JSON 类型（实验功能）

:::warning
JSON 类型目前仍处于实验阶段，在未来的版本中可能会有所调整。
:::

GreptimeDB 支持 JSON 类型，允许用户存储和查询 JSON 格式的数据。JSON 类型非常灵活，可以存储各种形式的结构化或非结构化数据，适合日志记录、分析和半结构化数据存储等场景。

```sql
CREATE TABLE json_data(
    my_json JSON, 
    ts TIMESTAMP TIME INDEX
);

INSERT INTO json_data VALUES ('{"key1": "value1", "key2": 10}', 1000), 
                             ('{"name": "GreptimeDB", "open_source": true}', 2000);

SELECT * FROM json_data;
```

输出：

```
+------------------------------------------+---------------------+
| my_json                                  | ts                  |
+------------------------------------------+---------------------+
| {"key1":"value1","key2":10}              | 1970-01-01 00:00:01 |
| {"name":"GreptimeDB","open_source":true} | 1970-01-01 00:00:02 |
+------------------------------------------+---------------------+
```

### 查询 JSON 数据

您可以直接查询 JSON 数据，也可以使用 GreptimeDB 提供的 [JSON 函数](./functions/overview.md#json-functions) 提取特定字段。以下是一个示例：

```sql
SELECT json_get_string(my_json, '$.name') as name FROM json_data;
```

输出：

```
+---------------------------------------------------+
| name                                              |
+---------------------------------------------------+
| NULL                                              |
| GreptimeDB                                        |
+---------------------------------------------------+
```


## 布尔类型

| 类型名称  | 描述   | 大小   |
| --------- | ------ | ------ |
| `Boolean` | 布尔值 | 1 字节 |

在 SQL 语句中使用 `TRUE` 或 `FALSE` 表示布尔值。例如：

```sql
CREATE TABLE bools(
    b BOOLEAN, 
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
);
```
  
```sql
INSERT INTO bools(b) VALUES (TRUE), (FALSE);
```

## 与 MySQL 和 PostgreSQL 兼容的数据类型

### 类型别名

对于从 MySQL 或 PostgreSQL 迁移到 GreptimeDB 的用户，GreptimeDB 支持以下类型别名。

| 数据类型               | 别名                                                            |
| ---------------------- | --------------------------------------------------------------- |
| `String`               | `Text`, `TinyText`, `MediumText`, `LongText`, `Varchar`, `Char` |
| `Binary`               | `Varbinary`                                                     |
| `Int8`                 | `TinyInt`                                                       |
| `Int16`                | `SmallInt`, `Int2`                                              |
| `Int32`                | `Int`, `Int4`                                                   |
| `Int64`                | `BigInt`, `Int8`                                                |
| `UInt8`                | `UnsignedTinyInt`                                               |
| `UInt16`               | `UnsignedSmallInt`                                              |
| `UInt32`               | `UnsignedInt`                                                   |
| `UInt64`               | `UnsignedBigInt`                                                |
| `Float32`              | `Float`, `Float4`                                               |
| `Float64`              | `Double`, `Float8`                                              |
| `TimestampSecond`      | `Timestamp_s`, `Timestamp_sec`, `Timestamp(0)`                  |
| `TimestampMillisecond` | `Timestamp`, `Timestamp_ms` , `Timestamp(3)`                    |
| `TimestampMicroSecond` | `Timestamp_us`, `Timestamp(6)`                                  |
| `TimestampNanosecond`  | `Timestamp_ns`, `Timestamp(9)`                                  |

:::warning 重要变更
类型别名 `Int2`、`Int4`、`Int8`、`Float4` 和 `Float8` 遵循 PostgreSQL 和 MySQL 的约定，这些标识符表示类型中的**字节**数（而非位数）。

具体来说：
- `Int2` = 2 字节 = `SmallInt`（16 位）
- `Int4` = 4 字节 = `Int`（32 位）
- `Int8` = 8 字节 = `BigInt`（64 位）- **不兼容变更**：之前映射到 `TinyInt`（8 位）
- `Float4` = 4 字节 = `Float`（32 位）
- `Float8` = 8 字节 = `Double`（64 位）

注意：GreptimeDB 的原生类型名称（如 `UInt8`、`Int32`、`Int64`）表示**位**数，而 SQL 类型别名 `Int2`、`Int4` 和 `Int8` 遵循 PostgreSQL/MySQL 约定表示**字节**数。例如，原生类型 `Int8` 是 8 **位**整数（`TinyInt`, 1 字节），而 SQL 别名 `INT8` 映射到 8 **字节**整数（`BigInt`，64 位）。
:::

在创建表时也可以使用这些别名类型。
例如，使用 `Varchar` 代替 `String`，使用 `Double` 代替 `Float64`，使用 `Timestamp(0)` 代替 `TimestampSecond`。

```sql
CREATE TABLE alias_types (
  s TEXT,
  i Double,
  ts0 Timestamp(0) DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
  PRIMARY KEY(s)
);
```

### 日期和时间类型

除了在 GreptimeDB 中用作默认时间类型的 `Timestamp` 类型之外
GreptimeDB 还支持与 MySQL 和 PostgreSQL 兼容的 `Date` 和 `DateTime` 类型。

| 类型名称   | 描述                                               | 大小   |
| ---------- | -------------------------------------------------- | ------ |
| `Date`     | 32 位日期值，表示自 UNIX Epoch 以来的天数          | 4 字节 |
| `DateTime` | 64 位毫秒精度的间戳，等同于 `TimestampMicrosecond` | 8 字节 |

## 示例

### 创建表

```sql
CREATE TABLE data_types (
  s STRING,
  vbi BINARY,
  b BOOLEAN,
  tint INT8,
  sint INT16,
  i INT32,
  bint INT64,
  utint UINT8,
  usint UINT16,
  ui UINT32,
  ubint UINT64,
  f FLOAT32,
  d FLOAT64,
  dm DECIMAL(3, 2), 
  dt DATE,
  dtt DATETIME,
  ts0 TIMESTAMPSECOND,
  ts3 TIMESTAMPMILLISECOND,
  ts6 TIMESTAMPMICROSECOND,
  ts9 TIMESTAMPNANOSECOND DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
  PRIMARY KEY(s));
```

### 描述表结构

```sh
DESC TABLE data_types;
```

```sql
+--------+----------------------+------+------+---------------------+---------------+
| Column | Type                 | Key  | Null | Default             | Semantic Type |
+--------+----------------------+------+------+---------------------+---------------+
| s      | String               | PRI  | YES  |                     | TAG           |
| vbi    | Binary               |      | YES  |                     | FIELD         |
| b      | Boolean              |      | YES  |                     | FIELD         |
| tint   | Int8                 |      | YES  |                     | FIELD         |
| sint   | Int16                |      | YES  |                     | FIELD         |
| i      | Int32                |      | YES  |                     | FIELD         |
| bint   | Int64                |      | YES  |                     | FIELD         |
| utint  | UInt8                |      | YES  |                     | FIELD         |
| usint  | UInt16               |      | YES  |                     | FIELD         |
| ui     | UInt32               |      | YES  |                     | FIELD         |
| ubint  | UInt64               |      | YES  |                     | FIELD         |
| f      | Float32              |      | YES  |                     | FIELD         |
| d      | Float64              |      | YES  |                     | FIELD         |
| dm     | Decimal(3, 2)        |      | YES  |                     | FIELD         |
| dt     | Date                 |      | YES  |                     | FIELD         |
| dtt    | TimestampMicrosecond |      | YES  |                     | FIELD         |
| ts0    | TimestampSecond      |      | YES  |                     | FIELD         |
| ts3    | TimestampMillisecond |      | YES  |                     | FIELD         |
| ts6    | TimestampMicrosecond |      | YES  |                     | FIELD         |
| ts9    | TimestampNanosecond  | PRI  | NO   | current_timestamp() | TIMESTAMP     |
+--------+----------------------+------+------+---------------------+---------------+
```
