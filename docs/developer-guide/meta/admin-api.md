# Admin API

The Admin API provides a simple way to view cluster information, including meta health detection, meta leader query, database metadata query, and datanode heartbeat detection. 

The Admin API is an HTTP service that provides a set of RESTful APIs that can be called through HTTP requests. The Admin API is designed to be simple, easy to use and safe.

Available API:

- /health
- /leader
- /catalogs
- /schemas
- /tables
- /heartbeat

All these APIs are under the parent resource `/admin`.


The following sections assume your meta instance is running on localhost port 3002.

## /health HTTP endpoint  

The `/health` endpoint accepts Get HTTP requests. Use this endpoint to check the health of your meta instance.

### Definition

```bash
curl -X GET http://localhost:3002/admin/health
```

### Examples

```bash
curl -X GET http://localhost:3002/admin/health

OK
```

## /leader HTTP endpoint

The `/leader` endpoint accepts Get HTTP requests. Use this endpoint to query the leader's addr of your meta instance.

### Definition

```bash
curl -X GET http://localhost:3002/admin/leader
```

### Examples

```bash
curl -X GET http://localhost:3002/admin/leader

127.0.0.1:3002
```

## /catalogs HTTP endpoint

The `/catalogs` endpoint accepts Get HTTP requests. Use this endpoint to query the all the catalog's name.

### Definition

```bash
curl -X GET http://localhost:3002/admin/catalogs
```

### Examples

```bash
curl -X GET http://localhost:3002/admin/catalogs

["-greptime"]
```

## /schemas HTTP endpoint

The `/schemas` endpoint accepts Get HTTP requests. Use this endpoint to query all schemas of a specific catalog.

### Definition

```bash
curl -X GET http://localhost:3002/admin/schemas
```

| Query String Parameter | Type   | Optional/Required | Definition               |
|:-----------------------|:-------|:------------------|:-------------------------|
| catalog_name           | String | Required          | The name of the catalog. |


### Examples

```bash
curl -X GET 'http://localhost:3002/admin/schemas?catalog_name=greptime'

["-public"]
```

## /tables HTTP endpoint

The `/tables` endpoint accepts Get HTTP requests. Use this endpoint to query all tables of a specific catalog and schema.

Therefore, specify `catalog_name` and `schema_name` in the path is required

### Definition

```bash
curl -X GET http://localhost:3002/admin/tables
```

| Query String Parameter | Type   | Optional/Required | Definition               |
|:-----------------------|:-------|:------------------|:-------------------------|
| catalog_name           | String | Required          | The name of the catalog. |
| schema_name            | String | Required          | The name of the schema.  |

### Examples

```bash
curl -X GET `http://localhost:3002/admin/tables?catalog_name=greptime&schema_name=public`

["-dist_table"]
```

## /heartbeat HTTP endpoint

The `/heartbeat` endpoint accepts Get HTTP requests. Use this endpoint to query the heartbeat of all datanodes.

We can also query the heartbeat data of the datanode of the specified addr.

specify `addr` in the path is optional. 

### Definition

```bash
curl -X GET http://localhost:3002/admin/heartbeat
```

| Query String Parameter | Type   | Optional/Required | Definition                |
|:-----------------------|:-------|:------------------|:--------------------------|
| addr                   | String | Optional          | The addr of the datanode. |

### Examples

```bash
curl -X GET 'http://localhost:3002/admin/heartbeat?addr=127.0.0.1:4100'

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
