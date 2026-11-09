---
keywords: [admin api, health check, leader query, heartbeat, maintenance mode, recovery mode, table id sequence, datanode drain, procedure status]
description: Details the Metasrv Admin API for status inspection, cluster controls, datanode draining, and metadata recovery.
---

# Admin API

:::tip
Note that all Admin API endpoints in this document listen on Metasrv's `HTTP_PORT`, which defaults to `4000`.
:::

The Admin API exposes Metasrv status, cluster controls, and metadata recovery operations over HTTP. It does not provide authentication, and some endpoints change cluster behavior or metadata allocation. Deployments must protect the HTTP port with network-level controls.
This page covers the following APIs:

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

All these APIs are under the parent resource `/admin`.

In the following sections, we assume that your metasrv instance is running on localhost port 4000.

## /health HTTP endpoint  

The `/health` endpoint accepts GET requests and returns `OK` when the HTTP service is running. It does not check whether this Metasrv is the leader or whether external dependencies are available.

### Definition

```bash
curl -X GET http://localhost:4000/admin/health
```

### Examples

#### Request

```bash
curl -X GET http://localhost:4000/admin/health
```

#### Response

```json
OK
```

## /leader HTTP endpoint

The `/leader` endpoint accepts GET HTTP requests and you can use this endpoint to query the leader's addr of your metasrv instance.

### Definition

```bash
curl -X GET http://localhost:4000/admin/leader
```

### Examples

#### Request

```bash
curl -X GET http://localhost:4000/admin/leader
```

#### Response

```json
127.0.0.1:4000
```

## /heartbeat HTTP endpoint

The `/heartbeat` endpoint accepts GET HTTP requests and you can use this endpoint to query the heartbeat of all datanodes.

You can also query the heartbeat data of the datanode for a specified `addr`, however, specifying `addr` in the path is optional.

### Definition

```bash
curl -X GET http://localhost:4000/admin/heartbeat
```

| Query String Parameter | Type   | Optional/Required | Definition                |
|:-----------------------|:-------|:------------------|:--------------------------|
| addr                   | String | Optional          | The addr of the datanode. |

### Examples

#### Request

```bash
curl -X GET 'http://localhost:4000/admin/heartbeat?addr=127.0.0.1:4100'
```

#### Response

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

## /node-lease HTTP endpoint

The `/node-lease` endpoint returns the current leases recorded for Datanodes. Use it when diagnosing whether Metasrv still considers a Datanode active.

```bash
curl -X GET http://localhost:4000/admin/node-lease
```

## /datanode HTTP endpoints

These endpoints drain a Datanode and control whether Metasrv may place Regions on it. They are intended for planned node removal and maintenance. Follow [Drain a Datanode](/user-guide/deployments-administration/maintenance/drain-datanode.md) for the full workflow.

- `POST /admin/datanode/drain`: submit an asynchronous drain of the Datanode's Leader Regions.
- `POST /admin/datanode/mark-schedulable`: allow new Region placement on the Datanode again.
- `GET /admin/datanode/scheduling/status`: query whether the Datanode is schedulable.

The `/drain` and `/mark-schedulable` endpoints accept a JSON body, and `/scheduling/status` accepts the `node_id` query string parameter:

```bash
curl -X POST 'http://localhost:4000/admin/datanode/drain' \
  -H 'Content-Type: application/json' \
  -d '{"node_id": 1, "target_node_id": 2, "parallelism": 8, "strategy": "fail_fast", "timeout": "30m"}'
```

```json
{"procedure_id":"a3b9f746-81c2-4e65-9d07-6f2c8b104ea5"}
```

The request accepts optional `target_node_id`, `parallelism` (1–32, default `4`), `strategy` (`try_all` by default, or `fail_fast`), and `timeout` (default `20m`). An explicit `null` is rejected for `parallelism`, `strategy`, and `timeout`. [Drain a Datanode](/user-guide/deployments-administration/maintenance/drain-datanode.md) describes each field. The drain runs as a procedure, so the response returns its ID immediately.

```bash
curl -X POST 'http://localhost:4000/admin/datanode/mark-schedulable' \
  -H 'Content-Type: application/json' \
  -d '{"node_id": 1}'

curl -X GET 'http://localhost:4000/admin/datanode/scheduling/status?node_id=1'
```

Both scheduling requests return:

```json
{"node_id":1,"schedulable":true}
```

`scheduling/status` reports the current state. `mark-schedulable` restores placement, succeeds when repeated, and returns `"schedulable": true`.

These endpoints behave as follows:

- All three endpoints must reach the leader Metasrv. A follower returns HTTP `500` with error code `1006`.
- Draining marks the node unschedulable before migrating. The node stays unschedulable after the procedure ends, whether it succeeded or failed, until `mark-schedulable` succeeds.
- Only Leader Regions migrate; Follower Regions stay on the node, and draining does not stop the Datanode process.
- A second drain request for the same Datanode, including an identical one, is rejected while the tracked drain runs. Use `/procedure/status` to follow it instead.
- `mark-schedulable` is rejected while a drain of the same node runs.
- Drain submission and `mark-schedulable` are rejected while the Metasrv has not completed procedure recovery after a restart.
- The drain budget defaults to 20 minutes from submission, and up to four Leader Regions migrate concurrently. `timeout` and `parallelism` override these defaults per request.

