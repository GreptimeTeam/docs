---
keywords: [Prometheus 迁移, 数据迁移, 监控数据, 数据导入, 数据查询]
description: 介绍从 Prometheus 迁移到 GreptimeDB 的步骤和注意事项。
---

import DocTemplate from '../../db-cloud-shared/migrate/_migrate-from-prometheus.md' 

# 从 Prometheus 迁移

<DocTemplate>

<div id="remote-write">

有关 Prometheus 将数据写入 GreptimeDB 的配置信息，请参阅 [Remote Write](/user-guide/ingest-data/for-observability/prometheus.md#配置-remote-write) 文档。

</div>

<div id="promql">

有关使用 Prometheus 查询语言在 GreptimeDB 中查询数据的详细信息，请参阅 PromQL 文档中的 [HTTP API](/user-guide/query-data/promql.md#prometheus-的-http-api) 部分。

</div>

<div id="grafana">

要在 Grafana 中将 GreptimeDB 添加为 Prometheus 数据源，请参阅 [Grafana](/user-guide/integrations/grafana#prometheus-数据源) 的集成文档。

</div>

</DocTemplate>