# 数据写入

想要了解如何向 GreptimeDB 写入数据，在进行以下操作之前需要先[进行连接](./clients.md#connect)。

## 自动模式生成
GreptimeDB 提供了 schemaless 的写入方式，自动生成表结构，这样你就不需要提前创建表。当使用 [gRPC](#grpc)、[InfluxDB](#influxdb-line-protocol)、[OpenTSDB](#opentsdb-line-protocol) 和 [Prometheus remote write](#prometheus) 协议写入数据时，表和列将被自动创建和添加。必要时，GreptimeDB 会自动添加所需的列，以确保正确保存用户的数据。

## 写入

### gRPC

#### Java
![Data Ingestion Process](../public/data-ingest-process.png)

使用下面的代码来向 GreptimeDB 插入一个对象（object）：

``` java
TableSchema tableSchema = TableSchema.newBuilder(TableName.with("db_name", "monitor"))
    .semanticTypes(SemanticType.Tag, SemanticType.Timestamp, SemanticType.Field, SemanticType.Field)
    .dataTypes(ColumnDataType.String, ColumnDataType.Int64, ColumnDataType.Float64, ColumnDataType.Float64)
    .columnNames("host", "ts", "cpu", "memory")
    .build();

WriteRows rows = WriteRows.newBuilder(tableSchema).build();

rows.insert("127.0.0.1", System.currentTimeMillis(), 0.1, null)
    .insert("127.0.0.2", System.currentTimeMillis(), 0.3, 0.5)
    .finish();

CompletableFuture<Result<WriteOk, Err>> writeFuture = greptimeDB.write(rows);

writeFuture.whenComplete((result, throwable) -> {
    if (throwable != null) {
        throwable.printStackTrace();
    } else {
        System.out.println(result);
    }
});
```

首先，必须创建一个 `TableSchema`，然后用它来构造一个 `WriteRows` 对象。由于 `TableSchema` 可以被重复使用，缓存它可以防止重复构建。

一旦 `WriteRows` 对象被创建，就可以向其添加数据。然而，这些数据只是存储在内存中，还没有被发送到服务器上。为了有效地插入多行，可以使用批量插入。当所有需要的数据都被添加到 `WriteRows` 中后，记得在把数据发送到服务器之前调用它的 `finish` 方法。

在对完成的 `WriteRows` 调用 `write` 方法后，将返回一个 future，允许我们通过其回调函数获得写入结果。

##### 写入 API

``` java
/**
 * Write a single table multi rows data to database.
 *
 * @param rows rows with one table
 * @param ctx  invoke context
 * @return write result
 */
CompletableFuture<Result<WriteOk, Err>> write(WriteRows rows, Context ctx);
```

| Name                 | Description                                                                                |
|:---------------------|:-------------------------------------------------------------------------------------------|
| rows                 | Several rows of data to write to the database (all data must belong to the same table).    |
| ctx                  | The KV in ctx will be written to the gRPC headers metadata then sent to GreptimeDB server. |
| Result<WriteOk, Err> | Inspired by Result in Rust, where WriteOk and Err only one is meaningful and the other is empty.If the call succeeds, you can extract the appropriate information from WriteOk, otherwise you need to extract useful information from Err.                                                                                           |

### Go

首先，我们必须准备一个 `Series`，它代表了一行数据。在 `Series` 中可以使用三种字段：

| Kind      | Description                                                         |
|-----------|---------------------------------------------------------------------|
| Tag       | index column, helps to retrieve data more efficiently               |
| Field     | value column, helps to analysis, aggregation, calculating, etc,.    |
| Timestamp | timestamp column, each table MUST have exactly one timestamp column |

然后，用户可以在 `Metric` 中添加一个 `Series`，创建一个 `InsertRequest` 并调用 `client.Insert` 将数据存入 GreptimeDB。

`Metric` 可以通过 `metric.SetTimePrecision` 改变 `Timestamp` 精度。以下是支持的选项：

| Precision        | Description |
|------------------|-------------|
| time.Second      |             |
| time.Millisecond | default     |
| time.Microsecond |             |
| time.Nanosecond  |             |


```go
func Insert() {
    series := greptime.Series{}              // Create one row of data
    series.AddStringTag("host", "localhost") // add index column, for query efficiency
    series.AddFloatField("cpu", 0.90)        // add value column
    series.AddIntField("memory", 1024)       // add value column
    series.SetTimestamp(time.Now())          // requird

    metric := greptime.Metric{} // Create a Metric and add the Series
    metric.AddSeries(series)
    // metric.SetTimePrecision(time.Second)  // default is Millisecond
    // metric.SetTimestampAlias("timestamp") // default is 'ts'


    // Create an InsertRequest using fluent style
    // the specified table will be created automatically if it's not exist
    insertRequest := greptime.InsertRequest{}
    // if you want to specify another database, you can specify it via: `WithDatabase(database)`
    insertRequest.WithTable("monitor").WithMetric(metric) // .WithDatabase(database)

    // Fire the real Insert request and Get the affected number of rows
    n, err := client.Insert(context.Background(), insertRequest)
    if err != nil {
        fmt.Printf("fail to insert, err: %+v\n", err)
        return
    }
    fmt.Printf("AffectedRows: %d\n", n)
}
```

### SQL

#### `INSERT` 语句

向之前创建的 system_metrics 表插入一些测试数据。可以使用 INSERT INTO SQL 语句：

``` sql
INSERT INTO monitor
VALUES
    ("127.0.0.1", 1667446797450, 0.1, 0.4),
    ("127.0.0.2", 1667446798450, 0.2, 0.3),
    ("127.0.0.1", 1667446798450, 0.5, 0.2);
```
```sql
Query OK, 3 rows affected (0.01 sec)
```

通过上述语句，我们向 `system_metrics` 表插入了三条记录。

关于 `INSERT` 语句的更多信息，请参考 SQL 参考文档。


#### HTTP API

使用 POST 来插入数据：

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=INSERT INTO monitor VALUES ("127.0.0.1", 1667446797450, 0.1, 0.4), ("127.0.0.2", 1667446798450, 0.2, 0.3), ("127.0.0.1", 1667446798450, 0.5, 0.2)' \
http://localhost:4000/v1/sql?db=public
```

结果如下：

```json
{"code":0,"output":[{"affectedrows":3}],"execution_time_ms":0}
```

请参考 [API](/reference/sql/http-api.md) 文档获取有关 SQL HTTP 请求的更多信息。

### InfluxDB Line 协议

GreptimeDB 支持 HTTP InfluxDB Line 协议。你可以通过 `/influxdb/write` API 来写入数据：

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&precision=ms" \
--data-binary \
'system_metrics,host=host1,idc=idc_a cpu_util=11.8,memory_util=10.3,disk_util=10.3 1667446797450
 system_metrics,host=host2,idc=idc_a cpu_util=80.1,memory_util=70.3,disk_util=90.0 1667446797450
 system_metrics,host=host1,idc=idc_b cpu_util=50.0,memory_util=66.7,disk_util=40.6 1667446797450'
```

`/influxdb/write` 支持的查询参数包括：

* `db` 指定要写入的数据库，默认为 `public`。
* `precision`，行协议中时间戳的精度。支持 `ns`（纳秒）、`us`（微秒）、`ms`（毫秒）和 `s`（秒），默认为纳秒。

### OpenTSDB Line 协议

GreptimeDB 支持通过 Telnet 或 HTTP API 写入 OpenTSDB Line。

#### Telnet

GreptimeDB 完全支持 OpenTSDB 的 "put" 命令格式：

`put <metric> <timestamp> <value> <tagk1=tagv1[tagk2=tagv2...tagkN=tagvN]>`

可以通过 `put` 来输入指标：

```shell
~ % telnet 127.0.0.1 4242
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
put sys.cpu.system 1667892080 3 host=web01 dc=hz
put sys.cpu.system 1667892080 2 host=web02 dc=hz
put sys.cpu.system 1667892080 2 host=web03 dc=hz
put sys.cpu.system 1667892081 1 host=web01
put sys.cpu.system 1667892081 4 host=web04 dc=sh
put sys.cpu.system 1667892082 10 host=web10 dc=sh
quit
Connection closed by foreign host.
~ %
```

GreptimeDB 将每个指标作为一个独立的表，并对其列进行标记。`greptime_timestamp` 和 `greptime_value` 是两个保留列，对应于时间戳和值。

GreptimeDB 会在放置指标后自动创建指标表，所以不需要
手动创建表。

> 注意只有 "put" 命令被支持，其他命令如 "histogram"或 "stats"
> 不被支持。

#### HTTP API

GreptimeDB 也支持通过 HTTP 接口写入 OpenTSDB 指标。我们使用 OpenTSDB 的 `/api/put` 中描述的请求和
响应格式。

GreptimeDB 中处理指标的 HTTP 接口是 `/opentsdb/api/put`。

> 注意：记得在路径前加上 GreptimeDB 的 http API 版本，`v1`。

启动 GreptimeDB，HTTP 服务器默认监听端口为 `4000`。

使用 curl 插入一个指标点：

```shell
curl -X POST http://127.0.0.1:4000/v1/opentsdb/api/put -d '
{
    "metric": "sys.cpu.nice",
    "timestamp": 1667898896,
    "value": 18,
    "tags": {
       "host": "web01",
       "dc": "hz"
    }
}
'
```

或者插入多个指标点：

```shell
curl -X POST http://127.0.0.1:4000/v1/opentsdb/api/put -d '
[
    {
        "metric": "sys.cpu.nice",
        "timestamp": 1667898896,
        "value": 1,
        "tags": {
           "host": "web02",
           "dc": "hz"
        }
    },
    {
        "metric": "sys.cpu.nice",
        "timestamp": 1667898897,
        "value": 9,
        "tags": {
           "host": "web03",
           "dc": "sh"
        }
    }
]
'
```

### Prometheus

请参考 [Prometheus Storage](./prometheus.md#storage)。

## Delete

### SQL

#### `DELETE` 语句

通过主键 `host` 和时间戳索引 `ts` 从其中删除一条记录：
```sql
DELETE FROM monitor WHERE host='127.0.0.2' and ts=1667446798450;
```

```sql
Query OK, 1 row affected (0.00 sec)
```

关于 `DELETE` 语句的更多信息，请参考 [SQL DELETE](/reference/sql/delete.md)。

#### HTTP API

使用 POST 来删除数据：

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "sql=DELETE FROM monitor WHERE host = '127.0.0.2' and ts = 1667446798450" \
http://localhost:4000/v1/sql?db=public
```

结果如下：

```json
{"code":0,"output":[{"affectedrows":1}],"execution_time_ms":1}
```

关于 SQL HTTP 请求的更多信息，请参考 [API](/reference/sql/http-api.md) 文档。

