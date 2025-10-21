---
keywords: [快速开始, 写入日志, 查询日志, pipeline, 结构化数据, 日志写入, 日志收集, 日志管理工具]
description: 在 GreptimeDB 中快速写入和查询日志的全面指南，包括直接日志写入和使用 pipeline 处理结构化数据。
---

# 使用自定义 Pipeline

基于你的 pipeline 配置，
GreptimeDB 能够将日志自动解析和转换为多列的结构化数据，
当内置 pipeline 无法处理特定的文本日志格式时，
你可以创建自定义 pipeline 来定义如何根据你的需求解析和转换日志数据。

## 识别你的原始日志格式

在创建自定义 pipeline 之前，了解原始日志数据的格式至关重要。
如果你正在使用日志收集器且不确定日志格式，
有两种方法可以检查你的日志：

1. **阅读收集器的官方文档**：配置你的收集器将数据输出到控制台或文件以检查日志格式。
2. **使用 `greptime_identity` pipeline**：使用内置的 `greptime_identity` pipeline 将示例日志直接写入到 GreptimeDB 中。
  `greptime_identity` pipeline 将整个文本日志视为单个 `message` 字段，方便你直接看到原始日志的内容。

一旦了解了要处理的日志格式，
你就可以创建自定义 pipeline。
本文档使用以下 Nginx 访问日志条目作为示例：

```txt
127.0.0.1 - - [25/May/2024:20:16:37 +0000] "GET /index.html HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
```

## 创建自定义 Pipeline

GreptimeDB 提供 HTTP 接口用于创建 pipeline。
以下是创建方法。

首先，创建一个示例 pipeline 配置文件来处理 Nginx 访问日志，
将其命名为 `pipeline.yaml`：

```yaml
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
  - vrl:
      source: |
        .greptime_table_ttl = "7d"
        .

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

上面的 pipeline 配置使用 [version 2](/reference/pipeline/pipeline-config.md#transform-in-version-2) 格式，
包含 `processors` 和 `transform` 部分来结构化你的日志数据：

**Processors**：用于在转换前预处理日志数据：
- **数据提取**：`dissect` 处理器使用 pattern 匹配来解析 `message` 字段并提取结构化数据，包括 `ip_address`、`timestamp`、`http_method`、`request_line`、`status_code`、`response_size` 和 `user_agent`。
- **时间戳处理**：`date` 处理器使用格式 `%d/%b/%Y:%H:%M:%S %z` 解析提取的 `timestamp` 字段并将其转换为适当的时间戳数据类型。
- **字段选择**：`select` 处理器从最终输出中排除原始 `message` 字段，同时保留所有其他字段。
- **表选项**：`vrl` 处理器根据提取的字段设置表选项，例如向表名添加后缀和设置 TTL。`greptime_table_ttl = "7d"` 配置表数据的保存时间为 7 天。

**Transform**：定义如何转换和索引提取的字段：
- **字段转换**：每个提取的字段都转换为适当的数据类型并根据需要配置相应的索引。像 `http_method` 这样的字段在没有提供显式配置时保留其默认数据类型。
- **索引策略**：
  - `ip_address` 和 `status_code` 使用倒排索引作为标签进行快速过滤
  - `request_line` 和 `user_agent` 使用全文索引以获得最佳文本搜索能力
  - `timestamp` 是必需的时间索引列

有关 pipeline 配置选项的详细信息，
请参考 [Pipeline 配置](/reference/pipeline/pipeline-config.md) 文档。

## 上传 Pipeline

执行以下命令上传 pipeline 配置：

```shell
curl -X "POST" \
  "http://localhost:4000/v1/pipelines/nginx_pipeline" \
     -H 'Authorization: Basic {{authentication}}' \
     -F "file=@pipeline.yaml"
