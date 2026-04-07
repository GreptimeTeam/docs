---
keywords: [MCP, Model Context Protocol, AI助手, Claude, 数据库集成]
description: 了解如何将 GreptimeDB 与模型上下文协议（MCP）集成，让 AI 助手能够探索和分析您的时序数据。
---

# Model Context Protocol (MCP)

:::warning 实验性功能
GreptimeDB MCP Server 目前处于实验阶段并在积极开发中。API 和功能可能会在没有通知的情况下发生变化。请在生产环境中谨慎使用。
:::

[GreptimeDB MCP Server](https://github.com/GreptimeTeam/greptimedb-mcp-server) 提供了模型上下文协议的实现，使 Claude 等 AI 助手能够安全地探索和分析您的 GreptimeDB 数据库。

查看我们的[演示视频和文章](https://mp.weixin.qq.com/s/gbTuMLoG4b151Hs8KCSGxg)，了解 MCP Server 的实际应用效果，更直观地理解其功能。

## 什么是 MCP？

模型上下文协议（MCP）是一种标准协议，允许 AI 助手与外部数据源和工具进行交互。通过 GreptimeDB MCP Server，您可以让 AI 助手实现：

- 列出和探索数据库表
- 读取表数据和模式
- 执行 SQL 查询
- 通过自然语言分析时序数据

## 安装

使用 pip 安装 GreptimeDB MCP Server：

```bash
pip install greptimedb-mcp-server
```

## 配置

MCP 服务器可以通过环境变量或命令行参数进行配置。主要配置选项包括：

- 数据库连接设置（主机、端口、用户名、密码）
- 数据库名称
- 时区设置

### 示例：Claude Desktop 集成

要与 Claude Desktop 集成，请在您的 `claude_desktop_config.json` 中添加以下配置：

```json
{
  "mcpServers": {
    "greptimedb": {
      "command": "python",
      "args": ["-m", "greptimedb_mcp_server"],
      "env": {
        "GREPTIMEDB_HOST": "localhost",
        "GREPTIMEDB_PORT": "4002",
        "GREPTIMEDB_USERNAME": "your_username",
        "GREPTIMEDB_PASSWORD": "your_password",
        "GREPTIMEDB_DATABASE": "your_database"
      }
    }
  }
}
```

## 了解更多

有关详细的配置选项、高级用法和故障排除，请参阅 [GreptimeDB MCP Server 文档](https://github.com/GreptimeTeam/greptimedb-mcp-server)。

:::note
GreptimeDB MCP Server 是一个仍在开发中的实验性项目。在处理敏感数据时请谨慎使用。
:::