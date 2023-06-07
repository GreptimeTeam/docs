# 查询数据

## SQL

GreptimeDB 支持 SQL 语言，方便用户查询数据。下面以 `monitor` 查询为展示，方便用户熟悉使用 SQL 和 GreptimeDB 函数。
使用 `SELECT` 语句从 `monitor` 表中选择所有的数据，

```sql
SELECT * FROM monitor;
```

The query result looks like the following:

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2022-11-03 03:39:57 |  0.1 |    0.4 |
| 127.0.0.1 | 2022-11-03 03:39:58 |  0.5 |    0.2 |
| 127.0.0.2 | 2022-11-03 03:39:58 |  0.2 |    0.3 |
+-----------+---------------------+------+--------+
3 rows in set (0.00 sec)
```

使用 `count()` 函数来获得表格中所有行的数量：

```sql
SELECT count(*) FROM monitor;
```

```sql
+-----------------+
| COUNT(UInt8(1)) |
+-----------------+
|               3 |
+-----------------+
```

`avg()` 函数返回某个字段的平均值：

```sql
SELECT avg(cpu) FROM monitor;
```

```sql
+---------------------+
| AVG(monitor.cpu)    |
+---------------------+
| 0.26666666666666666 |
+---------------------+
1 row in set (0.00 sec)
```

使用 `GROUP BY` 子句，将具有相同数值的行分组为汇总行。

按 idc 分组的平均内存使用量：

```sql
SELECT host, avg(cpu) FROM monitor GROUP BY host;
```

```sql
+-----------+------------------+
| host      | AVG(monitor.cpu) |
+-----------+------------------+
| 127.0.0.2 |              0.2 |
| 127.0.0.1 |              0.3 |
+-----------+------------------+
2 rows in set (0.00 sec)
```

关于 `SELECT` 语句的更多信息，请参考 [SELECT](/reference/sql/select.md)。

### HTTP API

使用 POST 来查询数据：

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=select * from monitor' \
http://localhost:4000/v1/sql?db=public
```

结果如下：

```json
{
  "code": 0,
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "host",
              "data_type": "String"
            },
            {
              "name": "ts",
              "data_type": "TimestampMillisecond"
            },
            {
              "name": "cpu",
              "data_type": "Float64"
            },
            {
              "name": "memory",
              "data_type": "Float64"
            }
          ]
        },
        "rows": [
          ["127.0.0.1", 1667446797450, 0.1, 0.4],
          ["127.0.0.1", 1667446798450, 0.5, 0.2],
          ["127.0.0.2", 1667446798450, 0.2, 0.3]
        ]
      }
    }
  ],
  "execution_time_ms": 0
}
```

关于 SQL HTTP 请求的更多信息，请参考 [API](/reference/sql/http-api.md) 文档。

## gRPC

### Java

![Data Query Process](../../public/data-query-process.png)

使用以下代码来查询对象：

```java
QueryRequest request = QueryRequest.newBuilder()
    .exprType(SelectExprType.Sql) // Currently, only SQL is supported, and more query methods will be supported in the future
    .ql("SELECT * FROM monitor;")
    .build();

// For performance reasons, the SDK is designed to be purely asynchronous.
// The return value is a future object. If you want to immediately obtain
// the result, you can call `future.get()`.
CompletableFuture<Result<QueryOk, Err>> future = greptimeDB.query(request);
Result<QueryOk, Err> result = future.get();

if (result.isOk()) {
    QueryOk queryOk = result.getOk();
    SelectRows rows = queryOk.getRows();
    // `collectToMaps` will discard type information, if type information is needed,
    // please use `collect`.
    List<Map<String, Object>> maps = rows.collectToMaps();
    for (Map<String, Object> map : maps) {
        LOG.info("Query row: {}", map);
    }
} else {
    LOG.error("Failed to query: {}", result.getErr());
}
```

该代码将输出查询的细节，内容如下：

```
[main] INFO  QuickStart:114 - Query row: {memory=null, host=127.0.0.1, cpu=0.1, ts=2023-03-16T07:20:26.043}
[main] INFO  QuickStart:114 - Query row: {memory=null, host=127.0.0.1, cpu=0.1, ts=2023-03-16T07:21:48.050}
[main] INFO  QuickStart:114 - Query row: {memory=null, host=127.0.0.1, cpu=0.1, ts=2023-03-16T07:29:47.780}
[main] INFO  QuickStart:114 - Query row: {memory=0.5, host=127.0.0.2, cpu=0.3, ts=2023-03-16T07:20:26.096}
[main] INFO  QuickStart:114 - Query row: {memory=0.5, host=127.0.0.2, cpu=0.3, ts=2023-03-16T07:21:48.103}
[main] INFO  QuickStart:114 - Query row: {memory=0.5, host=127.0.0.2, cpu=0.3, ts=2023-03-16T07:29:47.882}
```

#### 查询 API

```java
/**
 * According to the conditions, query data from the DB.
 *
 * @param req the query request
 * @param ctx invoke context
 * @return query result
 */
CompletableFuture<Result<QueryOk, Err>> query(QueryRequest req, Context ctx);
```

### Go

首先，用户必须准备一个 `QueryRequest`，然后通过以下语法检索数据：

- SQL
- PromQL (TODO)
- RangePromQL

```go
func Query() {
    // Query with metric via Sql, you can do it via PromQL
    queryRequest := greptime.QueryRequest{}
    // if you want to specify another database, you can specify it via: `WithDatabase(database)`
    queryRequest.WithSql("SELECT * FROM monitor") // .WithDatabase(database)

    resMetric, err := client.Query(context.Background(), queryRequest)
    if err != nil {
        fmt.Printf("fail to query, err: %+v\n", err)
        return
    }

    type Monitor struct {
        host   string
        cpu    float64
        memory int64
        ts     time.Time
    }

    monitors := []Monitor{}
    for _, series := range resMetric.GetSeries() {
        monitor := Monitor{}
        host, exist := series.Get("host") // you can directly call Get and do the type assertion
        if exist {
            monitor.host = host.(string)
        }
        monitor.cpu, _ = series.GetFloat("cpu")     // also, you can directly GetFloat
        monitor.memory, _ = series.GetInt("memory") // also, you can directly GetInt
        monitor.ts = series.GetTimestamp()          // GetTimestamp
        monitors = append(monitors, monitor)
    }
    fmt.Println(monitors)
}
```

## PromQL

参考 [Prometheus 查询语言](./prometheus.md#prometheus-query-language)以了解如何查询数据。
