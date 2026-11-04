---
keywords: [MCP, Model Context Protocol, AI助手, Claude, 数据库集成, 语义层, TQL, pipeline]
description: 了解如何将 GreptimeDB 与模型上下文协议（MCP）集成，让 AI 助手能够探索和分析您的 metrics、logs 和 traces。
---

# Model Context Protocol (MCP)

:::warning 实验性功能
GreptimeDB MCP Server 目前处于实验阶段并在积极开发中。API 和功能可能会在没有通知的情况下发生变化。请在生产环境中谨慎使用。
:::

[GreptimeDB MCP Server](https://github.com/GreptimeTeam/greptimedb-mcp-server) 提供了模型上下文协议的实现，使 Claude 等 AI 助手能够安全地用 SQL、TQL（兼容 PromQL）和 RANGE 查询来查询与分析您的 GreptimeDB 数据库——并内置只读 SQL 校验和数据脱敏。

查看我们的[演示视频和文章](https://mp.weixin.qq.com/s/gbTuMLoG4b151Hs8KCSGxg)，了解 MCP Server 的实际应用效果。

## 什么是 MCP？

模型上下文协议（MCP）是一种标准协议，允许 AI 助手与外部数据源和工具进行交互。通过 GreptimeDB MCP Server，AI 助手可以探索你的表、借助[语义层](/user-guide/concepts/semantic-layer.md)理解每张表代表什么、执行查询，并管理 pipeline 和仪表盘。

## 工具

server v0.6.1 提供以下工具。

### 查询与检查

| 工具 | 说明 |
| --- | --- |
| `execute_sql` | 执行 SQL 查询（MySQL 方言）。`format` 可选 `csv`（默认）、`json` 或 `markdown`；`limit` 默认为 `1000` 行，取值会被限制在 `1`–`10000` 之间。 |
| `execute_tql` | 执行 TQL（兼容 PromQL）查询，参数为 `query`、`start`、`end`、`step`，以及可选的 `lookback`（默认 `5m`）。最多返回 10000 行。 |
| `query_range` | 用 RANGE/ALIGN 语法执行时间窗口聚合查询。`table`、`select` 和 `align` 必填；`by`、`where`、`fill` 和 `order_by` 可选。 |
| `search_table_semantics` | 按可观测性概念查找表，例如 `redis memory usage`。在一个数据库内搜索表名、语义选项和实体声明，按匹配的词数排序。可选参数为 `signal_type`、`schema` 和 `limit`（默认值和上限均为 `50`）。 |
| `query_semantic_graph` | 查询[语义图](/user-guide/semantic-layer/semantic-graph.md)。`view` 可选 `summary`、`entities` 或 `relationships`；`start_time` 和 `end_time`（RFC 3339）指定必填的左闭右开时间窗口。实体和关系过滤条件可选；`limit` 默认为 `100`（上限 `500`）。 |
| `describe_table` | 检查表的 profile：schema、语义元数据、样本行（默认 `5` 行，最多 `20` 行）和查询提示。 |
| `explain_query` | 查看 SQL 查询或 `TQL EVAL` 语句的执行计划。`analyze=true` 会实际执行查询并返回运行时指标；`verbose=true` 额外返回按分区统计的扫描指标。 |
| `health_check` | 检查数据库连接状态和 server 版本。 |

`execute_sql`、`query_range` 和 `describe_table` 可以用 `schema.table` 读取其他数据库；`execute_tql` 通过 `__schema__` 匹配器读取其他数据库，例如 `metric{__schema__="other_db"}`。连接所用的用户需要具备该数据库的读权限。

`describe_table` 和 `search_table_semantics` 会读取[表语义](/user-guide/semantic-layer/table-semantics.md)，因此 AI 助手能直接得到表的 signal type、source 和 metric 元数据，无需根据列名推断。`search_table_semantics` 只返回带有 `greptime.semantic.*` 选项、或由内置约定生成实体声明的表。实体声明需要 GreptimeDB v1.3 及以上版本。`query_semantic_graph` 读取 `greptime_private.semantic_entities` 和 `greptime_private.semantic_relationships`，同样需要 v1.3 及以上版本。如果 server 启动时这两个视图不存在，或连接用户无权读取，server 不会提供 `query_semantic_graph`。

工具返回结果的大小受 `GREPTIMEDB_MAX_RESULT_BYTES` 限制（默认 1 MiB）。超出限制的查询结果会减少返回行数，并注明结果已被截断。

### Pipeline 管理

| 工具 | 说明 |
| --- | --- |
| `list_pipelines` | 列出所有 pipeline，或获取某个 pipeline 的详情。 |
| `create_pipeline` | 用 YAML 配置创建新的 pipeline 版本。需要开启[写模式](#写模式)。 |
| `dryrun_pipeline` | 用样本数据测试内联或已保存的 pipeline，不写入数据库。 |
| `delete_pipeline` | 删除某个版本的 pipeline。需要开启[写模式](#写模式)。 |

### 仪表盘管理

| 工具 | 说明 |
| --- | --- |
| `list_dashboards` | 列出所有 Perses 仪表盘定义。 |
| `create_dashboard` | 创建或覆盖 Perses 仪表盘定义。需要开启[写模式](#写模式)。 |
| `delete_dashboard` | 删除仪表盘定义。需要开启[写模式](#写模式)。 |

### Resource 和 prompt

可以通过 `greptime://<table>/data` URI 以 resource 形式读取表数据，最多返回 100 行。

server 还内置了以下 Jinja prompt 模板：`pipeline_creator`、`log_pipeline`、`metrics_analysis`、`promql_analysis`、`trace_analysis`、`table_operation`、`schema_design_advisor`、`observability_correlation`、`ingestion_troubleshooting` 和 `query_performance_tuning`。

## 安装

server 需要 Python 3.11 及以上版本。

```bash
pip install greptimedb-mcp-server
```

直接运行（默认连接 `localhost:4002`）：

```bash
greptimedb-mcp-server --host localhost --database public
```

## 配置

server 通过环境变量或命令行参数配置。

| 环境变量 | 命令行参数 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `GREPTIMEDB_HOST` | `--host` | `localhost` | 数据库主机。 |
| `GREPTIMEDB_PORT` | `--port` | `4002` | MySQL 协议端口。 |
| `GREPTIMEDB_USER` | `--user` | 空 | 数据库用户。 |
| `GREPTIMEDB_PASSWORD` | `--password` | 空 | 数据库密码。 |
| `GREPTIMEDB_DATABASE` | `--database` | `public` | 数据库名称。 |
| `GREPTIMEDB_TIMEZONE` | `--timezone` | 空 | 会话时区。 |
| `GREPTIMEDB_POOL_SIZE` | `--pool-size` | `5` | 连接池大小。 |
| `GREPTIMEDB_HTTP_PORT` | `--http-port` | `4000` | HTTP API 端口，供 pipeline 和仪表盘工具使用。 |
| `GREPTIMEDB_HTTP_PROTOCOL` | `--http-protocol` | `http` | HTTP API 协议：`http` 或 `https`。 |
| `GREPTIMEDB_MASK_ENABLED` | `--mask-enabled` | `true` | 脱敏敏感列。 |
| `GREPTIMEDB_MASK_PATTERNS` | `--mask-patterns` | 空 | 额外的敏感列名模式，以逗号分隔。 |
| `GREPTIMEDB_AUDIT_ENABLED` | `--audit-enabled` | `true` | 记录每次工具调用。 |
| `GREPTIMEDB_ALLOW_WRITE` | `--allow-write` | `false` | 允许通过 `execute_sql` 执行 DDL/DML，并启用 pipeline 和仪表盘的写操作工具，见下文[写模式](#写模式)。 |
| `GREPTIMEDB_MAX_RESULT_BYTES` | `--max-result-bytes` | `1048576` | 单次工具调用结果的字节上限。 |
| `GREPTIMEDB_TRANSPORT` | `--transport` | `stdio` | 传输方式：`stdio`、`sse` 或 `streamable-http`。 |
| `GREPTIMEDB_LISTEN_HOST` | `--listen-host` | `0.0.0.0` | `sse` 和 `streamable-http` 传输方式的监听地址。 |
| `GREPTIMEDB_LISTEN_PORT` | `--listen-port` | `8080` | `sse` 和 `streamable-http` 传输方式的监听端口。 |
| `GREPTIMEDB_ALLOWED_HOSTS` | `--allowed-hosts` | 空 | DNS rebinding 保护允许的 host，以逗号分隔。为空时关闭该保护。 |
| `GREPTIMEDB_ALLOWED_ORIGINS` | `--allowed-origins` | 空 | CORS 允许的 origin，以逗号分隔。仅在设置了 `--allowed-hosts` 时生效。 |

布尔类型的选项接受 `true`/`false`、`1`/`0`、`yes`/`no` 或 `on`/`off`。

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

对于容器化或 Kubernetes 部署，可以用 HTTP 而非 stdio 运行 server：

```bash
# Streamable HTTP（生产推荐）
greptimedb-mcp-server --transport streamable-http --listen-port 8080

# SSE 模式（旧版）
greptimedb-mcp-server --transport sse --listen-port 3000
```

为了兼容代理和 Kubernetes service，DNS rebinding 保护默认关闭。需要时用 `--allowed-hosts` 开启，例如 `--allowed-hosts "localhost:*,127.0.0.1:*,my-service.namespace:*"`。

## 安全

server **默认只读**。未开启写模式时，`execute_sql` 会拒绝被安全校验拦截的语句；`create_pipeline`、`delete_pipeline`、`create_dashboard` 和 `delete_dashboard` 直接返回错误，不会访问 GreptimeDB。`list_pipelines`、`dryrun_pipeline` 和 `list_dashboards` 仍可使用。

- **安全校验**：拦截 `DROP`、`DELETE`、`TRUNCATE`、`UPDATE`、`INSERT`、`ALTER`、`CREATE`、`GRANT`、`REVOKE`、`REPLACE INTO`、`EXEC`/`EXECUTE`、`CALL`、`LOAD`、`COPY`、`OUTFILE`、`LOAD_FILE`、`INTO DUMPFILE`，以及 `UNHEX`、十六进制字面量、`CHAR()` 等编码内容。
- **数据脱敏**：列名包含 `password`、`token`、`api_key`、`ssn`、`credit_card` 等模式的列会被脱敏为 `******`。用 `--mask-patterns` 增加模式。
- **审计日志**：记录每次工具调用。用 `--audit-enabled false` 关闭。

为了获得最强的安全配置，还可以用[静态用户 provider](/user-guide/deployments-administration/authentication/static.md) 创建一个只读数据库用户，并用它来连接 server。

### 写模式

在本地开发或测试时，可以开启写模式：

```bash
greptimedb-mcp-server --allow-write true
```

写模式会跳过安全校验，允许通过 `execute_sql` 执行 DDL/DML 语句（`CREATE`、`DROP`、`ALTER`、`INSERT`、`UPDATE`、`DELETE`），并启用 `create_pipeline`、`delete_pipeline`、`create_dashboard` 和 `delete_dashboard`。server 启动时会打印警告。

:::danger
写模式会让 AI 助手对你的数据库执行破坏性语句。切勿在生产数据上开启。
:::

## 了解更多

有关高级用法和故障排除，请参阅 [GreptimeDB MCP Server 文档](https://github.com/GreptimeTeam/greptimedb-mcp-server)。

:::note
GreptimeDB MCP Server 是一个仍在开发中的实验性项目。在处理敏感数据时请谨慎使用。
:::
