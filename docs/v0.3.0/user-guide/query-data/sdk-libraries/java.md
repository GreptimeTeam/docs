# Java

![Data Query Process](/data-query-process.png)

Use the following code to query objects:

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

## Query API

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