```

成功执行后，将创建一个名为 `nginx_pipeline` 的 pipeline 并返回以下结果：

```json
{"name":"nginx_pipeline","version":"2024-06-27 12:02:34.257312110Z"}.
```

你可以为同一个 pipeline 名称创建多个版本。
所有 pipeline 都存储在 `greptime_private.pipelines` 表中。
参考[查询 Pipeline](manage-pipelines.md#查询-pipeline) 来查看 pipeline 数据。

## 使用 Pipeline 写入日志

以下示例使用 `nginx_pipeline` pipeline 将日志写入 `custom_pipeline_logs` 表来格式化和转换日志消息：

```shell
curl -X POST \
  "http://localhost:4000/v1/ingest?db=public&table=custom_pipeline_logs&pipeline_name=nginx_pipeline" \
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

命令执行成功后将返回以下输出：

```json
{"output":[{"affectedrows":4}],"execution_time_ms":79}
```

`custom_pipeline_logs` 表内容根据 pipeline 配置自动创建：

```sql
+-------------+-------------+-------------+---------------------------+-----------------------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
| ip_address  | http_method | status_code | request_line              | user_agent                                                                                                                              | response_size | timestamp           |
+-------------+-------------+-------------+---------------------------+-----------------------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
| 10.0.0.1    | GET         |         304 | /images/logo.png HTTP/1.1 | Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0                                                            |             0 | 2024-05-25 20:18:37 |
| 127.0.0.1   | GET         |         200 | /index.html HTTP/1.1      | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36                     |           612 | 2024-05-25 20:16:37 |
| 172.16.0.1  | GET         |         404 | /contact HTTP/1.1         | Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1 |           162 | 2024-05-25 20:19:37 |
| 192.168.1.1 | POST        |         200 | /api/login HTTP/1.1       | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36                |          1784 | 2024-05-25 20:17:37 |
+-------------+-------------+-------------+---------------------------+-----------------------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+
```

有关日志写入 API 端点 `/ingest` 的更详细信息，
包括附加参数和配置选项，
请参考[日志写入 API](/reference/pipeline/write-log-api.md) 文档。

## 查询日志

我们使用 `custom_pipeline_logs` 表作为示例来查询日志。

### 通过 tag 查询日志

通过 `custom_pipeline_logs` 中的多个 tag 列，
你可以灵活地通过 tag 查询数据。
例如，查询 `status_code` 为 200 且 `http_method` 为 GET 的日志。

```sql
SELECT * FROM custom_pipeline_logs WHERE status_code = 200 AND http_method = 'GET';
```

```sql
+------------+-------------+----------------------+---------------------------------------------------------------------------------------------------------------------+---------------+---------------------+-------------+
| ip_address | status_code | request_line         | user_agent                                                                                                          | response_size | timestamp           | http_method |
+------------+-------------+----------------------+---------------------------------------------------------------------------------------------------------------------+---------------+---------------------+-------------+
| 127.0.0.1  |         200 | /index.html HTTP/1.1 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 |           612 | 2024-05-25 20:16:37 | GET         |
+------------+-------------+----------------------+---------------------------------------------------------------------------------------------------------------------+---------------+---------------------+-------------+
1 row in set (0.02 sec)
```

### 全文搜索

