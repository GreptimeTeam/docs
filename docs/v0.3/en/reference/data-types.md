# Data Types

GreptimeDB supports the following data types:

| Type name | Description | Synonyms | Size |
|:-:|:-:| :-:| :-:|
|`tinyint`| 8-bit signed small integers between -128~127|| 1 Byte |
|`smallint`| 16-bit signed big integers between -32768~32767 | |2 Bytes |
|`int`| 32-bit signed integers between -2147483648~2147483647| `integer`|  4 Bytes |
|`bigint`| 64-bit signed big integers between -9223372036854775808~9223372036854775807| | 8 Bytes |
|`varchar`|UTF-8 encoded strings|`text`<br />/`string`<br />/ `char`| The length of the strings |
|`float`|32-bit IEEE754 floating point values || 4 Bytes |
|`double`|Double precision IEEE 754 floating point values|| 8 Bytes |
|`boolean`|Boolean values|| 1 Byte |
|`varbinary`|Variable length binary values| | The length of the data + 2 bytes|
|`date`|32-bit date values|| 4 Bytes |
|`datetime`|64-bit datetime values|| 8 Bytes |
|`timestamp[(0/3/6/9)]`|64-bit timestamp values with optional precision. <br /> For example, `timestamp(0)` represents timestamp type with seconds precision, `timestamp(3)` represents  milliseconds precision, `timestamp(6)` for microseconds and `timestamp(9)` for nanoseconds. If no precision is given, the timestamp is in **milliseconds** precision by default.|| 8 Bytes |

## Unsigned version of integer types

`int` / `tinyint` / `smallint` / `bigint` also have unsigned version, and there corresponding value ranges are:

- `int unsigned`: 0~4294967295
- `tinyint unsigned`: 0~255
- `smallint unsigned`: 0~65535
- `bigint unsigned`: 0~18446744073709551615

## Variable-sized type limitations

The max capacities of variable-sized type, such as `string` and `varbinary` are determined by their encodings and how storage engine handles them.

For example, `string` values are encoded into UTF-8. If all characters are 3-bytes lengthed, this field can store 715827882 characters. As for `varbinary` types, it can store 2147483647 bytes at most.

### Choose the data type for timestamp column

GreptimeDB allows user to choose `bigint` or `timestamp` for timestamp index column.
Both `bigint` and `timestamp` are interpreted as timestamp in millisecond precision.

```SQL
# using TIMESTAMP as timestamp column data type
CREATE TABLE monitor (
    host STRING,
    ts TIMESTAMP, 
    cpu DOUBLE DEFAULT 0,
    memory DOUBLE,
    TIME INDEX (ts),
    PRIMARY KEY(host)) ENGINE=mito WITH(regions=1);

# using BIGINT as timestamp column data type is also allowed
CREATE TABLE monitor (
    host STRING,
    ts BIGINT, 
    cpu DOUBLE DEFAULT 0,
    memory DOUBLE,
    TIME INDEX (ts),
    PRIMARY KEY(host)) ENGINE=mito WITH(regions=1);
```
