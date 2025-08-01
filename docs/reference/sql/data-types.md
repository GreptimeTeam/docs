---
keywords: [SQL data types, SQL column types, SQL syntax, SQL examples, SQL type compatibility]
description: Provides an overview of SQL data types supported by GreptimeDB, including string, binary, numeric, decimal, date and time, interval, JSON, and boolean types, with examples and compatibility with MySQL and PostgreSQL.
---

# Data Types

SQL data types define the type of data that a column can store. When you run the `DESC TABLE` command, you can see the data type of each column.

## String and Binary Data Types

| Type Name | Description                                                            | Size                             |
| --------- | ---------------------------------------------------------------------- | -------------------------------- |
| `String`  | UTF-8 encoded strings. Holds up to 2,147,483,647 bytes of data         | The length of the strings        |
| `Binary`  | Variable-length binary values. Holds up to 2,147,483,647 bytes of data | The length of the data + 2 bytes |

The maximum capacities of `String` and `Binary` are determined by their encodings and how the storage engine handles them. For example, `String` values are encoded into UTF-8. If all characters are 3 bytes in length, this field can store up to 715,827,882 characters. As for `Binary` types, they can store a maximum of 2,147,483,647 bytes.

## Numeric Data Types

| Type Name | Description                                     | Size    |
| --------- | ----------------------------------------------- | ------- |
| `Int8`    | -128 ~ 127                                      | 1 Byte  |
| `Int16`   | -32768 ~ 32767                                  | 2 Bytes |
| `Int32`   | -2147483648 ~ 2147483647                        | 4 Bytes |
| `Int64`   | -9223372036854775808 ~ 9223372036854775807      | 8 Bytes |
| `UInt8`   | 0 ~ 255                                         | 1 Byte  |
| `UInt16`  | 0 ~ 65535                                       | 2 Bytes |
| `UInt32`  | 0 ~ 4294967295                                  | 4 Bytes |
| `UInt64`  | 0 ~ 18446744073709551615                        | 8 Bytes |
| `Float32` | 32-bit IEEE754 floating point values            | 4 Bytes |
| `Float64` | Double precision IEEE 754 floating point values | 8 Bytes |

## Decimal Type

GreptimeDB supports the `decimal` type, a fixed-point type represented as `decimal(precision, scale)`, where `precision` is the total number of digits, and `scale` is the number of digits in the fractional part. For example, `123.45` has a precision of 5 and a scale of 2.

- `precision` can range from [1, 38].
- `scale` can range from [0, precision].

The default decimal is `decimal(38, 10)` if the precision and scale are not specified.

```sql
CREATE TABLE decimals(
    d DECIMAL(3, 2), 
    ts TIMESTAMP TIME INDEX,
);

INSERT INTO decimals VALUES ('0.1',1000), ('0.2',2000);

SELECT * FROM decimals;
```

Output:
```sql
+------+---------------------+
| d    | ts                  |
+------+---------------------+
| 0.10 | 1970-01-01T00:00:01 |
| 0.20 | 1970-01-01T00:00:02 |
+------+---------------------+
```

## Date and Time Types

| Type Name              | Description                                                                                                                  | Size                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `TimestampSecond`      | 64-bit timestamp values with seconds precision, range: `[-262144-01-01 00:00:00, +262143-12-31 23:59:59]`                    | 8 Bytes                                                                        |
| `TimestampMillisecond` | 64-bit timestamp values with milliseconds precision, range: `[-262144-01-01 00:00:00.000, +262143-12-31 23:59:59.999]`       | 8 Bytes                                                                        |
| `TimestampMicroSecond` | 64-bit timestamp values with microseconds precision, range: `[-262144-01-01 00:00:00.000000, +262143-12-31 23:59:59.999999]` | 8 Bytes                                                                        |
| `TimestampNanosecond`  | 64-bit timestamp values with nanoseconds precision, range: `[1677-09-21 00:12:43.145225, 2262-04-11 23:47:16.854775807]`     | 8 Bytes                                                                        |
| `Interval`             | Time interval                                                                                                                | 4 Bytes for `YearMonth`, 8 Bytes for `DayTime` and 16 Bytes for `MonthDayNano` |

:::tip NOTE
When inserting Timestamp string literals to GreptimeDB using MySQL/PostgreSQL protocol, the value range is limited to '0001-01-01 00:00:00' to '9999-12-31 23:59:59'.
:::

### Interval Type

`Interval` type is used in scenarios where you need to track and manipulate time durations. It can be written using the following verbose syntax:

```
QUANTITY UNIT [QUANTITY UNIT...]
```

* `QUANTITY`:  is a number (possibly signed),
* `UNIT`:   is `microsecond`, `millisecond`, `second`, `minute`, `hour`, `day`, `week`, `month`, `year`, `decade`, `century`, or abbreviations or plurals of these units; 

