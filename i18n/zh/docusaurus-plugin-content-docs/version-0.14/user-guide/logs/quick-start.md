---
keywords: [快速开始, 写入日志, 查询日志, 直接写入, 使用 Pipeline, 创建表, 插入日志, gRPC 协议, JSON 日志, 自定义 Pipeline]
description: 介绍如何快速开始写入和查询日志，包括直接写入日志和使用 Pipeline 写入日志的方法，以及两者的区别。
---

# 快速开始

本指南将引导您快速完成写入并查询日志的过程。

您可以直接写入日志或使用 pipeline 写入日志。
直接写入日志很简单，但不能像 pipeline 方法那样将日志文本拆分为结构化数据。
以下部分将帮助您了解这两种方法之间的区别。

## 直接写入日志

这是将日志写入 GreptimeDB 的最简单方法。

### 创建表

首先，创建一个名为 `origin_logs` 的表来存储您的日志。
以下 SQL 中 `message` 列的 `FULLTEXT INDEX` 表示创建了一个全文索引以优化查询。

```sql
CREATE TABLE `origin_logs` (
  `message` STRING FULLTEXT INDEX,
  `time` TIMESTAMP TIME INDEX
) WITH (
  append_mode = 'true'
);
```

### 插入日志

#### 使用 SQL 协议写入

使用 `INSERT` 语句将日志插入表中。

```sql
INSERT INTO origin_logs (message, time) VALUES
('127.0.0.1 - - [25/May/2024:20:16:37 +0000] "GET /index.html HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"', '2024-05-25 20:16:37.217'),
('192.168.1.1 - - [25/May/2024:20:17:37 +0000] "POST /api/login HTTP/1.1" 200 1784 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36"', '2024-05-25 20:17:37.217'),
('10.0.0.1 - - [25/May/2024:20:18:37 +0000] "GET /images/logo.png HTTP/1.1" 304 0 "-" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0"', '2024-05-25 20:18:37.217'),
('172.16.0.1 - - [25/May/2024:20:19:37 +0000] "GET /contact HTTP/1.1" 404 162 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"', '2024-05-25 20:19:37.217');
```

上述 SQL 将整个日志文本插入到一个列中，除此之外，您必须为每条日志添加一个额外的时间戳。

#### 使用 gRPC 协议写入

您也可以使用 gRPC 协议写入日志，这是一个更高效的方法。

请参阅[使用 gRPC 写入数据](/user-guide/ingest-data/for-iot/grpc-sdks/overview.md)以了解如何使用 gRPC 协议写入日志。

## 使用 Pipeline 写入日志

使用 pipeline 可以自动将日志消息格式化并转换为多个列，并自动创建和修改表结构。

### 使用内置 Pipeline 写入 JSON 日志（试验功能）

:::warning
JSON 类型目前仍处于实验阶段，在未来的版本中可能会有所调整。
:::

GreptimeDB 提供了一个内置 pipeline `greptime_identity` 用于处理 JSON 日志格式。该 pipeline 简化了写入 JSON 日志的过程。

```shell
curl -X POST \
  "http://localhost:4000/v1/events/logs?db=public&table=pipeline_logs&pipeline_name=greptime_identity" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic {{authentication}}" \
  -d '[
    {
      "name": "Alice",
      "age": 20,
      "is_student": true,
      "score": 90.5,
      "object": { "a": 1, "b": 2 }
    },
    {
      "age": 21,
      "is_student": false,
      "score": 85.5,
      "company": "A",
      "whatever": null
    },
    {
      "name": "Charlie",
      "age": 22,
      "is_student": true,
      "score": 95.5,
      "array": [1, 2, 3]
    }
  ]'
```

