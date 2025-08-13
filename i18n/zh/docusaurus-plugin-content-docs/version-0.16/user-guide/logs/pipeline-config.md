---
keywords: [Pipeline 配置, Processor, Transform, 解析日志, 转换日志, YAML 配置, 数据处理, 时间字段解析, 字段拆分]
description: 介绍 GreptimeDB 中 Pipeline 的配置，包括 Processor 和 Transform 的使用方法，以及各种 Processor 的详细配置示例。
---

# Pipeline 配置

Pipeline 是 GreptimeDB 中对 log 数据进行解析和转换的一种机制，由一个唯一的名称和一组配置规则组成，这些规则定义了如何对日志数据进行格式化、拆分和转换。目前我们支持 JSON（`application/json` 或者 `application/x-ndjson`，推荐后者）和纯文本（`text/plain`）格式的日志数据作为输入。

这些配置以 YAML 格式提供，使得 Pipeline 能够在日志写入过程中，根据设定的规则对数据进行处理，并将处理后的数据存储到数据库中，便于后续的结构化查询。

## 输入格式

一般情况下，Pipeline 接收一组键值对形式的 map 作为 Pipeline 的输入。如下三种格式均可作为 Pipeline 的输入：

### JSON 格式

当请求的 Content-Type 为 `application/json` 时，请求的数据格式为标准的 JSON 格式。

```json
[
  {"message": "hello world", "time": "2024-07-12T16:18:53.048"},
  {"message": "hello greptime", "time": "2024-07-12T16:18:53.048"}
]
```

### NDJSON 格式

当请求的 Content-Type 为 `application/x-ndjson` 时，每行数据会被视为一条独立的标准 JSON 对象。

```json
{"message": "hello world", "time": "2024-07-12T16:18:53.048"}
{"message": "hello greptime", "time": "2024-07-12T16:18:53.048"}
```

### 纯文本格式

当请求的 Content-Type 为 `text/plain` 时，每行数据会被视为一条独立的对象。并且会将整行数据视为一个字符串，存储在一个只包含 `message` 字段的 map 对象中

```
hello world 2024-07-12T16:18:53.048
hello greptime 2024-07-12T16:18:53.048
```

上述的纯文本格式数据会被转换为如下的等价形式：

```json
{"message": "hello world 2024-07-12T16:18:53.048"}
{"message": "hello greptime 2024-07-12T16:18:53.048"}
```

也就是说，当输入内容为纯文本格式时，需要在编写 `Processor` 和 `Transform` 的过程中，使用 `message` 来指代每行数据的内容。

## 整体结构

Pipeline 由四部分组成：Processors、Dispatcher、Transform 和 Table suffix。
Processors 对数据进行预处理。
Dispatcher 可以将 pipeline 执行上下文转发到不同的后续 pipeline 上。
Transform 决定最终保存在数据库中的数据类型和表结构。
Table suffix 支持将数据保存到不同的表中。

