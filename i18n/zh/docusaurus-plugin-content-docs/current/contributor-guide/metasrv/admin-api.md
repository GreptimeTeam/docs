---
keywords: [Admin API, 健康检查, leader 查询, 心跳检测, 维护模式]
description: 介绍 Metasrv 的 Admin API，包括健康检查、leader 查询、心跳检测、维护模式和 Procedure Manager 控制等功能。
---

# Admin API

Admin API 通过 HTTP 提供 Metasrv health、leader、Datanode 心跳、维护模式和 Procedure Manager 信息。该 API 不提供认证，且部分端点会改变集群行为，部署时必须通过网络策略保护 HTTP 端口。
本页介绍以下 API：

- /health
- /leader
- /heartbeat
- /maintenance
- /procedure-manager

所有这些 API 都在父资源 `/admin` 下。

在以下部分中，我们假设你的 metasrv 实例运行在本地主机的 4000 端口。

## /health HTTP 端点

`/health` 端点接受 GET 请求。HTTP 服务运行时返回 `OK`，但不会检查当前 Metasrv 是否为 leader，也不会检查外部依赖是否可用。

### 定义

```bash
curl -X GET http://localhost:4000/admin/health
```

### 示例

#### 请求

```bash
curl -X GET http://localhost:4000/admin/health
```

#### 响应

```json
OK
```

## /leader HTTP 端点

`/leader` 端点接受 GET HTTP 请求，你可以使用此端点查询你的 metasrv 实例的 leader 地址。

### 定义

```bash
curl -X GET http://localhost:4000/admin/leader
```

### 示例

#### 请求

```bash
curl -X GET http://localhost:4000/admin/leader
```

#### 响应

```json
127.0.0.1:4000
```

## /heartbeat HTTP 端点

`/heartbeat` 端点接受 GET HTTP 请求，你可以使用此端点查询所有数据节点的心跳。

你还可以查询指定 `addr` 的数据节点的心跳数据，但在路径中指定 `addr` 是可选的。

### 定义

```bash
curl -X GET http://localhost:4000/admin/heartbeat
```

| 查询字符串参数 | 类型   | 可选/必选 | 定义                |
|:---------------|:-------|:----------|:--------------------|
| addr           | String | 可选      | 数据节点的地址。    |

### 示例

#### 请求

```bash
curl -X GET 'http://localhost:4000/admin/heartbeat?addr=127.0.0.1:4100'
```

#### 响应

```json
[
  [
    {
      "timestamp_millis": 1677049348651,
      "id": 1,
      "addr": "127.0.0.1:4100",
      "rcus": 0,
      "wcus": 0,
      "region_num": 2,
      "region_stats": [],
      "topic_stats": [],
      "node_epoch": 0,
      "datanode_workloads": {
        "types": []
      },
      "gc_stat": null
    }
  ]
]
```

## /maintenance HTTP 端点

集群维护模式是 GreptimeDB 中的一项安全功能，它可以临时禁用自动集群管理操作。此模式在集群升级、计划停机以及任何可能暂时影响集群稳定性的操作期间特别有用。有关更多详细信息，请参阅[集群维护模式](/user-guide/deployments-administration/maintenance/maintenance-mode.md)。

`/maintenance` 端点支持以下 HTTP 请求：

- `GET /admin/maintenance` 或 `GET /admin/maintenance/status`：查询维护模式状态。
- `POST /admin/maintenance/enable`：启用维护模式。
- `POST /admin/maintenance/disable`：禁用维护模式。

响应体使用以下格式：

```json
{
  "enabled": true
}
```

## /procedure-manager HTTP 端点

该端点用于管理 Procedure Manager 状态。有关更多详细信息，请参阅[防止元数据变更](/user-guide/deployments-administration/maintenance/prevent-metadata-changes.md)。

`/procedure-manager` 端点支持以下 HTTP 请求：

- `GET /admin/procedure-manager/status`：查询 Procedure Manager 状态。
- `POST /admin/procedure-manager/pause`：暂停 Procedure Manager。
- `POST /admin/procedure-manager/resume`：恢复 Procedure Manager。

响应体使用以下格式：

```json
{
  "status": "running"
}
```
