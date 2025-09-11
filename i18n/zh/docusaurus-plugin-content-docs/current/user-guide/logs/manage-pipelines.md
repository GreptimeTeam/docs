---
keywords: [管理 Pipeline, 创建 Pipeline, 删除 Pipeline, 查询 Pipeline, 内置 Pipeline, 数据处理, 日志解析, 日志转换]
description: 介绍如何在 GreptimeDB 中管理 Pipeline，包括创建、删除和查询 Pipeline 的方法，以及内置 Pipeline 的使用。
---

# 管理 Pipeline

在 GreptimeDB 中，每个 `pipeline` 是一个数据处理单元集合，用于解析和转换写入的日志内容。本文档旨在指导你如何创建和删除 Pipeline，以便高效地管理日志数据的处理流程。


有关 Pipeline 的具体配置，请阅读 [Pipeline 配置](pipeline-config.md)。

## 鉴权

在使用 HTTP API 进行 Pipeline 管理时，你需要提供有效的鉴权信息。
请参考[鉴权](/user-guide/protocols/http.md#鉴权)文档了解详细信息。

## 创建 Pipeline

GreptimeDB 提供了专用的 HTTP 接口用于创建 Pipeline。
假设你已经准备好了一个 Pipeline 配置文件 pipeline.yaml，使用以下命令上传配置文件，其中 `test` 是你指定的 Pipeline 的名称：

```shell
## 上传 pipeline 文件。test 为 Pipeline 的名称
curl -X "POST" "http://localhost:4000/v1/events/pipelines/test" \
  -H "Authorization: Basic {{authentication}}" \
  -F "file=@pipeline.yaml"
```

你可以在所有 Database 中使用创建的 Pipeline。

## 删除 Pipeline

可以使用以下 HTTP 接口删除 Pipeline：

```shell
## test 为 Pipeline 的名称
curl -X "DELETE" "http://localhost:4000/v1/events/pipelines/test?version=2024-06-27%2012%3A02%3A34.257312110Z" \
  -H "Authorization: Basic {{authentication}}"
```

上面的例子中，我们删除了名为 `test` 的 Pipeline。`version` 参数是必须的，用于指定要删除的 Pipeline 的版本号。

## 查询 Pipeline

可以使用以下 HTTP 接口查询 Pipeline：

```shell
## test 是 Pipeline 的名称，该查询将返回最新版本的 Pipeline。
curl "http://localhost:4000/v1/events/pipelines/test" \
  -H "Authorization: Basic {{authentication}}"
```

```shell
## 如果你想查询某个 Pipeline 的历史版本，可以在 URL 中添加 `version` 参数
curl "http://localhost:4000/v1/events/pipelines/test?version=2025-04-01%2006%3A58%3A31.335251882%2B0000" \
  -H "Authorization: Basic {{authentication}}"
```

 如果这个 pipeline 存在，输出会如下所示：

```json
{
  "pipelines": [
    {
      "name": "test",
      "version": "2025-04-01 06:58:31.335251882",
      "pipeline": "version: 2\nprocessors:\n  - dissect:\n      fields:\n        - message\n      patterns:\n        - '%{ip_address} - - [%{timestamp}] \"%{http_method} %{request_line}\" %{status_code} %{response_size} \"-\" \"%{user_agent}\"'\n      ignore_missing: true\n  - date:\n      fields:\n        - timestamp\n      formats:\n        - \"%d/%b/%Y:%H:%M:%S %z\"\n  - select:\n      type: exclude\n      fields:\n        - message\n\ntransform:\n  - fields:\n      - ip_address\n    type: string\n    index: inverted\n    tag: true\n  - fields:\n      - status_code\n    type: int32\n    index: inverted\n    tag: true\n  - fields:\n      - request_line\n      - user_agent\n    type: string\n    index: fulltext\n  - fields:\n      - response_size\n    type: int32\n  - fields:\n      - timestamp\n    type: time\n    index: timestamp\n"
    }
  ],
  "execution_time_ms": 7
}
```

在上面的输出中，pipeline 字段是 YAML 格式的字符串。
JSON 格式无法很好地展示 YMAL 字符串，使用 echo 命令可以将其以阅读友好的方式展示出来：

```shell
echo -e "version: 2\nprocessors:\n  - dissect:\n      fields:\n        - message\n      patterns:\n        - '%{ip_address} - - [%{timestamp}] \"%{http_method} %{request_line}\" %{status_code} %{response_size} \"-\" \"%{user_agent}\"'\n      ignore_missing: true\n  - date:\n      fields:\n        - timestamp\n      formats:\n        - \"%d/%b/%Y:%H:%M:%S %z\"\n  - select:\n      type: exclude\n      fields:\n        - message\n\ntransform:\n  - fields:\n      - ip_address\n    type: string\n    index: inverted\n    tag: true\n  - fields:\n      - status_code\n    type: int32\n    index: inverted\n    tag: true\n  - fields:\n      - request_line\n      - user_agent\n    type: string\n    index: fulltext\n  - fields:\n      - response_size\n    type: int32\n  - fields:\n      - timestamp\n    type: time\n    index: timestamp\n"
```

```yml
version: 2
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
  - select:
      type: exclude
      fields:
        - message

transform:
  - fields:
      - ip_address
    type: string
    index: inverted
    tag: true
  - fields:
      - status_code
    type: int32
    index: inverted
    tag: true
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

请注意，如果你使用 MySQL 或者 PostgreSQL 协议作为连接 GreptimeDB 的方式，查询出来的 Pipeline 时间信息精度可能有所不同，可能会丢失纳秒级别的精度。

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
     -H "Content-Type: application/x-yaml" \
     -H "Authorization: Basic {{authentication}}" \
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
    index: timestamp
```

Pipeline 配置存在错误。`gsub` processor 期望 `replacement` 字段为字符串，但当前配置提供了一个数组。因此，该 Pipeline 创建失败，并显示以下错误消息：


```json
{"error":"Failed to parse pipeline: 'replacement' must be a string"}
```

因此，你需要修改 `gsub` processor 的配置，将 `replacement` 字段的值更改为字符串类型。

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/test" \
     -H "Content-Type: application/x-yaml" \
     -H "Authorization: Basic {{authentication}}" \
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
    index: timestamp
```

此时 Pipeline 创建成功，可以使用 `dryrun` 接口测试该 Pipeline。

### 调试日志写入

我们可以使用 `dryrun` 接口测试 Pipeline。我们将使用错误的日志数据对其进行测试，其中消息字段的值为数字格式，会导致 Pipeline 在处理过程中失败。

**此接口仅仅用于测试 Pipeline 的处理结果，不会将日志写入到 GreptimeDB 中。**

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/dryrun?pipeline_name=test" \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic {{authentication}}" \
     -d $'{"message": 1998.08,"time":"2024-05-25 20:16:37.217"}'

{"error":"Failed to execute pipeline, reason: gsub processor: expect string or array string, but got Float64(1998.08)"}
```

输出显示 Pipeline 处理失败，因为 `gsub` Processor 期望的是字符串类型，而不是浮点数类型。我们需要修改日志数据的格式，确保 Pipeline 能够正确处理。
我们再将 message 字段的值修改为字符串类型，然后再次测试该 Pipeline。

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/dryrun?pipeline_name=test" \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic {{authentication}}" \
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

## 从 Pipeline 配置生成表的建表语句

使用 Pipeline 时，GreptimeDB 默认会在首次数据写入时自动创建目标表。
但是，你可能希望预先手动创建表以添加自定义表选项，例如添加分区规则以获得更好的性能。

虽然自动创建的表结构对于给定的 Pipeline 配置是确定的，
但根据配置手动编写表的建表语句可能会很繁琐。`/ddl` API 简化了这一过程。

对于现有的 Pipeline，你可以使用 `/v1/pipelines/{pipeline_name}/ddl` 来生成建表语句。
此 API 会检查 Pipeline 配置中的 transform 定义并推断出相应的表结构。
你可以在第一次写入数据之前使用此 API 来生成基础的建表语句，进行参数调整并手动建表。
常见的调整选项包括：
- 增加[数据分区规则](/user-guide/deployments-administration/manage-data/table-sharding.md)
- 调整[索引的参数](/user-guide/manage-data/data-index.md)
- 增加其他[表选项](/reference/sql/create.md#表选项)

以下是演示如何使用此 API 的示例。考虑以下 Pipeline 配置：
```YAML
# pipeline.yaml
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

transform:
  - fields:
      - timestamp
    type: time
    index: timestamp
  - fields:
      - ip_address
    type: string
    index: skipping
  - fields:
      - username
    type: string
    tag: true
  - fields:
      - http_method
    type: string
    index: inverted
  - fields:
      - request_line
    type: string
    index: fulltext
  - fields:
      - protocol
    type: string
  - fields:
      - status_code
    type: int32
    index: inverted
    tag: true
  - fields:
      - response_size
    type: int64
    on_failure: default
    default: 0
  - fields:
      - message
    type: string
```

首先，使用以下命令将 Pipeline 上传到数据库：
```bash
curl -X "POST" "http://localhost:4000/v1/pipelines/pp" -F "file=@pipeline.yaml"
```
然后，使用以下命令查询表的建表语句：
```bash
curl -X "GET" "http://localhost:4000/v1/pipelines/pp/ddl?table=test_table"
```
API 返回以下 JSON 格式的输出：
```JSON
{
  "sql": {
    "sql": "CREATE TABLE IF NOT EXISTS `test_table` (\n  `timestamp` TIMESTAMP(9) NOT NULL,\n  `ip_address` STRING NULL SKIPPING INDEX WITH(false_positive_rate = '0.01', granularity = '10240', type = 'BLOOM'),\n  `username` STRING NULL,\n  `http_method` STRING NULL INVERTED INDEX,\n  `request_line` STRING NULL FULLTEXT INDEX WITH(analyzer = 'English', backend = 'bloom', case_sensitive = 'false', false_positive_rate = '0.01', granularity = '10240'),\n  `protocol` STRING NULL,\n  `status_code` INT NULL INVERTED INDEX,\n  `response_size` BIGINT NULL,\n  `message` STRING NULL,\n  TIME INDEX (`timestamp`),\n  PRIMARY KEY (`username`, `status_code`)\n)\nENGINE=mito\nWITH(\n  append_mode = 'true'\n)"
  },
  "execution_time_ms": 3
}
```
格式化响应中的 `sql` 字段后，你可以看到推断出的表结构：
```SQL
CREATE TABLE IF NOT EXISTS `test_table` (
  `timestamp` TIMESTAMP(9) NOT NULL,
  `ip_address` STRING NULL SKIPPING INDEX WITH(false_positive_rate = '0.01', granularity = '10240', type = 'BLOOM'),
  `username` STRING NULL,
  `http_method` STRING NULL INVERTED INDEX,
  `request_line` STRING NULL FULLTEXT INDEX WITH(analyzer = 'English', backend = 'bloom', case_sensitive = 'false', false_positive_rate = '0.01', granularity = '10240'),
  `protocol` STRING NULL,
  `status_code` INT NULL INVERTED INDEX,
  `response_size` BIGINT NULL,
  `message` STRING NULL,
  TIME INDEX (`timestamp`),
  PRIMARY KEY (`username`, `status_code`)
  )
ENGINE=mito
WITH(
  append_mode = 'true'
)
```

你可以将推断出的表的建表语句作为起点。
根据你的需求自定义建表语句后，在通过 Pipeline 写入数据之前手动执行它。

**注意事项：**
1. 该 API 仅从 Pipeline 配置推断表结构；它不会检查表是否已存在。
2. 该 API 不考虑表后缀。如果你在 Pipeline 配置中使用 `dispatcher`、`table_suffix` 或表后缀 hint，你需要手动调整表名。
