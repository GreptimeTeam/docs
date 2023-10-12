# 数据类型

GreptimeDB 支持下列数据类型：

| 类型 | 描述 | 别名 | 大小 |
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

## 整数类型的 Unsigned 版本

`int` / `tinyint` / `smallint` / `bigint` 有 unsigned 版本，相应的值范围如下：

- `int unsigned / UInt8` : 0 ~ 4294967295
- `tinyint unsigned / UInt16` : 0 ~ 255
- `smallint unsigned / UInt32` : 0 ~ 65535
- `bigint unsigned / UInt64` : 0 ~ 18446744073709551615

## Variable-sized 类型的限制

variable-sized 类型的最大容量, 例如 `string` 和 `varbinary`，取决于它们的编码和存储引擎处理它们的方式。

例如，`string` 值被编码为 UTF-8。如果所有字符都是 3 字节长度，则该字段可以存储 715827882 个字符。对于 `varbinary` 类型，最多可以存储 2147483647 字节。

## Timestamp 类型别名

`timestamp` 类型带有各种别名，建议使用 `TimestampSecond`、`TimestampMillisecond`、`TimestampMicrosecond` 和 `TimestampNanosecond`。下表列出了对应的别名。

|Type name|Alias|
|:-|:-:|
|TimestampSecond| Timestamp_s, Timestamp_sec , Timestamp(0)|
|TimestampMillisecond| Timestamp, Timestamp_ms , Timestamp(3)|
|TimestampMicrosecond| Timestamp_us , Timestamp(6)|
|TimestampNanosecond|Timestamp_ns , Timestamp(9)|

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
  ts9 TimestampNanosecond DEFAULT CURRENT_TIMESTAMP TIME INDEX,
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