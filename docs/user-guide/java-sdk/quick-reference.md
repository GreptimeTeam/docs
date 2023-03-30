# Quick Reference

## Data Ingestion Process

![Data Ingestion Process](../../public/data-ingest-process.png)

GreptimeDB supports automatic create table based on the first writing of data.
Users can also create tables manually. For more details, please refer to [Table Management][1].

``` sql
CREATE TABLE monitor (
    host STRING,
    ts BIGINT,
    cpu DOUBLE DEFAULT 0,
    memory DOUBLE NULL,
    TIME INDEX (ts),
PRIMARY KEY(host)) ENGINE=mito WITH(regions=1);
```

[1]: ../table-management.md

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
```

| Name                 | Description                                                                                |
|:---------------------|:-------------------------------------------------------------------------------------------|
| rows                 | Several rows of data to write to the database (all data must belong to the same table).    |
| ctx                  | The KV in ctx will be written to the gRPC headers metadata then sent to GreptimeDB server. |
| Result<WriteOk, Err> | Inspired by Result in Rust, where WriteOk and Err only one is meaningful and the other is empty.If the call succeeds, you can extract the appropriate information from WriteOk, otherwise you need to extract useful information from Err.                                                                                           |

### How to build WriteRows

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

## Data Query Process

![Data Query Process](../../public/data-query-process.png)

### Query API

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

### How to build QueryRequest

``` java
QueryRequest request = QueryRequest.newBuilder()
    .exprType(SelectExprType.Sql) // Currently, only SQL is supported, and more query methods will be supported in the future
    .ql("SELECT * FROM monitor;")
    .build();
```

## Configuration

### Global Options (System properties / Java -Dxxx)

| Name                                           | Description                                                                                                                                                        |
|:-----------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| greptimedb.use\_os\_signal                     | Whether or not to use OS Signal, SDK listens for SIGUSR2 signals by default and can outputs some information. This is helpful when troubleshooting complex issues. |
| greptimedb.signal.out\_dir                     | Signal handler can output to the specified directory, default is the process start directory.                                                                      |
| greptimedb.available\_cpus                     | Specify the number of available cpus, the default is to use the full number of cpus of the current environment.                                                    |
| greptimedb.reporter.period\_minutes            | Metrics reporter timed output period, default 30 minutes.                                                                                                          |
| greptimedb.read.write.rw_logging               | Whether to print logs for each read/write operation, default off.                                                                                                  |

### GreptimeDBOptions

| Name           | Description                                                                                                                                                                                                                                                                                                                                   |
|:---------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| endpoints      | GreptimeDB server address, can have one or more.                                                                                                                                                                                                                                                                                              |
| asyncWritePool | As a purely asynchronous client, a write scheduling thread pool is required, which can be configured by the user, and will use SerializingExecutor by default. If you configure the pool yourself, please focus on the performance metrics: `async_write_pool.time`, and adjust the configuration of this scheduling thread pool in time. |
| asyncReadPool  | As a purely asynchronous client, a read scheduling thread pool is required, which can be configured by the user, and will use SerializingExecutor by default.If you configure the pool yourself, please focus on the performance metrics: `async_write_pool.time`, and adjust the configuration of this scheduling thread pool in time.   |
| rpcOptions     | Configuration options for RPC component, please refer to `RpcOptions` for details.                                                                                                                                                                                                                                                            |
| routerOptions  | Configuration options for the routing table component, please refer to `RouterOptions` for details.                                                                                                                                                                                                                                           |
| writeOptions   | Configuration options for the write component, please refer to `WriteOptions` for details.                                                                                                                                                                                                                                                    |

## Metrics&Display

At runtime, users can use the SIGUSR2 signal of the Linux platform to output
the status information (display) of the node and the metrics.

### How

```shell
kill -s SIGUSR2 pid
```

The relevant information is output to the specified directory.

By default, 2 files are generated in the program's working directory
(cwd: `lsof -p $pid | grep cwd`)

- greptimedb\_client\_metrics.log.xxx: It records all metrics information for the current
client node
- greptimedb\_client\_display.log.xxx: It records important memory state information about the
current client

### List of Metrics (constantly updated)

| Name                                                            | Description                                                                                                                    |
|:----------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------|
| thread\_pool.${thread\_pool\_name} [timer]                      | Thread pool execution task time statistics.                                                                                    |
| scheduled\_thread\_pool.${schedule\_thread\_pool\_name} [timer] | Schedule thread pool execution task time statistics.                                                                           |
| async\_write\_pool.time [timer]                                 | Asynchronous pool time statistics for asynchronous write tasks in SDK, this is important and it is recommended to focus on it. |
| async\_read\_pool.time [timer]                                  | Asynchronous pool time statistics for asynchronous read tasks in SDK, this is important and it is recommended to focus on it.  |
| write\_rows\_success\_num [histogram]                           | Statistics on the number of successful writes.                                                                                 |
| write\_rows\_failure\_num [histogram]                           | Statistics on the number of data entries that failed to write.                                                                 |
| write\_failure\_num [meter]                                     | Statistics on the number of failed writes.                                                                                     |
| write\_qps [meter]                                              | Write Request QPS                                                                                                              |
| write\_by\_retries\_${n} [meter]                                | QPS for the nth retry write, n == 0 for the first write (non-retry), n > 3 will be counted as n == 3                           |
| read\_rows\_num [histogram]                                     | Statistics of the number of data items per query.                                                                              |
| read\_failure\_num [meter]                                      | Statistics of the number of failed queries.                                                                                    |
| serializing\_executor\_single\_task\_timer\_${name} [timer]     | Serializing executor. Single task execution time consumption statistics                                                        |
| serializing\_executor\_drain\_timer\_${name} [timer]            | Serializing executor. Drains all tasks for time consumption statistics                                                         |
| serializing\_executor\_drain\_num\_${name} [histogram]          | Serializing executor. Statistics on the number of draining tasks                                                               |

## Magic Tools

### How to use `kill -s SIGUSR2 $pid`

The first time you execute `kill -s SIGUSR2 $pid` you will see the following help messages on
the log output, including:

- Turn on/off the output of the condensed version of the read/write log.
- Turn on/off limter
- Export in-memory metrics and memory state information of important objects to a local file

### Just follow the help information

``` text
 - -- GreptimeDBClient Signal Help --
 -     Signal output dir: /Users/xxx/xxx
 -
 -     How to open or close read/write log(The second execution means close):
 -       [1] `cd /Users/xxx/xxx`
 -       [2] `touch rw_logging.sig`
 -       [3] `kill -s SIGUSR2 $pid`
 -       [4] `rm rw_logging.sig`
 -
 -     How to get metrics and display info:
 -       [1] `cd /Users/xxx/xxx`
 -       [2] `rm *.sig`
 -       [3] `kill -s SIGUSR2 $pid`
 -
 -     The file signals that is currently open:
 -       rw_logging.sig
 -
```
