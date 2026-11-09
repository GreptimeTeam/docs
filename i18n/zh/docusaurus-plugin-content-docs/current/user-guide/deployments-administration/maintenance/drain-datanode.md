---
keywords: [Drain Datanode, Datanode 下线, Leader Region 迁移, 节点调度, GreptimeDB 集群维护]
description: 通过 Metasrv Admin HTTP API 将 Datanode 上的 Leader Region 迁走、跟踪 Procedure 状态并恢复调度的操作指南。
---

# Drain Datanode

Drain 会把某个 Datanode 上的 Leader Region 迁移到其他 Datanode，使该节点可以在不影响写入可用性的前提下停止服务。在恢复调度之前，Metasrv 不会再把 Region 放置到该节点。

:::warning
Drain 仅在 Datanode 使用共享存储的集群模式下可用，前提条件与 [Region Migration](/user-guide/deployments-administration/manage-data/region-migration.md) 相同。单机实例不支持该操作。
:::

## Drain 的作用

- Procedure 开始时会将该 Datanode 标记为不可调度。在 Drain 期间以及 Drain 结束后，Metasrv 都不会再向该节点放置新的 Region。
- 节点上的 Leader Region 会迁移到其他 Datanode。未指定目标节点时，由 Metasrv 为每个 Region 选择目标。
- Follower Region 不会被迁移。节点仍会存储并服务它持有的 Follower Region。Drain 既不会停止 Datanode 进程，也不会把节点从集群中移除。
- Drain 是一个异步 Procedure：HTTP 请求只返回 `procedure_id`，迁移在后台继续，Metasrv 重启后会恢复执行。
- 无论成功还是失败，Procedure 结束后节点仍处于不可调度状态。恢复调度需要单独执行操作。

## 前提条件

- 使用共享存储的集群模式。
- 能访问 **leader** Metasrv 的 HTTP 端口，默认为 `4000`。在 follower 上调用这些端点会返回 HTTP `500` 和错误码 `1006`。可通过 `GET /admin/leader` 获取 leader 地址。
- 在网络层保护 Admin HTTP 端口。Admin API 没有鉴权，详见 [Admin API](/contributor-guide/metasrv/admin-api.md)。

## 查询当前调度状态

```bash
curl -X GET 'http://localhost:4000/admin/datanode/scheduling/status?node_id=1'
```

```json
{"node_id":1,"schedulable":true}
```

从未被 Drain 的节点，`schedulable` 为 `true`。

## 发起 Drain

```bash
curl -X POST 'http://localhost:4000/admin/datanode/drain' \
  -H 'Content-Type: application/json' \
  -d '{"node_id": 1, "target_node_id": 2, "parallelism": 8, "strategy": "fail_fast", "timeout": "30m"}'
```

```json
{"procedure_id":"a3b9f746-81c2-4e65-9d07-6f2c8b104ea5"}
```

请求支持以下可选字段：

- `target_node_id`：目标 Datanode。省略时由 Metasrv 为每个 Region 选择目标。目标节点不能与被 Drain 的节点相同，否则请求返回 HTTP `400`。
- `parallelism`：同时执行的 Leader Region 迁移数量，取值为 1 到 32，默认为 `4`。
- `strategy`：`try_all` 在迁移失败后继续迁移剩余 Region，并报告无法迁走的 Region；`fail_fast` 在一批迁移出现失败后停止 Drain。默认为 `try_all`。
- `timeout`：整个 Drain 的时间预算，从提交时刻开始计算。支持 `"30m"`、`"1h 30m"` 这类可读时长，默认为 `20m`。

省略字段即使用默认值。`parallelism`、`strategy` 和 `timeout` 显式传入 `null` 会被拒绝。

当该节点已有 Drain 在运行时，对同一节点的 Drain 请求（包括内容完全相同的请求）都会被拒绝。请跟踪正在运行的 Procedure，而不是重试请求。

## 等待 Procedure 结束

```bash
curl -X GET 'http://localhost:4000/admin/procedure/status?procedure_id=a3b9f746-81c2-4e65-9d07-6f2c8b104ea5'
```

