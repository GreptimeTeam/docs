# Admin API

The Admin API provides a simple way to view cluster information, including metasrv health detection, metasrv leader query, database metadata query, and datanode heartbeat detection.

The Admin API is an HTTP service that provides a set of RESTful APIs that can be called through HTTP requests. The Admin API is simple, user-friendly and safe.
Available APIs:

- /health
- /leader
- /catalogs
- /schemas
- /tables
- /heartbeat

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

## /catalogs HTTP endpoint

The `/catalogs` endpoint accepts GET HTTP requests and you can use this endpoint to query the all the catalog's name.

### Definition

```bash
curl -X GET http://localhost:3002/admin/catalogs
```

### Examples

#### Request

```bash
curl -X GET http://localhost:3002/admin/catalogs
```

#### Response

```json
["greptime"]
```

## /schemas HTTP endpoint

The `/schemas` endpoint accepts GET HTTP requests and you can use this endpoint to query all schemas of a specific catalog.

### Definition

```bash
curl -X GET http://localhost:3002/admin/schemas
```

| Query String Parameter | Type   | Optional/Required | Definition               |
|:-----------------------|:-------|:------------------|:-------------------------|
| catalog_name           | String | Required          | The name of the catalog. |

### Examples

#### Request

```bash
curl -X GET 'http://localhost:3002/admin/schemas?catalog_name=greptime'
```

#### Response

```json
["public"]
```

## /tables HTTP endpoint

The `/tables` endpoint accepts GET HTTP requests and you can use this endpoint to query all tables of a specific catalog and schema.

Therefore, it is required to specify `catalog_name` and `schema_name` in the path.

### Definition

```bash
curl -X GET http://localhost:3002/admin/tables
```

| Query String Parameter | Type   | Optional/Required | Definition               |
|:-----------------------|:-------|:------------------|:-------------------------|
| catalog_name           | String | Required          | The name of the catalog. |
| schema_name            | String | Required          | The name of the schema.  |

### Examples

#### Request

```bash
curl -X GET `http://localhost:3002/admin/tables?catalog_name=greptime&schema_name=public`
```

#### Response

```json
["dist_table"]
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
