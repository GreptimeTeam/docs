---
keywords: [pipeline configuration, log parsing, log transformation, processors, transform rules]
description: Explains the configuration of pipelines in GreptimeDB for parsing and transforming log data, including processors and transform rules.
---

# Pipeline Configuration

Pipeline is a mechanism in GreptimeDB for parsing and transforming log data. It consists of a unique name and a set of configuration rules that define how log data is formatted, split, and transformed. Currently, we support JSON (`application/json` or `application/x-ndjson`, the latter is preferred) and plain text (`text/plain`) formats as input for log data.

These configurations are provided in YAML format, allowing the Pipeline to process data during the log writing process according to the defined rules and store the processed data in the database for subsequent structured queries.

## Input Formats

In general, a pipeline receives a set of key-value pairs in the form of a map as its input. The following three formats can all be used as pipeline input:

### JSON Format

When the request's Content-Type is `application/json`, the data format should be standard JSON.

```json
[
  {"message": "hello world", "time": "2024-07-12T16:18:53.048"},
  {"message": "hello greptime", "time": "2024-07-12T16:18:53.048"}
]
```

### NDJSON Format

When the request's Content-Type is `application/x-ndjson`, each line is treated as a separate standard JSON object.

```json
{"message": "hello world", "time": "2024-07-12T16:18:53.048"}
{"message": "hello greptime", "time": "2024-07-12T16:18:53.048"}
```

### Plain Text Format

When the request's Content-Type is `text/plain`, each line is treated as a separate object. The entire line is treated as a string and stored in a map object containing only the `message` field.

```
hello world 2024-07-12T16:18:53.048
hello greptime 2024-07-12T16:18:53.048
```

The above plain text data will be converted to the following equivalent form:

```json
{"message": "hello world 2024-07-12T16:18:53.048"}
{"message": "hello greptime 2024-07-12T16:18:53.048"}
```

In other words, when the input is in plain text format, you need to use `message` to refer to the content of each line when writing `Processor` and `Transform` configurations.

## Overall structure

Pipeline consists of four parts: Processors, Dispatcher, Transform, and Table suffix.
Processors pre-processes input log data.
Dispatcher forwards pipeline execution context onto different subsequent pipeline.
Transform decides the final datatype and table structure in the database.
Table suffix allows storing the data into different tables.

- Processors are used for preprocessing log data, such as parsing time fields and replacing fields.
- Dispatcher(optional) is used for forwarding the context into another pipeline, so that the same batch of input data can be divided and processed by different pipeline based on certain fields.
- Transform(optional) is used for converting data formats, such as converting string types to numeric types, and specifying indexes.
- Table suffix(optional) is used for storing data into different table for later convenience.

Here is an example of a simple configuration that includes Processors and Transform:

```yaml
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
  # The written data must include the timestamp field
  - fields:
      - reqTimeSec, req_time_sec
    # epoch is a special field type and must specify precision
    type: epoch, ms
    index: timestamp
table_suffix: _${string_field_a}
```

