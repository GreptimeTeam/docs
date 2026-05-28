---
keywords: [Coding Agent, Vibe Coding, MCP, Skills, llms.txt, AI Agent]
description: 配合 AI coding agent 使用 GreptimeDB 的资源——MCP Server、Skills、机器可读文档，以及一行接入的 SKILL.md
---

# For AI Agents

GreptimeDB 为 AI coding agent 而构建。Agent 可以通过标准协议（OTLP、Prometheus、
MySQL/PostgreSQL、SQL/PromQL）自主完成 GreptimeDB 的部署、配置、写入和查询，下面这些
资源帮助它把这些事做对、做稳。背景可参考博客
[What GreptimeDB is doing for AI agents](https://greptime.cn/blogs/2026-04-08-greptimedb-agent-friendly-infrastructure)。

## 最快上手：一句话指令

入口级的 quickstart 指南以可直接抓取的 markdown 文件形式托管。给你的 agent 一句话指令，
它就能接手：

> Read https://docs.greptime.cn/SKILL.md and follow the instructions to use
> GreptimeDB with your AI agent — deploy, configure, ingest, and query.

Agent 会在运行时抓取这份指南，判断 GreptimeDB 是否适用，选择合适的安装与写入路径，并通过
`llms.txt` 浏览文档。无需安装任何东西。

## GreptimeDB MCP Server

[GreptimeDB MCP Server](../user-guide/integrations/mcp.md) 实现了 Model Context
Protocol，让 agent 能安全地探索和分析你的数据库——列出表、读取数据，执行 SQL、TQL
（兼容 PromQL）和 range 查询。它强制只读访问、支持数据脱敏，并内置了面向 metrics、trace、
PromQL 分析、IoT 监控、表操作和日志 pipeline 创建的场景模板。

```shell
pip install greptimedb-mcp-server
```

传输方式（stdio、SSE、Streamable HTTP）和配置详见
[greptimedb-mcp-server](https://github.com/GreptimeTeam/greptimedb-mcp-server) 仓库。

## GreptimeDB Skills

GreptimeDB 兼容大多数 coding agent 已经熟悉的开放标准。而对于我们自有的功能——pipeline、
flow、trigger——安装一个 Skill 能把完整工作流教给 agent，效果最好。Skill 告诉 agent
*要做什么*，MCP Server 提供*执行*它的工具（例如 pipeline skill 会用 `dryrun_pipeline`
在应用前验证配置）。

- **`greptimedb-quickstart`** —— 入口。何时该用 GreptimeDB、如何安装、选哪种写入协议、
  如何查询，以及深入文档的指引。从这里开始。
- **`greptimedb-pipeline`** —— 解析、转换、路由日志（Learn → Create → Verify → Refine）。
- **`greptimedb-flow`** —— 持续聚合与物化视图。
- **`greptimedb-trigger`** —— 告警规则，包括把 Prometheus 告警规则转换为
  `CREATE TRIGGER`（企业版）。
- **`self-monitoring-export`** —— 用于集群故障排查：从用户描述中推断日志导出的时间范围，
  然后导出集群自监控日志和指标供工程排查。

Skills 遵循 [Agent Skills](https://agentskills.io/) 开放标准，因此可用于 Claude Code、
OpenAI Codex CLI、GitHub Copilot、Cursor 等。每个 Skill 也以可直接抓取的 markdown 文件
托管在 `https://docs.greptime.cn/skills/<skill-name>/SKILL.md`（例如
[`greptimedb-pipeline`](https://docs.greptime.cn/skills/greptimedb-pipeline/SKILL.md)），
agent 可在运行时加载，无需安装。

如需把 Skill 持久安装进 agent 配置，使用 `skills` CLI：

```shell
npx skills add https://github.com/GreptimeTeam/docs/tree/main/skills/greptimedb-quickstart
```

完整清单和安装命令见 [skills](https://github.com/GreptimeTeam/docs/tree/main/skills) 仓库。

## 机器可读文档

整个文档站点都按 [llmstxt.org](https://llmstxt.org) 标准构建，便于 agent 消费：

- [`llms.txt`](https://docs.greptime.cn/llms.txt) —— 结构化索引，列出每个文档章节及简要
  描述。让 agent 指向它，就能直接找到对应页面，无需爬整个站点。
- [`llms-full.txt`](https://docs.greptime.cn/llms-full.txt) —— 把全部文档拼接成单个文件，
  一次性加载整个文档语料。
- **任意页面的 markdown** —— 在任意文档 URL 后追加 `.md`，即可得到该页的原始 markdown
  （例如 [`/user-guide/integrations/mcp.md`](https://docs.greptime.cn/user-guide/integrations/mcp.md)）。

临时提问可以用 [docs.greptime.cn](https://docs.greptime.cn/) 上的 **Ask AI** 助手，它基于
官方文档用平实语言作答。
