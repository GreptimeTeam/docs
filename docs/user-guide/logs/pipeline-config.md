# Pipeline Configuration

Pipeline is a mechanism in GreptimeDB for parsing and transforming log data. It consists of a unique name and a set of configuration rules that define how log data is formatted, split, and transformed. Currently, we support JSON (`application/json`) and plain text (`text/plain`) formats as input for log data.

These configurations are provided in YAML format, allowing the Pipeline to process data during the log writing process according to the defined rules and store the processed data in the database for subsequent structured queries.

## Overall structure

Pipeline consists of two parts: Processors and Transform, both of which are in array format. A Pipeline configuration can contain multiple Processors and multiple Transforms. The data type described by Transform determines the table structure when storing log data in the database.

- Processors are used for preprocessing log data, such as parsing time fields and replacing fields.
- Transform is used for converting data formats, such as converting string types to numeric types.

Here is an example of a simple configuration that includes Processors and Transform:

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
  # The written data must include the timestamp field
  - fields: 
      - reqTimeSec, req_time_sec
    # epoch is a special field type and must specify precision
    type: epoch, ms
    index: timestamp
```

## Processor

The Processor is used for preprocessing log data, and its configuration is located under the `processors` field in the YAML file. The Pipeline processes data by applying multiple Processors in sequential order, where each Processor depends on the result of the previous Processor. A Processor consists of a name and multiple configurations, and different types of Processors have different fields in their configuration.

We currently provide the following built-in Processors:

- `date`: parses formatted time string fields, such as `2024-07-12T16:18:53.048`.
- `epoch`: parses numeric timestamp fields, such as `1720772378893`.
- `dissect`: splits log data fields.
- `gsub`: replaces log data fields.
- `join`: merges array-type fields in logs.
- `letter`: converts log data fields to letters.
- `regex`: performs regular expression matching on log data fields.
- `urlencoding`: performs URL encoding/decoding on log data fields.
- `csv`: parses CSV data fields in logs.

Most processors have `field` or `fields` fields to specify the fields that need to be processed. Most processors will overwrite the original field after processing. If you do not want to affect the corresponding field in the original data, we can output the result to another field to avoid overwriting.

When a field name contains `,`, the target field will be renamed. For example, `reqTimeSec, req_time_sec` means renaming the `reqTimeSec` field to `req_time_sec`, and the processed data will be written to the `req_time_sec` key in the intermediate state. The original `reqTimeSec` field is not affected. If some processors do not support field renaming, the renamed field name will be ignored and noted in the documentation.

for example

```yaml
processors:
  - letter:
      fields:
        - message, message_upper
      method: upper
      ignore_missing: true
```

the `message` field will be converted to uppercase and stored in the `message_upper` field.

### `date`

The `date` processor is used to parse time fields. Here's an example configuration:

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

In the above example, the configuration of the `date` processor includes the following fields:

- `fields`: A list of time field names to be parsed.
- `formats`: Time format strings, supporting multiple format strings. Parsing is attempted in the order provided until successful. You can find reference [here](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) for formatting syntax. 
- `ignore_missing`: Ignores the case when the field is missing. Defaults to `false`. If the field is missing and this configuration is set to `false`, an exception will be thrown.
- `timezone`: Time zone. Use the time zone identifiers from the [tz_database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) to specify the time zone. Defaults to `UTC`.

### `epoch`

The `epoch` processor is used to parse timestamp fields. Here's an example configuration:

```yaml
processors:
  - epoch:
      fields:
        - reqTimeSec
      resolution: millisecond
      ignore_missing: true
```

In the above example, the configuration of the `epoch` processor includes the following fields:

- `fields`: A list of timestamp field names to be parsed.
- `resolution`: Timestamp precision, supports `s`, `sec`, `second`, `ms`, `millisecond`, `milli`, `us`, `microsecond`, `micro`, `ns`, `nanosecond`, `nano`. Defaults to `ms`.
- `ignore_missing`: Ignores the case when the field is missing. Defaults to `false`. If the field is missing and this configuration is set to `false`, an exception will be thrown.

### `dissect`

The `dissect` processor is used to split log data fields. Here's an example configuration:

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

In the above example, the configuration of the `dissect` processor includes the following fields:

- `fields`: A list of field names to be split, does not support field renaming.
- `patterns`: The dissect pattern for splitting.
- `ignore_missing`: Ignores the case when the field is missing. Defaults to `false`. If the field is missing and this configuration is set to `false`, an exception will be thrown.
- `append_separator`: Specifies the separator for concatenating multiple fields with same field name together. Defaults to an empty string. See `+` modifier below.

#### Dissect pattern

Similar to Logstash's dissect pattern, the dissect pattern consists of `%{key}`, where `%{key}` is a field name. For example:

```
"%{key1} %{key2} %{+key3} %{+key4/2} %{key5->} %{?key6}"
```

#### Dissect modifiers

The dissect pattern supports the following modifiers:

| Modifier   | Description                                          | Example              |
| ---------- | ---------------------------------------------------- | -------------------- |
| `+`        | Concatenates two or more fields together             | `%{+key} %{+key}`    |
| `+` and `/n` | Concatenates two or more fields in the specified order | `%{+key/2} %{+key/1}` |
| `->`       | Ignores any repeating characters on the right side    | `%{key1->} %{key2->}` |
| `?`        | Ignores matching values                               | `%{?key}`            |

#### `dissect` examples

For example, given the following log data:

```
"key1 key2 key3 key4 key5 key6"
```

Using the following Dissect pattern:

```
"%{key1} %{key2} %{+key3} %{+key3/2} %{key5->} %{?key6}"
```

The result will be:

```
{
  "key1": "key1",
  "key2": "key2",
  "key3": "key3 key4",
  "key5": "key5"
}
```

### `gsub`

The `gsub` processor is used to replace values in log data fields. Here's an example configuration:

```yaml
processors:
  - gsub:
      fields: 
        - message
      pattern: 'old'
      replacement: 'new'
      ignore_missing: true
