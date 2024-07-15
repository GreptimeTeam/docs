# Pipeline 配置

Pipeline 是 GreptimeDB 中对 log 数据进行转换的一种机制， 由一个唯一的名称和一组配置规则组成，这些规则定义了如何对日志数据进行格式化、拆分和转换。目前我们支持 JSON（`application/json`）和纯文本（`text/plain`）格式的日志数据作为输入。

这些配置以 YAML 格式提供，使得 Pipeline 能够在日志写入过程中，根据设定的规则对数据进行处理，并将处理后的数据存储到数据库中，便于后续的结构化查询。

## 整体结构

Pipeline 由两部分组成：Processors 和 Transform，这两部分均为数组形式。一个 Pipeline 配置可以包含多个 Processor 和多个 Transform。Transform 所描述的数据类型会决定日志数据保存到数据库时的表结构。

- Processor 用于对 log 数据进行预处理，例如解析时间字段，替换字段等。
- Transform 用于对 log 数据进行格式转换，例如将字符串类型转换为数字类型。

一个包含 Processor 和 Transform 的简单配置示例如下：

```yaml
processors:
  - urlencoding:
      fields:
        - string_field_a
        - string_field_b
      method: decode
      ignore_missing: true
transform:
  - fields:
      - string_field_a
      - string_field_b
    type: string
  # 写入的数据必须包含 timestamp 字段
  - fields: 
      - reqTimeSec, req_time_sec
    # epoch 是特殊字段类型，必须指定精度
    type: epoch, ms
    index: timestamp
```

## Processor

Processor 用于对 log 数据进行预处理，其配置位于 YAML 文件中的 `processors` 字段下。
Pipeline 会按照多个 Processor 的顺序依次加工数据，每个 Processor 都依赖于上一个 Processor 处理的结果。
Processor 由一个 name 和多个配置组成，不同类型的 Processor 配置有不同的字段。

我们目前内置了以下几种 Processor：

- `date`: 用于解析格式化的时间字符串字段，例如 `2024-07-12T16:18:53.048`。
- `epoch`: 用于解析数字时间戳字段，例如 `1720772378893`。
- `dissect`: 用于对 log 数据字段进行拆分。
- `gsub`: 用于对 log 数据字段进行替换。
- `join`: 用于对 log 中的 array 类型字段进行合并。
- `letter`: 用于对 log 数据字段进行字母转换。
- `regex`: 用于对 log 数据字段进行正则匹配。
- `urlencoding`: 用于对 log 数据字段进行 URL 编解码。
- `csv`: 用于对 log 数据字段进行 CSV 解析。

### `date`

`date` Processor 用于解析时间字段。示例配置如下：

```yaml
processors:
  - date:
      fields: 
        - time
      formats:
        - '%Y-%m-%d %H:%M:%S%.3f'
      ignore_missing: true
      timezone: 'Asia/Shanghai'
```

如上所示，`date` Processor 的配置包含以下字段：