```json
{"procedure_id":"a3b9f746-81c2-4e65-9d07-6f2c8b104ea5","status":"Done","error":null}
```

迁移进行中 `status` 为 `Running`。当 Drain 无法迁移部分 Leader Region，或因无法恢复的错误停止时，`status` 为 `Failed`；失败信息写在 `error` 中，无法迁走的 Region 也会列在那里。已经迁移成功的 Region 保持迁移后的状态。

`Done` 只表示 Drain 没有更多需要提交的迁移，不能证明该节点已不承载任何 Leader Region。Metasrv 重启后，已恢复的 Region 迁移会独立继续执行；Drain 不会处理已有迁移在运行的 Region，因此可能在这些迁移仍为 `Running` 时报告 `Done`。`Done` 也不包含迁移数量。

如果 Drain 失败，排除原因后重新提交即可。新的 Procedure 会重新扫描该节点剩余的 Leader Region，并跳过已经迁走的 Region，不会从头开始。

## 确认节点上没有 Leader Region

调度状态和 Procedure 状态都不反映 Region 分布。请查询当前 catalog 中该节点仍在担任 leader 的 Region：

```sql
SELECT table_schema, table_name, region_id
FROM information_schema.region_peers
WHERE peer_id = 1 AND is_leader = 'Yes';
```

在将节点下线之前，该查询必须返回空结果。`region_peers` 会列出当前 catalog 中的所有 peer，因此 `is_leader = 'No'` 的行是仍留在该节点上的 Follower Region，它们不阻碍下线。仍在迁移中的 Region 依然由该节点担任 leader，因此应等待查询返回空结果，而不是只看 `Done`。

`region_peers` 一次只覆盖一个 catalog。请对集群中的每个 catalog 分别执行查询，并要求每个结果都为空；通过 `greptime.information_schema.region_peers` 这样的限定名可以查询指定 catalog。

## 恢复调度

维护结束，或需要让该节点重新承载 Region 时，显式恢复调度：

```bash
curl -X POST 'http://localhost:4000/admin/datanode/mark-schedulable' \
  -H 'Content-Type: application/json' \
  -d '{"node_id": 1}'
```

```json
{"node_id":1,"schedulable":true}
```

该调用是幂等的，重复执行也会成功。当同一节点仍有 Drain 在运行，或 Metasrv 重启后尚未完成 Procedure 恢复时，该调用会失败。

## 行为与限制

- Drain 的时间预算默认为 20 分钟，从提交时刻开始计算，可通过 `timeout` 为单次请求调整。超过预算的 Drain 以 `Failed` 结束。
- 默认最多同时迁移 4 个 Leader Region，可通过 `parallelism` 设置为 1 到 32。
- `strategy` 决定迁移失败后的处理方式：`try_all`（默认）继续迁移剩余 Region；`fail_fast` 在出现失败的那一批之后停止。
- Procedure 不会把 Datanode 移出集群，也不会迁移 Follower Region。如果节点上仍有 Follower Region 就将其下线，依赖这些 Region 的读请求会受影响。

## 响应与错误

成功的请求返回 HTTP `200` 和 JSON 响应体。被拒绝的请求返回统一的错误响应体：

```json
{"code":1006,"error":"Another drain procedure is running for datanode: 1","execution_time_ms":0}
```

- `1006`（`IllegalState`，HTTP `500`）：请求打到了 follower Metasrv；该节点已有 Drain 在运行；恢复调度时该节点正在 Drain；或 Metasrv 尚未完成 Procedure 恢复。
- `1004`（`InvalidArguments`，HTTP `400`）：Drain 的目标节点与源节点相同；`parallelism` 超出 1–32；`timeout` 为零或大到无法调度；或 `procedure_id` 格式不合法、不存在。
- HTTP `422`：JSON 请求体无法解析，例如缺少必填字段、`strategy` 取值未知或 `timeout` 时长格式错误。能正常解析但未通过校验的取值（例如 `parallelism` 超出 1–32）返回 HTTP `400`。