- [`鉴权`](/user-guide/protocols/http.md#鉴权) HTTP header。
- `pipeline_name=greptime_identity` 指定了内置 pipeline。
- `table=pipeline_logs` 指定了目标表。如果表不存在，将自动创建。
`greptime_identity` pipeline 将自动为 JSON 日志中的每个字段创建列。成功执行命令将返回：

```json
{"output":[{"affectedrows":3}],"execution_time_ms":9}
```

有关 `greptime_identity` pipeline 的更多详细信息，请参阅 [管理 Pipeline](manage-pipelines.md#greptime_identity) 文档。

### 使用自定义 Pipeline 写入日志

#### 创建 Pipeline

GreptimeDB 提供了一个专用的 HTTP 接口来创建 pipeline。方法如下：

首先，创建一个 pipeline 文件，例如 `pipeline.yaml`。

```yaml
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

该 pipeline 使用指定的模式拆分 `message` 字段以提取 `ip_address`、`timestamp`、`http_method`、`request_line`、`status_code`、`response_size` 和 `user_agent`。
然后，它使用格式 `%d/%b/%Y:%H:%M:%S %z` 解析 `timestamp` 字段，将其转换为数据库可以理解的正确时间戳格式。
最后，它将每个字段转换为适当的数据类型并相应地建立索引。
需要注意的是，`request_line` 和 `user_agent` 字段被索引为 `fulltext` 以优化全文搜索查询，且表中必须有一个由 `timestamp` 指定的时间索引列。

执行以下命令上传配置文件：

```shell
curl -X "POST" \
  "http://localhost:4000/v1/events/pipelines/nginx_pipeline" \
     -H 'Authorization: Basic {{authentication}}' \
     -F "file=@pipeline.yaml"
```

成功执行此命令后，将创建一个名为 `nginx_pipeline` 的 pipeline，返回的结果如下：

```json
{"name":"nginx_pipeline","version":"2024-06-27 12:02:34.257312110Z"}.
```

您可以为同一 pipeline 名称创建多个版本。
所有 pipeline 都存储在 `greptime_private.pipelines` 表中。
请参阅[查询 Pipelines](manage-pipelines.md#查询-pipeline)以查看表中的 pipeline 数据。

#### 写入日志

以下示例将日志写入 `custom_pipeline_logs` 表，并使用 `nginx_pipeline` pipeline 格式化和转换日志消息。

```shell
curl -X POST \
  "http://localhost:4000/v1/events/logs?db=public&table=custom_pipeline_logs&pipeline_name=nginx_pipeline" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic {{authentication}}" \
  -d '[
    {
      "message": "127.0.0.1 - - [25/May/2024:20:16:37 +0000] \"GET /index.html HTTP/1.1\" 200 612 \"-\" \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\""
    },
    {
      "message": "192.168.1.1 - - [25/May/2024:20:17:37 +0000] \"POST /api/login HTTP/1.1\" 200 1784 \"-\" \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36\""
    },
    {
      "message": "10.0.0.1 - - [25/May/2024:20:18:37 +0000] \"GET /images/logo.png HTTP/1.1\" 304 0 \"-\" \"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0\""
    },
    {
      "message": "172.16.0.1 - - [25/May/2024:20:19:37 +0000] \"GET /contact HTTP/1.1\" 404 162 \"-\" \"Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1\""
    }
  ]'
```

如果命令执行成功，您将看到以下输出：

```json
{"output":[{"affectedrows":4}],"execution_time_ms":79}
```

## 直接写入日志与使用 Pipeline 的区别

在上述示例中，直接写入日志的方式创建了表 `origin_logs`，使用 pipeline 写入日志的方式自动创建了表 `pipeline_logs`，让我们来探讨这两个表之间的区别。


```sql
DESC origin_logs;
```

```sql
+---------+----------------------+------+------+---------+---------------+
| Column  | Type                 | Key  | Null | Default | Semantic Type |
+---------+----------------------+------+------+---------+---------------+
| message | String               |      | YES  |         | FIELD         |
| time    | TimestampMillisecond | PRI  | NO   |         | TIMESTAMP     |
+---------+----------------------+------+------+---------+---------------+
```

```sql
DESC pipeline_logs;
```

```sql
+---------------+---------------------+------+------+---------+---------------+
| Column        | Type                | Key  | Null | Default | Semantic Type |
+---------------+---------------------+------+------+---------+---------------+
| ip_address    | String              | PRI  | YES  |         | TAG           |
| http_method   | String              | PRI  | YES  |         | TAG           |
| status_code   | Int32               | PRI  | YES  |         | TAG           |
| request_line  | String              |      | YES  |         | FIELD         |
| user_agent    | String              |      | YES  |         | FIELD         |
| response_size | Int32               |      | YES  |         | FIELD         |
| timestamp     | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
+---------------+---------------------+------+------+---------+---------------+
7 rows in set (0.00 sec)
```

从表结构中可以看到，`origin_logs` 表只有两列，整个日志消息存储在一个列中。
而 `pipeline_logs` 表将日志消息存储在多个列中。

推荐使用 pipeline 方法将日志消息拆分为多个列，这样可以精确查询某个特定列中的某个值。
与全文搜索相比，列匹配查询在处理字符串时具有以下几个优势：

- **性能效率**：列的匹配查询通常都比全文搜索更快。
- **资源消耗**：由于 GreptimeDB 的存储引擎是列存，结构化的数据更利于数据的压缩，并且 Tag 匹配查询使用的倒排索引，其资源消耗通常显著少于全文索引，尤其是在存储大小方面。
- **可维护性**：精确匹配查询简单明了，更易于理解、编写和调试。

当然，如果需要在大段文本中进行关键词搜索，依然需要使用全文搜索，因为它就是专门为此设计。

## 查询日志

以 `pipeline_logs` 表为例查询日志。

### 按 Tag 查询日志

对于 `pipeline_logs` 中的多个 Tag 列，您可以灵活地按 Tag 查询数据。
例如，查询 `status_code` 为 `200` 且 `http_method` 为 `GET` 的日志。

```sql
SELECT * FROM pipeline_logs WHERE status_code = 200 AND http_method = 'GET';
```

```sql
+------------+-------------+-------------+----------------------+---------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
| ip_address | http_method | status_code | request_line         | user_agent                                                                                                          | response_size | timestamp           |
+------------+-------------+-------------+----------------------+---------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
| 127.0.0.1  | GET         |         200 | /index.html HTTP/1.1 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 |           612 | 2024-05-25 20:16:37 |
+------------+-------------+-------------+----------------------+---------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
1 row in set (0.02 sec)
```

### 全文搜索

对于 `request_line` 和 `user_agent` 文本字段，你可以使用 `matches_term` 函数查询日志。
为了提高全文搜索的性能，我们在[创建 Pipeline](#创建-pipeline) 时为这两个列创建了全文索引。

例如，查询 `request_line` 包含 `/index.html` 或 `/api/login` 的日志。

```sql
SELECT * FROM pipeline_logs WHERE matches_term(request_line, '/index.html') OR matches_term(request_line, '/api/login');
```

```sql
+-------------+-------------+-------------+----------------------+--------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
| ip_address  | http_method | status_code | request_line         | user_agent                                                                                                               | response_size | timestamp           |
+-------------+-------------+-------------+----------------------+--------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
| 127.0.0.1   | GET         |         200 | /index.html HTTP/1.1 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36      |           612 | 2024-05-25 20:16:37 |
| 192.168.1.1 | POST        |         200 | /api/login HTTP/1.1  | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36 |          1784 | 2024-05-25 20:17:37 |
+-------------+-------------+-------------+----------------------+--------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
2 rows in set (0.00 sec)
```

你可以参阅[全文搜索](query-logs.md)文档以获取 `matches_term` 的详细用法。

## 下一步

您现在已经体验了 GreptimeDB 的日志记录功能，可以通过以下文档进一步探索：

- [Pipeline 配置](./pipeline-config.md): 提供 GreptimeDB 中每个 pipeline 配置的深入信息。
- [管理 Pipeline](./manage-pipelines.md): 解释如何创建和删除 pipeline。
- [使用 Pipeline 写入日志](./write-logs.md): 介绍利用 pipeline 机制写入日志数据的详细说明。
- [查询日志](./query-logs.md): 描述如何使用 GreptimeDB SQL 接口查询日志。
