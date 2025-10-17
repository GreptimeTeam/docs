---
keywords: [built-in pipelines, greptime_identity, JSON logs, log processing, time index, pipeline, GreptimeDB]
description: Learn about GreptimeDB's built-in pipelines, including the greptime_identity pipeline for processing JSON logs with automatic schema creation, type conversion, and time index configuration.
---

# Built-in Pipelines

GreptimeDB offers built-in pipelines for common log formats, allowing you to use them directly without creating new pipelines.

Note that the built-in pipelines are not editable.
Additionally, the "greptime_" prefix of the pipeline name is reserved.

## `greptime_identity`

The `greptime_identity` pipeline is designed for writing JSON logs and automatically creates columns for each field in the JSON log.

- The first-level keys in the JSON log are used as column names.
- An error is returned if the same field has different types.
- Fields with `null` values are ignored.
- If time index is not specified, an additional column, `greptime_timestamp`, is added to the table as the time index to indicate when the log was written.

### Type conversion rules

- `string` -> `string`
- `number` -> `int64` or `float64`
- `boolean` -> `bool`
- `null` -> ignore
- `array` -> `json`
- `object` -> `json`


For example, if we have the following json data:

```json
[
    {"name": "Alice", "age": 20, "is_student": true, "score": 90.5,"object": {"a":1,"b":2}},
    {"age": 21, "is_student": false, "score": 85.5, "company": "A" ,"whatever": null},
    {"name": "Charlie", "age": 22, "is_student": true, "score": 95.5,"array":[1,2,3]}
]
```

We'll merge the schema for each row of this batch to get the final schema. The table schema will be:

```sql
mysql> desc pipeline_logs;
+--------------------+---------------------+------+------+---------+---------------+
| Column             | Type                | Key  | Null | Default | Semantic Type |
+--------------------+---------------------+------+------+---------+---------------+
| age                | Int64               |      | YES  |         | FIELD         |
| is_student         | Boolean             |      | YES  |         | FIELD         |
| name               | String              |      | YES  |         | FIELD         |
| object             | Json                |      | YES  |         | FIELD         |
| score              | Float64             |      | YES  |         | FIELD         |
| company            | String              |      | YES  |         | FIELD         |
| array              | Json                |      | YES  |         | FIELD         |
| greptime_timestamp | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
+--------------------+---------------------+------+------+---------+---------------+
8 rows in set (0.00 sec)
```

The data will be stored in the table as follows:

```sql
mysql> select * from pipeline_logs;
+------+------------+---------+---------------+-------+---------+---------+----------------------------+
| age  | is_student | name    | object        | score | company | array   | greptime_timestamp         |
+------+------------+---------+---------------+-------+---------+---------+----------------------------+
|   22 |          1 | Charlie | NULL          |  95.5 | NULL    | [1,2,3] | 2024-10-18 09:35:48.333020 |
|   21 |          0 | NULL    | NULL          |  85.5 | A       | NULL    | 2024-10-18 09:35:48.333020 |
|   20 |          1 | Alice   | {"a":1,"b":2} |  90.5 | NULL    | NULL    | 2024-10-18 09:35:48.333020 |
+------+------------+---------+---------------+-------+---------+---------+----------------------------+
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

If flattening a JSON object into a single-level structure is needed, add the `x-greptime-pipeline-params` header to the request and set `flatten_json_object` to `true`.

Here is a sample request:

```shell
curl -X "POST" "http://localhost:4000/v1/ingest?db=<db-name>&table=<table-name>&pipeline_name=greptime_identity&version=<pipeline-version>" \
     -H "Content-Type: application/x-ndjson" \
     -H "Authorization: Basic {{authentication}}" \
     -H "x-greptime-pipeline-params: flatten_json_object=true" \
     -d "$<log-items>"
```

With this configuration, GreptimeDB will automatically flatten each field of the JSON object into separate columns. For example:

```JSON
{
    "a": {
        "b": {
            "c": [1, 2, 3]
        }
    },
    "d": [
        "foo",
        "bar"
    ],
    "e": {
        "f": [7, 8, 9],
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
    "a.b.c": [1,2,3],
    "d": ["foo","bar"],
    "e.f": [7,8,9],
    "e.g.h": 123,
    "e.g.i": "hello",
    "e.g.j.k": true
}
```



