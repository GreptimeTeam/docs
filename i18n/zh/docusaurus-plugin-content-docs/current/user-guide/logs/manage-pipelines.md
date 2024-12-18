---
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
- 作为时间索引的额外列 `greptime_timestamp` 将被添加到表中，以指示日志写入的时间。

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

目前可以使用 SQL 来查询 Pipeline 的信息。

```sql
SELECT * FROM greptime_private.pipelines;
```

请注意，如果您使用 MySQL 或者 PostgreSQL 协议作为连接 GreptimeDB 的方式，查询出来的 Pipeline 时间信息精度可能有所不同，可能会丢失纳秒级别的精度。

为了解决这个问题，可以将 `created_at` 字段强制转换为 timestamp 来查看 Pipeline 的创建时间。例如，下面的查询将 `created_at` 以 `bigint` 的格式展示:

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
      |     index: tag                   +|
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

### 调试 Pipeline 配置

由于 Pipeline 的配置文件和需要处理的数据需要同时上传，且数据格式不一致
会导致一些在命令行中调试困难的问题。因此我们在 Dashboard 的 logview 中提供了图形化的调试界面。
如果需要在命令行中进行调试，可以使用如下脚本进行调试：

**此脚本仅仅用于测试 Pipeline 的处理结果，不会将日志写入到 GreptimeDB 中。**

```bash
#! /bin/bash

PIPELINE_TYPE=$1
P1=$2
P2=$3
P3=$4
HOST="http://localhost:4000"

function usage {
    echo "Usage: $0 <pipeline_type> <param1> <param2> [param3]"
    echo "pipeline_type: 'name' or 'content'"
    echo "  - 'name': requires param1 (pipeline_name), param2 (data), and param3 (pipeline_version)"
    echo "  - 'content': requires param1 (pipeline_content_file) and param2 (data)"
    exit 1
}

function test_pipeline_name {
    local PIPELINE_NAME=$P1
    local DATA="$P2"
    local PIPELINE_VERSION="$P3"
    if [[ -z "$PIPELINE_VERSION" ]]; then
        PIPELINE_VERSION="null"
    else
        PIPELINE_VERSION="\"$PIPELINE_VERSION\""
    fi

    local BODY=$(jq -nc --argjson data "$DATA" --arg pipeline_name "$PIPELINE_NAME" --argjson pipeline_version "$PIPELINE_VERSION" '{"pipeline_name": $pipeline_name, "pipeline_version": $pipeline_version, "data": $data}')
    local result=$(curl --silent -X POST -H "Content-Type: application/json" "$HOST/v1/events/pipelines/dryrun" --data "$BODY")
    echo "$result" | jq
}

function test_pipeline_content {
    local PIPELINE_CONTENT=$(cat "$P1")
    local DATA="$P2"
    local BODY=$(jq -nc --arg pipeline_content "$PIPELINE_CONTENT" --argjson data "$DATA" '{"pipeline": $pipeline_content, "data": $data}')
    local result=$(curl --silent -X POST -H "Content-Type: application/json" "$HOST/v1/events/pipelines/dryrun" --data "$BODY")
    echo "$result" | jq
}

if [[ -z "$PIPELINE_TYPE" || -z "$P1" || -z "$P2" ]]; then
    usage
fi

case $PIPELINE_TYPE in
  "name")
    test_pipeline_name
    ;;
  "content")
    test_pipeline_content
    ;;
  *)
    usage
    ;;
esac
```

我们后续的调试都会使用这个脚本，首先将脚本保存为 `test_pipeline.sh`，然后使用 `chmod +x test_pipeline.sh` 添加执行权限。此脚本依赖 `curl`, `jq`。请确保你的系统已经安装了这两个工具。
如果需要更换 endpoint，请修改脚本中的 $HOST 为你的 GreptimeDB 的地址。

#### 调试 Pipeline

假设我们需要将如下数据中的，`message` 字段中的 `.` 替换为 `-`，同时将 `time` 字段解析为时间格式。

