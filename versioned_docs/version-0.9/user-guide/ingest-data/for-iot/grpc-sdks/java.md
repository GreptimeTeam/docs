import DocTemplate from './template.md' 

# Java

<DocTemplate>

<div id="ingester-lib-introduction">

The Java ingester SDK provided by GreptimeDB is a lightweight library with the following features:

- SPI-based extensible network transport layer, which provides the default implementation using the gRPC framework.
- Non-blocking, purely asynchronous API that is easy to use.
- Automatic collection of various performance metrics by default. You can then configure and write them to local files.
- Ability to take in-memory snapshots of critical objects, configure them, and write them to local files. This is helpful for troubleshooting complex issues.

</div>

<div id="ingester-lib-installation">

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
    <version>0.7.3</version>
</dependency>
```

The latest version can be viewed [here](https://central.sonatype.com/search?q=io.greptime&name=ingester-all).

After configuring your dependencies, make sure they are available to your project. This may require refreshing the project in your IDE or running the dependency manager.

</div>

<div id="ingester-lib-connect">

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

For customizing the connection options, please refer to [API Documentation](#ingester-library-reference).

</div>


<div id="low-level-object">

```java
// Construct the table schema for CPU metrics
TableSchema cpuMetricSchema = TableSchema.newBuilder("cpu_metric")
        .addTag("host", DataType.String) // Identifier for the host
        .addTimestamp("ts", DataType.TimestampMillisecond) // Timestamp in milliseconds
        .addField("cpu_user", DataType.Float64) // CPU usage by user processes
        .addField("cpu_sys", DataType.Float64) // CPU usage by system processes
        .build();

// Create the table from the defined schema
Table cpuMetric = Table.from(cpuMetricSchema);

// Example data for a single row
String host = "127.0.0.1"; // Host identifier
long ts = System.currentTimeMillis(); // Current timestamp
double cpuUser = 0.1; // CPU usage by user processes (in percentage)
double cpuSys = 0.12; // CPU usage by system processes (in percentage)

// Insert the row into the table
// NOTE: The arguments must be in the same order as the columns in the defined schema: host, ts, cpu_user, cpu_sys
cpuMetric.addRow(host, ts, cpuUser, cpuSys);
```

</div>


<div id="create-rows">

```java
// Creates schemas
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

Table cpuMetric = Table.from(cpuMetricSchema);
Table memMetric = Table.from(memMetricSchema);

// Adds row data items
for (int i = 0; i < 10; i++) {
    String host = "127.0.0." + i;
    long ts = System.currentTimeMillis();
    double cpuUser = i + 0.1;
    double cpuSys = i + 0.12;
    cpuMetric.addRow(host, ts, cpuUser, cpuSys);
}

for (int i = 0; i < 10; i++) {
    String host = "127.0.0." + i;
    long ts = System.currentTimeMillis();
    double memUsage = i + 0.2;
    memMetric.addRow(host, ts, memUsage);
}

```

</div>


<div id="insert-rows">

```java
// Saves data

// For performance reasons, the SDK is designed to be purely asynchronous.
// The return value is a future object. If you want to immediately obtain
// the result, you can call `future.get()`.
CompletableFuture<Result<WriteOk, Err>> future = greptimeDB.write(cpuMetric, memMetric);

Result<WriteOk, Err> result = future.get();

if (result.isOk()) {
    LOG.info("Write result: {}", result.getOk());
} else {
    LOG.error("Failed to write: {}", result.getErr());
}

```

</div>


<div id="streaming-insert">


```java
StreamWriter<Table, WriteOk> writer = greptimeDB.streamWriter();

// write data into stream
writer.write(cpuMetric);
writer.write(memMetric);

