---
keywords: [admin api, health check, leader query, heartbeat, maintenance mode, RESTful API]
description: Details the Admin API for Metasrv, including endpoints for health checks, leader queries, heartbeat data, maintenance mode, and Procedure Manager controls.
---

# Admin API

:::tip
Note that all Admin API endpoints in this document listen on Metasrv's `HTTP_PORT`, which defaults to `4000`.
:::

The Admin API provides a simple way to view and manage cluster information, including metasrv health detection, metasrv leader query, datanode heartbeat detection, maintenance mode, and Procedure Manager controls.

The Admin API is an HTTP service that provides a set of RESTful APIs that can be called through HTTP requests. The Admin API is simple, user-friendly and safe.
This page covers the following APIs:

- /health
- /leader
- /heartbeat
- /maintenance
- /procedure-manager

All these APIs are under the parent resource `/admin`.

In the following sections, we assume that your metasrv instance is running on localhost port 4000.

## /health HTTP endpoint  

The `/health` endpoint accepts GET HTTP requests and you can use this endpoint to check the health of your metasrv instance.

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

## /maintenance HTTP endpoint

Cluster Maintenance Mode is a safety feature in GreptimeDB that temporarily disables automatic cluster management operations. This mode is particularly useful during cluster upgrades, planned downtime, and any operation that might temporarily affect cluster stability. For more details, please refer to [Cluster Maintenance Mode](/user-guide/deployments-administration/maintenance/maintenance-mode.md).

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
