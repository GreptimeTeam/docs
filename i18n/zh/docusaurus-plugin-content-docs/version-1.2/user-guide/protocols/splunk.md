---
keywords: [Splunk, 协议, HTTP Event Collector, HEC, 日志写入, Vector]
description: GreptimeDB 对 Splunk HEC 协议的实现范围、提供哪些端点，以及明确不实现的部分。
---

# Splunk

GreptimeDB 实现了 [Splunk HTTP Event Collector（HEC）](https://docs.splunk.com/Documentation/Splunk/latest/Data/UsetheHTTPEventCollector)协议的一个子集，本来就在用 HEC 的采集端——Vector、OpenTelemetry Collector——改一下地址和 token 即可写入 GreptimeDB。

基础路径是 `/v1/splunk`，collector 路径由客户端自行拼接。

| 端点 | 说明 |
| --- | --- |
| `/services/collector/event` | 结构化 JSON 事件 |
| `/services/collector/raw` | 纯文本，原样存储 |

映射关系：Splunk 的 `index` 对应一张 GreptimeDB 表；`host`、`source`、`sourcetype` 以及 `fields` 下的键转成 tag 列，并进入表的主键。

不实现的部分：

- Indexer acknowledgment（`/services/collector/ack`）。
- `channel` 参数会被接受但忽略。
- Fluent Bit 自带的 `splunk` output：它把请求路径写死，无法访问 `/v1/splunk`，请改用 [HTTP output](/user-guide/ingest-data/for-observability/fluent-bit.md)。

端点细节、响应码和采集端配置见[使用 Splunk 写入数据](/user-guide/ingest-data/for-observability/splunk.md)。