- Version 用于指定 pipeline 配置的格式。虽然它是可选的，但是我们强烈建议使用 version 2 来编写新配置。更多详情请参考这个[章节](#版本-2-中的-transform)。
- Processor 用于对 log 数据进行预处理，例如解析时间字段，替换字段等。
- Dispatcher(可选) 用于将执行上下文转发到另一个 pipeline，同一个输入批次的数据可以基于特定的值被不同的 pipeline 进行处理。 
- Transform(可选) 用于对数据进行格式转换，例如将字符串类型转换为数字类型，并且指定数据库表中列的索引信息。
- Table suffix（可选） 用于将数据存储到不同的表中，以便后续使用。

一个包含 Processor 和 Transform 的简单配置示例如下：

```yaml
version: 2
processors:
  - urlencoding:
      fields:
        - string_field_a
        - string_field_b
      method: decode
      ignore_missing: true
dispatcher:
  field: type
  rules:
    - value: http
      table_suffix: http
      pipeline: http
    - value: db
      table_suffix: db
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
table_suffix: _${string_field_a}
```

从 `v0.15` 开始， GreptimeDB 引入了一个新的文件格式版本。
其主要的差别在于 Transform 的处理逻辑。
请参考[下述章节](#版本-2-中的-transform)查看更多细节。

## Processor

Processor 用于对 log 数据进行预处理，其配置位于 YAML 文件中的 `processors` 字段下。
Pipeline 会按照多个 Processor 的顺序依次加工数据，每个 Processor 都依赖于上一个 Processor 处理的结果。
Processor 由一个 name 和多个配置组成，不同类型的 Processor 配置有不同的字段。

我们目前内置了以下几种 Processor：

- `date`: 解析格式化的时间字符串字段，例如 `2024-07-12T16:18:53.048`。
- `epoch`: 解析数字时间戳字段，例如 `1720772378893`。
- `decolorize`: 移除日志数据中的 ANSI 颜色代码。
- `dissect`: 对 log 数据字段进行拆分。
- `gsub`: 对 log 数据字段进行替换。
- `join`: 对 log 中的 array 类型字段进行合并。
- `letter`: 对 log 数据字段进行字母转换。
- `regex`: 对 log 数据字段进行正则匹配。
- `urlencoding`: 对 log 数据字段进行 URL 编解码。
- `csv`: 对 log 数据字段进行 CSV 解析。
- `json_path`: 从 JSON 数据中提取字段。（**已废弃**，请使用 `vrl` ）
- `json_parse`: 将一个字段解析成 JSON 对象。
- `simple_extract`: 使用简单的 key 从 JSON 数据中提取字段。
- `digest`: 提取日志消息模板。
- `select`: 从 pipeline 执行上下文中保留或移除字段。
- `vrl`: 使用 pipeline 上下文执行 [vrl](https://vector.dev/docs/reference/vrl/) 脚本。
- `filter`: 过滤不需要写入的行数据。

### Processor 的输入和输出

大多数 Processor 接收一个 `field` 或者 `fields` 参数（一个串行处理的 `field` 列表）作为输入数据。
Processor 会产出一个或者多个输出数据。
对于那些只产出一个输出数据的 processor，输出的数据会替换上下文中原始 key 所关联的数据。

下述的示例中，在 `letter` processor 之后，一个大写版本的字符串会被保存在 `message` 字段中。
```yaml
processors:
  - letter:
      fields:
        - message
      method: upper
```

我们可以将输出数据保存到另一个字段中，使得原有的字段不变。
下述的示例中，我们依然使用 `message` 字段作为 `letter` processor 的输入，但是将输出保存到一个名为 `upper_message` 的新字段中。
```yaml
processors:
  - letter:
      fields:
        - key: message
          rename_to: upper_message
      method: upper
```

这个重命名的语法有一种便捷的书写方式：通过 `,` 将两个字段分割即可。
以下是一个示例：
```yaml
processors:
  - letter:
      fields:
        - message, upper_message
      method: upper
```

重命名主要有两个场景：
1. 保持原字段不变，使得它可以被多个 processor 使用，或者作为原始记录被保存到数据库中。
2. 统一命名。例如为了一致性，将驼峰命名法的变量重命名为蛇形命名法。

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
- `formats`: 时间格式化字符串，支持多个时间格式化字符串。按照提供的顺序尝试解析，直到解析成功。你可以在[这里](https://docs.rs/chrono/latest/chrono/format/strftime/index.html)找到格式化的语法说明。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。
- `timezone`：时区。使用[tz_database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 中的时区标识符来指定时区。默认为 `UTC`。

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

### `decolorize`

`decolorize` Processor 用于移除日志数据中的 ANSI 颜色代码。示例配置如下：

```yaml
processors:
  - decolorize:
      fields:
        - message
```

如上所示，`decolorize` Processor 的配置包含以下字段：

- `fields`: 需要移除颜色代码的字段名列表。

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

- `fields`: 需要拆分的字段名列表。不支持字段重命名。
- `patterns`: 拆分的 dissect 模式。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。
- `append_separator`: 对于多个追加到一起的字段，指定连接符。默认是一个空字符串。

#### Dissect 模式

和 Logstash 的 Dissect 模式类似，Dissect 模式由 `%{key}` 组成，其中 `%{key}` 为一个字段名。例如：

```
"%{key1} %{key2} %{+key3} %{+key4/2} %{key5->} %{?key6}"
```

#### Dissect 修饰符

Dissect 模式支持以下修饰符：

| 修饰符      | 说明                                     | 示例                  |
| ----------- | ---------------------------------------- | --------------------- |
| `+`         | 将两个或多个字段追加到一起               | `%{+key} %{+key}`     |
| `+` 和 `/n` | 按照指定的顺序将两个或多个字段追加到一起 | `%{+key/2} %{+key/1}` |
| `->`        | 忽略右侧的任何重复字符                   | `%{key1->} %{key2->}` |
| `?`         | 忽略匹配的值                             | `%{?key}`             |

#### `dissect` 示例

例如，对于以下 log 数据：

```
"key1 key2 key3 key4 key5 key6"
```

使用以下 Dissect 模式：

```
"%{key1} %{key2} %{+key3} %{+key3/2} %{key5->} %{?key6}"
```

将得到以下结果：

```
{
  "key1": "key1",
  "key2": "key2",
  "key3": "key3 key4",
  "key5": "key5"
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
- `method`: 转换方法，支持 `upper`, `lower` ，`capital`。默认为 `lower`。注意 `capital` 只会将第一个字母转换为大写。
- `ignore_missing`: 忽略字段不存在的情况。默认为 `false`。如果字段不存在，并且此配置为 false，则会抛出异常。

### `regex`

`regex` Processor 用于对 log 数据字段进行正则匹配，示例配置如下：

```yaml
processors:
  - regex:
      fields:
        - message
      patterns:
        - ':(?<id>[0-9])'
      ignore_missing: true
```

如上所示，`regex` Processor 的配置包含以下字段：

- `fields`: 需要匹配的字段名列表。如果重命名了字段，重命名后的字段名将与 `pattern` 中的命名捕获组名进行拼接。
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

### `json_path`（废弃）

:::danger 废弃特性
增加 vrl processor 后，`json_path` 处理器的使用场景已经大大减少。
如果你需要从 JSON 数据中提取字段，建议使用 `vrl` 处理器来实现更灵活的处理。
我们计划在未来的版本中废弃 `json_path` 处理器。
:::

`json_path` 处理器用于从 JSON 数据中提取字段。以下是一个配置示例：

```yaml
processors:
  - json_path:
      fields:
        - complex_object
      json_path: "$.shop.orders[?(@.active)].id"
      ignore_missing: true
      result_index: 1
```

在上述示例中，`json_path` processor 的配置包括以下字段：

- `fields`：要提取的字段名称列表。
- `json_path`：要提取的 JSON 路径。
- `ignore_missing`：忽略字段缺失的情况。默认为 `false`。如果字段缺失且此配置设置为 `false`，将抛出异常。
- `result_index`：指定提取数组中要用作结果值的下标。默认情况下，包含所有值。Processor 提取的结果值是包含 path 中所有值的数组。如果指定了索引，将使用提取数组中对应的下标的值作为最终结果。

#### JSON 路径语法

JSON 路径语法基于 [jsonpath-rust](https://github.com/besok/jsonpath-rust) 库。

在此阶段，我们仅推荐使用一些简单的字段提取操作，以便将嵌套字段提取到顶层。

#### `json_path` 示例

例如，给定以下日志数据：

```json
{
  "product_object": {
    "hello": "world"
  },
  "product_array": [
    "hello",
    "world"
  ],
  "complex_object": {
    "shop": {
      "orders": [
        {
          "id": 1,
          "active": true
        },
        {
          "id": 2
        },
        {
          "id": 3
        },
        {
          "id": 4,
          "active": true
        }
      ]
    }
  }
}
```

使用以下配置：

```yaml
processors:
  - json_path:
      fields:
        - product_object, object_target
      json_path: "$.hello"
      result_index: 0
  - json_path:
      fields:
        - product_array, array_target
      json_path: "$.[1]"
      result_index: 0
  - json_path:
      fields:
        - complex_object, complex_target_1
      json_path: "$.shop.orders[?(@.active)].id"
  - json_path:
      fields:
        - complex_target_1, complex_target_2
      json_path: "$.[1]"
      result_index: 0
  - json_path:
      fields:
        - complex_object, complex_target_3
      json_path: "$.shop.orders[?(@.active)].id"
      result_index: 1
transform:
  - fields:
      - object_target
      - array_target
    type: string
  - fields:
      - complex_target_3
      - complex_target_2
    type: uint32
  - fields:
      - complex_target_1
    type: json
```

结果将是：

```json
{
  "object_target": "world",
  "array_target": "world",
  "complex_target_3": 4,
  "complex_target_2": 4,
  "complex_target_1": [1, 4]
}
```

### `json_parse`

`json_parse`，如其名字所示，将一个字符串解析成一个 JSON 对象。以下是一份示例配置:

```yaml
processors:
  - json_parse:
      fields:
        - complex_object, target_field
      ignore_missing: true
```

在上述示例中，`json_parse` 处理器的配置包含以下字段：

- `fields`：对于每个字段，第一个 key 表示输入字符串中的 key，第二个 key 表示输出的 key 名称。如果不填写第二个 key，则默认使用第一个 key 名作为输出名，也就是替换第一个 key 中的值。上面的示例表示解析 `complex_object` 并将输出放入 `target_field` 中。
- `ignore_missing`：忽略字段不存在的情况。默认为 `false`。如果字段不存在且此配置为 `false`，将抛出异常。

#### `json_parse` example

例如，给定以下日志数据：

```json
{
  "product_object": "{\"hello\":\"world\"}",
}
```

使用以下配置：

```yaml
processors:
  - json_parse:
      fields:
        - product_object
```

结果将是：

```json
{
  "product_object": {
    "hello": "world"
  }
}
```

### `simple_extract`

虽然 `json_path` 处理器能够使用复杂表达式从 JSON 对象中提取字段，但它相对较慢且成本较高。`simple_extract` 处理器提供了一种简单的方法，仅使用键名来提取字段。以下是示例配置：

```yaml
processors:
  - simple_extract:
      fields:
        - complex_object, target_field
      key: "shop.name"
      ignore_missing: true
```

在上述示例中，`simple_extract` 处理器的配置包含以下字段：

- `fields`：对于每个字段，第一个键表示上下文中的输入 JSON 对象，第二个键表示输出键名。上面的示例表示从 `complex_object` 中提取数据并将输出放入 `target_field` 中。
- `key`：提取键，使用 `x.x` 格式，每个 `.` 表示一个新的嵌套层。
- `ignore_missing`：忽略字段不存在的情况。默认为 `false`。如果字段不存在且此配置为 `false`，将抛出异常。

#### `simple_extract` 示例

例如，给定以下日志数据：

```json
{
  "product_object": {
    "hello": "world"
  },
  "product_array": [
    "hello",
    "world"
  ],
  "complex_object": {
    "shop": {
      "name": "some_shop_name"
    }
  }
}
```

使用以下配置：

```yaml
processors:
  - simple_extract:
      fields:
        - complex_object, shop_name
      key: "shop.name"
transform:
  - fields:
      - shop_name
    type: string
```

结果将是：

```json
{
  "shop_name": "some_shop_name"
}
```

### `digest`

`digest` 处理器用于从日志内容中提取日志模板，它通过识别并移除可变内容（如数字、UUID、IP 地址、引号中的内容和括号中的文本等）来实现。提取出的模板可用于日志的分类和分析。配置示例如下：

```yaml
processors:
  - digest:
      fields:
        - message
      presets:
        - numbers
        - uuid
        - ip
        - quoted
        - bracketed
      regex:
        - "foobar"
      ignore_missing: true
```

在上述示例中，`digest` 处理器的配置包含以下字段：

- `fields`：要进行摘要处理的字段名列表。处理后的结果将存储在带有 `_digest` 后缀的新字段中。
- `presets`：要移除的预设模式列表。支持以下模式：
  - `numbers`：匹配数字序列
  - `uuid`：匹配 UUID 字符串，如 `123e4567-e89b-12d3-a456-426614174000`
  - `ip`：匹配 IPv4/IPv6 地址（可选带端口号）
  - `quoted`：匹配单引号/双引号内的文本（包括各种 Unicode 引号）
  - `bracketed`：匹配各种类型括号内的文本（包括各种 Unicode 括号）
- `regex`：要移除的自定义正则表达式列表
- `ignore_missing`：是否忽略字段不存在的情况。默认为 `false`。如果字段不存在且此配置为 `false`，将抛出异常。

#### `digest` 示例

例如，给定以下日志数据：

```json
{
  "message": "User 'john.doe' from [192.168.1.1] accessed resource 12345 with UUID 123e4567-e89b-12d3-a456-426614174000"
}
```

使用以下配置：

```yaml
processors:
  - digest:
      fields:
        - message
      presets:
        - numbers
        - uuid
        - ip
        - quoted
        - bracketed
```

结果将是：

```json
{
  "message": "User 'john.doe' from [192.168.1.1] accessed resource 12345 with UUID 123e4567-e89b-12d3-a456-426614174000",
  "message_digest": "User  from  accessed resource  with UUID "
}
```

提取的模板可用于对相似的日志消息进行分组或分析日志模式，即使可变内容不同。例如，以下所有日志消息都会生成相同的模板：

- `User 'alice' from [10.0.0.1] accessed resource 54321 with UUID 987fbc97-4bed-5078-9141-2791ba07c9f3`
- `User 'bob' from [2001:0db8::1] accessed resource 98765 with UUID 550e8400-e29b-41d4-a716-446655440000`

### `select`

`select` 处理器用于从 pipeline 执行上下文中保留或者移除字段。

从 `v0.15` 开始，我们引入了[`自动 transform`](#自动-transform)用来简化配置。
`自动 transform`会尝试将 pipeline 执行上下文中所有的字段都保存下来。
`select` 处理器在这里能选择上下文中的字段并保留或者移除，在`自动 transform`模式下即反映了最终的表结构。

`select` 处理器的选项非常简单：
- `type` （可选）
  - `include` （默认）: 只保留选中的字段列表
  - `exclude`: 从当前的上下文中移除选中的字段列表
- `fields`: 选择的字段列表

以下是一个简单的示例：
```YAML
processors:
  - dissect:
      fields:
        - message
      patterns:
        - "%{+ts} %{+ts} %{http_status_code} %{content}"
  - date:
      fields:
        - ts
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
  - select:
      fields:
        - http_status_code
        - ts
```

通过 `dissect` 和 `date` 处理器之后，现在上下文中有四个字段： `ts`，`http_status_code`，`content` 和最初的 `message`。
在没有 `select` 处理器的情况下，四个字段都会被保存下来。
`select` 处理器在这里选择了 `http_status_code` 和 `ts` 两个字段来保存（默认 `include` 行为），等效于从 pipeline 执行上下文中删除了 `content` 和 `message` 字段，使得最终只有 `http_status_code` 和 `ts` 这两个字段被保存到数据库中。

上述的示例也可以用以下 `select` 处理器配置来达成效果：
```YAML
  - select:
      type: exclude
      fields:
        - content
        - message
```

### `vrl`

:::warning 实验性特性
此实验性功能可能存在预期外的行为，其功能未来可能发生变化。
:::

`vrl` 处理器使用 pipeline 上下文作为环境来运行 vrl 编程脚本。
相比于简单的处理器，它功能更加强大，允许你编写编程代码来此操作上下文中的变量；不过执行 vrl 脚本会消耗更多的资源。
更多的 vrl 语言介绍和使用，请参考[官方网站](https://vector.dev/docs/reference/vrl/)。

`vrl` 处理器目前只有一个配置项，就是 `source`（源码）。以下是一个示例：
```YAML
processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true
  - vrl:
      source: |
        .from_source = "channel_2"
        cond, err = .id1 > .id2
        if (cond) {
            .from_source = "channel_1"
        }
        del(.id1)
        del(.id2)
        .
```

这份配置使用 `|` 在 YAML 中开启一个多行的文本。随后即可编写整个脚本。

在使用 `vrl` 处理器时，有一些需要注意的点：
1. 整个脚本必须以一个单独的 `.` 行作为结尾，表示将整个上下文作为脚本的返回值。
2. vrl 脚本的返回值中不能包含任何的 `regex` 类型的变量。在脚本的过程中可以使用这种类型，但是在返回之前需要 `del`（删除） 掉。
3. 由于 pipeline 的类型和 vrl 的类型之前存在转换，经过 vrl 处理的类型会变成最大的容量类型，即 `i64`， `u64` 和 `Timestamp::nanoseconds`。

### `filter`

`filter` 处理器用于根据指定条件筛选数据行，从而移除不需要的数据。

以下是一个简单的 `filter` 处理器配置：
```YAML
processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
  - filter:
      field: name
      mode: simple
      match_op: in
      case_insensitive: true
      targets: 
        - John
        - Wick
transform:
  - field: name
    type: string
  - field: time
    type: time
    index: timestamp
```
`filter` 处理器在这里会检查 pipeline 上下文中的 `name` 变量的值。
如果它的值和 targets 列表 `['John', 'Wick']` 中的任意值匹配，则认为条件判断成功。
这条输入数据的处理将会被中止，不会被持久化到数据库中。

`filter` 处理器接受以下参数：
1. `field`（或者 `fields`）：用于比较的上下文变量，可以是一个或者多个；任意一个满足条件即会触发过滤。
2. `mode`（可选）：默认为 `simple`，即为简单字符串匹配。这个字段是为了将来对 `filter` 处理器的功能进行扩展。
3. `match_op`（可选）：如果 mode 是 `simple`，这个选项可以设置为 `in` 或者 `not_in`，意为检查目标列表是否包含变量。默认为 `in`。
4. `case_insensitive`（可选）：默认为 `true`.
5. `targets`: 用于比较的目标列表。

## Transform

Transform 用于对 log 数据进行转换，并且指定在数据库表中列的索引信息。其配置位于 YAML 文件中的 `transform` 字段下。

从 `v0.15` 开始，GreptimeDB 引入了版本 2 格式和自动 transform，可以大幅简化配置。具体详情见下。

Transform 由一个或多个配置组成，每个配置包含以下字段：

- `fields`: 需要转换的字段名列表
- `type`: 指定在数据库中的数据类型
- `index`（可选）: 索引类型
- `tag`（可选）: 设置列为 tag
- `on_failure`（可选）: 转换失败时的处理方式
- `default`（可选）: 默认值

### 版本 2 中的 Transform

在最初的 pipeline 版本中，你需要在 transform 中手动指定所有的字段，来将它们持久化到数据库中。
如果一个字段没有在 transform 中被指定，那么它将会被丢弃。
当字段的数量不断增加时，配置将会变得繁琐、容易出错。

从 `v0.15` 开始，GreptimeDB 引入了一种新的 transform 模式，使得编写 pipeline 配置变得更加简单。
你只需要在 transform 指定需要设置索引和数据类型转换的字段即可；其他 pipeline 上下文中的字段将会被 pipeline 引擎自动转换并保存。
配合 `select` 处理器，我们可以决定什么字段会被最终保留在数据库中。

但是这无法兼容已经存在的 pipeline 配置文件。
如果你已经在 pipeline 配置中使用了 `dissect` 或者 `regex` 处理器，那么在升级数据库版本后，原始的日志文本，因为还留存于 pipeline 上下文中，会被立刻写入到数据库中。

因此，GreptimeDB pipeline 引入了 `version` 字段来执行要使用的 transform 版本，就像 Docker Compose 文件的版本号字段一样。
以下是一个示例：
```YAML
version: 2
processors:
  - date:
    field: input_str
    formats:
      - "%Y-%m-%dT%H:%M:%S%.3fZ"

transform:
  - field: input_str, ts
    type: time, ms
    index: timestamp
```

只需要在配置文件的开头加上 `version: 2`，pipeline 引擎就会以新的 transform 模式来处理数据：
1. 顺序执行所有配置的 transform 规则。
2. 将 pipeline 上下文中的所有字段保存到最终的结果表中

注意：
- Transform 规则**必须设置一个时间索引列**。
- 版本 2 中的 transform 规则执行会将原始字段从 pipeline 上下文中移除，故你无法在 transform 规则对同一个字段引用多次

### 自动 transform

在版本 2 中 transform 的配置编写已经进行了大幅的简化。
即使如此，在某些场景下，我们仍然希望能够结合处理器的处理能力与 `greptime_identity` 的自动字段保存能力，从而无需编写任何转换代码，即可让 pipeline 引擎自动推导并保存字段。

现在自定义 pipeline 支持了这点。
如果 pipeline 配置中没有 transform 模块，pipeline 引擎将会尝试为上下文中的变量自动推导数据类型，并将它们持久化到数据库中，就像 `greptime_identity` 一样。

当在 GreptimeDB 中创建表时，必须指定一个时间索引列。在这个场景中，pipeline 引擎会尝试从上下文中寻找一个 `timestamp`
类型的字段，并将其设置成时间索引列。`timestamp` 类型的字段是 `date` 或者 `epoch` processor 的产物。所以在 processors 声明中，必须存在一个
`date` 或者 `epoch` processor。同时，只允许存在一个 `timestamp` 类型的字段，多个 `timestamp` 字段的情况下会因无法判断在哪一列上设置时间索引而报错。

例如，以下 pipeline 配置现在是有效的。
```YAML
version: 2
processors:
  - dissect:
      fields:
        - message
      patterns:
        - '%{ip_address} - %{username} [%{timestamp}] "%{http_method} %{request_line} %{protocol}" %{status_code} %{response_size}'
      ignore_missing: true
  - date:
      fields:
        - timestamp
      formats:
        - "%d/%b/%Y:%H:%M:%S %z"
```

其产生的表结构如下：
```
mysql> desc auto_trans;
+---------------+---------------------+------+------+---------+---------------+
| Column        | Type                | Key  | Null | Default | Semantic Type |
+---------------+---------------------+------+------+---------+---------------+
| timestamp     | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| host          | String              |      | YES  |         | FIELD         |
| http_method   | String              |      | YES  |         | FIELD         |
| ip_address    | String              |      | YES  |         | FIELD         |
| message       | String              |      | YES  |         | FIELD         |
| protocol      | String              |      | YES  |         | FIELD         |
| request_line  | String              |      | YES  |         | FIELD         |
| response_size | String              |      | YES  |         | FIELD         |
| service       | String              |      | YES  |         | FIELD         |
| source_type   | String              |      | YES  |         | FIELD         |
| status_code   | String              |      | YES  |         | FIELD         |
| username      | String              |      | YES  |         | FIELD         |
+---------------+---------------------+------+------+---------+---------------+
12 rows in set (0.03 sec)
```

可以看到所有的字段都被保存下来了，包括原始的 `message` 字段。注意所有的字段都被保存成 `String` 类型，`timestamp` 字段自动被设置成时间索引列。

### `fields` 字段

每个字段名都是一个字符串。
在 transform 中 `fields` 也可以使用重命名，语法参考[这里](#processor-的输入和输出)。
字段的最终命名会被作为数据库表中的列的名字。

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

`Pipeline` 会将处理后的数据写入到 GreptimeDB 自动创建的数据表中。为了提高查询效率，GreptimeDB 会为表中的某些列创建索引。`index` 字段用于指定哪些字段需要被索引。关于 GreptimeDB 的索引类型，请参考[数据索引](/user-guide/manage-data/data-index.md)文档。

GreptimeDB 支持以下四种字段的索引类型：

- `timestamp`: 用于指定某列是时间索引列
- `inverted`: 用于指定某列使用 inverted 类型的索引（倒排索引）
- `fulltext`: 用于指定某列使用 fulltext 类型的索引（全文索引），该列需要是字符串类型
- `skipping`: 用于指定某列使用 skipping 类型的索引（跳数索引），该列需要是字符串类型


不提供 `index` 字段时，GreptimeDB 将不会在该字段上建立索引。

在 GreptimeDB 中，一张表里必须包含一个 `timestamp` 类型的列作为该表的时间索引列，因此一个 Pipeline 有且只有一个时间索引列。

#### 时间戳列

通过 `index: timestamp` 指定哪个字段是时间索引列，写法请参考下方的 [Transform 示例](#transform-示例)。

#### Inverted 索引

通过 `index: inverted` 指定在哪个列上建立倒排索引，写法请参考下方的 [Transform 示例](#transform-示例)。

#### Fulltext 索引

通过 `index: fulltext` 指定在哪个列上建立全文索引，该索引可大大提升 [日志搜索](./query-logs.md) 的性能，写法请参考下方的 [Transform 示例](#transform-示例)。

#### Skipping 索引

通过 `index: skipping` 指定在哪个列上建立跳数索引，该索引只需少量存储空间的索引文件即可以加速在高基数列上的查询，写法请参考下方的 [Transform 示例](#transform-示例)。

### `tag` 字段

`Pipeline` 支持手动指定 tag 列。关于 tag 列的更多信息，请参考[数据模型](/user-guide/concepts/data-model.md)文档。写法请参考下方的 [Transform 示例](#transform-示例)。

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
    index: skipping
    tag: true
  - fields:
      - num_field_a, age
    type: int32
    index: inverted
  - fields:
      - string_field_b, description
    type: string
    index: fulltext
  - fields:
      - time_field_a, born_time
    type: epoch, s
    index: timestamp
```

将得到以下结果：

```
{
  "name": "john",
  "age": 3,
  "description": "It was snowing when he was born.",
  "born_time": 2021-07-08 16:00:00
}
```

## Dispatcher

Dispatcher 允许用户将数据路由到其他 Pipeline 上。这是为了应对当多种日志类型共享
单一来源且需要存储在不同结构的单独表中。

配置例子如下：

```yaml
dispatcher:
  field: type
  rules:
    - value: http
      table_suffix: http
      pipeline: http
    - value: db
      table_suffix: db

```

Dispatcher 在 processor 之后执行。当匹配到相应的规则时，下一个 pipeline 将被执行。

你可以指定路由数据所依据的字段名 `field`，并指定路由规则 `rules`。假如 `field`
字段匹配到规则中的 `value`，数据将被路由到 `pipeline`。如果规则中没有指定
`pipeline`，将会根据当前的数据结构推断表结构。在上面的例子里，如果用户输入的数据
中 `type` 字段的值为 `http`，我们将把数据路由给名为 `http` 的 pipeline 执行。如
果 `type` 字段的值为 `db`，我们将用当前数据的结构作为表结构存储。

写入的目标表名由 `table_suffix` 指定，这个后缀将和请求输入的 `table` 参数及下划
线组合形成最终的表名。例如，请求的表名叫做 `applogs`，当匹配到上面例子中的
`http` 规则时，最终的表名叫做 `applogs_http`。

如果没有规则匹配到，数据将执行当前 pipeline 中定一个 transform 规则。

## Table suffix

:::warning 实验性特性
此实验性功能可能存在预期外的行为，其功能未来可能发生变化。
:::

在一些场景下，你可能需要将写入的日志数据基于输入的字段值保存到不同表上。
比如你可能希望按照产生的应用名将日志保存到不同的表上，在表名上添加这个应用名的后缀。

一个配置示例如下:
```yaml
table_suffix: _${app_name}
```

语法非常简单： 使用 `${}` 来引用 pipeline 执行上下文中的变量。
该变量可以是输入数据中直接存在的，也可以是前序处理流程中产生的。
变量替换完成之后，整个字符串会被添加到输入的表名后。

注意：
1. 引用的变量必须是一个整数或者字符串类型的数据
2. 如果在执行过程中遇到任何错误（例如变量不存在或者无效数据类型），输入的表名会被作为最终表名

下面举一个例子。以下是输入数据：
```JSON
[
  {"type": "db"},
  {"type": "http"},
  {"t": "test"}
]
```

输入的表名为 `persist_app`，pipeline 配置如下：
```YAML
table_suffix: _${type}
```

这三行输入数据会被写入到三张不同的表中：
1. `persist_app_db`
2. `persist_app_http`
3. `persist_app`, 因为输入的数据中并没有 `type` 字段，所以使用了默认的表名