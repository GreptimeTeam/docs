# 数据类型

GreptimeDB 支持下列数据类型：

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
|`timestamp[(0/3/6/9)]`|64-bit timestamp values with optional precision. <br /> For example, `timestamp(0)` represents timestamp type with seconds precision, `timestamp(3)` represents  milliseconds precision, `timestamp(6)` for microseonds and `timestamp(9)` for nanoseconds. If no precision is given, the timestamp is in **milliseconds** precision by default.|| 8 Bytes |

## 整数类型的 Unsigned 版本

`int` / `tinyint` / `smallint` / `bigint` 有 unsigned 版本，相应的值范围如下：

- `int unsigned`: 0~4294967295
- `tinyint unsigned`: 0~255
- `smallint unsigned`: 0~65535
- `bigint unsigned`: 0~18446744073709551615

## Variable-sized 类型的限制

variable-sized 类型的最大容量, 例如 `string` 和 `varbinary`，取决于它们的编码和存储引擎处理它们的方式。

例如，`string` 值被编码为 UTF-8。如果所有字符都是 3 字节长度，则该字段可以存储 715827882 个字符。对于 `varbinary` 类型，最多可以存储 2147483647 字节。

### 为 timestamp 列选择数据类型

GreptimeDB 允许用户为时间戳索引列设置为 `bigint` 或 `timestamp` 类型。
`bigint` 和 `timestamp` 都被解释为毫秒精度的时间戳。

```sql
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
