# Java

## Insert

![Data Ingestion Process](/data-ingest-process.png)

Use the following code to insert an object to GreptimeDB:

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

You can also use the StreamWriter API to write data:

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

To begin, we must create a `TableSchema` and then use it to construct a `WriteRows` object. Since the `TableSchema` can be reused, caching it can prevent unnecessary construction.

Once the `WriteRows` object is created, data can be added to it. However, this data is only stored in memory and has not yet been sent to the server. To insert multiple rows efficiently, we use batch insertion. Once all desired data has been added to the `WriteRows`, remember to call its `finish` method before sending it to the server.

After calling the `write` method on our completed `WriteRows`, a future will be returned which allows us to obtain write results through its callback function.

If you need to insert a large amount of data, consider using `StreamWriter` to enhance write performance. `StreamWriter` persistently writes data to the database using a `stream`. Once the writing is complete, you should invoke the `completed` method to close the `stream` and await the database's confirmation of write success. (Tip: Even though each `WriteRows` can only contain data from a single table, a `StreamWrite` instance can write multiple `WriteRows` simultaneously. This means that `StreamWrite` supports multi-table data import.)

### Write API

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
| rows                 | Several rows of data to write to the database (all data must belong to the same table).    |
| ctx                  | The KV in ctx will be written to the gRPC headers metadata then sent to GreptimeDB server. |
| Result<WriteOk, Err> | Inspired by Result in Rust, where WriteOk and Err only one is meaningful and the other is empty.If the call succeeds, you can extract the appropriate information from WriteOk, otherwise you need to extract useful information from Err.                                                                                           |
| maxPointsPerSecond | The max number of points that can be written per second, exceeding which may cause blockage.                                                                                          |

<!-- TODO: DELETE -->
