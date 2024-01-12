# Data Types

GreptimeDB supports the following data types:

| Type name | Description | Aliases | Size |
|:-:|:-:| :-:| :-:|
|`tinyint`| -128 ~ 127|`Int8`| 1 Byte |
|`smallint`| -32768 ~ 32767 | `Int16`|2 Bytes |
|`int`| -2147483648 ~ 2147483647| `Int32`|  4 Bytes |
|`bigint`| -9223372036854775808 ~ 9223372036854775807| `Int64` | 8 Bytes |
|`varchar`|UTF-8 encoded strings|`Text`<br />/`String`<br />/ `Char `| The length of the strings |
|`float`|32-bit IEEE754 floating point values |`Float32`| 4 Bytes |
|`double`|Double precision IEEE 754 floating point values|`Float64`| 8 Bytes |
|`boolean`|bool values|`Boolean`| 1 Byte |
|`varbinary`|Variable length binary values| `Binary`| The length of the data + 2 bytes|
|`date`|32-bit date values represent the days since UNIX Epoch |`Date`| 4 Bytes |
|`datetime`|64-bit datetime values represent the milliseconds since UNIX Epoch|`DateTime`| 8 Bytes |
|`timestamp[(0/3/6/9)]`|64-bit timestamp values with optional precision. <br /> For example, `timestamp(0)` represents timestamp type with seconds precision, `timestamp(3)` represents  milliseconds precision, `timestamp(6)` for microseonds and `timestamp(9)` for nanoseconds. If no precision is given, the timestamp is in **milliseconds** precision by default.|`TimestampSecond`<br />/`TimestampMillisecond`<br />/`TimestampMicroSecond`<br />/`TimestampNanosecond` | 8 Bytes |

## Unsigned version of integer types
`int` / `tinyint` / `smallint` / `bigint` also have unsigned version, and there corresponding value ranges are:

- `int unsigned / UInt8` : 0 ~ 4294967295
- `tinyint unsigned / UInt16` : 0 ~ 255
- `smallint unsigned / UInt32` : 0 ~ 65535
- `bigint unsigned / UInt64` : 0 ~ 18446744073709551615



## Variable-sized type limitations

The max capacities of variable-sized type, such as `string` and `varbinary` are determined by their encodings and how storage engine handles them. 

For example, `string` values are encoded into UTF-8. If all characters are 3-bytes lengthed, this field can store 715827882 characters. As for `varbinary` types, it can store 2147483647 bytes at most.


## Timestamp type alias

The `timestamp` type comes with various aliases, and it is suggested to use `TimestampSecond`, `TimestampMillisecond`, `TimestampMicrosecond`, and `TimestampNanosecond`. 

The following table lists the corresponding alias.

|Type name|Alias|
|:-|:-:|
|TimestampSecond| Timestamp_s, Timestamp_sec , Timestamp(0)|
|TimestampMillisecond| Timestamp, Timestamp_ms , Timestamp(3)|
|TimestampMicrosecond| Timestamp_us , Timestamp(6)|
|TimestampNanosecond|Timestamp_ns , Timestamp(9)|

## Decimal

GreptimeDB supports `decimal` type, which is a fixed-point type. 

It is represented as `decimal(precision, scale)`, where `precision` is the total number of digits and `scale` is the 
number of digits in the fractional part. For example, `123.45` has a precision of 5 and a scale of 2.


- `precision` can range from [1, 38]. 
- `scale` can range from [0, precision].

The default decimal is `decimal(38, 10)` if the precision and scale are not specified.

### Simple Usage

```sql
CREATE TABLE decimals(
    d DECIMAL(3, 2), 
    ts TIMESTAMP TIME INDEX,
);

INSERT INTO decimals VALUES ('0.1',1000), ('0.2',2000);

SELECT * FROM decimals;
```

Output:
```sh
+------+---------------------+
| d    | ts                  |
+------+---------------------+
| 0.10 | 1970-01-01T00:00:01 |
| 0.20 | 1970-01-01T00:00:02 |
+------+---------------------+
```


## Examples

### Create Table

```sql
CREATE TABLE data_types (
  s String,
  vbi Binary,
  b Boolean,
  tint Int8,
  sint Int16,
  i Int32,
  bint Int64,
  utint UInt8,
  usint UInt16,
  ui UInt32,
  ubint UInt64,
  f Float32,
  d Float64,
  dt Date,
  dtt DateTime,
  ts0 TimestampSecond,
  ts3 TimestampMillisecond,
  ts6 TimestampMicrosecond,
  ts9 TimestampNanosecond DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
  PRIMARY KEY(s));
```

### Describe Table

```sh
> describe table data_types;
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
| dt     | Date                 |      | YES  |                     | FIELD         |
| dtt    | DateTime             |      | YES  |                     | FIELD         |
| ts0    | TimestampSecond      |      | YES  |                     | FIELD         |
| ts3    | TimestampMillisecond |      | YES  |                     | FIELD         |
| ts6    | TimestampMicrosecond |      | YES  |                     | FIELD         |
| ts9    | TimestampNanosecond  | PRI  | NO   | current_timestamp() | TIMESTAMP     |
+--------+----------------------+------+------+---------------------+---------------+
```