Starting from `v0.15`, the GreptimeDB introduce a version `2` format.
The main change is the transform process.
Refer to [the following documentation](#transform-in-doc-version-2) for detailed changes.

## Processor

The Processor is used for preprocessing log data, and its configuration is located under the `processors` section in the YAML file. The Pipeline processes data by applying multiple Processors in sequential order, where each Processor depends on the result of the previous Processor. A Processor consists of a name and multiple configurations, and different types of Processors have different fields in their configuration.

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
- `json_path`: extracts fields from JSON data.
- `json_parse`: parse a field into JSON object.
- `simple_extract`: extracts fields from JSON data using simple key.
- `digest`: extracts the template from a log message by removing variable content.
- `select`: retain(include) or exclude fields from the pipeline context.
- `vrl`: runs the [vrl](https://vector.dev/docs/reference/vrl/) script against the pipeline context.

### Input and output of Processors

Most processors accept a `field` or `fields` parameter, which is a list of fields processed sequentially, as input data.
Processors produce one or more output based on the input.
For processors that produce a single output, the result will overwrite the original input key in the context.

In the following example, after the `letter` processor, an upper-case version of the original string is saved back to the `message` field.
```yaml
processors:
  - letter:
      fields:
        - message
      method: upper
```

We can save the output data to another field, leaving the original field unchanged.
In the following example, we still use the `message` field as the input of the `letter` processor, but saving the output to a new field named `upper_message`.
```yaml
processors:
  - letter:
      fields:
        - key: message
          rename_to: upper_message
      method: upper
```

This renaming syntax also has a shortcut form: simply separate the two field names with a `,`.
Here is an example of this shortcut:
```yaml
processors:
  - letter:
      fields:
        - message, upper_message
      method: upper
```

There are mainly two reasons why renaming is needed:
1. Leaving the original field unchanged, so it can be reused in more than one processors, or be saved into the database as well.
2. Unifying naming. For example rename camel-case names to snake-case names for consistency.

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

| Modifier     | Description                                            | Example               |
| ------------ | ------------------------------------------------------ | --------------------- |
| `+`          | Concatenates two or more fields together               | `%{+key} %{+key}`     |
| `+` and `/n` | Concatenates two or more fields in the specified order | `%{+key/2} %{+key/1}` |
| `->`         | Ignores any repeating characters on the right side     | `%{key1->} %{key2->}` |
| `?`          | Ignores matching values                                | `%{?key}`             |

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

### `json_parse`

`json_parse`, as its name suggests, parses a string field into a JSON object. Here's an example configuration:

```yaml
processors:
  - json_parse:
      fields:
        - complex_object, target_field
      ignore_missing: true
```

In the above example, the configuration of the `json_parse` processor includes the following fields:

- `fields`: For each field, the first key represents the entry string in the context, the second key represents the output key name. If the second key is not present, it uses the first key as the output key name too, which means in-place replacement of the original value. The example above means parsing `complex_object` and put the output into `target_field`.
- `ignore_missing`: Ignores the case when the field is missing. Defaults to `false`. If the field is missing and this configuration is set to `false`, an exception will be thrown.

#### `json_parse` example

For example, given the following log data:

```json
{
  "product_object": "{\"hello\":\"world\"}",
}
```

Using the following configuration:

```yaml
processors:
  - json_parse:
      fields:
        - product_object
```

The result will be:

```json
{
  "product_object": {
    "hello": "world"
  }
}
```

### `simple_extract`

While `json_path` processor is capable of extracting fields from JSON objects using complex expressions, it's relatively slow and costly. The `simple_extract` processor offers a simple way to extract fields by using just key names. Here's an example configuration:

```yaml
processors:
  - simple_extract:
      fields:
        - complex_object, target_field
      key: "shop.name"
      ignore_missing: true
```

In the above example, the configuration of the `simple_extract` processor includes the following fields:

- `fields`: For each field, the first key represents the entry JSON object in the context, the second key represents the output key name. The example above means extracting from `complex_object` and put the output into `target_field`.
- `key`: The extracting key, using `x.x` format, each `.` represents a new nested layer.
- `ignore_missing`: Ignores the case when the field is missing. Defaults to `false`. If the field is missing and this configuration is set to `false`, an exception will be thrown.

#### `simple_extract` example

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
      "name": "some_shop_name"
    }
  }
}
```

Using the following configuration:

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

The result will be:

```json
{
  "shop_name": "some_shop_name"
}
```

### `digest`

The `digest` processor is used to extract the template from a log message by removing variable content, such as numbers, UUIDs, IP addresses, quoted strings, and bracketed text. The digested result can be useful for log template grouping and analysis. Here's an example configuration:

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

In the above example, the configuration of the `digest` processor includes the following fields:

- `fields`: A list of field names to be digested. The digested result will be stored in a new field with suffix `_digest`.
- `presets`: A list of preset patterns to remove. The following patterns are supported:
  - `numbers`: Matches numeric sequences
  - `uuid`: Matches UUID strings like `123e4567-e89b-12d3-a456-426614174000`
  - `ip`: Matches IPv4/IPv6 addresses with optional port numbers
  - `quoted`: Matches text within single/double quotes (including various Unicode quotes)
  - `bracketed`: Matches text within various types of brackets (including various Unicode brackets)
- `regex`: A list of custom regex patterns to remove
- `ignore_missing`: Ignores the case when the field is missing. Defaults to `false`. If the field is missing and this configuration is set to `false`, an exception will be thrown.

#### `digest` example

For example, given the following log data:

```json
{
  "message": "User 'john.doe' from [192.168.1.1] accessed resource 12345 with UUID 123e4567-e89b-12d3-a456-426614174000"
}
```

Using the following configuration:

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

The result will be:

```json
{
  "message": "User 'john.doe' from [192.168.1.1] accessed resource 12345 with UUID 123e4567-e89b-12d3-a456-426614174000",
  "message_digest": "User  from  accessed resource  with UUID "
}
```

The digested template can be used to group similar log messages together or analyze log patterns, even when the variable content differs. For example, all these log messages would generate the same template:

- `User 'alice' from [10.0.0.1] accessed resource 54321 with UUID 987fbc97-4bed-5078-9141-2791ba07c9f3`
- `User 'bob' from [2001:0db8::1] accessed resource 98765 with UUID 550e8400-e29b-41d4-a716-446655440000`

### `select`

The `select` processor is used to retain or exclude fields from the pipeline execution context.

Starting from `v0.15` release, we are introducing [`auto-transform`](#auto-transform) for simplicity.
The `auto-transform` mode will try to preserve all fields from the pipeline execution context.
The `select` processor can be used here to select fields to include or exclude, which will reflects the final table schema if `auto-transform` is used.

The configuration options for `select` is simple:
- `type`(optional)
  - `include`(default): only keeps the selected fields
  - `exclude`: removes the selected fields from the current context
- `fields`: fields selected from the pipeline execution context

Here is an example:
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

With `dissect` and `date` processor, there are four fields in the context: `ts`, `http_status_code`, `content` and the original `message`.
Without the `select` processor, all four fields are preserved.
The `select` processor here selects `http_status_code` and `ts` fields to include (by default), which effectively removes `content` and `message` in the pipeline execution context, resulting the `http_status_code` and `ts` to be preserved into the database.

The above example can also be done in the following `select` processor's configuration:
```YAML
  - select:
      type: exclude
      fields:
        - content
        - message
