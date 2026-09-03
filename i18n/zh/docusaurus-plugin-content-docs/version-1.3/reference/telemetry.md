---
keywords: [指标收集, 数据收集, 隐私保护, 配置管理, 禁用指标, 操作系统, 机器架构, 集群信息]
description: 介绍 GreptimeDB 的指标收集功能，包括收集的数据类型、如何禁用指标收集等内容。
---

# 指标收集

GreptimeDB 默认启用匿名遥测。遥测数据只包含下文列出的安装和运行时字段，不包含数据库名、表名或查询内容。

可以通过 GreptimeDB 配置禁用遥测。

## 将会收集哪些数据

遥测字段可能在后续版本中发生变化，相关变更会记录在发行说明中。

启用遥测后，遥测任务启动时会发送一次数据，之后每 30 分钟发送一次。每次发送包含以下字段：

- GreptimeDB 版本
- GreptimeDB 的构建 git 哈希
- 运行 GreptimeDB 的设备的操作系统（Linux、macOS 等）
- GreptimeDB 运行的机器架构（x86_64、arm64 等）
- GreptimeDB 运行模式（独立、分布式）
- 随机生成的安装 ID
- GreptimeDB 集群中的 datanode 数量
- 系统运行时间，非精确数字，仅为 `hours`、`weeks` 等时间范围，并且不带数字

数据示例：
```json
{
  "os": "linux",
  "version": "0.15.1",
  "arch": "aarch64",
  "mode": "standalone",
  "git_commit": "00d759e828f5e148ec18141904e20cb1cb7577b0",
  "nodes": 1,
  "uuid": "43717682-baa8-41e0-b126-67b797b66606",
  "uptime": "hours"
}
```

## 如何禁用指标收集

从 GreptimeDB v0.4.0 开始，遥测默认启用。

### 独立模式

将独立配置文件中的 `enable_telemetry` 设置为 `false`：

```toml
# Whether to enable greptimedb telemetry, true by default.
enable_telemetry = false
```

或者在启动时通过环境变量 `GREPTIMEDB_STANDALONE__ENABLE_TELEMETRY=false` 进行配置。

### 分布式模式

将 metasrv 配置文件中的 `enable_telemetry` 设置为 `false`：

```toml
# metasrv config file
# Whether to enable greptimedb telemetry, true by default.
enable_telemetry = false
```

或者在启动时设置环境变量 `GREPTIMEDB_METASRV__ENABLE_TELEMETRY=false`。
