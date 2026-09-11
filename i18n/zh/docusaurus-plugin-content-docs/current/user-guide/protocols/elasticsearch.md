---
keywords: [Elasticsearch, 协议, _bulk API, 日志写入, Logstash, Filebeat]
description: GreptimeDB 对 Elasticsearch 协议的实现范围——仅支持写入的 _bulk API——以及写入文档的位置。
---

# Elasticsearch

GreptimeDB 实现了 Elasticsearch 的 [`_bulk` API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html)，本来就在用这套协议的采集端——Logstash、Filebeat、Telegraf——改一下地址即可写入 GreptimeDB。

提供两个端点，都用 `POST` 提交 NDJSON：

| 端点 | 说明 |
| --- | --- |
| `/v1/elasticsearch/_bulk` | index 取自每条命令行的 `_index` 字段 |
| `/v1/elasticsearch/${index}/_bulk` | index 取自路径，但请求体中的 `_index` 字段优先 |

实现范围：

- 一个 Elasticsearch index 对应一张 GreptimeDB 表，数据库由 `db` URL 参数指定。
- `index` 和 `create` 命令都按插入处理，不支持修改和删除。
- 命令行中只读取 `_index` 字段，其余字段忽略。
- 只覆盖写入。查询用 [SQL](/user-guide/query-data/sql.md)，不支持 Elasticsearch Query DSL。

采集端配置和完整示例见[使用 Elasticsearch 写入数据](/user-guide/ingest-data/for-observability/elasticsearch.md)。
