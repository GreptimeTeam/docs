---
keywords: [Admin API, 健康检查, leader 查询, 心跳检测, 维护模式]
description: 介绍 Metasrv 的 Admin API，包括健康检查、leader 查询和心跳检测等功能。
---

# Admin API

Admin 提供了一种简单的方法来查看集群信息，包括 metasrv 健康检测、metasrv leader 查询、数据库元数据查询和数据节点心跳检测。

Admin API 是一个 HTTP 服务，提供一组可以通过 HTTP 请求调用的 RESTful API。Admin API 简单、用户友好且安全。
可用的 API：

- /health
- /leader
- /heartbeat
- /maintenance

所有这些 API 都在父资源 `/admin` 下。

在以下部分中，我们假设你的 metasrv 实例运行在本地主机的 3002 端口。

## /health HTTP 端点

`/health` 端点接受 GET HTTP 请求，你可以使用此端点检查你的 metasrv 实例的健康状况。

### 定义

```bash
curl -X GET http://localhost:3002/admin/health
```

### 示例

#### 请求

```bash
curl -X GET http://localhost:3002/admin/health
```

#### 响应

```json
OK
```

## /leader HTTP 端点

`/leader` 端点接受 GET HTTP 请求，你可以使用此端点查询你的 metasrv 实例的 leader 地址。

### 定义

```bash
curl -X GET http://localhost:3002/admin/leader
```

### 示例

#### 请求

```bash
curl -X GET http://localhost:3002/admin/leader
```

#### 响应

```json
127.0.0.1:3002
```

## /heartbeat HTTP 端点

`/heartbeat` 端点接受 GET HTTP 请求，你可以使用此端点查询所有数据节点的心跳。

你还可以查询指定 `addr` 的数据节点的心跳数据，但在路径中指定 `addr` 是可选的。

### 定义

```bash
curl -X GET http://localhost:3002/admin/heartbeat
```

| 查询字符串参数 | 类型   | 可选/必选 | 定义                |
|:---------------|:-------|:----------|:--------------------|
| addr           | String | 可选      | 数据节点的地址。    |

### 示例

#### 请求

```bash
curl -X GET 'http://localhost:3002/admin/heartbeat?addr=127.0.0.1:4100'
```

#### 响应

