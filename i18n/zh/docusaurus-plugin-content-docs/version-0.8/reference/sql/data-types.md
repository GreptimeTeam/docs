# 数据类型

SQL 数据类型定义了列可以存储的数据类型。当您运行 `DESC TABLE` 命令时，你可以看到每列的数据类型。

## 字符串和二进制数据类型

| 类型名称 | 描述 | 大小 |
|-----------|-------------|------|
| `String`   | UTF-8 编码的字符串。最多可容纳 2,147,483,647 字节的数据 | 字符串的长度 |
| `Binary`   | 变长二进制值。最多可容纳 2,147,483,647 字节的数据 | 数据的长度 + 2 字节 |

`String` 和 `Binary` 的最大容量取决于它们的编码方式以及存储引擎如何处理它们。例如，`String` 值被编码为 UTF-8，如果所有字符的长度为 3 个字节，该字段最多可以存储 715,827,882 个字符。对于 `Binary` 类型，它们最多可以存储 2,147,483,647 字节。

## 数值数据类型

| 类型名称 | 描述 | 大小 |
|-----------|-------------|------|
| `Int8`     | -128 ~ 127   | 1 字节 |
| `Int16`    | -32768 ~ 32767 | 2 字节 |
| `Int32`    | -2147483648 ~ 2147483647 | 4 字节 |
| `Int64`    | -9223372036854775808 ~ 9223372036854775807 | 8 字节 |
| `UInt8`    | 0 ~ 255      | 1 字节 |
| `UInt16`   | 0 ~ 65535    | 2 字节 |
| `UInt32`   | 0 ~ 4294967295 | 4 字节 |
| `UInt64`   | 0 ~ 18446744073709551615 | 8 字节 |
| `Float32`  | 32 位 IEEE 754 浮点数 | 4 字节 |
| `Float64`  | 双精度 IEEE 754 浮点数 | 8 字节 |

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

| 类型名称 | 描述 | 大小 |
|-----------|-------------|------|
| `TimestampSecond` | 64 位时间戳值，精度为秒，范围：`[-262144-01-01 00:00:00, +262143-12-31 23:59:59]` | 8 字节 |
| `TimestampMillisecond` | 64 位时间戳值，毫秒精度，范围：`[-262144-01-01 00:00:00.000, +262143-12-31 23:59:59.999]` | 8 字节 |
| `TimestampMicroSecond` | 64 位时间戳值，微秒精度，范围：`[-262144-01-01 00:00:00.000000, +262143-12-31 23:59:59.999999]` | 8 字节 |
| `TimestampNanosecond` | 64 位时间戳值，纳秒精度，范围： `[1677-09-21 00:12:43.145225, 2262-04-11 23:47:16.854775807]` | 8 字节 |
| `Interval`| 时间间隔 | 对于 `YearMonth`, 使用 4 字节，对于 `DayTime`, 使用 8 字节，对于 `MonthDayNano`, 使用 16 字节 |

:::tip 注意
使用 MySQL/PostgreSQL 协议写入时间戳字符串字面量时，值的范围限制为 '0001-01-01 00:00:00' 到 '9999-12-31 23:59:59'。
:::

## 布尔类型

| 类型名称 | 描述 | 大小 |
|-----------|-------------|------|
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
| `Int16`                | `SmallInt`                                                      |
| `Int32`                | `Int`                                                           |
| `Int64`                | `BigInt`                                                        |
| `UInt8`                | `UnsignedTinyInt`                                               |
| `UInt16`               | `UnsignedSmallInt`                                              |
| `UInt32`               | `UnsignedInt`                                                   |
| `UInt64`               | `UnsignedBigInt`                                                |
| `Float32`              | `Float`                                                         |
| `Float64`              | `Double`                                                        |
| `TimestampSecond`      | `Timestamp_s`, `Timestamp_sec`, `Timestamp(0)`                  |
| `TimestampMillisecond` | `Timestamp`, `Timestamp_ms` , `Timestamp(3)`                    |
| `TimestampMicroSecond` | `Timestamp_us`, `Timestamp(6)`                                  |
| `TimestampNanosecond`  | `Timestamp_ns`, `Timestamp(9)`                                  |

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

| 类型名称 | 描述 | 大小 |
|-----------|-------------|------|
|`Date`     |32 位日期值，表示自 UNIX Epoch 以来的天数 | 4 字节 |
|`DateTime` |64 位日期时间值，表示自 UNIX Epoch 以来的毫秒数 | 8 字节 |

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
| dtt    | DateTime             |      | YES  |                     | FIELD         |
| ts0    | TimestampSecond      |      | YES  |                     | FIELD         |
| ts3    | TimestampMillisecond |      | YES  |                     | FIELD         |
| ts6    | TimestampMicrosecond |      | YES  |                     | FIELD         |
| ts9    | TimestampNanosecond  | PRI  | NO   | current_timestamp() | TIMESTAMP     |
+--------+----------------------+------+------+---------------------+---------------+
```
