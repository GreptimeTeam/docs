# 快速开始

本指南将引导您快速完成写入并查询日志的过程。

您可以直接写入日志或使用 pipeline 写入日志。
直接写入日志很简单，但不能像 pipeline 方法那样将日志文本拆分为结构化数据。
以下部分将帮助您了解这两种方法之间的区别。

## 直接写入日志

这是将日志写入 GreptimeDB 的最简单方法。

### 创建表

首先，创建一个名为 `origin_logs` 的表来存储您的日志。
以下 SQL 中 `message` 列的 `FULLTEXT` 表示创建了一个全文索引以优化查询。

```sql
CREATE TABLE `origin_logs` (
  `message` STRING FULLTEXT,
  `time` TIMESTAMP TIME INDEX
) WITH (
  append_mode = 'true'
);
```

### 插入日志

使用 `INSERT` 语句将日志插入表中。

```sql
INSERT INTO origin_logs (message, time) VALUES
('127.0.0.1 - - [25/May/2024:20:16:37 +0000] "GET /index.html HTTP/1.1" 200 612 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"', '2024-05-25 20:16:37.217'),
('192.168.1.1 - - [25/May/2024:20:17:37 +0000] "POST /api/login HTTP/1.1" 200 1784 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36"', '2024-05-25 20:17:37.217'),
('10.0.0.1 - - [25/May/2024:20:18:37 +0000] "GET /images/logo.png HTTP/1.1" 304 0 "-" "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0"', '2024-05-25 20:18:37.217'),
('172.16.0.1 - - [25/May/2024:20:19:37 +0000] "GET /contact HTTP/1.1" 404 162 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"', '2024-05-25 20:19:37.217');
```

上述 SQL 将整个日志文本插入到一个列中，除此之外，您必须为每条日志添加一个额外的时间戳。

## 使用 Pipeline 写入日志

使用 pipeline 可以自动将日志消息格式化并转换为多个列，并自动创建表。

### 创建 Pipeline

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

该 pipeline 使用指定的模式拆分 `message` 字段以提取 `ip_address`、`timestamp`、`http_method`、`request_line`、`status_code`、`response_size` 和 `user_agent`。
然后，它使用格式 `%d/%b/%Y:%H:%M:%S %z` 解析 `timestamp` 字段，将其转换为数据库可以理解的正确时间戳格式。
最后，它将每个字段转换为适当的数据类型并相应地建立索引。
需要注意的是，`request_line` 和 `user_agent` 字段被索引为 `fulltext` 以优化全文搜索查询，且表中必须有一个由 `timestamp` 指定的时间索引列。

执行以下命令上传配置文件：

```shell
curl -X "POST" "http://localhost:4000/v1/events/pipelines/nginx_pipeline" -F "file=@pipeline.yaml"
```

成功执行此命令后，将创建一个名为 `nginx_pipeline` 的 pipeline，返回的结果如下：

```shell
{"name":"nginx_pipeline","version":"2024-06-27 12:02:34.257312110Z"}.
```

您可以为同一 pipeline 名称创建多个版本。
所有 pipeline 都存储在 `greptime_private.pipelines` 表中。
请参阅[查询 Pipelines](manage-pipelines.md#查询-pipeline)以查看表中的 pipeline 数据。

### 写入日志

以下示例将日志写入 `pipeline_logs` 表，并使用 `nginx_pipeline` pipeline 格式化和转换日志消息。

```shell
curl -X "POST" "http://localhost:4000/v1/events/logs?db=public&table=pipeline_logs&pipeline_name=nginx_pipeline" \
     -H 'Content-Type: application/json' \
     -d $'[
{"message":"127.0.0.1 - - [25/May/2024:20:16:37 +0000] \\"GET /index.html HTTP/1.1\\" 200 612 \\"-\\" \\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\\""},
{"message":"192.168.1.1 - - [25/May/2024:20:17:37 +0000] \\"POST /api/login HTTP/1.1\\" 200 1784 \\"-\\" \\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36\\""},
{"message":"10.0.0.1 - - [25/May/2024:20:18:37 +0000] \\"GET /images/logo.png HTTP/1.1\\" 304 0 \\"-\\" \\"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0\\""},
{"message":"172.16.0.1 - - [25/May/2024:20:19:37 +0000] \\"GET /contact HTTP/1.1\\" 404 162 \\"-\\" \\"Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1\\""}
]'
```

如果命令执行成功，您将看到以下输出：

```shell
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

推荐使用 pipeline 方法将日志消息拆分为多个列，这样可以明确查询某个特定列中的某个值。
与模糊查询相比，精确匹配在处理字符串时具有以下几个关键优势：

- 性能效率：在 pipeline 中将列标记为 Tag 会基于该列的值创建一个倒排索引，从而实现比模糊查询中使用的全文索引更快的查询执行。
- 资源消耗：精确匹配查询通常涉及更简单的比较，并且使用的 CPU、内存和 I/O 资源较少，而模糊查询需要更多资源密集型的全文索引。
- 准确性：精确匹配返回严格符合查询条件的精确结果，减少了无关结果的可能性，而模糊查询即使使用全文索引仍然可能返回更多噪音。
- 可维护性：精确匹配查询简单直观，编写和调试更容易，而带有全文索引的模糊查询仍然增加了一层复杂性，使其更具挑战性，难以优化和维护。

## 查询日志

以 `pipeline_logs` 为例查询日志。

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

对于 `request_line` 和 `user_agent` 文本字段，您可以使用 `MATCHES` 函数查询日志。
请记得我们在[创建 Pipeline](#创建-pipeline) 时为这两个列创建了全文索引，这提高了全文搜索的性能。

例如，查询 `request_line` 包含 `/index.html` 或 `/api/login` 的日志。

```sql
SELECT * FROM pipeline_logs WHERE MATCHES(request_line, 'index.html /api/login');
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

您可以参阅[全文搜索](query-logs.md#使用-matches-函数进行全文搜索)文档以获取 `MATCHES` 函数的详细用法。

## 下一步

您现在已经体验了 GreptimeDB 的日志记录功能，可以通过以下文档进一步探索：

- [Pipeline 配置](./pipeline-config.md): 提供 GreptimeDB 中每个 pipeline 配置的深入信息。
- [管理 Pipeline](./manage-pipelines.md): 解释如何创建和删除 pipeline。
- [使用 Pipeline 写入日志](./write-logs.md): 介绍利用 pipeline 机制写入日志数据的详细说明。
- [查询日志](./query-logs.md): 描述如何使用 GreptimeDB SQL 接口查询日志。
