---
keywords: [Java SDK, gRPC, data ingestion, installation, connection, low-level API, high-level API]
description: Guide on using the Java ingester SDK for GreptimeDB, including installation, connection, data model, and examples of low-level and high-level APIs.
---

# Java

GreptimeDB offers ingester libraries for high-throughput data writing.
It utilizes the gRPC protocol,
which supports schemaless writing and eliminates the need to create tables before writing data.
For more information, refer to [Automatic Schema Generation](/user-guide/ingest-data/overview.md#automatic-schema-generation).

The Java ingester SDK provided by GreptimeDB is a lightweight library with the following features:

- SPI-based extensible network transport layer, which provides the default implementation using the gRPC framework.
- Non-blocking, purely asynchronous API that is easy to use.
- Automatic collection of various performance metrics by default. You can then configure and write them to local files.
- Ability to take in-memory snapshots of critical objects, configure them, and write them to local files. This is helpful for troubleshooting complex issues.

## Quick start demos

To quickly get started, you can explore the [quick start demos](https://github.com/GreptimeTeam/greptimedb-ingester-java/tree/main/ingester-example/src/main/java/io/greptime) to understand how to use the GreptimeDB Java ingester SDK.

## Installation

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

## Connect to database

If you have set the [`--user-provider` configuration](/user-guide/deployments-administration/authentication/overview.md) when starting GreptimeDB,
you will need to provide a username and password to connect to GreptimeDB.
The following example shows how to set the username and password when using the library to connect to GreptimeDB.

The following code demonstrates how to connect to GreptimeDB with the simplest configuration.
For customizing the connection options, please refer to [API Documentation](#ingester-library-reference).
Please pay attention to the accompanying comments for each option, as they provide detailed explanations of their respective roles.

```java
// GreptimeDB has a default database named "public" in the default catalog "greptime",
// we can use it as the test database
String database = "public";
// By default, GreptimeDB listens on port 4001 using the gRPC protocol.
// We can provide multiple endpoints that point to the same GreptimeDB cluster.
// The client will make calls to these endpoints based on a load balancing strategy.
String[] endpoints = {"127.0.0.1:4001"};
// Sets authentication information.
AuthInfo authInfo = new AuthInfo("username", "password");
GreptimeOptions opts = GreptimeOptions.newBuilder(endpoints, database)
        // If the database does not require authentication, we can use AuthInfo.noAuthorization() as the parameter.
        .authInfo(authInfo)
        // Enable secure connection if your server is secured by TLS
        //.tlsOptions(new TlsOptions())
        // A good start ^_^
        .build();

GreptimeDB client = GreptimeDB.create(opts);
```

## Data model

Each row item in a table consists of three types of columns: `Tag`, `Timestamp`, and `Field`. For more information, see [Data Model](/user-guide/concepts/data-model.md).
The types of column values could be `String`, `Float`, `Int`, `Timestamp`, `JSON` etc. For more information, see [Data Types](/reference/sql/data-types.md).

## Set table options

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
ctx = ctx.withCompression(Compression.Zstd)
// Use the ctx when writing data to GreptimeDB
// The data object `cpuMetric` and `memMetric` are described in the following sections
CompletableFuture<Result<WriteOk, Err>> future = greptimeDB.write(Arrays.asList(cpuMetric, memMetric), WriteOp.Insert, ctx);
```

For how to write data to GreptimeDB, see the following sections.

## Low-level API

The GreptimeDB low-level API provides a straightforward method to write data to GreptimeDB 
by adding rows to the table object with a predefined schema.

### Create row objects

This following code snippet begins by constructing a table named `cpu_metric`,
which includes columns `host`, `cpu_user`, `cpu_sys`, and `ts`. 
Subsequently, it inserts a single row into the table.

The table consists of three types of columns:

- `Tag`: The `host` column, with values of type `String`.
- `Field`: The `cpu_user` and `cpu_sys` columns, with values of type `Float`.
- `Timestamp`: The `ts` column, with values of type `Timestamp`.

```java
// Construct the table schema for `cpu_metric`.
// The schema is immutable and can be safely reused across multiple operations.
// It is recommended to use snake_case for column names.
TableSchema cpuMetricSchema = TableSchema.newBuilder("cpu_metric")
        .addTag("host", DataType.String) // Identifier for the host
        .addTimestamp("ts", DataType.TimestampMillisecond) // Timestamp in milliseconds
        .addField("cpu_user", DataType.Float64) // CPU usage by user processes
        .addField("cpu_sys", DataType.Float64) // CPU usage by system processes
        .build();

// Create a table from the defined schema.
// Tables are not reusable - a new instance must be created for each write operation.
// However, we can add multiple rows to a single table before writing it,
// which is more efficient than writing rows individually.
Table cpuMetric = Table.from(cpuMetricSchema);

// Example data for a single row
String host = "127.0.0.1"; // Host identifier
long ts = System.currentTimeMillis(); // Current timestamp
double cpuUser = 0.1; // CPU usage by user processes (in percentage)
double cpuSys = 0.12; // CPU usage by system processes (in percentage)

// Insert the row into the table
// NOTE: The arguments must be in the same order as the columns in the defined schema: host, ts, cpu_user, cpu_sys
cpuMetric.addRow(host, ts, cpuUser, cpuSys);
// We can add more rows to the table
// ...

// Complete the table to make it immutable. This finalizes the table for writing.
// If users forget to call this method, it will automatically be called internally
// before the table data is written.
cpuMetric.complete();
```

To improve the efficiency of writing data, you can create multiple rows at once to write to GreptimeDB.

```java
// Define the schema for tables.
// The schema is immutable and can be safely reused across multiple operations.
// It is recommended to use snake_case for column names.
TableSchema cpuMetricSchema = TableSchema.newBuilder("cpu_metric")
        .addTag("host", DataType.String)
        .addTimestamp("ts", DataType.TimestampMillisecond)
        .addField("cpu_user", DataType.Float64)
        .addField("cpu_sys", DataType.Float64)
        .build();

TableSchema memMetricSchema = TableSchema.newBuilder("mem_metric")
        .addTag("host", DataType.String)
        .addTimestamp("ts", DataType.TimestampMillisecond)
        .addField("mem_usage", DataType.Float64)
        .build();

// Tables are not reusable - a new instance must be created for each write operation.
// However, we can add multiple rows to a single table before writing it,
// which is more efficient than writing rows individually.
Table cpuMetric = Table.from(cpuMetricSchema);
Table memMetric = Table.from(memMetricSchema);

// Adds row data items
for (int i = 0; i < 10; i++) {
    String host = "127.0.0." + i;
    long ts = System.currentTimeMillis();
    double cpuUser = i + 0.1;
    double cpuSys = i + 0.12;
    // Add a row to the `cpu_metric` table.
    // The order of the values must match the schema definition.
    cpuMetric.addRow(host, ts, cpuUser, cpuSys);
}

for (int i = 0; i < 10; i++) {
    String host = "127.0.0." + i;
    long ts = System.currentTimeMillis();
    double memUsage = i + 0.2;
    // Add a row to the `mem_metric` table.
    // The order of the values must match the schema definition.
    memMetric.addRow(host, ts, memUsage);
}

// Complete the table to make it immutable. If users forget to call this method,
// it will still be called internally before the table data is written.
cpuMetric.complete();
memMetric.complete();

```

### Insert data

The following example shows how to insert rows to tables in GreptimeDB.

```java
// Saves data

// For performance reasons, the SDK is designed to be purely asynchronous.
// The return value is a CompletableFuture object. If you want to immediately obtain
// the result, you can call `future.get()`, which will block until the operation completes.
// For production environments, consider using non-blocking approaches with callbacks or
// the CompletableFuture API.
CompletableFuture<Result<WriteOk, Err>> future = greptimeDB.write(cpuMetric, memMetric);

Result<WriteOk, Err> result = future.get();

if (result.isOk()) {
    LOG.info("Write result: {}", result.getOk());
} else {
    LOG.error("Failed to write: {}", result.getErr());
}

```

### Streaming insert

Streaming insert is useful when you want to insert a large amount of data such as importing historical data.


```java
// Set the compression algorithm to Zstd.
Context ctx = Context.newDefault().withCompression(Compression.Zstd);
// Create a stream writer with a rate limit of 100,000 points per second.
// This helps control the data flow and prevents overwhelming the database.
StreamWriter<Table, WriteOk> writer = greptimeDB.streamWriter(100000, ctx);

// Write table data to the stream. The data will be immediately flushed to the network.
// This allows for efficient, low-latency data transmission to the database.
// Since this is client streaming, we cannot get the write result immediately.
// After writing all data, we can call `completed()` to finalize the stream and get the result.
writer.write(cpuMetric);
writer.write(memMetric);

// You can perform operations on the stream, such as deleting the first 5 rows.
writer.write(cpuMetric.subRange(0, 5), WriteOp.Delete);
```

Close the stream writing after all data has been written.
In general, you do not need to close the stream writing when continuously writing data.

```java
// Completes the stream, and the stream will be closed.
CompletableFuture<WriteOk> future = writer.completed();
// Now we can get the write result.
WriteOk result = future.get();
LOG.info("Write result: {}", result);
```

## High-level API

The high-level API uses an ORM style object to write data to GreptimeDB.
It allows you to create, insert, and update data in a more object-oriented way,
providing developers with a friendlier experience.
However, it is not as efficient as the low-level API.
This is because the ORM style object may consume more resources and time when converting the objects.

### Create row objects

GreptimeDB Java Ingester SDK allows us to use basic POJO objects for writing. This approach requires the use of Greptime's own annotations, but they are easy to use.

```java
@Metric(name = "cpu_metric")
public class Cpu {
    @Column(name = "host", tag = true, dataType = DataType.String)
    private String host;

    @Column(name = "ts", timestamp = true, dataType = DataType.TimestampMillisecond)
    private long ts;

    @Column(name = "cpu_user", dataType = DataType.Float64)
    private double cpuUser;
    @Column(name = "cpu_sys", dataType = DataType.Float64)
    private double cpuSys;

    // getters and setters
    // ...
}

@Metric(name = "mem_metric")
public class Memory {
    @Column(name = "host", tag = true, dataType = DataType.String)
    private String host;

    @Column(name = "ts", timestamp = true, dataType = DataType.TimestampMillisecond)
    private long ts;

    @Column(name = "mem_usage", dataType = DataType.Float64)
    private double memUsage;
    // getters and setters
    // ...
}

// Add rows
List<Cpu> cpus = new ArrayList<>();
for (int i = 0; i < 10; i++) {
    Cpu c = new Cpu();
    c.setHost("127.0.0." + i);
    c.setTs(System.currentTimeMillis());
    c.setCpuUser(i + 0.1);
    c.setCpuSys(i + 0.12);
    cpus.add(c);
}

List<Memory> memories = new ArrayList<>();
for (int i = 0; i < 10; i++) {
    Memory m = new Memory();
    m.setHost("127.0.0." + i);
    m.setTs(System.currentTimeMillis());
    m.setMemUsage(i + 0.2);
    memories.add(m);
}
```

### Insert data

Write data with POJO objects:

```java
// Saves data

CompletableFuture<Result<WriteOk, Err>> puts = greptimeDB.writeObjects(cpus, memories);

Result<WriteOk, Err> result = puts.get();

if (result.isOk()) {
    LOG.info("Write result: {}", result.getOk());
} else {
    LOG.error("Failed to write: {}", result.getErr());
}
```

### Streaming insert

Streaming insert is useful when you want to insert a large amount of data such as importing historical data.

```java
StreamWriter<List<?>, WriteOk> writer = greptimeDB.objectsStreamWriter();

// write data into stream
writer.write(cpus);
writer.write(memories);

// You can perform operations on the stream, such as deleting the first 5 rows.
writer.write(cpus.subList(0, 5), WriteOp.Delete);
```

Close the stream writing after all data has been written.
In general, you do not need to close the stream writing when continuously writing data.

```java
// complete the stream
CompletableFuture<WriteOk> future = writer.completed();
WriteOk result = future.get();
LOG.info("Write result: {}", result);
```

## Insert data in JSON type

GreptimeDB supports storing complex data structures using [JSON type data](/reference/sql/data-types.md#json-type).
With this ingester library, you can insert JSON data using string values.
For instance, if you have a table named `sensor_readings` and wish to add a JSON column named `attributes`,
refer to the following code snippet.

In the [low-level API](#low-level-api),
you can specify the column type as `DataType.Json` using the `addField` method to add a JSON column.
Then use map to insert JSON data.

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

// The following code for writing data is omitted
// ...
```

In the [high-level API](#high-level-api), you can specify the column type as `DataType.Json` within the POJO object.

```java
@Metric(name = "sensor_readings")
public class Sensor {
    // The code for creating other columns is omitted
    // ...
    // specify the column type as JSON        
    @Column(name = "attributes", dataType = DataType.Json)
    private Map<String, Object> attributes;
    // ...
}

Sensor sensor = new Sensor();
// ...
// Use map to insert JSON data
Map<String, Object> attr = new HashMap<>();
attr.put("action", "running");
sensor.setAttributes(attr);

// The following code for writing data is omitted
// ...
```

## Debug logs

The ingester SDK provides metrics and logs for debugging.
Please refer to [Metrics & Display](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/docs/metrics-display.md) and [Magic Tools](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/docs/magic-tools.md) to learn how to enable or disable the logs.


## FAQ

### Why am I getting some connection exceptions?

When using the GreptimeDB Java ingester SDK, you may encounter some connection exceptions.
For example, exceptions that are "`Caused by: java.nio.channels.UnsupportedAddressTypeException`",
"`Caused by: java.net.ConnectException: connect(..) failed: Address family not supported by protocol`", or
"`Caused by: java.net.ConnectException: connect(..) failed: Invalid argument`". While you are certain that the
GreptimeDB server is running, and its endpoint is reachable.

These connection exceptions could be all because the GRPC's `io.grpc.NameResolverProvider` service provider is not
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
