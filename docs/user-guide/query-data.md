# Query data

## SQL

GreptimeDB supports full SQL for you to query data from a database. Here are some query examples for the `monitor` so you can get familiar with using SQL alongside GreptimeDB functions.
To select all the data from the `monitor` table, use the `SELECT` statement:

``` sql
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

You can use the `count()` function to get the number of all rows in the table:

``` sql
SELECT count(*) FROM monitor;
```

```sql
+-----------------+
| COUNT(UInt8(1)) |
+-----------------+
|               3 |
+-----------------+
```

The `avg()` function returns the average value of a certain field:

``` sql
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

You can use the `GROUP BY` clause to group rows that have the same values into summary rows.
The average memory usage grouped by idc:

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

For more information about the `SELECT` statement, please refer to [SELECT](/reference/sql/select.md).

### HTTP API

Use POST method to query data:

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=select * from monitor' \
http://localhost:4000/v1/sql?db=public
```

The result is shown below:

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
          [
            "127.0.0.1",
            1667446797450,
            0.1,
            0.4
          ],
          [
            "127.0.0.1",
            1667446798450,
            0.5,
            0.2
          ],
          [
            "127.0.0.2",
            1667446798450,
            0.2,
            0.3
          ]
        ]
      }
    }
  ],
  "execution_time_ms": 0
}
```

For more information about SQL HTTP request, please refer to [API document](/reference/sql/http-api.md).

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

<!-- ### Go
TODO -->


## PromQL

See [Prometheus Query Language](./prometheus.md#prometheus-query-language) to know how to query data.
