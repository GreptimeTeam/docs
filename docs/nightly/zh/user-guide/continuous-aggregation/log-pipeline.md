## Pipeline 变换

Pipeline 是用于在 GreptimeDB 中对 log （由 json 格式构成的数据）数据进行转换的一种机制。Pipeline 由多个 Processor 和多个 Transform 组成。Processor 用于对 log 数据进行预处理，例如解析时间字段，Transform 用于对 log 数据进行转换，例如将字段转换为特定类型。使用 Yaml 格式来定义 Pipeline 的配置。

### 整体结构

Pipeline 一般主要由两部分组成：
Processors 和 Transform。均为数组形式，可以包含多个 Processor 和多个 Transform。

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

### Processor

Processor 用于对 log 数据进行预处理。Processor 的配置位于 Yaml 文件中的 `processors` 字段下。一个 Pipeline 可存在多个 Processor ，他们会按照顺序执行加工数据。每个 Processor 都可以依赖上一个 Processor 处理的结果。Processor 由一个 Processor name 和 Processor 的配置组成。不同类型的 Processor 配置有不同的字段。Processor 的配置为 Yaml 格式，包含了 Processor 的数据转换规则。
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

#### date

`date` Processor 用于解析时间字段。`date` Processor 的示例配置如下：

```yaml
processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true
```

如上所示，`date` Processor 的配置包含以下字段：

- `field`: 需要解析的时间字段名。
- `formats`: 时间格式化字符串，支持多个时间格式化字符串。按照提供的顺序尝试解析，直到解析成功。
- `ignore_missing`: 是否忽略字段不存在的情况。默认为 `false`。
- `timezone`： 时区。默认为 `UTC`。

#### epoch

`epoch` Processor 用于解析时间戳字段。`epoch` Processor 的示例配置如下：

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
- `ignore_missing`: 是否忽略字段不存在的情况。默认为 `false`。

#### dissect

`dissect` Processor 用于对 log 数据字段进行拆分。`dissect` Processor 的示例配置如下：

```yaml
processors:
  - dissect:
      field: message
      pattern: "%{key1} %{key2}"
      ignore_missing: true
      append_separator: "-"
```

如上所示，`dissect` Processor 的配置包含以下字段：

- `field`: 需要拆分的字段名。
- `pattern`: 拆分的 dissect 模式。
- `ignore_missing`: 是否忽略字段不存在的情况。默认为 `false`。
- `append_separator`: 是否在拆分后的字段之间添加分隔符。 默认为空。

##### Dissect 模式

和 Logstash 的 Dissect 模式类似，Dissect 模式由 `%{key}` 组成，其中 `%{key}` 为一个字段名。例如：

```
"%{key1} %{key2} %{+key3} %{+key4/2} %{key5->} %{?key6} %{*key7} %{&key8}"
```


#### gsub

`gsub` Processor 用于对 log 数据字段进行替换。`gsub` Processor 的示例配置如下：

```yaml
processors:
  - gsub:
      field: message
      pattern: "old"
      replacement: "new"
      ignore_missing: true
```

如上所示，`gsub` Processor 的配置包含以下字段：

- `field`: 需要替换的字段名。
- `pattern`: 需要替换的字符串。支持正则表达式。
- `replacement`: 替换后的字符串。
- `ignore_missing`: 是否忽略字段不存在的情况。默认为 `false`。

#### join

`join` Processor 用于对 log 中的 array 类型字段进行合并。`join` Processor 的示例配置如下：

```yaml
processors:
  - join:
      field: message
      separator: ","
      ignore_missing: true
```

如上所示，`join` Processor 的配置包含以下字段：

- `field`: 需要合并的字段名。
- `separator`: 合并后的分隔符。
- `ignore_missing`: 是否忽略字段不存在的情况。默认为 `false`。

#### letter

`letter` Processor 用于对 log 数据字段进行字母转换。`letter` Processor 的示例配置如下：

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
- `ignore_missing`: 是否忽略字段不存在的情况。默认为 `false`。

#### regex

`regex` Processor 用于对 log 数据字段进行正则匹配。`regex` Processor 的示例配置如下：

```yaml
processors:
  - regex:
      field: message
      pattern: ".*"
      ignore_missing: true
```

如上所示，`regex` Processor 的配置包含以下字段：

- `field`: 需要匹配的字段名。
- `pattern`: 正则表达式。
- `ignore_missing`: 是否忽略字段不存在的情况。默认为 `false`。

#### urlencoding

`urlencoding` Processor 用于对 log 数据字段进行 URL 编码。`urlencoding` Processor 的示例配置如下：

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
- `ignore_missing`: 是否忽略字段不存在的情况。默认为 `false`。
