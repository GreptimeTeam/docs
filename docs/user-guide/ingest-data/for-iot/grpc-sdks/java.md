---
keywords: [Java SDK, gRPC, data ingestion, installation, connection, Batching Write, Streaming Write, Bulk Write]
description: Guide on using the Java ingester SDK for GreptimeDB, including installation, connection, data model, and examples of low-level and high-level APIs.
---

# Java Ingester for GreptimeDB

GreptimeDB offers ingester libraries for high-throughput data writing.
It utilizes the gRPC protocol,
which supports schemaless writing and eliminates the need to create tables before writing data.
For more information, refer to [Automatic Schema Generation](/user-guide/ingest-data/overview.md#automatic-schema-generation).

The Java ingester SDK provided by GreptimeDB is a lightweight, high-performance client designed for efficient time-series data ingestion. It leverages the gRPC protocol to provide a non-blocking, purely asynchronous API that delivers exceptional throughput while maintaining seamless integration with your applications.

This client offers multiple ingestion methods optimized for various performance requirements and use cases. You can select the approach that best suits your specific needs—whether you require simple unary writes for low-latency operations or high-throughput bulk streaming for maximum efficiency when handling large volumes of time-series data.

## High Level Architecture

```
+-----------------------------------+
|      Client Applications          |
|     +------------------+          |
|     | Application Code |          |
|     +------------------+          |
+-------------+---------------------+
              |
              v
+-------------+---------------------+
|           API Layer               |
|      +---------------+            |
|      |   GreptimeDB  |            |
|      +---------------+            |
|         /          \              |
|        v            v             |
| +-------------+  +-------------+  |        +------------------+
| |  BulkWrite  |  |    Write    |  |        |    Data Model    |
| |  Interface  |  |  Interface  |  |------->|                  |
| +-------------+  +-------------+  |        |  +------------+  |
+-------|----------------|----------+        |  |    Table   |  |
        |                |                   |  +------------+  |
        v                v                   |        |         |
+-------|----------------|----------+        |        v         |
|        Transport Layer            |        |  +------------+  |
| +-------------+  +-------------+  |        |  | TableSchema|  |
| |  BulkWrite  |  |    Write    |  |        |  +------------+  |
| |   Client    |  |    Client   |  |        +------------------+
| +-------------+  +-------------+  |
|     |    \          /    |        |
|     |     \        /     |        |
|     |      v      v      |        |
|     |  +-------------+   |        |
|     |  |RouterClient |   |        |
+-----|--+-------------|---+--------+
      |                |   |        |
      |                |   |        |
      v                v   v        |
+-----|----------------|---|--------+
|       Network Layer               |
| +-------------+  +-------------+  |
| | Arrow Flight|  | gRPC Client |  |
| |   Client    |  |             |  |
| +-------------+  +-------------+  |
|     |                |            |
+-----|----------------|------------+
      |                |
      v                v
   +-------------------------+
   |    GreptimeDB Server    |
   +-------------------------+
```

- **API Layer**: Provides high-level interfaces for client applications to interact with GreptimeDB
- **Data Model**: Defines the structure and organization of time series data with tables and schemas
- **Transport Layer**: Handles communication logistics, request routing, and client management
- **Network Layer**: Manages low-level protocol communications using Arrow Flight and gRPC

## How To Use

### Installation

1. Install the Java Development Kit(JDK)

Make sure that your system has JDK 8 or later installed. For more information on how to
check your version of Java and install the JDK, see the [Oracle Overview of JDK Installation documentation](https://www.oracle.com/java/technologies/javase-downloads.html)

2. Add GreptiemDB Java SDK as a Dependency

If you are using [Maven](https://maven.apache.org/), add the following to your pom.xml
dependencies list:

```xml
<dependency>
    <groupId>io.greptime</groupId>
    <artifactId>ingester-all</artifactId>
    <version>VAR::javaSdkVersion</version>
</dependency>
```

The latest version can be viewed [here](https://central.sonatype.com/search?q=io.greptime&name=ingester-all).

After configuring your dependencies, make sure they are available to your project. This may require refreshing the project in your IDE or running the dependency manager.

### Client Initialization

The entry point to the GreptimeDB Ingester Java client is the `GreptimeDB` class. You create a client instance by calling the static create method with appropriate configuration options.

```java
// GreptimeDB has a default database named "public" in the default catalog "greptime",
// we can use it as the test database
String database = "public";
// By default, GreptimeDB listens on port 4001 using the gRPC protocol.
// We can provide multiple endpoints that point to the same GreptimeDB cluster.
// The client will make calls to these endpoints based on a load balancing strategy.
// The client performs regular health checks and automatically routes requests to healthy nodes,
// providing fault tolerance and improved reliability for your application.
String[] endpoints = {"127.0.0.1:4001"};
// Sets authentication information.
AuthInfo authInfo = new AuthInfo("username", "password");
GreptimeOptions opts = GreptimeOptions.newBuilder(endpoints, database)
        // If the database does not require authentication, we can use `AuthInfo.noAuthorization()` as the parameter.
        .authInfo(authInfo)
        // Enable secure connection if your server is secured by TLS
        //.tlsOptions(new TlsOptions())
        // A good start ^_^
        .build();

// Initialize the client
// NOTE: The client instance is thread-safe and should be reused as a global singleton
// for better performance and resource utilization.
GreptimeDB client = GreptimeDB.create(opts);
```

### Writing Data

The ingester provides a unified approach for writing data to GreptimeDB through the `Table` abstraction. All data writing operations, including high-level APIs, are built on top of this fundamental structure. To write data, you create a `Table` with your time series data and write it to the database.

#### Creating and Writing Tables

Define a table schema and create a table:

```java
// Create a table schema
TableSchema schema = TableSchema.newBuilder("metrics")
    .addTag("host", DataType.String)
    .addTag("region", DataType.String)
    .addField("cpu_util", DataType.Float64)
    .addField("memory_util", DataType.Float64)
    .addTimestamp("ts", DataType.TimestampMillisecond)
    .build();

// Create a table from the schema
Table table = Table.from(schema);

// Add rows to the table
// The values must be provided in the same order as defined in the schema
// In this case: addRow(host, region, cpu_util, memory_util, ts)
table.addRow("host1", "us-west-1", 0.42, 0.78, System.currentTimeMillis());
table.addRow("host2", "us-west-2", 0.46, 0.66, System.currentTimeMillis());
// Add more rows
// ..

// Complete the table to make it immutable. This finalizes the table for writing.
// If users forget to call this method, it will automatically be called internally
// before the table data is written.
table.complete();

// Write the table to the database
CompletableFuture<Result<WriteOk, Err>> future = client.write(table);
```

GreptimeDB supports storing complex data structures using [JSON type data](/reference/sql/data-types.md#json-type). You can define JSON columns in your table schema and insert data using Map objects:

```java
// Construct the table schema for sensor_readings
TableSchema sensorReadings = TableSchema.newBuilder("sensor_readings")
        // The code for creating other columns is omitted
        // ...
        // specify the column type as JSON        
        .addField("attributes", DataType.Json)
        .build();

// ...
// Use map to insert JSON data
Map<String, Object> attr = new HashMap<>();
attr.put("location", "factory-1");
sensorReadings.addRow(<other-column-values>... , attr);
```

##### TableSchema

The `TableSchema` defines the structure for writing data to GreptimeDB. It specifies the table structure including column names, semantic types, and data types. For detailed information about column semantic types (`Tag`, `Timestamp`, `Field`), refer to the [Data Model](/user-guide/concepts/data-model.md) documentation.

##### Table

The `Table` interface represents data that can be written to GreptimeDB. It provides methods for adding rows and manipulating the data. Essentially, `Table` temporarily stores data in memory, allowing you to accumulate multiple rows for batch processing before sending them to the database, which significantly improves write efficiency compared to writing individual rows.

A table goes through several distinct lifecycle stages:

1. **Creation**: Initialize a table from a schema using `Table.from(schema)`
2. **Data Addition**: Populate the table with rows using `addRow()` method
3. **Completion**: Finalize the table with `complete()` when all rows have been added
4. **Writing**: Send the completed table to the database

Important considerations:
- Tables are not thread-safe and should be accessed from a single thread
- Tables cannot be reused after writing - create a new instance for each write operation
- The associated `TableSchema` is immutable and can be safely reused across multiple operations

### Write Operations

Although the time series table is created automatically when writing data to GreptimeDB via the SDK,
you can still configure table options.
The SDK supports the following table options:

- `auto_create_table`: Default is `True`. If set to `False`, it indicates that the table already exists and does not need automatic creation, which can improve write performance.
- `ttl`, `append_mode`, `merge_mode`: For more details, refer to the [table options](/reference/sql/create.md#table-options).

You can set table options using the `Context`.
For example, to set the `ttl` option, use the following code:

```java
Context ctx = Context.newDefault();
// Add a hint to make the database create a table with the specified TTL (time-to-live)
ctx = ctx.withHint("ttl", "3d");
// Set the compression algorithm to Zstd.
ctx = ctx.withCompression(Compression.Zstd);
// Use the ctx when writing data to GreptimeDB
CompletableFuture<Result<WriteOk, Err>> future = client.write(Arrays.asList(table1, table2), WriteOp.Insert, ctx);
```

For how to write data to GreptimeDB, see the following sections.

### Batching Write

Batching write allows you to write data to multiple tables in a single request. It returns a `CompletableFuture<Result<WriteOk, Err>>` and provides good performance through asynchronous execution.

This is the recommended way to write data to GreptimeDB for most use cases.

```java
// The batching write API
CompletableFuture<Result<WriteOk, Err>> future = client.write(table1, table2, table3);

// For performance reasons, the SDK is designed to be purely asynchronous.
// The return value is a CompletableFuture object. If you want to immediately obtain
// the result, you can call `future.get()`, which will block until the operation completes.
// For production environments, consider using non-blocking approaches with callbacks or
// the CompletableFuture API.
Result<WriteOk, Err> result = future.get();
```

### Streaming Write

The streaming write API maintains a persistent connection to GreptimeDB for continuous data ingestion with rate limiting. It allows writing data from multiple tables through a single stream.

Use this API when you need:
- Continuous data collection with moderate volume
- Writing to multiple tables via one connection
- Cases where simplicity and convenience are more important than maximum throughput

```java
// Create a stream writer
StreamWriter<Table, WriteOk> writer = client.streamWriter();

// Write multiple tables
writer.write(table1)
      .write(table2)
      .write(table3);

// Complete the stream and get the result
CompletableFuture<WriteOk> result = writer.completed();
```

You can also set a rate limit for stream writing:

```java
// Limit to 1000 points per second
StreamWriter<Table, WriteOk> writer = client.streamWriter(1000);
```

### Bulk Write

The Bulk Write API provides a high-performance, memory-efficient mechanism for ingesting large volumes of time-series data into GreptimeDB. It leverages off-heap memory management to achieve optimal throughput when writing batches of data.

**Important**:
1. **Manual Table Creation Required**: Bulk API does **not** create tables automatically. You must create the table beforehand using either:
   - Insert API (which supports auto table creation), or
   - SQL DDL statements (CREATE TABLE)
2. **Schema Matching**: The table template in bulk API must exactly match the existing table schema.
3. **Column Types**: For bulk operations, currently use `addField()` instead of `addTag()`. Tag columns are part of the primary key in GreptimeDB, but bulk operations don't yet support tables with tag columns. This limitation will be addressed in future versions.

This API supports writing to one table per stream and handles large data volumes (up to 200MB per write) with adaptive flow control. Performance advantages include:
- Off-heap memory management with Arrow buffers
- Efficient binary serialization and data transfer
- Optional compression
- Batched operations

This approach is particularly well-suited for:
- Large-scale batch processing and data migrations
- High-throughput log and sensor data ingestion
- Time-series applications with demanding performance requirements
- Systems processing high-frequency data collection

Here's a typical pattern for using the Bulk Write API:

```java
// Create a BulkStreamWriter with the table schema
try (BulkStreamWriter writer = greptimeDB.bulkStreamWriter(schema)) {
    // Write multiple batches
    for (int batch = 0; batch < batchCount; batch++) {
        // Get a TableBufferRoot for this batch
        Table.TableBufferRoot table = writer.tableBufferRoot(1000); // column buffer size

        // Add rows to the batch
        for (int row = 0; row < rowsPerBatch; row++) {
            Object[] rowData = generateRow(batch, row);
            table.addRow(rowData);
        }

        // Complete the table to prepare for transmission
        table.complete();

        // Send the batch and get a future for completion
        CompletableFuture<Integer> future = writer.writeNext();

        // Wait for the batch to be processed (optional)
        Integer affectedRows = future.get();

        System.out.println("Batch " + batch + " wrote " + affectedRows + " rows");
    }

    // Signal completion of the stream
    writer.completed();
}
```

#### Configuration

The Bulk Write API can be configured with several options to optimize performance:

```java
BulkWrite.Config cfg = BulkWrite.Config.newBuilder()
        .allocatorInitReservation(64 * 1024 * 1024L) // Customize memory allocation: 64MB initial reservation
        .allocatorMaxAllocation(4 * 1024 * 1024 * 1024L) // Customize memory allocation: 4GB max allocation
        .timeoutMsPerMessage(60 * 1000) // 60 seconds timeout per request
        .maxRequestsInFlight(8) // Concurrency Control: Configure with 10 maximum in-flight requests
        .build();
// Enable Zstd compression
Context ctx = Context.newDefault().withCompression(Compression.Zstd);

BulkStreamWriter writer = greptimeDB.bulkStreamWriter(schema, cfg, ctx);
```

### Resource Management

It's important to properly shut down the client when you're finished using it:

```java
// Gracefully shut down the client
client.shutdownGracefully();
```

### Performance Tuning

#### Compression Options

The ingester supports various compression algorithms to reduce network bandwidth and improve throughput.

```java
// Set the compression algorithm to Zstd
Context ctx = Context.newDefault().withCompression(Compression.Zstd);
```

#### Write Operation Comparison

Understanding the performance characteristics of different write methods is crucial for optimizing data ingestion.

| Write Method | API | Throughput | Latency | Memory Efficiency | CPU Usage | Best For | Limitations |
|--------------|-----|------------|---------|-------------------|-----------|----------|-------------|
| Batching Write | `write(tables)` | Better | Good | High | Higher | Simple applications, low latency requirements | Lower throughput for large volumes |
| Streaming Write | `streamWriter()` | Moderate | Good | Moderate | Moderate | Continuous data streams, moderate throughput | More complex to use than regular writes |
| Bulk Write | `bulkStreamWriter()` | Best | Higher | Best | Moderate | Maximum throughput, large batch operations | Higher latency, requires manual table creation |

#### Buffer Size Optimization

When using `BulkStreamWriter`, you can configure the column buffer size:

```java
// Get the table buffer with a specific column buffer size
Table.TableBufferRoot table = bulkStreamWriter.tableBufferRoot(columnBufferSize);
```

This option can significantly improve the speed of data conversion to the underlying format. For optimal performance, we recommend setting the column buffer size to 1024 or larger, depending on your specific workload characteristics and available memory.

### Export Metrics

The ingester exposes comprehensive metrics that enable you to monitor its performance, health, and operational status.

For detailed information about available metrics and their usage, refer to the [Ingester Prometheus Metrics](https://github.com/GreptimeTeam/greptimedb-ingester-java/tree/main/ingester-prometheus-metrics) documentation.

## API Documentation and Examples
- [API Reference](https://javadoc.io/doc/io.greptime/ingester-protocol/latest/index.html)
- [Examples](https://github.com/GreptimeTeam/greptimedb-ingester-java/tree/main/ingester-example/)

## FAQ

### Why am I getting some connection exceptions?

When using the GreptimeDB Java ingester SDK, you may encounter some connection exceptions.
For example, exceptions that are "`Caused by: java.nio.channels.UnsupportedAddressTypeException`",
"`Caused by: java.net.ConnectException: connect(..) failed: Address family not supported by protocol`", or
"`Caused by: java.net.ConnectException: connect(..) failed: Invalid argument`". While you are certain that the
GreptimeDB server is running, and its endpoint is reachable.

These connection exceptions could be all because the gRPC's `io.grpc.NameResolverProvider` service provider is not
packaged into the final JAR, during the assembling process. So the fix can be:

- If you are using Maven Assembly plugin, add the `metaInf-services` container descriptor handler to your assembly
  file, like this:
  ```xml
  <assembly xmlns="http://maven.apache.org/ASSEMBLY/2.2.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/ASSEMBLY/2.2.0 http://maven.apache.org/xsd/assembly-2.2.0.xsd">
   ...
    <containerDescriptorHandlers>
      <containerDescriptorHandler>
        <handlerName>metaInf-services</handlerName>
      </containerDescriptorHandler>
    </containerDescriptorHandlers>
  </assembly>
  ```
- And if you are using Maven Shade plugin, you can add the `ServicesResourceTransformer` instead:
  ```xml
  <project>
    ...
    <build>
      <plugins>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-shade-plugin</artifactId>
          <version>3.6.0</version>
          <executions>
            <execution>
              <goals>
                <goal>shade</goal>
              </goals>
              <configuration>
                <transformers>
                  <transformer implementation="org.apache.maven.plugins.shade.resource.ServicesResourceTransformer"/>
                </transformers>
              </configuration>
            </execution>
          </executions>
        </plugin>
      </plugins>
    </build>
    ...
  </project>
  ```

## Ingester library reference

- [API Documentation](https://javadoc.io/doc/io.greptime/ingester-protocol/latest/index.html)
