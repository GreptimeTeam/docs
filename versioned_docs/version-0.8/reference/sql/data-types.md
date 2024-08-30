# Data Types

SQL data types define the type of data that a column can store. When you run the `DESC TABLE` command, you can see the data type of each column.

## String and Binary Data Types

| Type Name | Description | Size |
|-----------|-------------|------|
| `String`   | UTF-8 encoded strings. Holds up to 2,147,483,647 bytes of data | The length of the strings |
| `Binary`   | Variable-length binary values. Holds up to 2,147,483,647 bytes of data | The length of the data + 2 bytes |

The maximum capacities of `String` and `Binary` are determined by their encodings and how the storage engine handles them. For example, `String` values are encoded into UTF-8. If all characters are 3 bytes in length, this field can store up to 715,827,882 characters. As for `Binary` types, they can store a maximum of 2,147,483,647 bytes.

## Numeric Data Types

| Type Name | Description | Size |
|-----------|-------------|------|
| `Int8`     | -128 ~ 127   | 1 Byte |
| `Int16`    | -32768 ~ 32767 | 2 Bytes |
| `Int32`    | -2147483648 ~ 2147483647 | 4 Bytes |
| `Int64`    | -9223372036854775808 ~ 9223372036854775807 | 8 Bytes |
| `UInt8`    | 0 ~ 255      | 1 Byte |
| `UInt16`   | 0 ~ 65535    | 2 Bytes |
| `UInt32`   | 0 ~ 4294967295 | 4 Bytes |
| `UInt64`   | 0 ~ 18446744073709551615 | 8 Bytes |
| `Float32`  | 32-bit IEEE754 floating point values | 4 Bytes |
| `Float64`  | Double precision IEEE 754 floating point values | 8 Bytes |

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

| Type Name | Description | Size |
|-----------|-------------|------|
| `TimestampSecond` | 64-bit timestamp values with seconds precision | 8 Bytes |
| `TimestampMillisecond` | 64-bit timestamp values with milliseconds precision | 8 Bytes |
| `TimestampMicroSecond` | 64-bit timestamp values with microseconds precision | 8 Bytes |
| `TimestampNanosecond` | 64-bit timestamp values with nanoseconds precision | 8 Bytes |

## Boolean Type

| Type Name | Description | Size |
|-----------|-------------|------|
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
| `UInt8`                | `UnsignedInt`                                                   |
| `UInt16`               | `UnsignedTinyInt`                                               |
| `UInt32`               | `UnsignedSmallInt`                                              |
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

| Type name | Description | Size |
|-----------|-------------|------|
|`Date`     |32-bit date values represent the days since UNIX Epoch | 4 Bytes |
|`DateTime` |64-bit datetime values represent the milliseconds since UNIX Epoch| 8 Bytes |

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
| dtt    | DateTime             |      | YES  |                     | FIELD         |
| ts0    | TimestampSecond      |      | YES  |                     | FIELD         |
| ts3    | TimestampMillisecond |      | YES  |                     | FIELD         |
| ts6    | TimestampMicrosecond |      | YES  |                     | FIELD         |
| ts9    | TimestampNanosecond  | PRI  | NO   | current_timestamp() | TIMESTAMP     |
+--------+----------------------+------+------+---------------------+---------------+
```
