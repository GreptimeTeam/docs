---
keywords: [MCP, Model Context Protocol, AI助手, Claude, 数据库集成, 语义层, TQL, pipeline]
description: 了解如何将 GreptimeDB 与模型上下文协议（MCP）集成，让 AI 助手能够探索和分析您的 metrics、logs 和 traces。
---

# Model Context Protocol (MCP)

:::warning 实验性功能
GreptimeDB MCP Server 目前处于实验阶段并在积极开发中。API 和功能可能会在没有通知的情况下发生变化。请在生产环境中谨慎使用。
:::

[GreptimeDB MCP Server](https://github.com/GreptimeTeam/greptimedb-mcp-server) 提供了模型上下文协议的实现，使 Claude 等 AI 助手能够安全地用 SQL、TQL（兼容 PromQL）和 RANGE 查询来查询与分析您的 GreptimeDB 数据库——并内置只读保护和数据脱敏。

查看我们的[演示视频和文章](https://mp.weixin.qq.com/s/gbTuMLoG4b151Hs8KCSGxg)，了解 MCP Server 的实际应用效果。

## 什么是 MCP？

模型上下文协议（MCP）是一种标准协议，允许 AI 助手与外部数据源和工具进行交互。通过 GreptimeDB MCP Server，AI 助手可以探索你的表、借助[语义层](/user-guide/concepts/semantic-layer.md)理解每张表代表什么、执行查询，并管理 pipeline 和仪表盘。

## 工具

该 server（v0.5.0）提供以下工具。

### 查询与检查

| 工具 | 说明 |
| --- | --- |
| `execute_sql` | 执行 SQL 查询，支持格式（csv/json/markdown）和 limit 选项。 |
| `execute_tql` | 执行 TQL（兼容 PromQL）查询进行时序分析。 |
| `query_range` | 用 RANGE/ALIGN 语法执行时间窗口聚合查询。 |
| `describe_table` | 检查表的 profile：schema、语义元数据、最新样本行、查询提示。 |
| `explain_query` | 分析 SQL 或 TQL 查询的执行计划。 |
| `health_check` | 检查数据库连接状态和 server 版本。 |

`describe_table` 会读取[表语义层](/user-guide/concepts/semantic-layer.md)，因此 AI 助手能直接得到表的 signal type、source 和 metric 元数据，而不必从列名去猜。

### Pipeline 管理

| 工具 | 说明 |
| --- | --- |
| `list_pipelines` | 列出所有 pipeline，或获取某个 pipeline 的详情。 |
| `create_pipeline` | 用 YAML 配置创建新的 pipeline。 |
| `dryrun_pipeline` | 用样本数据测试 pipeline，不写入数据库。 |
| `delete_pipeline` | 删除某个版本的 pipeline。 |

### 仪表盘管理

| 工具 | 说明 |
| --- | --- |
| `list_dashboards` | 列出所有 Perses 仪表盘定义。 |
| `create_dashboard` | 创建或更新 Perses 仪表盘定义。 |
| `delete_dashboard` | 删除仪表盘定义。 |

server 还内置了一批 Jinja prompt 模板，覆盖常见任务（metrics 分析、trace 分析、pipeline 创建、schema 设计、查询性能调优等）。

## 安装

```bash
pip install greptimedb-mcp-server
```

直接运行（默认连接 `localhost:4002`）：

```bash
greptimedb-mcp-server --host localhost --database public
```

## 配置

server 通过环境变量或命令行参数配置。下表列出最常用的选项；[HTTP server 模式](#http-server-模式)还有额外参数。

| 环境变量 | 命令行参数 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `GREPTIMEDB_HOST` | `--host` | `localhost` | 数据库主机。 |
| `GREPTIMEDB_PORT` | `--port` | `4002` | MySQL 协议端口。 |
| `GREPTIMEDB_USER` | `--user` | `root` | 数据库用户。 |
| `GREPTIMEDB_PASSWORD` | `--password` | — | 数据库密码。 |
| `GREPTIMEDB_DATABASE` | `--database` | `public` | 数据库名称。 |
| `GREPTIMEDB_TIMEZONE` | `--timezone` | `UTC` | 会话时区。 |
| `GREPTIMEDB_HTTP_PORT` | `--http-port` | `4000` | HTTP API 端口（用于 pipeline/仪表盘工具）。 |
| `GREPTIMEDB_MASK_ENABLED` | `--mask-enabled` | `true` | 脱敏敏感列。 |
| `GREPTIMEDB_AUDIT_ENABLED` | `--audit-enabled` | `true` | 记录每次工具调用。 |
| `GREPTIMEDB_ALLOW_WRITE` | `--allow-write` | `false` | 允许通过 `execute_sql` 执行写/DDL，见下文[写模式](#写模式)。 |
| `GREPTIMEDB_TRANSPORT` | `--transport` | `stdio` | 传输方式：`stdio`、`sse` 或 `streamable-http`。 |

### Claude Desktop 集成

在 `claude_desktop_config.json` 中添加以下配置：

```json
{
  "mcpServers": {
    "greptimedb": {
      "command": "greptimedb-mcp-server",
      "args": ["--host", "localhost", "--database", "public"],
      "env": {
        "GREPTIMEDB_PORT": "4002",
        "GREPTIMEDB_USER": "your_username",
        "GREPTIMEDB_PASSWORD": "your_password"
      }
    }
  }
}
```

### HTTP server 模式

对于容器化或 Kubernetes 部署，可以用 HTTP 而非 stdio 运行 server（需要 `mcp>=1.8.0`）：

```bash
# Streamable HTTP（生产推荐）
greptimedb-mcp-server --transport streamable-http --listen-port 8080

# SSE 模式（旧版）
greptimedb-mcp-server --transport sse --listen-port 3000
```

为了兼容代理和 Kubernetes service，DNS rebinding 保护默认关闭。需要时用 `--allowed-hosts` 开启。

## 安全

server **默认只读**，并提供多重保护。

- **安全闸门**：拦截 `DROP`、`DELETE`、`TRUNCATE`、`UPDATE`、`INSERT`、`ALTER`、`CREATE`、`GRANT`、`REVOKE` 以及编码绕过尝试；放行 `SELECT`、`SHOW`、`DESCRIBE`、`TQL`、`EXPLAIN`、`UNION`。
- **数据脱敏**：列名匹配 `password`、`token`、`api_key`、`ssn`、`credit_card` 等模式的列会被脱敏为 `******`。用 `--mask-patterns` 增加模式。
- **审计日志**：记录每次工具调用。用 `--audit-enabled false` 关闭。

为了获得最强的安全配置，还可以用[静态用户 provider](/user-guide/deployments-administration/authentication/static.md) 创建一个只读数据库用户，并用它来连接 server。

### 写模式

在本地开发或测试时，可以允许通过 `execute_sql` 执行写/DDL 语句（`CREATE`、`DROP`、`ALTER`、`INSERT`、`UPDATE`、`DELETE`）：

```bash
greptimedb-mcp-server --allow-write true
```

开启后，`execute_sql` 的安全闸门会被绕过，server 启动时会打印警告。

:::danger
写模式会让 AI 助手对你的数据库执行破坏性语句。切勿在生产数据上开启。
:::

## 了解更多

有关高级用法和故障排除，请参阅 [GreptimeDB MCP Server 文档](https://github.com/GreptimeTeam/greptimedb-mcp-server)。

:::note
GreptimeDB MCP Server 是一个仍在开发中的实验性项目。在处理敏感数据时请谨慎使用。
:::
