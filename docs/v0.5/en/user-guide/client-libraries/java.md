---
template: template.md
---
# Java

<docs-template>

{template ingester-lib-installation%

1. Install the Java Development Kit(JDK)

Make sure that your system has JDK 8 or later installed. For more information on how to
check your version of Java and install the JDK, see the [Oracle Overview of JDK Installation documentation](https://www.oracle.com/java/technologies/javase-downloads.html)

2. Add GreptiemDB Java SDK as a Dependency

If you are using [Maven](https://maven.apache.org/), add the following to your pom.xml
dependencies list:

```
<dependencies>
    <dependency>
        <groupId>io.greptime</groupId>
        <artifactId>ingester-all</artifactId>
        <version>${latest_version}</version>
    </dependency>
</dependencies>
```

The latest version can be viewed [here](https://central.sonatype.com/search?q=io.greptime&name=ingester-all).

After configuring your dependencies, make sure they are available to your project. This may require refreshing the project in your IDE or running the dependency manager.

}

{template ingester-lib-connect%

The following code demonstrates how to start an `Ingester`` with all options included. We need to pay attention
to the accompanying comments for each option, as they provide detailed explanations of their respective roles.

```
// GreptimeDB has a default database named "public" in the default catalog "greptime",
// we can use it as the test database
String database = "public";
// By default, GreptimeDB listens on port 4001 using the gRPC protocol.
// We can provide multiple endpoints that point to the same GreptimeDB cluster.
// The client will make calls to these endpoints based on a load balancing strategy.
String[] endpoints = {"127.0.0.1:4001"};
GreptimeOptions opts = GreptimeOptions.newBuilder(endpoints, database) //
        // Optional, the default value is fine.
        //
        // Asynchronous thread pool, which is used to handle various asynchronous
        // tasks in the SDK (You are using a purely asynchronous SDK). If you do not
        // set it, there will be a default implementation, which you can reconfigure
        // if the default implementation is not satisfied.
        // The default implementation is: `SerializingExecutor`
        .asyncPool(new SerializingExecutor("asyncPool"))
        // Optional, the default value is fine.
        //
        // Sets the RPC options, in general, the default configuration is fine.
        .rpcOptions(RpcOptions.newDefault())
        // Optional, the default value is fine.
        //
        // In some case of failure, a retry of write can be attempted.
        // The default is 1
        .writeMaxRetries(1)
        // Optional, the default value is fine.
        //
        // Write flow limit: maximum number of data rows in-flight. It does not take effect on `StreamWriter`
        // The default is 65536
        .maxInFlightWriteRows(65536)
        // Optional, the default value is fine.
        //
        // Write flow limit: the policy to use when the write flow limit is exceeded.
        // All options:
        // - `LimitedPolicy.DiscardPolicy`: discard the data if the limiter is full.
        // - `LimitedPolicy.AbortPolicy`: abort if the limiter is full.
        // - `LimitedPolicy.BlockingPolicy`: blocks if the limiter is full.
        // - `LimitedPolicy.AbortOnBlockingTimeoutPolicy`: blocks the specified time if the limiter is full.
        // The default is `LimitedPolicy.AbortOnBlockingTimeoutPolicy`
        .writeLimitedPolicy(LimitedPolicy.defaultWriteLimitedPolicy())
        // Optional, the default value is fine.
        //
        // The default rate limit for stream writer. It only takes effect when we do not specify the
        // `maxPointsPerSecond` when creating a `StreamWriter`.
        // The default is 10 * 65536
        .defaultStreamMaxWritePointsPerSecond(10 * 65536)
        // Optional, the default value is fine.
        //
        // Refresh frequency of route tables. The background refreshes all route tables
        // periodically. By default, the route tables will not be refreshed.
        .routeTableRefreshPeriodSeconds(-1)
        // Optional, the default value is fine.
        //
        // Sets the request router, The internal default implementation works well.
        // You don't need to set it unless you have special requirements.
        .router(null)
        // Sets authentication information. If the DB is not required to authenticate, we can ignore this.
        .authInfo(AuthInfo.noAuthorization())
        // A good start ^_^
        .build();

GreptimeDB client = GreptimeDB.create(opts);
```

In most cases, the default options work well, so the above code can be simplified to:

```
// GreptimeDB has a default database named "public" in the default catalog "greptime",
// we can use it as the test database
String database = "public";
// By default, GreptimeDB listens on port 4001 using the gRPC protocol.
// We can provide multiple endpoints that point to the same GreptimeDB cluster.
// The client will make calls to these endpoints based on a load balancing strategy.
String[] endpoints = {"127.0.0.1:4001"};
GreptimeOptions opts = GreptimeOptions.newBuilder(endpoints, database)
        // Sets authentication information. If the DB is not required to authenticate, we can ignore this.
        .authInfo(AuthInfo.noAuthorization())
        // A good start ^_^
        .build();

GreptimeDB client = GreptimeDB.create(opts);
```

}

{template row-object%

The Java ingester SDK uses `Table` to represent multi rows on a table. We can add the row data item into the `Table` object and then written to GreptimeDB.

Alternatively, there is another way which allows us to write with simple POJO objects. Of course, this requires the use of Greptime's annotations, but these annotations are easy to understand, so don't worry about that.

Next, we will demonstrate both way:

}


{template create-rows%

```java
// Creates schemas
TableSchema myMetricCpuSchema = TableSchema.newBuilder("my_metric_cpu")
        .addColumn("host", SemanticType.Tag, DataType.String)
        .addColumn("ts", SemanticType.Timestamp, DataType.TimestampMillisecond)
        .addColumn("cpu", SemanticType.Field, DataType.Float64)
        .build();
TableSchema myMetricMemSchema = TableSchema.newBuilder("my_metric_mem")
        .addColumn("host", SemanticType.Tag, DataType.String)
        .addColumn("ts", SemanticType.Timestamp, DataType.TimestampMillisecond)
        .addColumn("memory", SemanticType.Field, DataType.Float64)
        .build();

// Adds row data items into myMetricCpu
myMetricCpu.addRow("127.0.0.1", System.currentTimeMillis(), 0.23);
myMetricCpu.addRow("127.0.0.2", System.currentTimeMillis(), 0.24);
// Adds row data items into myMetricMem
myMetricMem.addRow("127.0.0.1", System.currentTimeMillis(), 0.33);
myMetricMem.addRow("127.0.0.2", System.currentTimeMillis(), 0.34);

```

Or we can build data with POJO objects:

```java
@Metric(name = "my_metric_cpu")
public class Cpu {
    @Column(name = "host", tag = true, dataType = DataType.String)
    private String host;
    @Column(name = "ts", timestamp = true, dataType = DataType.TimestampMillisecond)
    private long ts;
    @Column(name = "cpu", dataType = DataType.Float64)
    private double cpu;
    // getters and setters
    // ...
}

@Metric(name = "my_metric_mem")
public class Memory {
    @Column(name = "host", tag = true, dataType = DataType.String)
    private String host;
    @Column(name = "ts", timestamp = true, dataType = DataType.TimestampMillisecond)
    private long ts;
    @Column(name = "mem", dataType = DataType.Float64)
    private double mem;
    // getters and setters
    // ...
}

// Add rows
Cpu cpuRow1 = new Cpu();
cpuRow1.setHost("127.0.0.1");
cpuRow1.setTs(System.currentTimeMillis());
cpuRow1.setCpu(0.23);
Cpu cpuRow2 = new Cpu();
cpuRow2.setHost("127.0.0.1");
cpuRow2.setTs(System.currentTimeMillis());
cpuRow2.setCpu(0.24);

List<Cpu> cpuRows = Arrays.asList(cpuRow1, cpuRow2);

Memory memRow1 = new Memory();
memRow1.setHost("127.0.0.1");
memRow1.setTs(System.currentTimeMillis());
memRow1.setMem(0.33);
Memory memRow2 = new Memory();
memRow2.setHost("127.0.0.2");
memRow2.setTs(System.currentTimeMillis());
memRow2.setMem(0.34);

List<Memory> memRows = Arrays.asList(memRow1, memRow2);
```

}


{template save-rows%

```java
// Saves data

// For performance reasons, the SDK is designed to be purely asynchronous.
// The return value is a future object. If you want to immediately obtain
// the result, you can call `future.get()`.
CompletableFuture<Result<WriteOk, Err>> future = greptimeDB.write(myMetricCpu, myMetricMem);

Result<WriteOk, Err> result = future.get();
if (result.isOk()) {
    // Congratulations, the write was successful.
    LOG.info("Write result: {}", result.getOk());
} else {
    // Writing failed, print the reason for the failure through the log.
    LOG.error("Failed to write: {}", result.getErr());
}

```

We also can write with POJO objects:

```java
// Saves data

CompletableFuture<Result<WriteOk, Err>> future = greptimeDB.writePOJOs(cpuRows, memRows);

Result<WriteOk, Err> result = future.get();
if (result.isOk()) {
    // Congratulations, the write was successful.
    LOG.info("Write result: {}", result.getOk());
} else {
    // Writing failed, print the reason for the failure through the log.
    LOG.error("Failed to write: {}", result.getErr());
}
```

}

{template update-rows%

```java
Table myMetricCpu = Table.from(myMetricCpuSchema);
// save a row data
long ts = 1703832681000L;
myMetricCpu.addRow("host1", ts, 0.23);

Result<WriteOk, Err> putResult = greptimeDB.write(myMetricCpu).get();

// update the row data
Table newMyMetricCpu = Table.from(myMetricCpuSchema);
// The same tag `host1`
// The same time index `1703832681000`
// The new field value `0.80`
long ts = 1703832681000L;
newMyMetricCpu.addRow("host1", ts, 0.80);

// overwrite the existing data
Result<WriteOk, Err> updateResult = greptimeDB.write(newMyMetricCpu).get();
```

Or we can update with POJO objects:

```java
Cpu cpu = new Cpu();
cpu.setHost("host1");
cpu.setTs(1703832681000L);
cpu.setCpu(0.23);

// save a row data
Result<WriteOk, Err> putResult = greptimeDB.writePOJOs(cpu).get();

// update the row data
Cpu newCpu = new Cpu();
// The same tag `host1`
newCpu.setHost("host1");
// The same time index `1703832681000`
newCpu.setTs(1703832681000L);
// The new field value `0.80`
newCpu.setCpu(0.80);

// overwrite the existing data
Result<WriteOk, Err> updateResult = greptimeDB.writePOJOs(newCpu).get();
```
}


{template recommended-query-library%

<!-- We recommend using the [Gorm](https://gorm.io/) library, which is popular and developer-friendly. -->

}

{template query-library-installation%


}

{template query-library-connect%

#### MySQL

```java

```

{template query-library-raw-sql%

```java

```

}

{template query-lib-link%

<!-- [GORM](https://gorm.io/docs/index.html) -->

}

</docs-template>