// You can perform operations on the stream, such as deleting the first 5 rows.
writer.write(cpuMetric.subRange(0, 5), WriteOp.Delete);
```

Close the stream writing after all data has been written.
In general, you do not need to close the stream writing when continuously writing data.

```java
// complete the stream
CompletableFuture<WriteOk> future = writer.completed();
WriteOk result = future.get();
LOG.info("Write result: {}", result);
```

</div>

<div id="high-level-style-object">

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

</div>


<div id="high-level-style-insert-data">


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

</div>


<div id="high-level-style-streaming-insert">

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

</div>

<div id="ingester-lib-debug-logs">

### Debug logs

The ingester SDK provides metrics and logs for debugging.
Please refer to [Metrics & Display](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/docs/metrics-display.md) and [Magic Tools](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/docs/magic-tools.md) to learn how to enable or disable the logs.

</div>

<div id="more-ingestion-examples">

For fully runnable code snippets and the complete code of the demo, please refer to the [Examples](https://github.com/GreptimeTeam/greptimedb-ingester-java/tree/main/ingester-example/src/main/java/io/greptime).

</div>

<div id="ingester-lib-reference">

- [API Documentation](https://javadoc.io/doc/io.greptime/ingester-protocol/latest/index.html)

</div>

<!-- <div id="recommended-query-library">

Java database connectivity (JDBC) is the JavaSoft specification of a standard application programming interface (API) that allows Java programs to access database management systems.

Many databases, such as MySQL or PostgreSQL, have implemented their own drivers based on the JDBC API.
Since GreptimeDB supports [multiple protocols](/user-guide/clients/overview.md), we use MySQL as an example to demonstrate how to use JDBC.
If you want to use other protocols, just replace the MySQL driver with the corresponding driver.

</div>

<div id="query-library-installation">

If you are using [Maven](https://maven.apache.org/), add the following to your pom.xml
dependencies list:

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>
```

</div> -->

<!-- <div id="query-library-connect">

Here we will use MySQL as an example to demonstrate how to connect to GreptimeDB.

```java

public static Connection getConnection() throws IOException, ClassNotFoundException, SQLException {
    Properties prop = new Properties();
    prop.load(QueryJDBC.class.getResourceAsStream("/db-connection.properties"));

    String dbName = (String) prop.get("db.database-driver");

    String dbConnUrl = (String) prop.get("db.url");
    String dbUserName = (String) prop.get("db.username");
    String dbPassword = (String) prop.get("db.password");

    Class.forName(dbName);
    Connection dbConn = DriverManager.getConnection(dbConnUrl, dbUserName, dbPassword);

    return Objects.requireNonNull(dbConn, "Failed to make connection!");
}

```

You need a properties file to store the DB connection information. Place it in the Resources directory and name it `db-connection.properties`. The file content is as follows:

```txt
# DataSource
db.database-driver=com.mysql.cj.jdbc.Driver
db.url=jdbc:mysql://localhost:4002/public
db.username=
db.password=
```

Or you can just get the file from [here](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/ingester-example/src/main/resources/db-connection.properties).

#### Time zone

Set the JDBC time zone by setting URL parameters:

```txt
jdbc:mysql://127.0.0.1:4002?connectionTimeZone=Asia/Shanghai&forceConnectionTimeZoneToSession=true
```

* `connectionTimeZone={LOCAL|SERVER|user-defined-time-zone}` specifies the connection time zone.
* `forceConnectionTimeZoneToSession=true` makes the session `time_zone` variable to be set to the value specified in `connectionTimeZone`. 

</div> -->

<!-- <div id="query-library-raw-sql">

```java
try (Connection conn = getConnection()) {
    Statement statement = conn.createStatement();

    // DESC table;
    ResultSet rs = statement.executeQuery("DESC cpu_metric");
    LOG.info("Column | Type | Key | Null | Default | Semantic Type ");
    while (rs.next()) {
        LOG.info("{} | {} | {} | {} | {} | {}",
                rs.getString(1),
                rs.getString(2),
                rs.getString(3),
                rs.getString(4),
                rs.getString(5),
                rs.getString(6));
    }

    // SELECT COUNT(*) FROM cpu_metric;
    rs = statement.executeQuery("SELECT COUNT(*) FROM cpu_metric");
    while (rs.next()) {
        LOG.info("Count: {}", rs.getInt(1));
    }

    // SELECT * FROM cpu_metric ORDER BY ts DESC LIMIT 5;
    rs = statement.executeQuery("SELECT * FROM cpu_metric ORDER BY ts DESC LIMIT 5");
    LOG.info("host | ts | cpu_user | cpu_sys");
    while (rs.next()) {
        LOG.info("{} | {} | {} | {}",
                rs.getString("host"),
                rs.getTimestamp("ts"),
                rs.getDouble("cpu_user"),
                rs.getDouble("cpu_sys"));
    }
}

```

For the complete code of the demo, please refer to [here](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/ingester-example/src/main/java/io/greptime/QueryJDBC.java).

</div> -->

<!-- <div id="query-lib-doc-link">

- [JDBC Online Tutorials](https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html)

</div> -->

</DocTemplate>