```

### `vrl`

:::warning Experimental Feature
This experimental feature may contain unexpected behavior, have its functionality change in the future.
:::

The `vrl` processor run the vrl programming script against the pipeline context.
It's more powerful than simple processors, for it allows you to write actual programming codes to manipulate the context; however, it also costs more resource to execute.
Refer to the [official website](https://vector.dev/docs/reference/vrl/) for more language introduction and usage.

The `vrl` processor only takes one configuration, that is the `source` field. Here's an example:
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

The configuration uses a `|` to start a multi-line content in the YAML file.
The whole script is then written below.

Some notes regarding the `vrl` processor:
1. The script have to end with a newline of `.`, indicating returning the whole context as the returning value of the script.
2. The returning value of the vrl script should not contain any regex-type variables. They can be used in the script, but have to be `del`ed before returning.
3. Due to type conversion between pipeline's value type and vrl's, the value type that comes out of the vrl script will be the ones with max capacity, meaning `i64`, `f64`, and `Timestamp::nanoseconds`.

## Transform

Transform is used to convert data formats and specify indexes upon columns. It is located under the `transform` section in the YAML file.

Starting from `v0.15`, an auto-transform mode is added to simplify the configuration. See below for details. 

A Transform consists of one or more configurations, and each configuration contains the following fields:

- `fields`: A list of field names to be transformed.
- `type`: The transformation type.
- `index`: The index type (optional).
- `tag`: Specify the field to be a tag field (optional).
- `on_failure`: Handling method for transformation failures (optional).
- `default`: Default value (optional).

### Auto-transform
If no transform section is specified in the pipeline configuration, the pipeline engine will attempt to infer the data types of the fields from the context and preserve them in the database, much like the `identity_pipeline` does.

To create a table in GreptimeDB, a time index column must be specified.
In this case, the pipeline engine will try to find a field of type `timestamp` in the context and set it as the time index column.
A `timestamp` field is produced by a `date` or `epoch` processor, so at least one `date` or `epoch` processor must be defined in the processors section.
Additionally, only one `timestamp` field is allowed, multiple `timestamp` fields would lead to an error due to ambiguity.

For example, the following pipeline configuration is now valid.
```YAML
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

And it result to the following table schema: 
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

We can see that all fields are preserved, including the original `message` field.
Note that all fields are saved as `String` type, and the `timestamp` field is automatically set as the time index.

### The `fields` field