对于文本字段 `request_line` 和 `user_agent`，你可以使用 `matches_term` 函数来搜索日志。
还记得我们在[创建 pipeline](#create-a-pipeline) 时为这两列创建了全文索引。
这带来了高性能的全文搜索。

例如，查询 `request_line` 列包含 `/index.html` 或 `/api/login` 的日志。

```sql
SELECT * FROM custom_pipeline_logs WHERE matches_term(request_line, '/index.html') OR matches_term(request_line, '/api/login');
```

```sql
+-------------+-------------+----------------------+--------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+-------------+
| ip_address  | status_code | request_line         | user_agent                                                                                                               | response_size | timestamp           | http_method |
+-------------+-------------+----------------------+--------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+-------------+
| 127.0.0.1   |         200 | /index.html HTTP/1.1 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36      |           612 | 2024-05-25 20:16:37 | GET         |
| 192.168.1.1 |         200 | /api/login HTTP/1.1  | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36 |          1784 | 2024-05-25 20:17:37 | POST        |
+-------------+-------------+----------------------+--------------------------------------------------------------------------------------------------------------------------+---------------+---------------------+-------------+
2 rows in set (0.00 sec)
```

你可以参考[全文搜索](fulltext-search.md) 文档了解 `matches_term` 函数的详细用法。


## 使用 Pipeline 的好处

使用 pipeline 处理日志带来了结构化的数据和自动的字段提取，
这使得查询和分析更加高效。

你也可以在没有 pipeline 的情况下直接将日志写入数据库，
但这种方法限制了高性能分析能力。

### 直接插入日志（不使用 Pipeline）

为了比较，你可以创建一个表来存储原始日志消息：

```sql
CREATE TABLE `origin_logs` (
  `message` STRING FULLTEXT INDEX,
  `time` TIMESTAMP TIME INDEX
) WITH (
  append_mode = 'true'
);
```

使用 `INSERT` 语句将日志插入表中。
注意你需要为每个日志手动添加时间戳字段：

```sql
INSERT INTO origin_logs (message, time) VALUES
('127.0.0.1 - - [25/May/2024:20:16:37 +0000] "GET /index.html HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"', '2024-05-25 20:16:37.217'),
('192.168.1.1 - - [25/May/2024:20:17:37 +0000] "POST /api/login HTTP/1.1" 200 1784 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36"', '2024-05-25 20:17:37.217'),
('10.0.0.1 - - [25/May/2024:20:18:37 +0000] "GET /images/logo.png HTTP/1.1" 304 0 "-" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0"', '2024-05-25 20:18:37.217'),
('172.16.0.1 - - [25/May/2024:20:19:37 +0000] "GET /contact HTTP/1.1" 404 162 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"', '2024-05-25 20:19:37.217');
```

### 表结构比较：Pipeline 转换后 vs 原始日志

在上面的示例中，表 `custom_pipeline_logs` 是通过使用 pipeline 写入日志自动创建的，
而表 `origin_logs` 是通过直接写入日志创建的。
让我们看一看这两个表之间的差异。

```sql
DESC custom_pipeline_logs;
```

```sql
+---------------+---------------------+------+------+---------+---------------+
| Column        | Type                | Key  | Null | Default | Semantic Type |
+---------------+---------------------+------+------+---------+---------------+
| ip_address    | String              | PRI  | YES  |         | TAG           |
| status_code   | Int32               | PRI  | YES  |         | TAG           |
| request_line  | String              |      | YES  |         | FIELD         |
| user_agent    | String              |      | YES  |         | FIELD         |
| response_size | Int32               |      | YES  |         | FIELD         |
| timestamp     | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| http_method   | String              |      | YES  |         | FIELD         |
+---------------+---------------------+------+------+---------+---------------+
7 rows in set (0.00 sec)
```

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

以上表结构显示了关键差异：

`custom_pipeline_logs` 表（使用 pipeline 创建）自动将日志数据结构化为多列：
- `ip_address`、`status_code` 作为索引标签用于快速过滤
- `request_line`、`user_agent` 具有全文索引用于文本搜索
- `response_size`、`http_method` 作为常规字段
- `timestamp` 作为时间索引

`origin_logs` 表（直接插入）将所有内容存储在单个 `message` 列中。

### 为什么使用 Pipeline？

建议使用 pipeline 方法将日志消息拆分为多列，
这具有明确查询特定列中特定值的优势。
有几个关键原因使得基于列的匹配查询比全文搜索更优越：

- **性能**：基于列的查询通常比全文搜索更快
- **存储效率**：GreptimeDB 的列式存储能更好地压缩结构化数据；标签的倒排索引比全文索引消耗更少的存储空间
- **查询简单性**：基于标签的查询更容易编写、理解和调试

## 下一步

- **全文搜索**：阅读[全文搜索](fulltext-search.md) 指南，了解 GreptimeDB 中的高级文本搜索功能和查询技术
- **Pipeline 配置**：阅读 [Pipeline 配置](/reference/pipeline/pipeline-config.md) 文档，了解更多关于为各种日志格式和处理需求创建和自定义 pipeline 的信息