- `fields`: 需要解析的时间字段名列表。
- `formats`: 时间格式化字符串，支持多个时间格式化字符串。按照提供的顺序尝试解析，直到解析成功。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。
- `timezone`： 时区。使用[tz_database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 中的时区标识符来指定时区。默认为 `UTC`。

### `epoch`

`epoch` Processor 用于解析时间戳字段，示例配置如下：

```yaml
processors:
  - epoch:
      fields:
        - reqTimeSec
      resolution: millisecond
      ignore_missing: true
```

如上所示，`epoch` Processor 的配置包含以下字段：

- `fields`: 需要解析的时间戳字段名列表。
- `resolution`: 时间戳精度，支持 `s`, `sec` , `second` , `ms`, `millisecond`, `milli`, `us`, `microsecond`, `micro`, `ns`, `nanosecond`, `nano`。默认为 `ms`。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。

### `dissect`

`dissect` Processor 用于对 log 数据字段进行拆分，示例配置如下：

```yaml
processors:
  - dissect:
      fields: 
        - message
      patterns:
        - '%{key1} %{key2}'
      ignore_missing: true
      append_separator: '-'
```

如上所示，`dissect` Processor 的配置包含以下字段：

- `fields`: 需要拆分的字段名列表。
- `patterns`: 拆分的 dissect 模式。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。
- `append_separator`: 对于多个追加到一起的字段，指定连接符。默认是一个空字符串。

#### Dissect 模式

和 Logstash 的 Dissect 模式类似，Dissect 模式由 `%{key}` 组成，其中 `%{key}` 为一个字段名。例如：

```
"%{key1} %{key2} %{+key3} %{+key4/2} %{key5->} %{?key6} %{*key7} %{&key8}"
```

#### Dissect 修饰符

Dissect 模式支持以下修饰符：

| 修饰符      | 说明                                     | 示例                  |
| ----------- | ---------------------------------------- | --------------------- |
| `+`         | 将两个或多个字段追加到一起               | `%{+key} %{+key}`     |
| `+` 和 `/n` | 按照指定的顺序将两个或多个字段追加到一起 | `%{+key/2} %{+key/1}` |
| `->`        | 忽略右侧的任何重复字符                   | `%{key1->} %{key2->}` |
| `?`         | 忽略匹配的值                             | `%{?key}`             |
| `*` 和 `&`  | 将输出键设置为 \*，输出值设置为 &。      | `%{*key} %{&value}`   |

#### `dissect` 示例

例如，对于以下 log 数据：

```
"key1 key2 key3 key4 key5 key6 key7 key8"
```

使用以下 Dissect 模式：

```
"%{key1} %{key2} %{+key3} %{+key3/2} %{key5->} %{?key6} %{*key7} %{&key8}"
```

将得到以下结果：

```
{
  "key1": "key1",
  "key2": "key2",
  "key3": "key3 key4",
  "key5": "key5",
  "key7": "key8"
}
```

### `gsub`

`gsub` Processor 用于对 log 数据字段进行替换，示例配置如下：

```yaml
processors:
  - gsub:
      fields: 
        - message
      pattern: 'old'
      replacement: 'new'
      ignore_missing: true
```

如上所示，`gsub` Processor 的配置包含以下字段：

- `fields`: 需要替换的字段名列表。
- `pattern`: 需要替换的字符串。支持正则表达式。
- `replacement`: 替换后的字符串。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。

### `join`

`join` Processor 用于对 log 中的 Array 类型字段进行合并，示例配置如下：

```yaml
processors:
  - join:
      fields:
        - message
      separator: ','
      ignore_missing: true
```

如上所示，`join` Processor 的配置包含以下字段：

- `fields`: 需要合并的字段名列表。注意，这里每行字段的值需要是 Array 类型，每行字段会单独合并自己数组内的值，所有行的字段不会合并到一起。
- `separator`: 合并后的分隔符。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。

#### `join` 示例

例如，对于以下 log 数据：

```json
{
  "message": ["a", "b", "c"]
}
```

使用以下配置：

```yaml
processors:
  - join:
      fields:
        - message
      separator: ','
```

将得到以下结果：

```json
{
  "message": "a,b,c"
}
```

### `letter`

`letter` Processor 用于对 log 数据字段进行字母转换，示例配置如下：

```yaml
processors:
  - letter:
      fields:
        - message
      method: upper
      ignore_missing: true
```

如上所示，`letter` Processor 的配置包含以下字段：

- `fields`: 需要转换的字段名列表。
- `method`: 转换方法，支持 `upper`, `lower` ，`capital`。默认为 `lower`。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。

### `regex`

`regex` Processor 用于对 log 数据字段进行正则匹配，示例配置如下：

```yaml
processors:
  - regex:
      fields:
        - message
      pattern: ':(?<id>[0-9])'
      ignore_missing: true
```

如上所示，`regex` Processor 的配置包含以下字段：

- `fields`: 需要匹配的字段名列表。
- `pattern`: 要进行匹配的正则表达式，需要使用命名捕获组才可以从对应字段中取出对应数据。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。

#### regex 命名捕获组的规则

`regex` Processor 支持使用 `(?<group-name>...)` 的语法来命名捕获组，最终将数据处理为这种形式： 
	
```json
{
  "<field-name>_<group-name>": "<value>"
}
```

例如 `regex` Processor 中 field 填写的字段名为 `message`，对应的内容为 `"[ERROR] error message"`，
你可以将 pattern 设置为 `\[(?<level>[A-Z]+)\] (?<content>.+)`，
最终数据会被处理为：
```json
{
  "message_level": "ERROR",
  "message_content": "error message"
}
```

### `urlencoding`

`urlencoding` Processor 用于对 log 数据字段进行 URL 编码，示例配置如下：

```yaml
processors:
  - urlencoding:
      fields:
        - string_field_a
        - string_field_b
      method: decode
      ignore_missing: true
```

如上所示，`urlencoding` Processor 的配置包含以下字段：

- `fields`: 需要编码的字段名列表。
- `method`: 编码方法，支持 `encode`, `decode`。默认为 `encode`。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。

### `csv`

`csv` Processor 用于对 log 数据中没有携带 header 的 CSV 类型字段解析，示例配置如下：

```yaml
processors:
  - csv:
      fields:
        - message
      separator: ','
      quote: '"'
      trim: true
      ignore_missing: true
```

如上所示，`csv` Processor 的配置包含以下字段：

- `fields`: 需要解析的字段名列表。
- `separator`: 分隔符。
- `quote`: 引号。
- `trim`: 是否去除空格。默认为 `false`。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。


## Transform

Transform 用于对 log 数据进行转换，其配置位于 YAML 文件中的 `transform` 字段下。

Transform 由一个或多个配置组成，每个配置包含以下字段：

- `fields`: 需要转换的字段名列表。
- `type`: 转换类型
- `index`: 索引类型（可选）
- `on_failure`: 转换失败时的处理方式（可选）
- `default`: 默认值（可选）

### `fields` 字段

每个字段名都是一个字符串，当字段名称包含 `,` 时，会进行字段重命名。例如，`reqTimeSec, req_time_sec` 表示将 `reqTimeSec` 字段重命名为 `req_time_sec`，
最终数据将被写入到 GreptimeDB 的 `req_time_sec` 列。

### `type` 字段

GreptimeDB 目前内置了以下几种转换类型：

- `int8`, `int16`, `int32`, `int64`: 整数类型。
- `uint8`, `uint16`, `uint32`, `uint64`: 无符号整数类型。
- `float32`, `float64`: 浮点数类型。
- `string`: 字符串类型。
- `time`: 时间类型。将被转换为 GreptimeDB `timestamp(9)` 类型。
- `epoch`: 时间戳类型。将被转换为 GreptimeDB `timestamp(n)` 类型。n 为时间戳精度，n 的值视 epoch 精度而定。当精度为 `s` 时，n 为 0；当精度为 `ms` 时，n 为 3；当精度为 `us` 时，n 为 6；当精度为 `ns` 时，n 为 9。

如果字段在转换过程中获得了非法值，Pipeline 将会抛出异常。例如将一个字符串 `abc` 转换为整数时，由于该字符串不是一个合法的整数，Pipeline 将会抛出异常。

### `index` 字段

`Pipeline` 会将处理后的数据写入到 GreptimeDB 自动创建的数据表中。为了提高查询效率，GreptimeDB 会为表中的某些列创建索引。`index` 字段用于指定哪些字段需要被索引。关于 GreptimeDB 的列类型，请参考[数据模型](/user-guide/concepts/data-model.md)文档。

GreptimeDB 支持以下三种字段的索引类型：

- `tag`: 用于指定某列为 Tag 列
- `fulltext`: 用于指定某列使用 fulltext 类型的索引，该列需要是字符串类型
- `timestamp`: 用于指定某列是时间索引列

不提供 `index` 字段时，GreptimeDB 会将该字段作为 `Field` 列。

在 GreptimeDB 中，一张表里必须包含一个 `timestamp` 类型的列作为该表的时间索引列，因此一个 Pipeline 有且只有一个时间索引列。

#### 时间戳列

通过 `index: timestamp` 指定哪个字段是时间索引列，写法请参考下方的 [Transform 示例](#transform-示例)。

#### Tag 列

通过 `index: tag` 指定哪个字段是 Tag 列，写法请参考下方的 [Transform 示例](#transform-示例)。

#### Fulltext 列

通过 `index: fulltext` 指定哪个字段将会被用于全文搜索，该索引可大大提升 [日志搜索](./log-query.md) 的性能，写法请参考下方的 [Transform 示例](#transform-示例)。

### `on_failure` 字段

`on_failure` 字段用于指定转换失败时的处理方式，支持以下几种方式：

- `ignore`: 忽略转换失败的字段，不写入数据库。
- `default`: 写入默认值。默认值由 `default` 字段指定。

### `default` 字段

`default` 字段用于指定转换失败时的默认值。

### Transform 示例

例如，对于以下 log 数据：

```json
{
  "num_field_a": "3",
  "string_field_a": "john",
  "string_field_b": "It was snowing when he was born.",
  "time_field_a": 1625760000
}
```

使用以下配置：

```yaml
transform:
  - fields:
      - string_field_a, name
    type: string
    index: tag
  - fields:
      - num_field_a, age
    type: int32
  - fields:
      - string_field_b, description
    type: string
    index: fulltext
  - fields:
      - time_field_a, bron_time
    type: epoch, s
    index: timestamp
```

将得到以下结果：

```
{
  "name": "john",
  "age": 3,
  "description": "It was snowing when he was born.",
  "bron_time": 2021-07-08 16:00:00
}
```