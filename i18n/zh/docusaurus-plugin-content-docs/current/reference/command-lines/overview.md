---
keywords: [命令行工具, 安装 Greptime, 启动服务, 配置示例, 升级版本]
description: 介绍 Greptime 命令行工具的安装、使用方法，包括全局选项、各子命令选项、配置示例、升级 GreptimeDB 版本等内容。
---

# 概述

`greptime` 命令行工具可以启动、停止、或传递配置项给 GreptimeDB。

## 安装命令行工具

Greptime 命令行工具与 GreptimeDB 二进制文件捆绑在一起。
在[安装 GreptimeDB](/getting-started/installation/overview.md)之后，
你可以在 GreptimeDB 的当前目录中执行 `./greptime` 命令。

为了方便起见，如果你希望使用 `greptime` 而不是 `./greptime` 来运行命令，
可以将命令行工具的二进制文件移动到系统的 `bin` 目录，或者将二进制文件的路径添加到 `PATH` 环境变量中。

## 选项

`help` 命令列出了 `greptime` 所有可用的命令和选项。

```sh
$ greptime help
Usage: greptime [OPTIONS] <COMMAND>

Commands:
  datanode    Start datanode service
  frontend    Start frontend service
  metasrv     Start metasrv service
  standalone  Run greptimedb as a standalone service
  cli         Execute the cli tools for greptimedb
  help        Print this message or the help of the given subcommand(s)

Options:
      --log-dir <LOG_DIR>
      --log-level <LOG_LEVEL>
  -h, --help                   Print help
  -V, --version                Print version
```

### 全局选项

| Option                    | Description                               |
| ------------------------- | ----------------------------------------- |
| `-h`/`--help`             | 打印帮助信息                              |
| `-V`/`--version`          | 打印版本信息                              |
| `--log-dir <LOG_DIR>`     | 日志目录，默认是 `./greptimedb_data/logs` |
| `--log-level <LOG_LEVEL>` | 日志级别，默认是 `info`                   |

### 子命令 
- [Metasrv](/reference/command-lines/metasrv.md)
- [Datanode](/reference/command-lines/datanode.md)
- [Flownode](/reference/command-lines/flownode.md)
- [Frontend](/reference/command-lines/frontend.md)
- [Standalone](/reference/command-lines/standalone.md)

### 升级 GreptimeDB 版本

请参考具体的[升级步骤](/user-guide/deployments-administration/upgrade.md)
