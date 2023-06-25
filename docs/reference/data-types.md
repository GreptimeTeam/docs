# Data Types

GreptimeDB supports the following data types:

| Type name | Description | Synonyms |
|:-:|:-:| :-:|
|`tinyint`| 8-bit signed small integers between -128~127| |
|`smallint`| 16-bit signed big integers between -32768~32767 | |
|`int`| 32-bit signed integers between -2147483648~2147483647| `integer`|
|`bigint`| 64-bit signed big integers between -9223372036854775808~9223372036854775807| |
|`varchar`|UTF-8 encoded strings|`text`/`string`/`char `|
|`float`|32-bit IEEE754 floating point values ||
|`double`|Double precision IEEE 754 floating point values||
|`boolean`|Boolean values||
|`varbinary`|Variable length binary values||
|`date`|32-bit date values||
|`datetime`|64-bit datetime values||
|`timestamp[(0/3/6/9)]`|64-bit timestamp values with optional precision. For example, `timestamp(0)` represents timestamp type with seconds precision, `timestamp(3)` represents  milliseconds precision, `timestamp(6)` for microseonds and `timestamp(9)` for nanoseconds. If no precision is given, the timestamp is in **milliseconds** precision by default.||

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
