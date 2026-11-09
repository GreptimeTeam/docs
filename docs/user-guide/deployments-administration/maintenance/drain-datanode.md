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
  -d '{"node_id": 1, "target_node_id": 2, "parallelism": 8, "strategy": "fail_fast", "timeout": "30m"}'
```

```json
{"procedure_id":"a3b9f746-81c2-4e65-9d07-6f2c8b104ea5"}
```

The request accepts these optional fields:

- `target_node_id`: the destination Datanode. When it is omitted, the selector chooses a destination for each region. It must differ from `node_id`, otherwise the request is rejected with HTTP `400`.
- `parallelism`: how many leader-region migrations run concurrently, from 1 to 32. Defaults to `4`.
- `strategy`: `try_all` keeps migrating the remaining regions after a failure and reports the regions it gives up on; `fail_fast` stops the drain after a batch with a failed migration. Defaults to `try_all`.
- `timeout`: the budget of the whole drain, measured from submission. It accepts human-readable durations such as `"30m"` or `"1h 30m"` and defaults to `20m`.

Omit a field to use its default. An explicit `null` is rejected for `parallelism`, `strategy`, and `timeout`.

While a drain of the node is running, any further drain request for the same node, including a byte-identical one, is rejected with HTTP `500` and error code `1006`. Track the running procedure instead of retrying the request.

## Step 3: Wait for the procedure

```bash
curl -X GET 'http://localhost:4000/admin/procedure/status?procedure_id=a3b9f746-81c2-4e65-9d07-6f2c8b104ea5'
```

```json
{"procedure_id":"a3b9f746-81c2-4e65-9d07-6f2c8b104ea5","status":"Done","error":null}
```

`status` is `Running` while migrations are in progress. When the drain gives up on leader-region migrations or stops on a terminal error, it ends as `Failed`; `error` carries the failure, and the regions the drain gave up on are listed there. Regions that already migrated stay migrated.

`Done` means the drain has no further migrations to dispatch. It does not by itself prove that the node leads no region:

- After a Metasrv restart, recovered region migrations continue independently. The drain leaves regions that already have a running migration alone, so it can report `Done` while those migrations are still `Running`.
- `Done` reports no migrated count.

If the drain failed, remove the cause and submit the drain again. The new procedure rescans the node's remaining leader regions and skips the regions that already moved. A drain that fails on a few regions therefore does not start over.

## Step 4: Verify that no leader region remains

Scheduling status and procedure status do not report placement. Query the leader peers of the node across all tables:

```sql
SELECT table_schema, table_name, region_id
FROM information_schema.region_peers
WHERE peer_id = 1 AND is_leader = 'Yes';
```

The result must be empty before you take the node offline. `region_peers` lists every peer of every table in the catalog where the query runs, so rows with `is_leader = 'No'` are the follower replicas that stay on the node and do not block shutdown. A region still migrating off the node is still led by it, so wait for the query to return no rows instead of relying on `Done`.

The table is catalog-scoped. Run the query in every catalog of the cluster and require an empty result for each one; qualifying the table name, for example `greptime.information_schema.region_peers`, checks a specific catalog. An empty result from one catalog says nothing about regions of another.

## Step 5: Restore scheduling

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

- The drain budget defaults to 20 minutes, counted from the submission, and `timeout` changes it for one request. A drain that exceeds its budget ends as `Failed`.
- Up to four leader regions are migrated concurrently by default; `parallelism` sets a value from 1 to 32.
- `strategy` decides what happens after a failed migration. `try_all`, the default, keeps migrating the remaining regions; `fail_fast` stops after the batch with the failure.
- The procedure does not remove the Datanode from the cluster and does not migrate follower replicas. Taking the node offline with follower replicas still on it interrupts reads served by those replicas.

## Responses and errors

Successful requests return HTTP `200` with a JSON body. Rejected requests return the shared error body:

```json
{"code":1006,"error":"Another drain procedure is running for datanode: 1","execution_time_ms":0}
```

- `1006` (`IllegalState`, HTTP `500`): the request reached a follower Metasrv, another drain of the node is running, a drain is in progress when you restore scheduling, or the Metasrv has not completed procedure recovery.
- `1004` (`InvalidArguments`, HTTP `400`): the drain target equals the source node, `parallelism` is outside 1–32, `timeout` is zero or too large to schedule, or the `procedure_id` is malformed or unknown.
- HTTP `422`: the JSON body cannot be deserialized, for example a missing required field, an unknown `strategy` value, or a malformed `timeout` duration. Values that deserialize but fail validation, such as `parallelism` outside 1–32, return HTTP `400`.
