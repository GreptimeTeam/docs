# Java

## 写入新数据

![Data Ingestion Process](/data-ingest-process.png)

使用下面的示例代码向 GreptimeDB 插入对象：

``` java
TableSchema tableSchema = TableSchema.newBuilder(TableName.with("public" /* db name */, "monitor"))
    .semanticTypes(SemanticType.Tag, SemanticType.Timestamp, SemanticType.Field, SemanticType.Field)
    .dataTypes(ColumnDataType.String, ColumnDataType.Int64, ColumnDataType.Float64, ColumnDataType.Float64)
    .columnNames("host", "ts", "cpu", "memory")
    .build();

WriteRows rows = WriteRows.newBuilder(tableSchema).build();
long now = System.currentTimeMillis();

rows.insert("127.0.0.1", now, 0.1, null)
    .insert("127.0.0.2", now, 0.3, 0.5)
    .finish();

CompletableFuture<Result<WriteOk, Err>> writeFuture = greptimeDB.write(rows);

Result<WriteOk, Err> result = future.get();

if (result.isOk()) {
    LOG.info("Write result: {}", result.getOk());
} else {
    LOG.error("Failed to write: {}", result.getErr());
}
```

也可以使用 StreamWriter API 来写入数据：

``` java
TableName tableName = TableName.with("public" /* db name */, "monitor");
TableSchema
        .newBuilder(tableName)
        .semanticTypes(SemanticType.Tag, SemanticType.Timestamp, SemanticType.Field, SemanticType.Field)
        .dataTypes(ColumnDataType.String, ColumnDataType.TimestampMillisecond, ColumnDataType.Float64, ColumnDataType.Float64)
        .columnNames("host", "ts", "cpu", "memory")
        .buildAndCache(); // cache for reuse

StreamWriter<WriteRows, WriteOk> streamWriter = greptimeDB.streamWriter();

for (int i = 0; i < 100; i++) {
    WriteRows rows = WriteRows.newBuilder(TableSchema.findSchema(tableName)).build();
    rows.insert("127.0.0.1", now + i, i, null).finish();

    streamWriter.write(rows);
}

CompletableFuture<WriteOk> future = streamWriter.completed();

WriteOk result = future.get();

LOG.info("Write result: {}", result);
```

在写入数据之前，我们需要创建一个 `TableSchema` 对象然后使用它来构造 `WriteRows` 对象。由于 `TableSchema` 可以被重复使用，可以将它缓存起来防止重复构建。

当 `WriteRows` 被创建完成后，数据可以被添加到其中，但是此时这些数据仅仅存储在客户端内存中，还没有被发送到服务器。为了高效地插入多行数据，我们可以使用批量插入。在所有需要插入的数据都被添加到 `WriteRows` 后，调用它的 `finish` 方法来表示没有新数据要再被添加了，然后调用 DB 实例的 `write` 方法将数据发送到数据库中。在写入数据后，`Future` 对象会被返回，通过它的回调函数可以获取写入结果，也可以通过 `future.get()` 来同步的获得结果。

如果你需要插入大量数据，可以考虑使用 `StreamWriter` 来提高写入性能。`StreamWriter` 会持续地将数据通过 `stream` 写入数据库。写入完成后，你需要调用 `completed` 方法关闭 `stream` 并等待数据库返回写入是否成功的信息。 （提示：尽管每个 `WriteRows` 只能包含一个表的数据，但一个 `StreamWrite` 实例可以分批写入多个 `WriteRows`，这意味着 `StreamWrite` 支持多表数据的导入。）

### 写入 API

``` java
/**
 * Write a single table multi rows data to database.
 *
 * @param rows rows with one table
 * @param ctx  invoke context
 * @return write result
 */
CompletableFuture<Result<WriteOk, Err>> write(WriteRows rows, Context ctx);

/**
 * Create a streaming for write.
 *
 * @param maxPointsPerSecond The max number of points that can be written per second,
 *                           exceeding which may cause blockage.
 * @param ctx invoke context
 * @return a stream writer instance
 */
StreamWriter<WriteRows, WriteOk> streamWriter(int maxPointsPerSecond, Context ctx);
```

| Name                 | Description                                                                                |
|:---------------------|:-------------------------------------------------------------------------------------------|
| rows                 | 要写入数据库的数据行（所有数据必须属于同一张表）。    |
| ctx                  | `ctx` 中的 KV 会被写到 gRPC 请求的 header 元数据中. |
| Result<WriteOk, Err> | 受 Rust 中 Result 的启发，其中 WriteOk 和 Err 只有一个是有意义的，另一个为空。如果调用成功，您可以从 WriteOk 中提取适当的信息，否则您需要从 Err 中提取有用的信息。|
| maxPointsPerSecond | 限流参数：每秒可写入的最大点数，超过限制会被阻塞 |

<!-- TODO -->
<!-- ## Delete -->
 