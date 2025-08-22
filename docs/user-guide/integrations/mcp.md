---
keywords: [MCP, Model Context Protocol, AI assistant, Claude, database integration]
description: Learn how to integrate GreptimeDB with Model Context Protocol (MCP) for AI assistants to explore and analyze your time-series data.
---

# Model Context Protocol (MCP)

:::warning Experimental Feature
The GreptimeDB MCP Server is currently in experimental stage and under active development. APIs and features may change without notice. Please use with caution in production environments.
:::

The [GreptimeDB MCP Server](https://github.com/GreptimeTeam/greptimedb-mcp-server) provides a Model Context Protocol implementation that enables AI assistants like Claude to securely explore and analyze your GreptimeDB databases.

## What is MCP?

Model Context Protocol (MCP) is a standard protocol that allows AI assistants to interact with external data sources and tools. With the GreptimeDB MCP Server, you can enable AI assistants to:

- List and explore database tables
- Read table data and schemas
- Execute SQL queries
- Analyze time-series data through natural language

## Installation

Install the GreptimeDB MCP Server using pip:

```bash
pip install greptimedb-mcp-server
```

## Configuration

The MCP server can be configured through environment variables or command-line arguments. Key configuration options include:

- Database connection settings (host, port, username, password)
- Database name
- Timezone settings

### Example: Claude Desktop Integration

To integrate with Claude Desktop, add the following configuration to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "greptimedb": {
      "command": "python",
      "args": ["-m", "greptimedb_mcp_server"],
      "env": {
        "GREPTIMEDB_HOST": "localhost",
        "GREPTIMEDB_PORT": "4000",
        "GREPTIMEDB_USERNAME": "your_username",
        "GREPTIMEDB_PASSWORD": "your_password",
        "GREPTIMEDB_DATABASE": "your_database"
      }
    }
  }
}
```

## Learn More

For detailed configuration options, advanced usage, and troubleshooting, refer to the [GreptimeDB MCP Server documentation](https://github.com/GreptimeTeam/greptimedb-mcp-server).

:::note
The GreptimeDB MCP Server is an experimental project still under development. Exercise caution when using it with sensitive data.
:::