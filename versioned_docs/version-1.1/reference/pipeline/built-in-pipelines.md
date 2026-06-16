---
keywords: [built-in pipelines, greptime_identity, JSON logs, log processing, time index, pipeline, GreptimeDB]
description: Learn about GreptimeDB's built-in pipelines, including the greptime_identity pipeline for processing JSON logs with automatic schema creation, type conversion, and time index configuration.
---

# Built-in Pipelines

GreptimeDB offers built-in pipelines for common log formats, allowing you to use them directly without creating new pipelines.

Note that the built-in pipelines are not editable.
Additionally, the "greptime_" prefix of the pipeline name is reserved.

## `greptime_identity`

The `greptime_identity` pipeline is designed for writing JSON logs and automatically creates columns for each field in the JSON log. Nested JSON objects are automatically flattened into separate columns using dot notation.

- Nested objects are automatically flattened (e.g., `{"a": {"b": 1}}` becomes column `a.b`)
- Arrays are converted to JSON strings
- An error is returned if the same field has different types
- Fields with `null` values are ignored
- If time index is not specified, an additional column, `greptime_timestamp`, is added to the table as the time index to indicate when the log was written

### Type conversion rules

- `string` -> `string`
- `number` -> `int64` or `float64`
- `boolean` -> `bool`
- `null` -> ignore
- `array` -> `string` (JSON-stringified)
- `object` -> automatically flattened into separate columns (see [Flatten JSON objects](#flatten-json-objects))


For example, if we have the following json data:

```json
[
    {"name": "Alice", "age": 20, "is_student": true, "score": 90.5,"object": {"a":1,"b":2}},
    {"age": 21, "is_student": false, "score": 85.5, "company": "A" ,"whatever": null},
    {"name": "Charlie", "age": 22, "is_student": true, "score": 95.5,"array":[1,2,3]}
]
```

We'll merge the schema for each row of this batch to get the final schema. Note that nested objects are automatically flattened into separate columns (e.g., `object.a`, `object.b`), and arrays are converted to JSON strings. The table schema will be:

```sql
mysql> desc pipeline_logs;
+--------------------+---------------------+------+------+---------+---------------+
| Column             | Type                | Key  | Null | Default | Semantic Type |
+--------------------+---------------------+------+------+---------+---------------+
| age                | Int64               |      | YES  |         | FIELD         |
| is_student         | Boolean             |      | YES  |         | FIELD         |
| name               | String              |      | YES  |         | FIELD         |
| object.a           | Int64               |      | YES  |         | FIELD         |
| object.b           | Int64               |      | YES  |         | FIELD         |
| score              | Float64             |      | YES  |         | FIELD         |
| company            | String              |      | YES  |         | FIELD         |
| array              | String              |      | YES  |         | FIELD         |
| greptime_timestamp | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
+--------------------+---------------------+------+------+---------+---------------+
9 rows in set (0.00 sec)
```

The data will be stored in the table as follows:

```sql
mysql> select * from pipeline_logs;
+------+------------+---------+----------+----------+-------+---------+-----------+----------------------------+
| age  | is_student | name    | object.a | object.b | score | company | array     | greptime_timestamp         |
+------+------------+---------+----------+----------+-------+---------+-----------+----------------------------+
|   22 |          1 | Charlie | NULL     | NULL     |  95.5 | NULL    | [1,2,3]   | 2024-10-18 09:35:48.333020 |
|   21 |          0 | NULL    | NULL     | NULL     |  85.5 | A       | NULL      | 2024-10-18 09:35:48.333020 |
|   20 |          1 | Alice   | 1        | 2        |  90.5 | NULL    | NULL      | 2024-10-18 09:35:48.333020 |
+------+------------+---------+----------+----------+-------+---------+-----------+----------------------------+
3 rows in set (0.01 sec)
```

### Specify time index

A time index is necessary in GreptimeDB. Since the `greptime_identity` pipeline does not require a YAML configuration, you must set the time index in the query parameters if you want to use the timestamp from the log data instead of the automatically generated timestamp when the data arrives.

Example of Incoming Log Data:
```JSON
[
    {"action": "login", "ts": 1742814853}
]
```

To instruct the server to use ts as the time index, set the following query parameter in the HTTP header:
```shell
curl -X "POST" "http://localhost:4000/v1/ingest?db=public&table=pipeline_logs&pipeline_name=greptime_identity&custom_time_index=ts;epoch;s" \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic {{authentication}}" \
     -d $'[{"action": "login", "ts": 1742814853}]'
```

The `custom_time_index` parameter accepts two formats, depending on the input data format:
- Epoch number format: `<field_name>;epoch;<resolution>`
  - The field can be an integer or a string.
  - The resolution must be one of: `s`, `ms`, `us`, or `ns`.
- Date string format: `<field_name>;datestr;<format>`
  - For example, if the input data contains a timestamp like `2025-03-24 19:31:37+08:00`, the corresponding format should be `%Y-%m-%d %H:%M:%S%:z`.

With the configuration above, the resulting table will correctly use the specified log data field as the time index.
```sql
DESC pipeline_logs;
```
```sql
+--------+-----------------+------+------+---------+---------------+
| Column | Type            | Key  | Null | Default | Semantic Type |
+--------+-----------------+------+------+---------+---------------+
| ts     | TimestampSecond | PRI  | NO   |         | TIMESTAMP     |
| action | String          |      | YES  |         | FIELD         |
+--------+-----------------+------+------+---------+---------------+
2 rows in set (0.02 sec)
```

Here are some example of using `custom_time_index` assuming the time variable is named `input_ts`:
- 1742814853: `custom_time_index=input_ts;epoch;s`
- 1752749137000: `custom_time_index=input_ts;epoch;ms`
- "2025-07-17T10:00:00+0800": `custom_time_index=input_ts;datestr;%Y-%m-%dT%H:%M:%S%z`
- "2025-06-27T15:02:23.082253908Z": `custom_time_index=input_ts;datestr;%Y-%m-%dT%H:%M:%S%.9f%#z`


### Flatten JSON objects

The `greptime_identity` pipeline **automatically flattens** nested JSON objects into a single-level structure. This behavior is always enabled and creates separate columns for each nested field using dot notation (e.g., `a.b.c`).

#### Controlling flattening depth

You can control how deeply nested objects are flattened using the `max_nested_levels` parameter in the `x-greptime-pipeline-params` header. The default value is 10 levels.

Here is a sample request:

```shell
curl -X "POST" "http://localhost:4000/v1/ingest?db=<db-name>&table=<table-name>&pipeline_name=greptime_identity&version=<pipeline-version>" \
     -H "Content-Type: application/x-ndjson" \
     -H "Authorization: Basic {{authentication}}" \
     -H "x-greptime-pipeline-params: max_nested_levels=5" \
     -d "$<log-items>"
```

When the maximum nesting level is reached, any remaining nested structure is converted to a JSON string and stored in a single column. For example, with `max_nested_levels=3`:

```JSON
{
    "a": {
        "b": {
            "c": {
                "d": [1, 2, 3]
            }
        }
    },
    "e": [
        "foo",
        "bar"
    ],
    "f": {
        "g": {
            "h": 123,
            "i": "hello",
            "j": {
                "k": true
            }
        }
    }
}
```

Will be flattened to:

```json
{
    "a.b.c": "{\"d\":[1,2,3]}",
    "e": "[\"foo\",\"bar\"]",
    "f.g.h": 123,
    "f.g.i": "hello",
    "f.g.j": "{\"k\":true}"
}
```

Note that:
- Arrays at any level are always converted to JSON strings (e.g., `"e"` becomes `"[\"foo\",\"bar\"]"`)
- When the nesting level limit is reached (level 3 in this example), the remaining nested objects are converted to JSON strings (e.g., `"a.b.c"` and `"f.g.j"`)
- Regular scalar values within the depth limit are stored as their native types (e.g., `"f.g.h"` as integer, `"f.g.i"` as string)



