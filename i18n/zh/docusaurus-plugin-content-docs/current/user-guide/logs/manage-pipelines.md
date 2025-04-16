---
keywords: [管理 Pipeline, 创建 Pipeline, 删除 Pipeline, 查询 Pipeline, 内置 Pipeline, 数据处理, 日志解析, 日志转换]
description: 介绍如何在 GreptimeDB 中管理 Pipeline，包括创建、删除和查询 Pipeline 的方法，以及内置 Pipeline 的使用。
---

# 管理 Pipeline

在 GreptimeDB 中，每个 `pipeline` 是一个数据处理单元集合，用于解析和转换写入的日志内容。本文档旨在指导您如何创建和删除 Pipeline，以便高效地管理日志数据的处理流程。


有关 Pipeline 的具体配置，请阅读 [Pipeline 配置](pipeline-config.md)。

## 内置 Pipeline

GreptimeDB 提供了常见日志格式的内置 Pipeline，允许您直接使用而无需创建新的 Pipeline。

请注意，内置 Pipeline 的名称以 "greptime_" 为前缀，不可编辑。

### `greptime_identity`

`greptime_identity` Pipeline 适用于写入 JSON 日志，并自动为 JSON 日志中的每个字段创建列。

- JSON 日志中的第一层级的 key 是表中的列名。
- 如果相同字段包含不同类型的数据，则会返回错误。
- 值为 `null` 的字段将被忽略。
- 如果没有手动指定，一个作为时间索引的额外列 `greptime_timestamp` 将被添加到表中，以指示日志写入的时间。

#### 类型转换规则

- `string` -> `string`
- `number` -> `int64` 或 `float64`
- `boolean` -> `bool`
- `null` -> 忽略
- `array` -> `json`
- `object` -> `json`

例如，如果我们有以下 JSON 数据：

```json
[
    {"name": "Alice", "age": 20, "is_student": true, "score": 90.5,"object": {"a":1,"b":2}},
    {"age": 21, "is_student": false, "score": 85.5, "company": "A" ,"whatever": null},
    {"name": "Charlie", "age": 22, "is_student": true, "score": 95.5,"array":[1,2,3]}
]
```

我们将合并每个批次的行结构以获得最终 schema。表 schema 如下所示：

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

数据将存储在表中，如下所示：

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

#### 自定义时间索引列

每个 GreptimeDB 表中都必须有时间索引列。`greptime_identity` pipeline 不需要额外的 YAML 配置，如果你希望使用写入数据中自带的时间列（而不是日志数据到达服务端的时间戳）作为表的时间索引列，则需要通过参数进行指定。

假设这是一份待写入的日志数据：
```JSON
[
    {"action": "login", "ts": 1742814853}
]
```

设置如下的 URL 参数来指定自定义时间索引列：
```shell
curl -X "POST" "http://localhost:4000/v1/events/logs?db=public&table=pipeline_logs&pipeline_name=greptime_identity&custom_time_index=ts;epoch;s" \
     -H 'Content-Type: application/json' \
     -d $'[{"action": "login", "ts": 1742814853}]'
```

取决于数据的格式，`custom_time_index` 参数接受两种格式的配置值：
- Unix 时间戳: `<字段名>;epoch;<精度>`
  - 该字段需要是整数或者字符串
  - 精度为这四种选项之一: `s`, `ms`, `us`, or `ns`.
- 时间戳字符串: `<字段名>;datestr;<字符串解析格式>`
  - 例如输入的时间字段值为 `2025-03-24 19:31:37+08:00`，则对应的字符串解析格式为 `%Y-%m-%d %H:%M:%S%:z`

通过上述配置，结果表就能正确使用输入字段作为时间索引列
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

## 创建 Pipeline

GreptimeDB 提供了专用的 HTTP 接口用于创建 Pipeline。
假设你已经准备好了一个 Pipeline 配置文件 pipeline.yaml，使用以下命令上传配置文件，其中 `test` 是你指定的 Pipeline 的名称：

```shell
## 上传 pipeline 文件。test 为 Pipeline 的名称
curl -X "POST" "http://localhost:4000/v1/events/pipelines/test?db=public" -F "file=@pipeline.yaml"
```

创建的 Pipeline 会关联到一个 database，可通过 URL 参数 `db` 来指定，默认为 `public`。
在将日志写入到数据库中时，所使用的 Pipeline 必须和写入的表在同一个 database 下。

## 删除 Pipeline

可以使用以下 HTTP 接口删除 Pipeline：

```shell
## test 为 Pipeline 的名称
curl -X "DELETE" "http://localhost:4000/v1/events/pipelines/test?db=public&version=2024-06-27%2012%3A02%3A34.257312110Z"
```

