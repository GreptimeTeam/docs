---
keywords: [指标收集, 数据收集, 隐私保护, 配置管理, 禁用指标, 操作系统, 机器架构, 集群信息]
description: 介绍 GreptimeDB 的指标收集功能，包括收集的数据类型、如何禁用指标收集等内容。
---

# 指标收集

为了提升我们的服务，GreptimeDB 会收集一些数据，包括 GreptimeDB 版本、节点数量、使用的操作系统、环境架构以及类似的技术细节等信息。但是我们尊重您的隐私，并确保不收集任何特定于用户的数据，其中包括数据库名称、表名称、查询内容等。

你的体验和隐私是我们的首要任务。你可以根据自己的喜好轻松管理此指标收集，通过配置选择启用或禁用它。

## 将会收集哪些数据

详细的数据信息可能会随着时间的推移而发生变化，这些更改（如果有）将在发行说明中公布。

启用指标收集后，GreptimeDB 将每半小时收集一次以下信息：

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
  "mode": "Standalone",
  "git_commit": "00d759e828f5e148ec18141904e20cb1cb7577b0",
  "nodes": 1,
  "uuid": "43717682-baa8-41e0-b126-67b797b66606",
  "uptime": "hours"
}
```

## 如何禁用指标收集

从 GreptimeDB v0.4.0 开始，指标收集将默认启用。你可以通过更改配置来禁用它。

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
