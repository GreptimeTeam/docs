# gRPC

## Insert

### Java
![Data Ingestion Process](../../public/data-ingest-process.png)

Use the following code to insert an object to GreptimeDB:

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

To begin, we must create a `TableSchema` and then use it to construct a `WriteRows` object. Since the `TableSchema` can be reused, caching it can prevent unnecessary construction.

Once the `WriteRows` object is created, data can be added to it. However, this data is only stored in memory and has not yet been sent to the server. To insert multiple rows efficiently, we use batch insertion. Once all desired data has been added to the `WriteRows`, remember to call its `finish` method before sending it to the server.

After calling the `write` method on our completed `WriteRows`, a future will be returned which allows us to obtain write results through its callback function.

#### Write API

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
| rows                 | Several rows of data to write to the database (all data must belong to the same table).    |
| ctx                  | The KV in ctx will be written to the gRPC headers metadata then sent to GreptimeDB server. |
| Result<WriteOk, Err> | Inspired by Result in Rust, where WriteOk and Err only one is meaningful and the other is empty.If the call succeeds, you can extract the appropriate information from WriteOk, otherwise you need to extract useful information from Err.                                                                                           |

### Go

To begin with, we have to prepare a `Series`, which delegates one row data. There are three kind fields in `Series` you can use:

| Kind      | Description                                                         |
|-----------|---------------------------------------------------------------------|
| Tag       | index column, helps to retrieve data more efficiently               |
| Field     | value column, helps to analysis, aggregation, calculating, etc,.    |
| Timestamp | timestamp column, each table MUST have exactly one timestamp column |

then, you can add one `Series` into `Metric`, then create an `InsertRequest` and call `client.Insert` to store the data into GreptimeDB.

`Metric` can change the `Timestamp` precision by `metric.SetTimePrecision`. The following is the supported options:

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
 
