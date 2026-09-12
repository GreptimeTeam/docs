---
keywords: [协议, HTTP API, MySQL, PostgreSQL, gRPC, InfluxDB 行协议, OpenTelemetry]
description: GreptimeDB 支持的传输协议，涵盖写入与查询两类用途，以及各协议写入文档的位置。
---

import DocCardList from '@theme/DocCardList';

# 协议

GreptimeDB 支持多种传输协议，分为两类。

**连接协议**同时承载写入和查询：[HTTP API](http.md)、[MySQL](mysql.md)、[PostgreSQL](postgresql.md) 和 [gRPC](grpc.md)。这些页面说明接口、鉴权和协议特有的选项。

**写入协议**接收那些本身就支持该协议的系统发来的数据，包括 InfluxDB 行协议、OpenTelemetry、Loki、Elasticsearch、Splunk 和 OpenTSDB。本章的页面覆盖协议层面的细节，各数据源的具体配置见[写入数据](/user-guide/ingest-data/overview.md)。

<DocCardList />
