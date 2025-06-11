---
keywords: [日志写入, HTTP 接口, Pipeline 配置, 数据格式, 请求参数]
description: 介绍如何通过 HTTP 接口使用指定的 Pipeline 将日志写入 GreptimeDB，包括请求参数、数据格式和示例。
---

# 使用 Pipeline 写入日志

本文档介绍如何通过 HTTP 接口使用指定的 Pipeline 进行处理后将日志写入 GreptimeDB。

在写入日志之前，请先阅读 [Pipeline 配置](pipeline-config.md)和[管理 Pipeline](manage-pipelines.md) 完成配置的设定和上传。

## HTTP API

您可以使用以下命令通过 HTTP 接口写入日志：

```shell
curl -X "POST" "http://localhost:4000/v1/events/logs?db=<db-name>&table=<table-name>&pipeline_name=<pipeline-name>&version=<pipeline-version>" \
     -H "Content-Type: application/x-ndjson" \
     -H "Authorization: Basic {{authentication}}" \
     -d "$<log-items>"
```


## 请求参数

此接口接受以下参数：

- `db`：数据库名称。
- `table`：表名称。
- `pipeline_name`：[Pipeline](./pipeline-config.md) 名称。
- `version`：Pipeline 版本号。可选，默认使用最新版本。

## `Content-Type` 和 Body 数据格式

GreptimeDB 使用 `Content-Type` header 来决定如何解码请求体内容。目前我们支持以下两种格式：
- `application/json`: 包括普通的 JSON 格式和 NDJSON 格式。
- `application/x-ndjson`: 指定 NDJSON 格式，会尝试先分割行再进行解析，可以达到精确的错误检查。
- `text/plain`: 通过换行符分割的多行日志文本行。

### `application/json` 和 `application/x-ndjson` 格式

以下是一份 JSON 格式请求体内容的示例：

```JSON
[
     {"message":"127.0.0.1 - - [25/May/2024:20:16:37 +0000] \"GET /index.html HTTP/1.1\" 200 612 \"-\" \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\""},
     {"message":"192.168.1.1 - - [25/May/2024:20:17:37 +0000] \"POST /api/login HTTP/1.1\" 200 1784 \"-\" \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36\""},
     {"message":"10.0.0.1 - - [25/May/2024:20:18:37 +0000] \"GET /images/logo.png HTTP/1.1\" 304 0 \"-\" \"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0\""},
     {"message":"172.16.0.1 - - [25/May/2024:20:19:37 +0000] \"GET /contact HTTP/1.1\" 404 162 \"-\" \"Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1\""}
]
```

请注意整个 JSON 是一个数组（包含多行日志）。每个 JSON 对象代表即将要被 Pipeline 引擎处理的一行日志。

JSON 对象中的 key 名，也就是这里的 `message`，会被用作 Pipeline processor 处理时的 field 名称。比如：

```yaml
processors:
  - dissect:
      fields:
        # `message` 是 JSON 对象中的 key 名
        - message
      patterns:
        - '%{ip_address} - - [%{timestamp}] "%{http_method} %{request_line}" %{status_code} %{response_size} "-" "%{user_agent}"'
      ignore_missing: true

# pipeline 文件的剩余部分在这里省略
```

我们也可以将这个请求体内容改写成 NDJSON 的格式，如下所示：

```JSON
{"message":"127.0.0.1 - - [25/May/2024:20:16:37 +0000] \"GET /index.html HTTP/1.1\" 200 612 \"-\" \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\""}
{"message":"192.168.1.1 - - [25/May/2024:20:17:37 +0000] \"POST /api/login HTTP/1.1\" 200 1784 \"-\" \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36\""}
{"message":"10.0.0.1 - - [25/May/2024:20:18:37 +0000] \"GET /images/logo.png HTTP/1.1\" 304 0 \"-\" \"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0\""}
{"message":"172.16.0.1 - - [25/May/2024:20:19:37 +0000] \"GET /contact HTTP/1.1\" 404 162 \"-\" \"Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1\""}
```

注意到最外层的数组符被消去了，现在每个 JSON 对象通过换行符分割而不是 `,`。

### `text/plain` 格式

纯文本日志在整个生态系统中被广泛应用。GreptimeDB 同样支持日志数据以 `text/plain` 格式进行输入，使得我们可以直接从日志产生源进行写入。

以下是一份和上述样例请求体内容等价的文本请求示例：

```plain
127.0.0.1 - - [25/May/2024:20:16:37 +0000] "GET /index.html HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
192.168.1.1 - - [25/May/2024:20:17:37 +0000] "POST /api/login HTTP/1.1" 200 1784 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36"
10.0.0.1 - - [25/May/2024:20:18:37 +0000] "GET /images/logo.png HTTP/1.1" 304 0 "-" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0"
172.16.0.1 - - [25/May/2024:20:19:37 +0000] "GET /contact HTTP/1.1" 404 162 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
```

仅需要将 `Content-Type` header 设置成 `text/plain`，即可将纯文本请求发送到 GreptimeDB。

主要注意的是，和 JSON 格式自带 key 名可以被 Pipeline processor 识别和处理不同，`text/plain` 格式直接将整行文本输入到 Pipeline engine。在这种情况下我们可以使用 `line` 来指代整行输入文本，例如：

```yaml
processors:
  - dissect:
      fields:
        # 使用 `line` 作为 field 名称
        - line
      patterns:
        - '%{ip_address} - - [%{timestamp}] "%{http_method} %{request_line}" %{status_code} %{response_size} "-" "%{user_agent}"'
      ignore_missing: true

# pipeline 文件的剩余部分在这里省略
```

对于 `text/plain` 格式的输入，推荐首先使用 `dissect` 或者 `regex` processor 将整行文本分割成不同的字段，以便进行后续的处理。

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
     -H "Content-Type: application/json" \
     -H "Authorization: Basic {{authentication}}" \
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

## 示例

请参考快速开始中的[写入日志](quick-start.md#写入日志)部分。

## Append 模式

通过此接口创建的日志表，默认为[Append 模式](/user-guide/deployments-administration/performance-tuning/design-table.md#何时使用-append-only-表).
