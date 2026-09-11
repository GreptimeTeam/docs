---
title: "GreptimeDB"
keywords: [可观测性数据库,开源可观测性数据库,时序数据库, 开源时序数据库, 可观测数据,时序数据, 可观测性工具, 云原生数据库, 数据可观测性, 可观测性平台, 边缘数据库, 物联网边缘计算, 边缘云计算, 日志管理, 日志聚合, 高基数, SQL查询示例, OpenTelemetry 收集器, GreptimeDB]
description: GreptimeDB 文档首页。GreptimeDB 是一个开源可观测性数据库，统一存储指标、日志、链路和宽事件；本页提供快速上手、用户指南、AI agent 和 SQL 参考的入口。
---

import AgentOnboarding from '@site/src/components/AgentOnboarding';

# GreptimeDB 文档

**GreptimeDB** 是一个开源可观测性数据库，用一个引擎存储指标、日志和链路追踪。它可以作为唯一的 OpenTelemetry 后端，替代 Prometheus、Loki 和 Elasticsearch，数据放在对象存储上，用 [SQL](/user-guide/query-data/sql.md) 和 [PromQL](/user-guide/query-data/promql.md) 查询。

<HomeCards>

- **[立即开始](/getting-started/overview.md)**

  安装 GreptimeDB，写入第一批数据，执行第一个查询。

- **[用户指南](/user-guide/overview.md)**

  写入协议、查询、Pipeline、Flow，以及生产环境的部署与运维。

- **[For AI Agents](/faq-and-others/vibecoding.md)**

  从 coding agent 使用 GreptimeDB，不需要自建集成。

- **[参考手册](/reference/sql/overview.md)**

  SQL、函数、配置项、命令行和 HTTP 接口。

</HomeCards>

## 向 AI 提问

回答基于本站文档生成，并给出对应页面的链接。

<AskAI />

## 为什么选择 GreptimeDB

**用一个系统替代三个。** 指标、日志、链路写进同一个列式引擎，原生支持 OpenTelemetry，不用再为每种信号分别维护存储、查询语言和运维体系。

**成本按对象存储计价。** S3、Azure Blob、GCS 是主存储，计算独立扩展。列式存储加上针对可观测性负载调优的压缩，成本最高可降 50 倍——[OceanBase Cloud](/user-guide/concepts/why-greptimedb.md#生产用户公开的数据) 在 GreptimeDB 上存放 300 TB 日志和审计数据，公开的数据显示从 Loki 迁移后存储成本下降 60%+。

**迁移不用重写查询。** 直接支持 [PromQL](/user-guide/query-data/promql.md)、[Prometheus remote write](/user-guide/ingest-data/for-observability/prometheus.md)、[Jaeger](/user-guide/query-data/jaeger.md)、[MySQL](/user-guide/protocols/mysql.md) 和 [PostgreSQL](/user-guide/protocols/postgresql.md)，现有采集器和 [Grafana](/user-guide/integrations/grafana.md) 仪表盘无需更换。

**给 agent 一个统一的查询接口。** 在 [Agent RCA Bench](https://rca-bench.greptime.com/#zh) 中，6 个模型分别在 GreptimeDB 和 Prometheus + Loki + Tempo 上排查同样的 14 个故障：错误诊断少 40%，读取的输入 token 少 48%，整体成本低约 45%。

详见[为什么选择 GreptimeDB](/user-guide/concepts/why-greptimedb.md)和 [Observability 2.0 与宽事件](/user-guide/concepts/observability-2.md)。

## 与 AI agent 集成

入门指南以可直接抓取的 markdown 文件托管，coding agent 在运行时读取即可，无需安装。

<AgentOnboarding />

- **[MCP Server](/user-guide/integrations/mcp.md)** —— 面向 agent 的只读访问：列出表、执行 SQL、TQL 和范围查询。
- **[Skills](/faq-and-others/vibecoding.md)** —— 覆盖 Pipeline、Flow、Trigger、表设计和性能诊断，遵循 [Agent Skills](https://agentskills.io/) 标准。
- **[语义层](/user-guide/concepts/semantic-layer.md)** —— `greptime.semantic.*` 表元数据，记录每张表的信号类型、写入来源和单位。
- **[llms.txt](https://docs.greptime.cn/llms.txt)** —— 全站的结构化索引；在任意文档 URL 后加 `.md` 可取得该页的原始 markdown。

## 继续了解

- [教程](/tutorials/k8s-metrics-monitor.md)：端到端的完整示例，例如监控一个 Kubernetes 集群。
- [GreptimeDB 企业版](/enterprise/overview.md)：读副本、负载隔离、RBAC、审计日志和容灾方案。
- [贡献者指南](/contributor-guide/overview.md)：面向参与 GreptimeDB 开发的读者，介绍内部实现。
- [Roadmap](https://greptime.cn/blogs/2026-02-11-greptimedb-roadmap-2026)：项目的发展方向。
- [发布说明](/release-notes)：所有历史版本的发布说明。
- [FAQ](/faq-and-others/faq.md)：部署、写入和查询中的常见问题。
