---
keywords: [Elasticsearch, log storage, API, configuration, data model]
description: 使用 Elasticsearch 协议写入日志数据。
---

# Elasticsearch

## 概述

GreptimeDB 支持使用 Elasticsearch 的 [`_bulk` API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html) 来写入数据。我们会将 Elasticsearch 中的 Index 概念映射为 GreptimeDB 的 Table，同时用户可在 HTTP 请求的 URL 参数中用 `db` 来指定相应的数据库名。**不同于原生 Elasticsearch，该 API 仅支持数据写入，不支持数据的修改和删除**。在实现层面上，GreptimeDB 会将原生 Elasticsearch `_bulk` API 请求中的 `index` 和 `create` 命令都视为**创建操作**。除此之外，GreptimeDB 仅支持解析原生 `_bulk` API 命令请求中的 `_index` 字段而忽略其他字段。

## HTTP API

GreptimeDB 支持通过以下两个 HTTP endpoint 来实现 Elasticsearch 协议的数据写入：

- **`/v1/elasticsearch/_bulk`**：用户可使用 POST 方法将数据以 NDJSON 格式写入到 GreptimeDB 中。

  以下面请求为例，GreptimeDB 将会创建一个名为 `test` 的表，并写入两条数据：

  ```json
  POST /v1/elasticsearch/_bulk

  {"create": {"_index": "test", "_id": "1"}}
  {"name": "John", "age": 30}
  {"create": {"_index": "test", "_id": "2"}}
  {"name": "Jane", "age": 25}
  ```

- **`/v1/elasticsearch/${index}/_bulk`**：用户可使用 POST 方法将数据以 NDJSON 格式写入到 GreptimeDB 中的 `${index}` 表中。如果 POST 请求中也有 `_index` 字段，则 URL 中的 `${index}` 将被忽略。

  以下面请求为例，GreptimeDB 将会创建一个名为 `test` 和 `another_index` 的表，并各自写入相应的数据：

  ```json
  POST /v1/elasticsearch/test/_bulk

  {"create": {"_id": "1"}}
  {"name": "John", "age": 30}
  {"create": {"_index": "another_index", "_id": "2"}}
  {"name": "Jane", "age": 25}
  ```

用户还可以使用以下 HTTP URL 参数：

- `db`：指定写入的数据库名。如不指定，则默认使用 `public` 数据库；
- `pipeline_name`：指定写入的 pipeline 名，如不指定，则默认使用 GreptimeDB 内部的 pipeline `greptime_identity`；
- `version`：指定写入的 pipeline 版本，如不指定，则默认对应 pipeline 的最新版本；
- `msg_field`：`msg_field` 可指定包含原始日志数据的 JSON 字段名。比如在 Logstash 和 Filebeat 中，该字段通常为 `message`。如果用户指定了该参数，则 GreptimeDB 会尝试将该字段中的数据以 JSON 格式进行展开，如果展开失败，则该字段会被当成字符串进行处理；
  
## 使用方法

### 使用 HTTP API 写入数据

你可以创建一个 `request.json` 文件，其中包含如下内容：

```json
{"create": {"_index": "es_test", "_id": "1"}}
{"name": "John", "age": 30}
{"create": {"_index": "es_test", "_id": "2"}}
{"name": "Jane", "age": 25}
```

然后使用 `curl` 命令将该文件作为请求体发送至 GreptimeDB：

```bash
curl -XPOST http://localhost:4000/v1/elasticsearch/_bulk \
  -H "Content-Type: application/json" -d @request.json
```

我们可使用 `mysql` 客户端连接到 GreptimeDB，然后执行如下 SQL 语句来查看写入的数据：

```sql
SELECT * FROM es_test;
```

我们将可以看到如下结果：

```
mysql> SELECT * FROM es_test;
+------+------+----------------------------+
| age  | name | greptime_timestamp         |
+------+------+----------------------------+
|   30 | John | 2025-01-15 08:26:06.516665 |
|   25 | Jane | 2025-01-15 08:26:06.521510 |
+------+------+----------------------------+
2 rows in set (0.13 sec)
```

### Logstash

如果你正在使用 [Logstash](https://www.elastic.co/logstash) 来收集日志，可使用如下配置来将数据写入到 GreptimeDB：

```
output {
    elasticsearch {
        hosts => ["http://localhost:4000/v1/elasticsearch"]
        index => "my_index"
        parameters => {
           "pipeline_name" => "my_pipeline"
           "msg_field" => "message"
        }
    }
}
```

其中 `parameters` 是可选项，而 `hosts` 和 `index` 请根据实际情况进行调整， 

### Filebeat

如果你正在使用 [Filebeat](https://github.com/elastic/beats/tree/main/filebeat) 来收集日志，可使用如下配置来将数据写入到 GreptimeDB：

```
output.elasticsearch:
  hosts: ["http://localhost:4000/v1/elasticsearch"]
  index: "my_index"
  parameters:
    pipeline_name: my_pipeline
    msg_field: message
```

其中 `parameters` 是可选项，而 `hosts` 和 `index` 请根据实际情况进行调整。