```json
[
 [{
  "timestamp_millis": 1677049348651,
  "cluster_id": 0,
  "id": 1,
  "addr": "127.0.0.1:4100",
  "is_leader": false,
  "rcus": 0,
  "wcus": 0,
  "table_num": 0,
  "region_num": 2,
  "cpu_usage": 0.0,
  "load": 0.0,
  "read_io_rate": 0.0,
  "write_io_rate": 0.0,
  "region_stats": []
 }, {
  "timestamp_millis": 1677049344048,
  "cluster_id": 0,
  "id": 1,
  "addr": "0.0.0.0:4100",
  "is_leader": false,
  "rcus": 0,
  "wcus": 0,
  "table_num": 0,
  "region_num": 2,
  "cpu_usage": 0.0,
  "load": 0.0,
  "read_io_rate": 0.0,
  "write_io_rate": 0.0,
  "region_stats": []
 }, {
  "timestamp_millis": 1677049343624,
  "cluster_id": 0,
  "id": 1,
  "addr": "127.0.0.1:4100",
  "is_leader": false,
  "rcus": 0,
  "wcus": 0,
  "table_num": 0,
  "region_num": 2,
  "cpu_usage": 0.0,
  "load": 0.0,
  "read_io_rate": 0.0,
  "write_io_rate": 0.0,
  "region_stats": []
 }, {
  "timestamp_millis": 1677049339036,
  "cluster_id": 0,
  "id": 1,
  "addr": "0.0.0.0:4100",
  "is_leader": false,
  "rcus": 0,
  "wcus": 0,
  "table_num": 0,
  "region_num": 2,
  "cpu_usage": 0.0,
  "load": 0.0,
  "read_io_rate": 0.0,
  "write_io_rate": 0.0,
  "region_stats": []
 }, {
  "timestamp_millis": 1677049338609,
  "cluster_id": 0,
  "id": 1,
  "addr": "127.0.0.1:4100",
  "is_leader": false,
  "rcus": 0,
  "wcus": 0,
  "table_num": 0,
  "region_num": 2,
  "cpu_usage": 0.0,
  "load": 0.0,
  "read_io_rate": 0.0,
  "write_io_rate": 0.0,
  "region_stats": []
 }, {
  "timestamp_millis": 1677049334019,
  "cluster_id": 0,
  "id": 1,
  "addr": "0.0.0.0:4100",
  "is_leader": false,
  "rcus": 0,
  "wcus": 0,
  "table_num": 0,
  "region_num": 2,
  "cpu_usage": 0.0,
  "load": 0.0,
  "read_io_rate": 0.0,
  "write_io_rate": 0.0,
  "region_stats": []
 }, {
  "timestamp_millis": 1677049333592,
  "cluster_id": 0,
  "id": 1,
  "addr": "127.0.0.1:4100",
  "is_leader": false,
  "rcus": 0,
  "wcus": 0,
  "table_num": 0,
  "region_num": 2,
  "cpu_usage": 0.0,
  "load": 0.0,
  "read_io_rate": 0.0,
  "write_io_rate": 0.0,
  "region_stats": []
 }, {
  "timestamp_millis": 1677049329002,
  "cluster_id": 0,
  "id": 1,
  "addr": "0.0.0.0:4100",
  "is_leader": false,
  "rcus": 0,
  "wcus": 0,
  "table_num": 0,
  "region_num": 2,
  "cpu_usage": 0.0,
  "load": 0.0,
  "read_io_rate": 0.0,
  "write_io_rate": 0.0,
  "region_stats": []
 }, {
  "timestamp_millis": 1677049328573,
  "cluster_id": 0,
  "id": 1,
  "addr": "127.0.0.1:4100",
  "is_leader": false,
  "rcus": 0,
  "wcus": 0,
  "table_num": 0,
  "region_num": 2,
  "cpu_usage": 0.0,
  "load": 0.0,
  "read_io_rate": 0.0,
  "write_io_rate": 0.0,
  "region_stats": []
 }, {
  "timestamp_millis": 1677049323986,
  "cluster_id": 0,
  "id": 1,
  "addr": "0.0.0.0:4100",
  "is_leader": false,
  "rcus": 0,
  "wcus": 0,
  "table_num": 0,
  "region_num": 2,
  "cpu_usage": 0.0,
  "load": 0.0,
  "read_io_rate": 0.0,
  "write_io_rate": 0.0,
  "region_stats": []
 }]
]
```

## /maintenance HTTP 端点

当处于维护状态时，metasrv 将忽略检测到的区域故障。这在数据节点计划短时间不可用时非常有用，例如数据节点的滚动升级时。

### GET

`/maintenance` 端点接受 GET HTTP 请求，你可以使用此端点查询你的 metasrv 实例的维护状态。

```bash
curl -X GET http://localhost:3002/admin/maintenance
```

#### 请求

```bash
curl -X GET http://localhost:3002/admin/maintenance
```

#### 响应

```text
Maintenance mode is disabled
```

### PUT

`/maintenance` 端点接受 PUT HTTP 请求，你可以切换你的 metasrv 实例的维护状态。

```bash
curl -X PUT http://localhost:3002/admin/maintenance
```

| 查询字符串参数 | 类型   | 可选/必选 | 定义                |
|:---------------|:-------|:----------|:--------------------|
| enable         | String | 必选      | 'true' 或 'false'   |

#### 请求

```bash
curl -X PUT http://localhost:3002/admin/maintenance?enable=true
```

#### 响应

```text
Maintenance mode enabled
```
