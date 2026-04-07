---
keywords: [请求容量单位, WCU, RCU, 计算方法, 优化建议, 数据类型, HTTP 响应]
description: 详细介绍 GreptimeCloud 的请求容量单位算法，包括 WCU 和 RCU 的计算方法和优化建议。
---

# 请求容量单位

本文档将介绍 GreptimeCloud 的请求容量单位算法。你可以前往 [GreptimeCloud 控制台](https://console.greptime.cloud/) 监控服务的使用情况。
所有对 GreptimeCloud 的请求都是以容量单位来衡量的，容量单位反映了请求的大小和复杂程度。写容量单位和读容量单位的计算方法不同，详情请见下文。

### Write Capacity Unit (WCU)

每个写入数据到表的 API 调用都是一个写请求。WCU 是根据一次请求中插入行的总大小来计算的。一个标准的 WCU 可以写入不超过 1 KB 的行数据。对于大于 1 KB 的数据，需要额外的 WCU。

:::tip 注意
WCU 的容量可能会在未来发生变化。
:::

每个请求的大小根据以下步骤计算：

1. 获取表结构中每个列的数据类型的大小。你可以在 [数据类型](/reference/sql/data-types.md) 文档中找到有关每个数据类型大小的详细信息。
2. 计算请求中所有列的大小之和。如果请求中不存在某列，则其大小取决于该列的默认值。如果默认值为 null，则大小为 0；否则，它是该列数据类型的大小。
3. 行数据的总和乘以要写入的行数。

这是一个具有以下表结构的 WCU 计算示例：

```shell
+-------------+----------------------+------+------+---------------------+---------------+
| Column      | Type                 | Key  | Null | Default             | Semantic Type |
+-------------+----------------------+------+------+---------------------+---------------+
| host        | String               | PRI  | YES  |                     | TAG           |
| idc         | String               | PRI  | YES  |                     | TAG           |
| cpu_util    | Float64              |      | YES  |                     | FIELD         |
| memory_util | Float64              |      | YES  |                     | FIELD         |
| disk_util   | Float64              |      | YES  |                     | FIELD         |
| ts          | TimestampMillisecond | PRI  | NO   | current_timestamp() | TIMESTAMP     |
+-------------+----------------------+------+------+---------------------+---------------+
```

你有一个这样的写请求：

```shell
INSERT INTO system_metrics VALUES ("host1", "a", 11.8, 10.3, 10.3, 1667446797450);
```

根据表结构中数据类型的大小，每行数据的大小为 38 字节（5+1+8+8+8+8），根据计算算法，此请求的 WCU 为 1。为了减少 WCU，可以使用批量的 `INSERT` 语句在单个语句中插入多行数据，而不是每行数据都发送一个单独的请求。例如：

```shell
INSERT INTO system_metrics
VALUES
    ("host1", "idc_a", 11.8, 10.3, 10.3, 1667446797450),
    ("host1", "idc_a", 80.1, 70.3, 90.0, 1667446797550),
    # ...... 22 rows
    ("host1", "idc_b", 90.0, 39.9, 60.6, 1667446798250);
```

该请求的大小为 950 字节（38 x 25）。此请求的 WCU 为 1。如果你在单个语句中插入 40 行数据，则大小为 1520 字节（38 x 40），此请求的 WCU 为 2。

### Read Capacity Unit (RCU)

从表中读取数据的每个 API 调用都是一个读请求。

RCU 是在服务器内存中扫描和加载的数据大小。
一个标准的读容量单位可以扫描最多 1MB 的数据。
对于扫描的数据大于 1MB，需要额外的读容量单位。

:::tip 注意
RCU 的容量可能会在未来发生变化。
:::

假如有一个读请求扫描 2.5MB 的数据。根据计算规则该请求的 RCU 为 3。

为了降低 RCU，可以仔细设计表结构和查询请求。以下是一些建议：

- 使用索引以支持在 GreptimeDB 中高效地执行查询。如果没有索引，GreptimeDB 必须扫描整个表来处理查询。如果索引与查询匹配，GreptimeDB 可以使用索引来限制扫描的数据。请考虑使用具有高区分度的列作为主键，并在 `WHERE` 子句中使用它。
- 选择使用匹配结果较少的查询。例如，时间索引字段和高区分度的标签字段上的相等匹配可以有效地限制扫描的数据大小。请注意，不等运算符 `!=` 无法做到有效查询，因为它总是会扫描所有数据。

## 通过 HTTP 响应监控 CU 使用情况

GreptimeCloud 通过 HTTP 响应头提供 CU（Capacity Unit）使用信息，此功能能够方便地跟踪请求的 CU 消耗。例如，当使用如下命令进行写入请求时：

```bash
curl -s -i -XPOST -w '\n' \
    "https://<host>/v1/influxdb/api/v2/write?db=<dbname>&precision=ms&u=<username>&p=<password>" \
    --data-binary \
    'monitor,host=127.0.0.1 cpu=0.1,memory=0.4 1667446797450
     monitor,host=127.0.0.2 cpu=0.2,memory=0.3 1667446798450
     monitor,host=127.0.0.1 cpu=0.5,memory=0.2 1667446798450'
```

响应头将包括如下信息：

```
HTTP/2 204 
date: Wed, 10 Apr 2024 03:29:36 GMT
x-greptime-metrics: {"greptime_cloud_wcu":1}
strict-transport-security: max-age=15724800; includeSubDomains
access-control-allow-origin: *
access-control-allow-credentials: true
access-control-allow-methods: OPTIONS
access-control-allow-headers: DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization
access-control-max-age: 1728000
```

可以看到，`x-greptime-metrics` 展示了 `greptime_cloud_wcu` 的值，指示了该写入请求的消耗 WCU。类似地，对于读取请求，你可以查看 `greptime_cloud_rcu`。此功能提供了请求对 CU 利用情况的信息，有助于更好地管理并优化资源。


## 用量统计

你可以在 [GreptimeCloud 控制台](https://console.greptime.cloud/) 查看用量。
最大 WCU 和 RCU 的使用情况将按时间范围进行聚合，并在用量图表中呈现。