```json
{
    "message": "1998.08",
    "time": "2024-05-25 20:16:37.217"
}
```

所以我们编写了如下的 Pipeline 配置文件，保存为 `pipeline.yaml`：

```yaml
processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true
  - gsub:
      fields:
        - message
      pattern: "\\."
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

然后使用 `test_pipeline.sh` 脚本进行测试：

```bash
./test_pipeline.sh content pipeline.yaml '[{"message": 1998.08,"time":"2024-05-25 20:16:37.217"}]'
```

输入如下：

```json
{
  "error": "Failed to build pipeline: Field replacement must be a string"
}
```

根据错误内容，我们需要修改 `gsub` processor 的配置，将 `replacement` 字段的值更改为字符串类型。

```yaml
processors:
  - date:
      field: time
      formats:
        - "%Y-%m-%d %H:%M:%S%.3f"
      ignore_missing: true
  - gsub:
      fields:
        - message
      pattern: "\\."
      # 修改为字符串类型
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

此时再次测试 Pipeline：

```bash
./test_pipeline.sh content pipeline.yaml '[{"message": 1998.08,"time":"2024-05-25 20:16:37.217"}]'
```

输入如下：

```json
{
  "error": "Failed to exec pipeline: Processor gsub: expect string value, but got Float64(1998.08)"
}
```

根据错误内容，我们需要修改测试数据的格式，将 `message` 字段的值更改为字符串类型。

```bash
./test_pipeline.sh content pipeline.yaml '[{"message": "1998.08","time":"2024-05-25 20:16:37.217"}]'
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

#### 调试 Pipeline 接口信息

**此接口仅仅用于测试 Pipeline 的处理结果，不会将日志写入到 GreptimeDB 中。**

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/dryrun" \
     -H 'Content-Type: application/json' \
     -d 'data here'
```

body 为固定格式的 json 字符串，其中包含 `pipeline`，`pipeline_name`，`pipeline_version` 和 `data` 字段。
`pipeline` 和 `pipeline_name` 二选一，`pipeline_version` 为可选字段。当所有字段都存在时，优先使用 `pipeline` 字段。
`pipeline_name` 为已经存储在 GreptimeDB 中的 Pipeline 的名称，`pipeline_version`（可选） 为 Pipeline 的版本号。

* `pipeline`：字符串，Pipeline 的配置内容。
* `pipeline_name`：字符串，Pipeline 的名称。
* `pipeline_version`：字符串，当 `pipeline_name` 存在时，Pipeline 的版本号。
* `data`：一个 JSON 数组，每个元素为一个 JSON 对象或者字符串，需要处理的数据。

例如，我们使用调试 Pipeline 的配置文件 `pipeline.yaml`，测试数据如下，则 curl 命令为：

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/dryrun" \
     -H 'Content-Type: application/json' \
     -d '{
  "pipeline": "processors:\n  - date:\n      field: time\n      formats:\n        - \"%Y-%m-%d %H:%M:%S%.3f\"\n      ignore_missing: true\n  - gsub:\n      fields:\n        - message\n      pattern: \"\\\\.\"\n      # 修改为字符串类型\n      replacement: \"-\"\n      ignore_missing: true\n\ntransform:\n  - fields:\n      - message\n    type: string\n  - field: time\n    type: time\n    index: timestamp",
  "data": [
    {
      "message": "1998.08",
      "time": "2024-05-25 20:16:37.217"
    }
  ]
}'
```

如果我们使用 Pipeline 的名称 `test_pipeline`，不提供 `pipeline_version` 参数，则 curl 命令为：

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/dryrun" \
     -H 'Content-Type: application/json' \
     -d '{
  "pipeline_name": "test_pipeline",
  "data": [
    {
      "message": "1998.08",
      "time": "2024-05-25 20:16:37.217"
    }
  ]
}'
```

这会使用名为 `test_pipeline` 的的最新版本 Pipeline 来处理数据。