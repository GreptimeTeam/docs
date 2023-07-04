# gRPC

## 写入新数据

### Java
![Data Ingestion Process](../../../public/data-ingest-process.png)

使用下面的示例代码向 GreptimeDB 插入对象：

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

在写入数据之前，我们需要创建一个 `TableSchema` 对象然后使用它来构造 `WriteRows` 对象。由于 `TableSchema` 可以被重复使用，可以将它缓存起来防止重复构建。

当 `WriteRows` 被创建完成后，数据可以被添加到其中，但是此时这些数据仅仅存储在客户端内存中，还没有被发送到服务器。为了高效地插入多行数据，我们可以使用批量插入。在所有需要插入的数据都被添加到 `WriteRows` 后，调用它的 `finish` 方法来表示没有新数据要再被添加了，然后调用 DB 实例的 `write` 方法将数据发送到数据库中。在写入数据后，`Future` 对象会被返回，通过它的回调函数可以获取写入结果。

#### 写入 API

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
| rows                 | 要写入数据库的数据行（所有数据必须属于同一张表）。    |
| ctx                  | `ctx` 中的 KV 会被写到 gRPC 请求的 header 元数据中. |
| Result<WriteOk, Err> | 受 Rust 中 Result 的启发，其中 WriteOk 和 Err 只有一个是有意义的，另一个为空。如果调用成功，您可以从 WriteOk 中提取适当的信息，否则您需要从 Err 中提取有用的信息。                                                                                           |

### Go

首先，我们需要准备一个 `Series`，它代表了一行数据。`Series` 中有三种字段类型可供使用：

| Kind      | Description                                                         |
|-----------|---------------------------------------------------------------------|
| Tag       | 索引列，有助于更有效率地检索数据                                         |
| Field     | 值存储列, 用于数据分析、聚合、计算等                                     |
| Timestamp | 时间戳列，每一个时序表都必须有一个时间戳列                                |


然后，您可以将一个 `Series` 添加到 `Metric` 中，然后创建一个 `InsertRequest` 对象并调用 `client.Insert` 将数据存储到 GreptimeDB 中。

`Metric` 可以通过 `metric.SetTimePrecision` 更改 `Timestamp` 精度。以下是支持的选项：

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

<!-- TODO -->
<!-- ## Delete -->
 
