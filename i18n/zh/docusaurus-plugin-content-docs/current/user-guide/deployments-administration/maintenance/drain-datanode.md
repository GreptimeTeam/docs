---
keywords: [Datanode 迁移, Datanode 下线, 节点调度, Leader Region 迁移, GreptimeDB 集群维护]
description: 通过 Metasrv Admin HTTP API 将 Datanode 上的 Leader Region 迁走、跟踪 Procedure 状态并恢复调度的操作指南。
---

# 迁移 Datanode 上的 Region（Drain Datanode）

Drain 会把某个 Datanode 上的 leader region 迁移到其他 Datanode，使该节点可以在不影响写入可用性的前提下停止服务。整个操作期间 Metasrv 会将该节点排除在 region 放置之外，何时恢复由你决定。

:::warning
Drain 仅在 Datanode 使用共享存储的集群模式下可用，前提条件与 [Region Migration](/user-guide/deployments-administration/manage-data/region-migration.md) 相同。单机实例不支持该操作。
:::

## Drain 做了什么

- Procedure 开始时会将该 Datanode 标记为不可调度。在 drain 期间以及 drain 结束后，Metasrv 都不会再向该节点放置新的 region。
- 节点上的 leader region 会迁移到其他 Datanode。未指定目标节点时，由 selector 为每个 region 选择目标。
- Follower 副本不会被迁移。节点仍会存储并服务它持有的 follower 副本。Drain 既不会停止 Datanode 进程，也不会把节点从集群中移除。
- 该操作是异步 procedure。HTTP 请求返回 procedure ID，迁移在后台继续，Metasrv 重启后会恢复执行。
- 无论成功还是失败，procedure 结束后节点仍处于不可调度状态。恢复调度需要单独执行操作。

## 前提条件

- 使用共享存储的集群模式。
- 能访问 **leader** Metasrv 的 HTTP 端口，默认为 `4000`。在 follower 上调用这些端点会返回 HTTP `500` 和错误码 `1006`。可通过 `GET /admin/leader` 获取 leader 地址。
- 在网络层保护 Admin HTTP 端口。Admin API 没有鉴权，详见 [Admin API](/contributor-guide/metasrv/admin-api.md)。

## 步骤 1：查询当前调度状态

```bash
curl -X GET 'http://localhost:4000/admin/datanode/scheduling/status?node_id=1'
```

```json
{"node_id":1,"schedulable":true}
```

从未被 drain 的节点，`schedulable` 为 `true`。

## 步骤 2：发起 drain

```bash
curl -X POST 'http://localhost:4000/admin/datanode/drain' \
  -H 'Content-Type: application/json' \
  -d '{"node_id": 1, "target_node_id": 2, "parallelism": 8, "strategy": "fail_fast", "timeout": "30m"}'
```

```json
{"procedure_id":"a3b9f746-81c2-4e65-9d07-6f2c8b104ea5"}
```

请求支持以下可选字段：

- `target_node_id`：目标 Datanode。省略时由 selector 为每个 region 选择目标。目标节点不能与被 drain 的节点相同，否则请求会以 HTTP `400` 拒绝。
- `parallelism`：同时执行的 leader region 迁移数量，取值为 1 到 32，默认为 `4`。
- `strategy`：`try_all` 在迁移失败后继续迁移剩余 region，并报告放弃的 region；`fail_fast` 在一批迁移出现失败后停止 drain。默认为 `try_all`。
- `timeout`：整个 drain 的时间预算，从提交时刻开始计算。支持 `"30m"`、`"1h 30m"` 这类可读时长，默认为 `20m`。

省略字段即使用默认值。`parallelism`、`strategy` 和 `timeout` 显式传入 `null` 会被拒绝。

当该节点已有 drain 在运行时，对同一节点的任何 drain 请求（包括内容完全相同的请求）都会返回 HTTP `500` 和错误码 `1006`。此时应跟踪正在运行的 procedure，而不是重试请求。

## 步骤 3：等待 procedure 结束

```bash
curl -X GET 'http://localhost:4000/admin/procedure/status?procedure_id=a3b9f746-81c2-4e65-9d07-6f2c8b104ea5'
```