The amounts of the different units are combined, with each unit's sign determining if it adds or subtracts from the total interval. For example, '1 year -2 months' results in a net interval of ten months. Unfortunately, GreptimeDB doesn't support writing the interval in the format of [ISO 8601 time intervals](https://en.wikipedia.org/wiki/ISO_8601#Time_intervals) such as `P3Y3M700DT133H17M36.789S` etc. But it's output supports it.

Let's take some examples:

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

55 minutes ago:

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

1 hour and 5 minutes ago:

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

And of course, you can manipulate time with intervals by arithmetics.
Get the time of 5 minutes go:

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

GreptimeDB also supports shorthand forms without spaces, such as `3y2mon4h`:

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

It also supports signed numbers:

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

Supported abbreviations include:

| Abbreviation | Full name    |
| ------------ | ------------ |
| y            | years        |
| mon          | months       |
| w            | weeks        |
| d            | days         |
| h            | hours        |
| m            | minutes      |
| s            | seconds      |
| millis       | milliseconds |
| ms           | milliseconds |
| us           | microseconds |
| ns           | nanoseconds  |

#### INTERVAL keyword

In the examples above, we used the cast operation `'{quantity unit}'::INTERVAL` to demonstrate the interval type. In fact, the interval type can also be used with the syntax supported by the `INTERVAL` keyword, though the behavior varies between database dialects:

1. In MySQL, the syntax is `INTERVAL {quantity} {unit}`, where `quantity` can be a number or a string depending on the context. For example:
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

2. In PostgreSQL and the default GreptimeDB dialect, it is `INTERVAL '{quantity unit}'`, where the INTERVAL keyword is followed by the interval string:
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

## JSON Type (Experimental)

:::warning
The JSON feature is currently experimental and may change in future releases.
:::

GreptimeDB supports the JSON type, allowing users to store and query JSON-formatted data. The JSON type is highly flexible and can store various forms of structured or unstructured data, making it suitable for use cases such as logging, analytics, and semi-structured data storage.

```sql
CREATE TABLE json_data(
    my_json JSON, 
    ts TIMESTAMP TIME INDEX
);

INSERT INTO json_data VALUES ('{"key1": "value1", "key2": 10}', 1000), 
                             ('{"name": "GreptimeDB", "open_source": true}', 2000);

SELECT * FROM json_data;
```

Output:

```
+------------------------------------------+---------------------+
| my_json                                  | ts                  |
+------------------------------------------+---------------------+
| {"key1":"value1","key2":10}              | 1970-01-01 00:00:01 |
| {"name":"GreptimeDB","open_source":true} | 1970-01-01 00:00:02 |
+------------------------------------------+---------------------+
```

### Query JSON data

You can query the JSON data directly or extract specific fields using [JSON functions](./functions/overview.md#json-functions) provided by GreptimeDB. Here's an example:

```sql
SELECT json_get_string(my_json, '$.name') as name FROM json_data;
```

Output:

```
+---------------------------------------------------+
| name                                              |
+---------------------------------------------------+
| NULL                                              |
| GreptimeDB                                        |
+---------------------------------------------------+
```


## Boolean Type

| Type Name | Description | Size   |
| --------- | ----------- | ------ |
| `Boolean` | Bool values | 1 Byte |

Use `TRUE` or `FALSE` to represent boolean values in SQL statements. For example:

```sql
CREATE TABLE bools(
    b BOOLEAN, 
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
);
```

```sql
INSERT INTO bools(b) VALUES (TRUE), (FALSE);
```

## Data types compatible with MySQL and PostgreSQL

### Type aliases

For users migrating from MySQL or PostgreSQL to GreptimeDB, GreptimeDB supports the following alias types.

| Data Type              | Alias Types                                                     |
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
| `TimestampMillisecond` | `Timestamp`, `Timestamp_ms`, `Timestamp(3)`                     |
| `TimestampMicroSecond` | `Timestamp_us`, `Timestamp(6)`                                  |
| `TimestampNanosecond`  | `Timestamp_ns`, `Timestamp(9)`                                  |

You can use these alias types when creating tables.
For example, use `Varchar` instead of `String`, `Double` instead of `Float64`, and `Timestamp(0)` instead of `TimestampSecond`.

```sql
CREATE TABLE alias_types (
  s TEXT,
  i DOUBLE,
  ts0 TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
  PRIMARY KEY(s)
);
```

### Date and time types

In addition to the `Timestamp` types used as the default time type in GreptimeDB, GreptimeDB also supports `Date` and `DateTime` types for compatibility with MySQL and PostgreSQL.

| Type name  | Description                                                                               | Size    |
| ---------- | ----------------------------------------------------------------------------------------- | ------- |
| `Date`     | 32-bit date values represent the days since UNIX Epoch                                    | 4 Bytes |
| `DateTime` | 64-bit timestamp values with milliseconds precision, equivalent to `TimestampMicrosecond` | 8 Bytes |

## Examples

### Create Table

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

### Describe Table

```sql
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