```

In the above example, the configuration of the `gsub` processor includes the following fields:

- `fields`: A list of field names to be replaced.
- `pattern`: The string to be replaced. Supports regular expressions.
- `replacement`: The string to replace with.
- `ignore_missing`: Ignores the case when the field is missing. Defaults to `false`. If the field is missing and this configuration is set to `false`, an exception will be thrown.

### `join`

The `join` processor is used to merge Array-type fields in log data. Here's an example configuration:

```yaml
processors:
  - join:
      fields:
        - message
      separator: ','
      ignore_missing: true
```

In the above example, the configuration of the `join` processor includes the following fields:

- `fields`: A list of field names to be merged. Note that all the fields mentioned are already of array type. Each field will have its own array merged separately. The content of multiple fields will not be combined.
- `separator`: The separator for the merged result.
- `ignore_missing`: Ignores the case when the field is missing. Defaults to `false`. If the field is missing and this configuration is set to `false`, an exception will be thrown.

#### `join` example

For example, given the following log data:

```json
{
  "message": ["a", "b", "c"]
}
```

Using the following configuration:

```yaml
processors:
  - join:
      fields:
        - message
      separator: ','
```

The result will be:

```json
{
  "message": "a,b,c"
}
```

### `letter`

The `letter` processor is used to convert the case of characters in log data fields. Here's an example configuration:

```yaml
processors:
  - letter:
      fields:
        - message
      method: upper
      ignore_missing: true
```

In the above example, the configuration of the `letter` processor includes the following fields:

- `fields`: A list of field names to be transformed.
- `method`: The transformation method, supports `upper`, `lower`, `capital`. Defaults to `lower`. Note the `capital` only changes the first letter to uppercase.
- `ignore_missing`: Ignores the case when the field is missing. Defaults to `false`. If the field is missing and this configuration is set to `false`, an exception will be thrown.

### `regex`

The `regex` processor is used to perform regular expression matching on log data fields. Here's an example configuration:

```yaml
processors:
  - regex:
      fields:
        - message
      patterns:
        - ':(?<id>[0-9])'
      ignore_missing: true
```

In the above example, the configuration of the `regex` processor includes the following fields:

- `fields`: A list of field names to be matched. If you rename the field, the renamed fields will be combined with the capture groups in `patterns` to generate the result name.
- `pattern`: The regular expression pattern to match. Named capture groups are required to extract corresponding data from the respective field.
- `ignore_missing`: Ignores the case when the field is missing. Defaults to `false`. If the field is missing and this configuration is set to `false`, an exception will be thrown.

#### Rules for named capture groups in regex

The `regex` processor supports the syntax `(?<group-name>...)` to define named capture groups. The data will be processed into the following format:

```json
{
  "<field-name>_<group-name>": "<value>"
}
```

For example, if the field name specified in the `regex` processor is `message`, and the corresponding content is `"[ERROR] error message"`, you can set the pattern as `\[(?<level>[A-Z]+)\] (?<content>.+)`, and the data will be processed as:

```json
{
  "message_level": "ERROR",
  "message_content": "error message"
}
```

### `urlencoding`

The `urlencoding` processor is used to perform URL encoding on log data fields. Here's an example configuration:

```yaml
processors:
  - urlencoding:
      fields:
        - string_field_a
        - string_field_b
      method: decode
      ignore_missing: true
```

In the above example, the configuration of the `urlencoding` processor includes the following fields:

- `fields`: A list of field names to be encoded.
- `method`: The encoding method, supports `encode`, `decode`. Defaults to `encode`.
- `ignore_missing`: Ignores the case when the field is missing. Defaults to `false`. If the field is missing and this configuration is set to `false`, an exception will be thrown.

### `csv`

The `csv` processor is used to parse CSV-type fields in log data that do not have a header. Here's an example configuration:

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

In the above example, the configuration of the `csv` processor includes the following fields:

- `fields`: A list of field names to be parsed.
- `separator`: The separator.
- `quote`: The quotation mark.
- `trim`: Whether to trim whitespace. Defaults to `false`.
- `ignore_missing`: Ignores the case when the field is missing. Defaults to `false`. If the field is missing and this configuration is set to `false`, an exception will be thrown.

### `json_path` (experimental)

Note: The `json_path` processor is currently in the experimental stage and may be subject to change.

The `json_path` processor is used to extract fields from JSON data. Here's an example configuration:

```yaml
processors:
  - json_path:
      fields:
        - complex_object
      json_path: "$.shop.orders[?(@.active)].id"
      ignore_missing: true
      result_index: 1
