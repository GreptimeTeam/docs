---
keywords: [drain datanode, decommission datanode, node scheduling, leader region migration, GreptimeDB cluster maintenance]
description: Guide to draining leader regions off a Datanode with the Metasrv admin HTTP API, tracking the procedure, and restoring scheduling.
---

# Drain a Datanode

Draining moves the leader regions of a Datanode to other Datanodes so that the node can be taken out of service without losing write availability. Metasrv keeps the node out of region placement for the whole operation and leaves the decision to put it back to you.

:::warning
Draining requires a distributed cluster whose Datanodes use shared storage, the same prerequisite as [Region Migration](/user-guide/deployments-administration/manage-data/region-migration.md). It is not available on standalone instances.
:::

## What draining does

- Metasrv marks the Datanode unschedulable when the procedure starts, and it does not place new regions on the node during or after the drain.
- Leader regions on the node are migrated to other Datanodes. When you do not specify a destination, the selector chooses one for each region.
- Follower replicas are not migrated. The node still stores and serves the follower replicas it holds. Draining neither stops the Datanode process nor removes the node from the cluster.
- The operation is an asynchronous procedure. The HTTP request returns a procedure ID, migrations continue in the background, and a Metasrv restart resumes them.
- The node stays unschedulable after the procedure finishes, whether it succeeded or failed. Restoring scheduling is a separate step.

## Prerequisites

- A distributed cluster using shared storage.
- Access to the HTTP port of the **leader** Metasrv, which defaults to `4000`. These endpoints return HTTP `500` with error code `1006` on a follower. Find the leader with `GET /admin/leader`.
- Network-level protection of the admin HTTP port. The Admin API has no authentication, as described in [Admin API](/contributor-guide/metasrv/admin-api.md).

## Step 1: Check the scheduling state

```bash
curl -X GET 'http://localhost:4000/admin/datanode/scheduling/status?node_id=1'
```

```json
{"node_id":1,"schedulable":true}
```

`schedulable` is `true` for a node that was never drained.

## Step 2: Start the drain

```bash
curl -X POST 'http://localhost:4000/admin/datanode/drain' \
  -H 'Content-Type: application/json' \
  -d '{"node_id": 1, "target_node_id": 2}'
```

```json
{"procedure_id":"a3b9f746-81c2-4e65-9d07-6f2c8b104ea5"}
```

Omit `target_node_id` to let the selector choose each destination. The target must differ from `node_id`, otherwise the request is rejected with HTTP `400`.

While a drain of the node is running, any further drain request for the same node, including a byte-identical one, is rejected with HTTP `500` and error code `1006`. Track the running procedure instead of retrying the request.

## Step 3: Wait for the procedure

```bash
curl -X GET 'http://localhost:4000/admin/procedure/status?procedure_id=a3b9f746-81c2-4e65-9d07-6f2c8b104ea5'
```

```json
{"procedure_id":"a3b9f746-81c2-4e65-9d07-6f2c8b104ea5","status":"Done","error":null}
```

`status` is `Running` while migrations are in progress. It becomes `Done` once no leader region of the node is left. If the procedure stops with regions still on the node, it ends as `Failed`. When the drain gives up on specific regions, `error` lists them; regions that already migrated stay migrated.

`Done` does not include a migrated count. To inspect placement, use the query in [Region Migration](/user-guide/deployments-administration/manage-data/region-migration.md); a region whose leader peer still lists the drained node was not migrated.

If the drain failed, remove the cause and submit the drain again. The new procedure rescans the node's remaining leader regions and skips the regions that already moved. A drain that fails on a few regions therefore does not start over.

## Step 4: Restore scheduling

After the maintenance window, or when the node should receive regions again, restore placement explicitly:

```bash
curl -X POST 'http://localhost:4000/admin/datanode/mark-schedulable' \
  -H 'Content-Type: application/json' \
  -d '{"node_id": 1}'
```

```json
{"node_id":1,"schedulable":true}
```

The call is idempotent, so repeating it succeeds. It is rejected with HTTP `500` and error code `1006` while a drain of the same node is running, and while the Metasrv has not finished recovering procedures after a restart.

## Behaviour and limits

- The drain budget is 20 minutes, counted from the submission. A drain that exceeds it ends as `Failed`.
- At most four leader regions are migrated concurrently. A failed migration does not stop the remaining ones, and the failures are reported when the procedure ends.
- The HTTP API exposes no setting for the budget, concurrency, or error handling; use the documented defaults.
- The procedure does not remove the Datanode from the cluster and does not migrate follower replicas. Taking the node offline with follower replicas still on it interrupts reads served by those replicas.

## Responses and errors

Successful requests return HTTP `200` with a JSON body. Rejected requests return the shared error body:

```json
{"code":1006,"error":"Another drain procedure is running for datanode: 1","execution_time_ms":0}
```

- `1006` (`IllegalState`, HTTP `500`): the request reached a follower Metasrv, another drain of the node is running, a drain is in progress when you restore scheduling, or the Metasrv has not completed procedure recovery.
- `1004` (`InvalidArguments`, HTTP `400`): the drain target equals the source node, or the `procedure_id` is malformed or unknown.
- HTTP `422`: the JSON body is missing a required field or has a field of the wrong type.
