# Java

## 写入新数据

![Data Ingestion Process](/data-ingest-process.png)

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
```

| Name                 | Description                                                                                |
|:---------------------|:-------------------------------------------------------------------------------------------|
| rows                 | 要写入数据库的数据行（所有数据必须属于同一张表）。    |
| ctx                  | `ctx` 中的 KV 会被写到 gRPC 请求的 header 元数据中. |
| Result<WriteOk, Err> | 受 Rust 中 Result 的启发，其中 WriteOk 和 Err 只有一个是有意义的，另一个为空。如果调用成功，您可以从 WriteOk 中提取适当的信息，否则您需要从 Err 中提取有用的信息。

<!-- TODO -->
<!-- ## Delete -->
 