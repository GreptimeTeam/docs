---
keywords: [admin api, health check, leader query, heartbeat, maintenance mode, recovery mode, table id sequence]
description: Details the Metasrv Admin API for status inspection, cluster controls, and metadata recovery.
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
- /maintenance
- /procedure-manager
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

Setting the sequence requires recovery mode. The new value must be greater than the current value; the API cannot move the sequence backwards.

```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"next_table_id": 2048}' \
  http://localhost:4000/admin/sequence/table/set-next-id
```

Changing this value affects IDs allocated to future tables. Use the endpoint only when repairing metadata after confirming the required next ID.