## /maintenance HTTP endpoint

Maintenance mode temporarily disables automatic cluster management operations during upgrades, planned downtime, or similar work. See [Cluster Maintenance Mode](/user-guide/deployments-administration/maintenance/maintenance-mode.md) for its effect on the cluster.

The `/maintenance` endpoint supports the following HTTP requests:

- `GET /admin/maintenance` or `GET /admin/maintenance/status`: query the maintenance mode status.
- `POST /admin/maintenance/enable`: enable maintenance mode.
- `POST /admin/maintenance/disable`: disable maintenance mode.

The response body uses the following format:

```json
{
  "enabled": true
}
```

## /procedure-manager HTTP endpoint

This endpoint is used to manage the Procedure Manager status. For more details, please refer to [Prevent Metadata Changes](/user-guide/deployments-administration/maintenance/prevent-metadata-changes.md).

The `/procedure-manager` endpoint supports the following HTTP requests:

- `GET /admin/procedure-manager/status`: query the Procedure Manager status.
- `POST /admin/procedure-manager/pause`: pause the Procedure Manager.
- `POST /admin/procedure-manager/resume`: resume the Procedure Manager.

The response body uses the following format:

```json
{
  "status": "running"
}
```

## /procedure/status HTTP endpoint

`GET /admin/procedure/status?procedure_id=<uuid>` returns the state of a procedure submitted to the leader Metasrv. Use it to follow the drain started by `/datanode/drain`. The SQL function `ADMIN procedure_state` returns the same state.

```bash
curl -X GET 'http://localhost:4000/admin/procedure/status?procedure_id=a3b9f746-81c2-4e65-9d07-6f2c8b104ea5'
```

```json
{"procedure_id":"a3b9f746-81c2-4e65-9d07-6f2c8b104ea5","status":"Done","error":null}
```

`status` is one of `Running`, `Done`, `Retrying`, `Failed`, `PrepareRollback`, `RollingBack`, or `Poisoned`. `error` holds the failure message while the procedure is failing or after it failed, and is `null` otherwise. When a drain cannot migrate some Regions, it lists them in `error`; a drain that ends as `Done` reports no count. `Done` only means the drain has no further migrations to dispatch. After a Metasrv restart, recovered migrations may still be running, so verify Region placement as described in [Drain a Datanode](/user-guide/deployments-administration/maintenance/drain-datanode.md) before taking the node offline.

The endpoint requires the leader Metasrv and is independent of the procedure-manager pause switch.

## /recovery HTTP endpoints

Recovery mode gates metadata repair endpoints such as manual table ID sequence changes. It is intended for recovery work, not routine maintenance.

- `GET /admin/recovery/status`: query whether recovery mode is enabled.
- `POST /admin/recovery/enable`: enable recovery mode.
- `POST /admin/recovery/disable`: disable recovery mode.

The response body uses the following format:

```json
{
  "enabled": true
}
```

Disable recovery mode after the repair is complete. Use [maintenance mode](/user-guide/deployments-administration/maintenance/maintenance-mode.md) instead when the goal is to suspend automatic cluster operations during planned maintenance.

## /sequence/table HTTP endpoints

These endpoints inspect or repair the table ID sequence:

- `GET /admin/sequence/table/next-id`: return the next table ID without allocating it.
- `POST /admin/sequence/table/set-next-id`: advance the next table ID.

Setting the sequence requires recovery mode. The new value must be greater than the current value; the API cannot move the sequence backwards. Recovery mode is an API precondition, not a DDL barrier. Follow [Manage table ID sequences](/user-guide/deployments-administration/maintenance/sequence-management.md) for the required cluster-wide procedure.

```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"next_table_id": 2048}' \
  http://localhost:4000/admin/sequence/table/set-next-id
```

Changing this value affects IDs allocated to future tables.

## Error responses

The `/datanode` and `/procedure/status` endpoints return the shared JSON error body:

```json
{"code":1006,"error":"Another drain procedure is running for datanode: 1","execution_time_ms":0}
```

- `1006` (`IllegalState`, HTTP `500`): the request reached a follower Metasrv, a drain of the node is already running, a drain is in progress when scheduling is restored, or the Metasrv has not completed procedure recovery.
- `1004` (`InvalidArguments`, HTTP `400`): the drain target equals the source node, `parallelism` is outside 1–32, `timeout` is zero or too large to schedule, or the `procedure_id` is malformed or unknown.
- HTTP `422`: the JSON body cannot be parsed, for example a missing required field, an unknown `strategy` value, or a malformed `timeout` duration. A request that parses but fails validation, such as `parallelism` outside 1–32, returns HTTP `400`.