Each field name is a string.
`fields` in transform can also use renaming, refer to the docs [here](#input-and-output-of-processors).
The final name of the field will be used as the column name in the database table.

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

The `Pipeline` will write the processed data to the automatically created table in GreptimeDB. To improve query efficiency, GreptimeDB creates indexes for certain columns in the table. The `index` field is used to specify which fields need to be indexed. For information about GreptimeDB index types, please refer to the [Data Index](/user-guide/manage-data/data-index.md) documentation.

GreptimeDB supports the following four types of index for fields:

- `timestamp`: Specifies a column as a timestamp index column.
- `inverted`: Specifies a column to use the inverted index type.
- `fulltext`: Specifies a column to use the fulltext index type. The column must be of string type.
- `skipping`: Specifies a column to use the skipping index type. The column must be of string type.

When `index` field is not provided, GreptimeDB doesn't create index on the column.

In GreptimeDB, a table must include exact one column of type `timestamp` as the time index column. Therefore, a Pipeline can have only one time index column.

#### The Timestamp column

Specify which field is the timestamp index column using `index: timestamp`. Refer to the [Transform Example](#transform-example) below for syntax.

#### The Inverted Index

Specify which field uses the inverted index. Refer to the [Transform Example](#transform-example) below for syntax.

#### The Fulltext Index

Specify which field will be used for full-text search using `index: fulltext`. This index greatly improves the performance of [log search](./query-logs.md). Refer to the [Transform Example](#transform-example) below for syntax.

#### The Skipping Index

Specify which field uses the skipping index. This index speeds up the query on high cardinality fields but consumes far less storage for building index files. Refer to the [Transform Example](#transform-example) below for syntax.

### The `tag` field

The `Pipeline` can also specify a tag field manually. For information about tag field, please refer to the [Data Model](/user-guide/concepts/data-model.md) documentation. Refer to the [Transform Example](#transform-example) below for syntax. 

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

The result will be:

```
{
  "name": "john",
  "age": 3,
  "description": "It was snowing when he was born.",
  "born_time": 2021-07-08 16:00:00
}
```

### Transform in doc version 2

Before `v0.15`, the pipeline engine only supports a fully-set transform mode and an auto-transform mode: 
- Fully-set transform: only fields explicitly noted in the transform section will be persisted into the database
- Auto-transform: no transform section is written, and the pipeline engine will try to set all the fields from the pipeline context. But in this case, there is no way to set other indexes other than the time index.

Starting from `v0.15`, GreptimeDB introduces a new transform mode combining the advantages of the existing two, which make it easier to write pipeline configuration.
You only set necessary fields in the transform section, specifying particular datatype and index for them; the rest of the fields from the pipeline context are set automatically by the pipeline engine.
With the `select` processor, you can decide what field is wanted and what isn't in the final table.

However, this is a breaking change to the existing pipeline configuration files.
If you has already used pipeline with `dissect` or `regex` processors, after upgrading the database, the original message string, which is still in the pipeline context, gets immediately inserted into the database and there's no way to stop this behavior.

Therefore, GreptimeDB introduces the concept of doc version to decide which transform mode you want to use, just like the version in a Docker Compose file. Here is an example:
```YAML
version: 2
processors:
  - date:
    field: input_str
    formats:
      - "%Y-%m-%dT%H:%M:%S%.3fZ"

transform:
  - field: input_str, ts
    type: time
```

Simply add a `version: 2` line at the top of the config file, and the pipeline engine will run the transform in combined mode:
1. Process all written transform rules sequentially.
2. Write all fields of the pipeline context to the final table.

Note:
- If the transform section is explicitly written, it must contain a time index field. Otherwise the time-index field will be inferred by the pipeline engine just like the auto-transform mode.
- The transform process in the version 2 will consume the original field in the pipeline context, so you can't transform the same field twice.

## Dispatcher

The pipeline dispatcher routes requests to other pipelines based on configured
field values. It is useful when multiple log types share a single source and
need to be stored in separate tables with different structures.

A sample configuration is like:

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

The dispatcher runs after processors and before transformations. It routes data
to the next pipeline, where the defined processors will execute.

You can specify a `field` and `rules` for routing. If the field value matches a
rule's `value`, the data is routed to the specified `pipeline`. If no pipeline
is defined, the current data structure is used as the table structure. In the
example configuration above, if the `type` of input data is `http`, we will call
`http` as next pipeline. And if `type` is `db`, we use current data structure to
store the data.

The target table name is determined by `table_suffix`, appended to the current
`table` and an underscore `_`. For example, if the table is `applogs` and it
matches the `http` rule, data is stored in `applogs_http`.

If no rules match, data is transformed by the current pipeline's
transformations.

## Table suffix

:::warning Experimental Feature
This experimental feature may contain unexpected behavior, have its functionality change in the future.
:::

There are cases where you want to split and insert log data into different target table
based on some certain values of input data. For example, if you want to divide and store the log data 
based on the application where the log is produced, thus adding an app name suffix to the target table.

A sample configuration is like:
```yaml
table_suffix: _${app_name}
```

The syntax is simple: use `${}` to include the variable in the pipeline execution context.
The variable can be directly from the input data or a product of former process.
After the table suffix is formatted, the whole string will be added to the input table name.

Note:
1. The variable must be an integer number or a string type of data.
2. If any error occurs in runtime(e.g: the variable is missing or not a valid type), the input table
name will be used.

Here is an example of how it works. The input data is like following:
```JSON
[
  {"type": "db"},
  {"type": "http"},
  {"t": "test"}
]
```

The input table name is `persist_app`, and the pipeline config is like
```YAML
table_suffix: _${type}
```

These three lines of input log will be inserted into three tables:
1. `persist_app_db`
2. `persist_app_http`
3. `persist_app`, for it doesn't have a `type` field, thus the default table name will be used.