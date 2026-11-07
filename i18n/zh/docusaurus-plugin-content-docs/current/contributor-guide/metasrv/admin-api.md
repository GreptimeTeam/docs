---
keywords: [Admin API, 健康检查, leader 查询, 心跳检测, 维护模式, 恢复模式, table id sequence, Datanode drain, Procedure 状态]
description: 介绍 Metasrv 用于状态检查、集群控制、Datanode drain 和元数据恢复的 Admin API。
---

# Admin API

:::tip
本页所有 Admin API 都监听 Metasrv 的 `HTTP_PORT`，默认值为 `4000`。
:::

Admin API 通过 HTTP 提供 Metasrv 状态、集群控制和元数据恢复操作。该 API 不提供认证，且部分端点会改变集群行为或元数据分配，部署时必须通过网络策略保护 HTTP 端口。
本页介绍以下 API：

- /health
- /leader
- /heartbeat
- /node-lease
- /datanode
- /maintenance
- /procedure-manager
- /procedure/status
- /recovery
- /sequence/table

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

## /node-lease HTTP 端点

`/node-lease` 返回 Metasrv 当前记录的 Datanode lease，可用于判断 Metasrv 是否仍将某个 Datanode 视为存活。

```bash
curl -X GET http://localhost:4000/admin/node-lease
```

## /datanode HTTP 端点

这些端点用于 drain 一个 Datanode，并控制 Metasrv 是否可以向该节点放置 region。它们面向计划内的节点下线与维护，完整流程请参阅 [迁移 Datanode 上的 Region](/user-guide/deployments-administration/maintenance/drain-datanode.md)。

- `POST /admin/datanode/drain`：提交一个异步 procedure，迁移该 Datanode 上的 leader region。
- `POST /admin/datanode/mark-schedulable`：允许 Metasrv 再次向该 Datanode 放置 region。
- `GET /admin/datanode/scheduling/status`：查询该 Datanode 是否可调度。

`/drain` 和 `/mark-schedulable` 接受 JSON 请求体，`/scheduling/status` 接受 `node_id` 查询字符串参数：

```bash
curl -X POST 'http://localhost:4000/admin/datanode/drain' \
  -H 'Content-Type: application/json' \
  -d '{"node_id": 1, "target_node_id": 2}'
```

```json
{"procedure_id":"a3b9f746-81c2-4e65-9d07-6f2c8b104ea5"}
```

`target_node_id` 是可选的。省略时由 selector 为每个 region 选择目标；指定时不能与 `node_id` 相同。drain 以 procedure 形式运行，因此响应会立即返回 procedure ID。

```bash
curl -X POST 'http://localhost:4000/admin/datanode/mark-schedulable' \
  -H 'Content-Type: application/json' \
  -d '{"node_id": 1}'

curl -X GET 'http://localhost:4000/admin/datanode/scheduling/status?node_id=1'
```

这两个调度请求都返回：

```json
{"node_id":1,"schedulable":true}
```

`scheduling/status` 返回当前状态；`mark-schedulable` 恢复调度，重复调用也会成功，并返回 `"schedulable": true`。

使用时的注意事项：

- 三个端点都必须发送到 leader Metasrv。在 follower 上调用会返回 HTTP `500` 和错误码 `1006`。
- drain 会先标记节点不可调度，再开始迁移。无论 procedure 成功还是失败，结束后节点都保持不可调度，直到 `mark-schedulable` 成功。
- 只迁移 leader region；follower 副本留在该节点上，drain 也不会停止 Datanode 进程。
- 同一 Datanode 已有 drain 在跟踪时，再次提交 drain（包括完全相同的请求）会被拒绝。应通过 `/procedure/status` 跟踪正在运行的 procedure。
- 同一节点正在 drain 时，`mark-schedulable` 会被拒绝。
- Metasrv 重启后尚未完成 procedure 恢复时，drain 提交和 `mark-schedulable` 都会被拒绝。
- drain 的时间预算为提交后 20 分钟，最多同时迁移 4 个 leader region。HTTP API 不提供这些默认值的配置项。

## /maintenance HTTP 端点

维护模式在升级、计划停机等操作期间临时禁用自动集群管理。它对集群的具体影响参见[集群维护模式](/user-guide/deployments-administration/maintenance/maintenance-mode.md)。

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

## /procedure/status HTTP 端点

`GET /admin/procedure/status?procedure_id=<uuid>` 返回提交到 leader Metasrv 的 procedure 状态，可用于跟踪 `/datanode/drain` 发起的 drain。SQL 函数 `ADMIN procedure_state` 返回相同的状态。

```bash
curl -X GET 'http://localhost:4000/admin/procedure/status?procedure_id=a3b9f746-81c2-4e65-9d07-6f2c8b104ea5'
```

```json
{"procedure_id":"a3b9f746-81c2-4e65-9d07-6f2c8b104ea5","status":"Done","error":null}
```

`status` 取值为 `Running`、`Done`、`Retrying`、`Failed`、`PrepareRollback`、`RollingBack` 或 `Poisoned`。procedure 正在失败或已经失败时，`error` 包含失败信息，其他情况下为 `null`。当 drain 放弃某些 region 时，它们会列在 `error` 中；以 `Done` 结束的 drain 不报告迁移数量。`Done` 只表示 drain 没有更多需要提交的迁移：Metasrv 重启后，已恢复的迁移可能仍在运行，因此在将节点下线前，请按[迁移 Datanode 上的 Region](/user-guide/deployments-administration/maintenance/drain-datanode.md)中的步骤确认 region 分布。

该端点必须发送到 leader Metasrv，且不受 Procedure Manager 暂停开关影响。

## /recovery HTTP 端点

Recovery mode 控制手动修改 table ID sequence 等元数据修复端点。它只用于恢复工作，不用于常规维护。

- `GET /admin/recovery/status`：查询 recovery mode 是否开启。
- `POST /admin/recovery/enable`：开启 recovery mode。
- `POST /admin/recovery/disable`：关闭 recovery mode。

响应体格式如下：

```json
{
  "enabled": true
}
```

修复完成后应关闭 recovery mode。如果只是计划暂停自动集群操作，应使用[维护模式](/user-guide/deployments-administration/maintenance/maintenance-mode.md)。

## /sequence/table HTTP 端点

这些端点用于检查或修复 table ID sequence：

- `GET /admin/sequence/table/next-id`：返回下一个 table ID，但不执行分配。
- `POST /admin/sequence/table/set-next-id`：推进下一个 table ID。

设置 sequence 前必须开启 recovery mode。新值必须大于当前值，不能通过该 API 回退 sequence。Recovery mode 只是该 API 的前置条件，不能阻止 DDL。执行该操作时，必须遵循[管理 Table ID Sequence](/user-guide/deployments-administration/maintenance/sequence-management.md)中的完整集群操作流程。

```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"next_table_id": 2048}' \
  http://localhost:4000/admin/sequence/table/set-next-id
```

该操作会影响后续新表分配到的 ID。

## 错误响应

`/datanode` 和 `/procedure/status` 端点返回统一的 JSON 错误响应体：

```json
{"code":1006,"error":"Another drain procedure is running for datanode: 1","execution_time_ms":0}
```

- `1006`（`IllegalState`，HTTP `500`）：请求打到了 follower Metasrv；该节点已有 drain 在运行；恢复调度时该节点正在 drain；或 Metasrv 尚未完成 procedure 恢复。
- `1004`（`InvalidArguments`，HTTP `400`）：drain 的目标节点与源节点相同，或 `procedure_id` 格式不合法、不存在。
- HTTP `422`：JSON 请求体缺少必填字段，或字段类型错误。
