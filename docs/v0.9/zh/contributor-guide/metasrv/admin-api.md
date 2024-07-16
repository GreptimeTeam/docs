# Admin API

The Admin API provides a simple way to view cluster information, including metasrv health detection, metasrv leader query, database metadata query, and datanode heartbeat detection.

The Admin API is an HTTP service that provides a set of RESTful APIs that can be called through HTTP requests. The Admin API is simple, user-friendly and safe.
Available APIs:

- /health
- /leader
- /heartbeat
- /maintenance

All these APIs are under the parent resource `/admin`.

In the following sections, we assume that your metasrv instance is running on localhost port 3002.

## /health HTTP endpoint  

The `/health` endpoint accepts GET HTTP requests and you can use this endpoint to check the health of your metasrv instance.

### Definition

```bash
curl -X GET http://localhost:3002/admin/health
```

### Examples

#### Request

```bash
curl -X GET http://localhost:3002/admin/health
```

#### Response

```json
OK
```

## /leader HTTP endpoint

The `/leader` endpoint accepts GET HTTP requests and you can use this endpoint to query the leader's addr of your metasrv instance.

### Definition

```bash
curl -X GET http://localhost:3002/admin/leader
```

### Examples

#### Request

```bash
curl -X GET http://localhost:3002/admin/leader
```

#### Response

```json
127.0.0.1:3002
```

## /heartbeat HTTP endpoint

The `/heartbeat` endpoint accepts GET HTTP requests and you can use this endpoint to query the heartbeat of all datanodes.

You can also query the heartbeat data of the datanode for a specified `addr`, however, specifying `addr` in the path is optional.

### Definition

```bash
curl -X GET http://localhost:3002/admin/heartbeat
```

| Query String Parameter | Type   | Optional/Required | Definition                |
|:-----------------------|:-------|:------------------|:--------------------------|
| addr                   | String | Optional          | The addr of the datanode. |

### Examples

#### Request

```bash
curl -X GET 'http://localhost:3002/admin/heartbeat?addr=127.0.0.1:4100'
```

#### Response

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

## /maintenance HTTP endpoint

The metasrv will ignore detected region failures when under maintenance. This is useful when the datanodes are planned to be unavailable for a short period of time; for example, rolling upgrade for datanodes.

### GET

The `/maintenance` endpoint accepts GET HTTP requests and you can use this endpoint to query the maintenance status of your metasrv instance.

```bash
curl -X GET http://localhost:3002/admin/maintenance
```

#### Request

```bash
curl -X GET http://localhost:3002/admin/maintenance
```

#### Response

```text
Maintenance mode is disabled
```

### PUT

The `/maintenance` endpoint accepts PUT HTTP requests and you can toggle the maintenance status of your metasrv instance.

```bash
curl -X PUT http://localhost:3002/admin/maintenance
```

| Query String Parameter | Type   | Optional/Required | Definition                |
|:-----------------------|:-------|:------------------|:--------------------------|
| enable                 | String | Required          | 'true' or 'false'         |

#### Request

```bash
curl -X PUT http://localhost:3002/admin/maintenance?enable=true
```

#### Response

```text
Maintenance mode enabled
```
