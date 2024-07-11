# Pipeline 配置

Pipeline 是 GreptimeDB 中对 log （由 JSON 格式构成的数据）数据进行转换的一种机制， 由一个唯一的名称和一组配置规则组成，这些规则定义了如何对日志数据进行格式化、拆分和转换。

这些配置以 YAML 格式提供，使得 Pipeline 能够在日志写入过程中，根据设定的规则对数据进行处理，并将处理后的数据存储到数据库中，便于后续的结构化查询。

## 整体结构

Pipeline 由两部分组成：Processors 和 Transform，这两部分均为数组形式。一个 Pipeline 配置可以包含多个 Processor 和多个 Transform。

- Processor 用于对 log 数据进行预处理，例如解析时间字段，替换字段等。
- Transform 用于对 log 数据进行转换，例如将字符串类型转换为数字类型。

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
  - field: reqTimeSec, req_time_sec
    # epoch 是特殊字段，必须指定精度
    type: epoch, ms
    index: timestamp
```

## Processor

Processor 用于对 log 数据进行预处理，其配置位于 YAML 文件中的 `processors` 字段下。
Pipeline 会按照多个 Processor 的顺序依次加工数据，每个 Processor 都依赖于上一个 Processor 处理的结果。
Processor 由一个 name 和多个配置组成，不同类型的 Processor 配置有不同的字段。

我们目前内置了以下几种 Processor：

- `date`: 用于解析时间字段。
- `epoch`: 用于解析时间戳字段。
- `dissect`: 用于对 log 数据字段进行拆分。
- `gsub`: 用于对 log 数据字段进行替换。
- `join`: 用于对 log 中的 array 类型字段进行合并。
- `letter`: 用于对 log 数据字段进行字母转换。
- `regex`: 用于对 log 数据字段进行正则匹配。
- `urlencoding`: 用于对 log 数据字段进行 URL 编码。
- `csv`: 用于对 log 数据字段进行 CSV 解析。

### date

`date` Processor 用于解析时间字段。示例配置如下：

```yaml
processors:
  - date:
      field: time
      formats:
        - '%Y-%m-%d %H:%M:%S%.3f'
      ignore_missing: true
      timezone: 'Asia/Shanghai'
```

如上所示，`date` Processor 的配置包含以下字段：

- `field`: 需要解析的时间字段名。
- `formats`: 时间格式化字符串，支持多个时间格式化字符串。按照提供的顺序尝试解析，直到解析成功。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。
- `timezone`： 时区。使用[tz_database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 中的时区标识符来指定时区。默认为 `UTC`。

### epoch

`epoch` Processor 用于解析时间戳字段，示例配置如下：

```yaml
processors:
  - epoch:
      field: reqTimeSec
      resolution: millisecond
      ignore_missing: true
```

如上所示，`epoch` Processor 的配置包含以下字段：

- `field`: 需要解析的时间戳字段名。
- `resolution`: 时间戳精度，支持 `s`, `sec` , `second` , `ms`, `millisecond`, `milli`, `us`, `microsecond`, `micro`, `ns`, `nanosecond`, `nano`。默认为 `ms`。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。

### dissect

`dissect` Processor 用于对 log 数据字段进行拆分，示例配置如下：

```yaml
processors:
  - dissect:
      field: message
      pattern: '%{key1} %{key2}'
      ignore_missing: true
      append_separator: '-'
```

如上所示，`dissect` Processor 的配置包含以下字段：

- `field`: 需要拆分的字段名。
- `pattern`: 拆分的 dissect 模式。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。
- `append_separator`: 是否在拆分后的字段之间添加分隔符。 默认为空。

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

#### Dissect 示例

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

### gsub

`gsub` Processor 用于对 log 数据字段进行替换，示例配置如下：

```yaml
processors:
  - gsub:
      field: message
      pattern: 'old'
      replacement: 'new'
      ignore_missing: true
```

如上所示，`gsub` Processor 的配置包含以下字段：

- `field`: 需要替换的字段名。
- `pattern`: 需要替换的字符串。支持正则表达式。
- `replacement`: 替换后的字符串。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。

### join

`join` Processor 用于对 log 中的 Array 类型字段进行合并，示例配置如下：

```yaml
processors:
  - join:
      field: message
      separator: ','
      ignore_missing: true
```

如上所示，`join` Processor 的配置包含以下字段：

- `field`: 需要合并的字段名。
- `separator`: 合并后的分隔符。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。

### letter

`letter` Processor 用于对 log 数据字段进行字母转换，示例配置如下：

```yaml
processors:
  - letter:
      field: message
      method: upper
      ignore_missing: true
```

如上所示，`letter` Processor 的配置包含以下字段：

- `field`: 需要转换的字段名。
- `method`: 转换方法，支持 `upper`, `lower` ，`capital`。默认为 `lower`。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。

### regex

`regex` Processor 用于对 log 数据字段进行正则匹配，示例配置如下：

```yaml
processors:
  - regex:
      field: message
      pattern: ':(?<id>[0-9])'
      ignore_missing: true
```

如上所示，`regex` Processor 的配置包含以下字段：

- `field`: 需要匹配的字段名。
- `pattern`: 要进行匹配的正则表达式，需要包含命名捕获组才可以从对因字段中取出对应数据。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。

#### regex 组命名规则

`regex` Processor 支持使用 `(?<name>...)` 的语法来命名组。

如上述例子所述，`id` 为命名组。为了区分不同 regex 的命名组，我们需要使用 `regex` Processor 的 `field` 字段来指定处理后的字段名前缀。

比如 `:(?<id>[0-9])` 的 `id` 组，处理后的字段名为 `message_id`。

### urlencoding

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

- `fields`: 需要编码的字段名。
- `method`: 编码方法，支持 `encode`, `decode`。默认为 `encode`。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。

### csv

`csv` Processor 用于对 log 数据中没有携带 header 的 CSV 类型字段解析，示例配置如下：

```yaml
processors:
  - csv:
      field: message
      separator: ','
      quote: '"'
      trim: true
      ignore_missing: true
```

如上所示，`csv` Processor 的配置包含以下字段：

- `field`: 需要解析的字段名。
- `separator`: 分隔符。
- `quote`: 引号。
- `trim`: 是否去除空格。默认为 `false`。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。
