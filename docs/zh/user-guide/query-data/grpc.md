# gRPC

## Java

![Data Query Process](../../../public/data-query-process.png)

使用下方的实力代码来查询数据：

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

The code will output the details of querying which will look something like this:

```
[main] INFO  QuickStart:114 - Query row: {memory=null, host=127.0.0.1, cpu=0.1, ts=2023-03-16T07:20:26.043}
[main] INFO  QuickStart:114 - Query row: {memory=null, host=127.0.0.1, cpu=0.1, ts=2023-03-16T07:21:48.050}
[main] INFO  QuickStart:114 - Query row: {memory=null, host=127.0.0.1, cpu=0.1, ts=2023-03-16T07:29:47.780}
[main] INFO  QuickStart:114 - Query row: {memory=0.5, host=127.0.0.2, cpu=0.3, ts=2023-03-16T07:20:26.096}
[main] INFO  QuickStart:114 - Query row: {memory=0.5, host=127.0.0.2, cpu=0.3, ts=2023-03-16T07:21:48.103}
[main] INFO  QuickStart:114 - Query row: {memory=0.5, host=127.0.0.2, cpu=0.3, ts=2023-03-16T07:29:47.882}
```

### 查询 API

``` java
/**
 * According to the conditions, query data from the DB.
 *
 * @param req the query request
 * @param ctx invoke context
 * @return query result
 */
CompletableFuture<Result<QueryOk, Err>> query(QueryRequest req, Context ctx);
```

## Go

在进行查询之前，需要先构造 `QueryRequest` 对象，然后通过以下语言查询 GreptimeDB 中的数据：

- SQL
- PromQL (TODO)
- RangePromQL

例如使用 `SQL` 查询：

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