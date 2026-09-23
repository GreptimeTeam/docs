---
keywords: [integrations, 数据写入, 可视化, 商业智能, 告警, Grafana, Superset, Metabase, DBeaver, MCP, vmalert]
description: 介绍 GreptimeDB 与数据写入、查询、可视化、告警、商业智能和 AI 工具的集成。
---

# 工具集成

GreptimeDB 可以与常见的数据写入、查询、可视化和告警工具配合使用。
例如，[vmalert](./vmalert.md) 可以将 GreptimeDB 用作数据源，执行
alerting rules 和 recording rules。
大部分工具通过 GreptimeDB 的 MySQL、PostgreSQL、gRPC、Prometheus、
OpenTelemetry 或 InfluxDB 行协议端点接入。
下面各页面分别说明对应工具的配置方法。

import DocCardList from '@theme/DocCardList';

<DocCardList />
