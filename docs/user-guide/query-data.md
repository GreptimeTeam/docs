# Query data

## SQL

GreptimeDB supports full SQL for you to query data from a database. Here are some query examples for the `system_metrics` so you can get familiar with using SQL alongside GreptimeDB functions.
To select all the data from the `system_metrics` table, use the `SELECT` statement:

``` sql
SELECT * FROM system_metrics;
```

The query result looks like the following:

```
+-------+-------+----------+-------------+-----------+---------------------+
| host  | idc   | cpu_util | memory_util | disk_util | ts                  |
+-------+-------+----------+-------------+-----------+---------------------+
| host1 | idc_a |     11.8 |        10.3 |      10.3 | 2022-11-03 03:39:57 |
| host1 | idc_b |       50 |        66.7 |      40.6 | 2022-11-03 03:39:57 |
| host2 | idc_a |     80.1 |        70.3 |        90 | 2022-11-03 03:39:57 |
+-------+-------+----------+-------------+-----------+---------------------+
```

You can use the `count()` function to get the number of all rows in the table:

``` sql
SELECT count(*) FROM system_metrics;
```

```
+-----------------+
| COUNT(UInt8(1)) |
+-----------------+
|               3 |
+-----------------+
```

The `avg()` function returns the average value of a certain field:

``` sql
SELECT avg(cpu_util) FROM system_metrics;
```

```
+------------------------------+
| AVG(system_metrics.cpu_util) |
+------------------------------+
|            47.29999999999999 |
+------------------------------+
```

You can use the `GROUP BY` clause to group rows that have the same values into summary rows.
The average memory usage grouped by idc:

```sql
SELECT idc, avg(memory_util) FROM system_metrics GROUP BY idc;
```

```
+-------+---------------------------------+
| idc   | AVG(system_metrics.memory_util) |
+-------+---------------------------------+
| idc_a |                            40.3 |
| idc_b |                            66.7 |
+-------+---------------------------------+
```

For more information about the `SELECT` statement, please refer to [SELECT](/reference/sql/select.md).

### HTTP API

Use GET method to query data:

```shell
curl -G  http://localhost:4000/v1/sql  --data-urlencode "sql=select * from numbers limit 5"
```

use POST method to query data:

```shell
curl http://localhost:4000/v1/sql -d "sql=select * from numbers limit 5"
```

The result is shown below:

```json
{
  "code": 0,
  "output": [{
    "records": {
      "schema": {
        "column_schemas": [
          {
            "name": "number",
            "data_type": "UInt32"
          }
        ]
      },
      "rows": [
        [0],
        [1],
        [2],
        [3],
        [4]
      ]
    }
  }],
  "execution_time_ms": 2
}

```

## gRPC

### Java

![Data Query Process](../public/data-query-process.png)

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

#### Query API

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

### Go

To begin with, you have to prepare a `QueryRequest`, and you can retrieve data from GreptimeDB via:

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

See [Prometheus Query Language](./prometheus.md#prometheus-query-language) to know how to query data.