上面的例子中，我们删除了一个在 `public` database 下名为 `test` 的 Pipeline。`version` 参数是必须的，用于指定要删除的 Pipeline 的版本号。

## 查询 Pipeline

可以使用以下 HTTP 接口查询 Pipeline：

```shell
## test 是 Pipeline 的名称，该查询将返回最新版本的 Pipeline。
curl "http://localhost:4000/v1/events/pipelines/test"
```

```shell
## 如果你想查询某个 Pipeline 的历史版本，可以在 URL 中添加 `version` 参数
curl "http://localhost:4000/v1/events/pipelines/test?version=2025-04-01%2006%3A58%3A31.335251882%2B0000"
```

 If the pipeline exists, the output should be:

```json
{
  "pipelines": [
    {
      "name": "test",
      "version": "2025-04-01 06:58:31.335251882+0000",
      "pipeline": "processors:\n  - dissect:\n      fields:\n        - message\n      patterns:\n        - '%{ip_address} - - [%{timestamp}] \"%{http_method} %{request_line}\" %{status_code} %{response_size} \"-\" \"%{user_agent}\"'\n      ignore_missing: true\n  - date:\n      fields:\n        - timestamp\n      formats:\n        - \"%d/%b/%Y:%H:%M:%S %z\"\n\ntransform:\n  - fields:\n      - ip_address\n      - http_method\n    type: string\n    index: tag\n  - fields:\n      - status_code\n    type: int32\n    index: tag\n  - fields:\n      - request_line\n      - user_agent\n    type: string\n    index: fulltext\n  - fields:\n      - response_size\n    type: int32\n  - fields:\n      - timestamp\n    type: time\n    index: timestamp\n"
    }
  ],
  "execution_time_ms": 92
}
```

在上面的输出中，pipeline 字段是 YAML 格式的字符串。
JSON 格式无法很好地展示 YMAL 字符串，使用 echo 命令可以将其以阅读友好的方式展示出来：

```shell
echo "processors:\n  - dissect:\n      fields:\n        - message\n      patterns:\n        - '%{ip_address} - - [%{timestamp}] \"%{http_method} %{request_line}\" %{status_code} %{response_size} \"-\" \"%{user_agent}\"'\n      ignore_missing: true\n  - date:\n      fields:\n        - timestamp\n      formats:\n        - \"%d/%b/%Y:%H:%M:%S %z\"\n\ntransform:\n  - fields:\n      - ip_address\n      - http_method\n    type: string\n    index: tag\n  - fields:\n      - status_code\n    type: int32\n    index: tag\n  - fields:\n      - request_line\n      - user_agent\n    type: string\n    index: fulltext\n  - fields:\n      - response_size\n    type: int32\n  - fields:\n      - timestamp\n    type: time\n    index: timestamp\n"
```

```yml
processors:
  - dissect:
      fields:
        - message
      patterns:
        - '%{ip_address} - - [%{timestamp}] "%{http_method} %{request_line}" %{status_code} %{response_size} "-" "%{user_agent}"'
      ignore_missing: true
  - date:
      fields:
        - timestamp
      formats:
        - "%d/%b/%Y:%H:%M:%S %z"

transform:
  - fields:
      - ip_address
      - http_method
    type: string
    index: tag
  - fields:
      - status_code
    type: int32
    index: tag
  - fields:
      - request_line
      - user_agent
    type: string
    index: fulltext
  - fields:
      - response_size
    type: int32
  - fields:
      - timestamp
    type: time
    index: timestamp

```

或者使用 SQL 来查询 Pipeline：

```sql
SELECT * FROM greptime_private.pipelines;
```

请注意，如果您使用 MySQL 或者 PostgreSQL 协议作为连接 GreptimeDB 的方式，查询出来的 Pipeline 时间信息精度可能有所不同，可能会丢失纳秒级别的精度。

为了解决这个问题，可以将 `created_at` 字段强制转换为 timestamp 来查看 Pipeline 的创建时间。例如，下面的查询将 `created_at` 以 `bigint` 的格式展示：

```sql
SELECT name, pipeline, created_at::bigint FROM greptime_private.pipelines;
```

查询结果如下：

