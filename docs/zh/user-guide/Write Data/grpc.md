# 写入

## gRPC

### Java

![Data Ingestion Process](../../public/data-ingest-process.png)

使用下面的代码来向 GreptimeDB 插入一个对象（object）：

```java
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

#### 写入 API

```java
/**
 * Write a single table multi rows data to database.
 *
 * @param rows rows with one table
 * @param ctx  invoke context
 * @return write result
 */
CompletableFuture<Result<WriteOk, Err>> write(WriteRows rows, Context ctx);
```

| Name                 | Description                                                                                                                                                                                                                                |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| rows                 | Several rows of data to write to the database (all data must belong to the same table).                                                                                                                                                    |
| ctx                  | The KV in ctx will be written to the gRPC headers metadata then sent to GreptimeDB server.                                                                                                                                                 |
| Result<WriteOk, Err> | Inspired by Result in Rust, where WriteOk and Err only one is meaningful and the other is empty.If the call succeeds, you can extract the appropriate information from WriteOk, otherwise you need to extract useful information from Err. |

### Go

首先，我们必须准备一个 `Series`，它代表了一行数据。在 `Series` 中可以使用三种字段：

| Kind      | Description                                                         |
| --------- | ------------------------------------------------------------------- |
| Tag       | index column, helps to retrieve data more efficiently               |
| Field     | value column, helps to analysis, aggregation, calculating, etc,.    |
| Timestamp | timestamp column, each table MUST have exactly one timestamp column |

然后，用户可以在 `Metric` 中添加一个 `Series`，创建一个 `InsertRequest` 并调用 `client.Insert` 将数据存入 GreptimeDB。

`Metric` 可以通过 `metric.SetTimePrecision` 改变 `Timestamp` 精度。以下是支持的选项：

| Precision        | Description |
| ---------------- | ----------- |
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