```

In the above example, the configuration of the `json_path` processor includes the following fields:

- `fields`: A list of field names to be extracted.
- `json_path`: The JSON path to extract.
- `ignore_missing`: Ignores the case when the field is missing. Defaults to `false`. If the field is missing and this configuration is set to `false`, an exception will be thrown.
- `result_index`: Specifies the index of the value in the extracted array to be used as the result value. By default, all values are included. The extracted value of the processor is an array containing all the values of the path. If an index is specified, the corresponding value in the extracted array will be used as the final result.

#### JSON path syntax

The JSON path syntax is based on the [jsonpath-rust](https://github.com/besok/jsonpath-rust) library.

At this stage we only recommend using some simple field extraction operations to facilitate the extraction of nested fields to the top level.

#### `json_path` example

For example, given the following log data:

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

Using the following configuration:

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

The result will be:

```json
{
  "object_target": "world",
  "array_target": "world",
  "complex_target_3": 4,
  "complex_target_2": 4,
  "complex_target_1": [1, 4]
}
```


## Transform

Transform is used to convert log data, and its configuration is located under the `transform` field in the YAML file.

A Transform consists of one or more configurations, and each configuration contains the following fields:

- `fields`: A list of field names to be transformed.
- `type`: The transformation type.
- `index`: Index type (optional).
- `on_failure`: Handling method for transformation failures (optional).
- `default`: Default value (optional).

### The `fields` field

Each field name is a string. When a field name contains `,`, the field will be renamed. For example, `reqTimeSec, req_time_sec` means renaming the `reqTimeSec` field to `req_time_sec`, and the final data will be written to the `req_time_sec` column in GreptimeDB.

### The `type` field

GreptimeDB currently provides the following built-in transformation types:

- `int8`, `int16`, `int32`, `int64`: Integer types.
- `uint8`, `uint16`, `uint32`, `uint64`: Unsigned integer types.
- `float32`, `float64`: Floating-point types.
- `string`: String type.
- `time`: Time type, which will be converted to GreptimeDB `timestamp(9)` type.
- `epoch`: Timestamp type, which will be converted to GreptimeDB `timestamp(n)` type. The value of `n` depends on the precision of the epoch. When the precision is `s`, `n` is 0; when the precision is `ms`, `n` is 3; when the precision is `us`, `n` is 6; when the precision is `ns`, `n` is 9.

If a field obtains an illegal value during the transformation process, the Pipeline will throw an exception. For example, when converting a string `abc` to an integer, an exception will be thrown because the string is not a valid integer.

### The `index` field

The `Pipeline` will write the processed data to the automatically created table in GreptimeDB. To improve query efficiency, GreptimeDB creates indexes for certain columns in the table. The `index` field is used to specify which fields need to be indexed. For information about GreptimeDB column types, please refer to the [Data Model](/user-guide/concepts/data-model.md) documentation.

GreptimeDB supports the following three types of index for fields:

- `tag`: Specifies a column as a Tag column.
- `fulltext`: Specifies a column to use the fulltext index type. The column must be of string type.
- `timestamp`: Specifies a column as a timestamp index column.

When `index` field is not provided, GreptimeDB treats the field as a `Field` column.

In GreptimeDB, a table must include one column of type `timestamp` as the time index column. Therefore, a Pipeline can have only one time index column.

#### The Timestamp column

Specify which field is the timestamp index column using `index: timestamp`. Refer to the [Transform Example](#transform-example) below for syntax.

#### The Tag column

Specify which field is the Tag column using `index: tag`. Refer to the [Transform Example](#transform-example) below for syntax.

#### The Fulltext column

Specify which field will be used for full-text search using `index: fulltext`. This index greatly improves the performance of [log search](./query-logs.md). Refer to the [Transform Example](#transform-example) below for syntax.

### The `on_failure` field

The `on_failure` field is used to specify the handling method when a transformation fails. It supports the following methods:

- `ignore`: Ignore the failed field and do not write it to the database.
- `default`: Write the default value. The default value is specified by the `default` field.

### The `default` field

The `default` field is used to specify the default value when a transformation fails.

### Transform Example

For example, with the following log data:

```json
{
  "num_field_a": "3",
  "string_field_a": "john",
  "string_field_b": "It was snowing when he was born.",
  "time_field_a": 1625760000
}
```

Using the following configuration:

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

The result will be:

```
{
  "name": "john",
  "age": 3,
  "description": "It was snowing when he was born.",
  "bron_time": 2021-07-08 16:00:00
}
```