```
 name |             pipeline              | greptime_private.pipelines.created_at
------+-----------------------------------+---------------------------------------
 test | processors:                      +|                   1719489754257312110
      |   - date:                        +|
      |       field: time                +|
      |       formats:                   +|
      |         - "%Y-%m-%d %H:%M:%S%.3f"+|
      |       ignore_missing: true       +|
      |                                  +|
      | transform:                       +|
      |   - fields:                      +|
      |       - id1                      +|
      |       - id2                      +|
      |     type: int32                  +|
      |   - fields:                      +|
      |       - type                     +|
      |       - logger                   +|
      |     type: string                 +|
      |     index: inverted              +|
      |   - fields:                      +|
      |       - log                      +|
      |     type: string                 +|
      |     index: fulltext              +|
      |   - field: time                  +|
      |     type: time                   +|
      |     index: timestamp             +|
      |                                   |
(1 row)
```

然后可以使用程序将 SQL 结果中的 bigint 类型的时间戳转换为时间字符串。

```shell
timestamp_ns="1719489754257312110"; readable_timestamp=$(TZ=UTC date -d @$((${timestamp_ns:0:10}+0)) +"%Y-%m-%d %H:%M:%S").${timestamp_ns:10}Z; echo "Readable timestamp (UTC): $readable_timestamp"
```

输出：

```shell
Readable timestamp (UTC): 2024-06-27 12:02:34.257312110Z
```

输出的 `Readable timestamp (UTC)` 即为 Pipeline 的创建时间同时也是版本号。

## 问题调试

首先，请参考 [快速入门示例](/user-guide/logs/quick-start.md#使用-pipeline-写入日志)来查看 Pipeline 正确的执行情况。

### 调试创建 Pipeline

在创建 Pipeline 的时候你可能会遇到错误，例如使用如下配置创建 Pipeline：

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/test" \
     -H 'Content-Type: application/x-yaml' \
     -d $'processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true
  - gsub:
      fields:
        - message
      pattern: "\\\."
      replacement:
        - "-"
      ignore_missing: true

transform:
  - fields:
      - message
    type: string
  - field: time
    type: time
    index: timestamp'
```

Pipeline 配置存在错误。`gsub` processor 期望 `replacement` 字段为字符串，但当前配置提供了一个数组。因此，该 Pipeline 创建失败，并显示以下错误消息：


```json
{"error":"Failed to parse pipeline: 'replacement' must be a string"}
```

因此，你需要修改 `gsub` processor 的配置，将 `replacement` 字段的值更改为字符串类型。

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/test" \
     -H 'Content-Type: application/x-yaml' \
     -d $'processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true
  - gsub:
      fields:
        - message
      pattern: "\\\."
      replacement: "-"
      ignore_missing: true

transform:
  - fields:
      - message
    type: string
  - field: time
    type: time
    index: timestamp'
```

此时 Pipeline 创建成功，可以使用 `dryrun` 接口测试该 Pipeline。

### 调试日志写入

我们可以使用 `dryrun` 接口测试 Pipeline。我们将使用错误的日志数据对其进行测试，其中消息字段的值为数字格式，会导致 Pipeline 在处理过程中失败。

**此接口仅仅用于测试 Pipeline 的处理结果，不会将日志写入到 GreptimeDB 中。**

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/dryrun?pipeline_name=test" \
     -H 'Content-Type: application/json' \
     -d $'{"message": 1998.08,"time":"2024-05-25 20:16:37.217"}'

{"error":"Failed to execute pipeline, reason: gsub processor: expect string or array string, but got Float64(1998.08)"}
```

输出显示 Pipeline 处理失败，因为 `gsub` Processor 期望的是字符串类型，而不是浮点数类型。我们需要修改日志数据的格式，确保 Pipeline 能够正确处理。
我们再将 message 字段的值修改为字符串类型，然后再次测试该 Pipeline。

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/dryrun?pipeline_name=test" \
     -H 'Content-Type: application/json' \
     -d $'{"message": "1998.08","time":"2024-05-25 20:16:37.217"}'
```

此时 Pipeline 处理成功，输出如下：

```json
{
    "rows": [
        [
            {
                "data_type": "STRING",
                "key": "message",
                "semantic_type": "FIELD",
                "value": "1998-08"
            },
            {
                "data_type": "TIMESTAMP_NANOSECOND",
                "key": "time",
                "semantic_type": "TIMESTAMP",
                "value": "2024-05-25 20:16:37.217+0000"
            }
        ]
    ],
    "schema": [
        {
            "colume_type": "FIELD",
            "data_type": "STRING",
            "fulltext": false,
            "name": "message"
        },
        {
            "colume_type": "TIMESTAMP",
            "data_type": "TIMESTAMP_NANOSECOND",
            "fulltext": false,
            "name": "time"
        }
    ]
}
```

可以看到，`1998.08` 字符串中的 `.` 已经被替换为 `-`，Pipeline 处理成功。