```json
{"procedure_id":"a3b9f746-81c2-4e65-9d07-6f2c8b104ea5","status":"Done","error":null}
```

迁移进行中 `status` 为 `Running`。当 drain 放弃部分 leader region 迁移，或因无法恢复的错误停止时，`status` 为 `Failed`；失败信息写在 `error` 中，放弃的 region 也会列在那里。已经迁移成功的 region 保持迁移后的状态。

`Done` 只表示 drain 没有更多需要提交的迁移，不能单独证明该节点已不承载任何 leader region：

- Metasrv 重启后，已恢复的 Region 迁移会独立继续执行。drain 不会处理已有迁移在运行的 region，因此可能在这些迁移仍为 `Running` 时报告 `Done`。
- `Done` 不包含迁移数量。

如果 drain 失败，排除原因后重新提交即可。新的 procedure 会重新扫描该节点剩余的 leader region，并跳过已经迁走的 region，不会从头再来。

## 步骤 4：确认节点上没有 leader region

调度状态和 procedure 状态都不反映 region 分布。请在所有表中查询该节点的 leader peer：

```sql
SELECT table_schema, table_name, region_id
FROM information_schema.region_peers
WHERE peer_id = 1 AND is_leader = 'Yes';
```

在将节点下线之前，该查询必须返回空结果。`region_peers` 会列出查询所在 catalog 中所有表的所有 peer，因此 `is_leader = 'No'` 的行是仍留在该节点上的 follower 副本，它们不阻碍下线。仍在迁移中的 region 依然由该节点担任 leader，因此应等待查询返回空结果，而不是只看 `Done`。

该表按 catalog 划分。请对集群中的每个 catalog 分别执行查询，并要求每个结果都为空；通过 `greptime.information_schema.region_peers` 这样的限定名可以查询指定 catalog。某个 catalog 返回空结果，并不代表其他 catalog 中没有该节点担任 leader 的 region。

## 步骤 5：恢复调度

维护窗口结束，或需要让该节点重新承载 region 时，显式恢复调度：

```bash
curl -X POST 'http://localhost:4000/admin/datanode/mark-schedulable' \
  -H 'Content-Type: application/json' \
  -d '{"node_id": 1}'
```

```json
{"node_id":1,"schedulable":true}
```

该调用是幂等的，重复执行也会成功。当同一节点仍有 drain 在运行，或 Metasrv 重启后尚未完成 procedure 恢复时，该请求会返回 HTTP `500` 和错误码 `1006`。

## 行为与限制

- Drain 的时间预算默认为 20 分钟，从提交时刻开始计算，可通过 `timeout` 为单次请求调整。超过预算的 drain 以 `Failed` 结束。
- 默认最多同时迁移 4 个 leader region，可通过 `parallelism` 设置为 1 到 32。
- `strategy` 决定迁移失败后的处理方式：`try_all`（默认）继续迁移剩余 region；`fail_fast` 在出现失败的那一批之后停止。
- Procedure 不会把 Datanode 移出集群，也不会迁移 follower 副本。如果节点上仍有 follower 副本就将其下线，依赖这些副本的读请求会受影响。

## 响应与错误

成功的请求返回 HTTP `200` 和 JSON 响应体。被拒绝的请求返回统一的错误响应体：

```json
{"code":1006,"error":"Another drain procedure is running for datanode: 1","execution_time_ms":0}
```

- `1006`（`IllegalState`，HTTP `500`）：请求打到了 follower Metasrv；该节点已有 drain 在运行；恢复调度时该节点正在 drain；或 Metasrv 尚未完成 procedure 恢复。
- `1004`（`InvalidArguments`，HTTP `400`）：drain 的目标节点与源节点相同；`parallelism` 超出 1–32；`timeout` 为零或大到无法调度；或 `procedure_id` 格式不合法、不存在。
- HTTP `422`：JSON 请求体无法反序列化，例如缺少必填字段、`strategy` 取值未知或 `timeout` 时长格式错误。能正常反序列化但未通过校验的取值（例如 `parallelism` 超出 1–32）返回 HTTP `400`。
