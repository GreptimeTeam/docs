---
template: template.md
---
# Java

<docs-template>

{template ingester-lib-introduction%

GreptimeDB 提供的 Java ingester SDK 是一个轻量级库，具有以下特点：

- 基于 SPI 的可扩展网络传输层，提供了使用 gRPC 框架的默认实现。
- 非阻塞、纯异步的易于使用的 API。
- 默认情况下自动收集各种性能指标，然后可以配置并将其写入本地文件。
- 能够对关键对象进行内存快照，配置并将其写入本地文件。这对于解决复杂问题很有帮助。

%}

{template ingester-lib-installation%

1. 安装 Java 开发工具包（JDK）

确保你的系统已安装 JDK 8 或更高版本。有关如何检查 Java 版本并安装 JDK 的更多信息，请参见 [Oracle JDK 安装概述文档](https://www.oracle.com/java/technologies/javase-downloads.html)

2. 将 GreptimeDB Java SDK 添加为依赖项

如果你使用的是 [Maven](https://maven.apache.org/)，请将以下内容添加到 pom.xml 的依赖项列表中：

```xml
<dependency>
    <groupId>io.greptime</groupId>
    <artifactId>ingester-all</artifactId>
    <version>${latest_version}</version>
</dependency>
```

最新版本可以在 [这里](https://central.sonatype.com/search?q=io.greptime&name=ingester-all) 查看。

配置依赖项后，请确保它们对项目可用，这可能需要在 IDE 中刷新项目或运行依赖项管理器。

%}

{template ingester-lib-connect%


下方的代码展示了以最简单的配置连接到 GreptimeDB 的方法。
如果想要自定义连接选项，请参考 [API 文档](#ingester-库参考)。
请注意每个选项的注释，它们提供了对其各自角色的详细解释。

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
        // A good start ^_^
        .build();

GreptimeDB client = GreptimeDB.create(opts);
```

%}

{template row-object%

Java ingester SDK 使用 `Table` 来表示表中的多行数据。我们可以将行数据项添加到 `Table` 对象中，然后写入 GreptimeDB。

我们还可以基本的 POJO 对象作为另一种替代方法进行写入。这种方法需要使用 Greptime 的注解，但它们很容易使用。

%}

{template create-a-row%

```java
// Creates schemas
TableSchema cpuMetricSchema = TableSchema.newBuilder("cpu_metric")
        .addTag("host", DataType.String)
        .addTimestamp("ts", DataType.TimestampMillisecond)
        .addField("cpu_user", DataType.Float64)
        .addField("cpu_sys", DataType.Float64)
        .build();
Table cpuMetric = Table.from(cpuMetricSchema);

String host = "127.0.0.1";
long ts = System.currentTimeMillis();
double cpuUser = 0.1;
double cpuSys = 0.12;
cpuMetric.addRow(host, ts, cpuUser, cpuSys);
```

%}


{template create-rows%

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

或者我们可以使用 POJO 对象构建数据：

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

%}


{template save-rows%

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

我们还可以使用 POJO 对象进行写入：

```java
// Saves data

CompletableFuture<Result<WriteOk, Err>> puts = greptimeDB.writePOJOs(cpus, memories);

Result<WriteOk, Err> result = puts.get();

if (result.isOk()) {
    LOG.info("Write result: {}", result.getOk());
} else {
    LOG.error("Failed to write: {}", result.getErr());
}
```

%}

{template update-rows%

```java
Table cpuMetric = Table.from(myMetricCpuSchema);
// save a row data
long ts = 1703832681000L;
cpuMetric.addRow("host1", ts, 0.23, 0.12);
Result<WriteOk, Err> putResult = greptimeDB.write(cpuMetric).get();

// update the row data
Table newCpuMetric = Table.from(myMetricCpuSchema);
// The same tag `host1`
// The same time index `1703832681000`
// The new value: cpu_user = `0.80`, cpu_sys = `0.81`
long ts = 1703832681000L;
myMetricCpuSchema.addRow("host1", ts, 0.80, 0.81);

// overwrite the existing data
Result<WriteOk, Err> updateResult = greptimeDB.write(myMetricCpuSchema).get();
```

或者我们可以使用 POJO 对象进行更新：

```java
Cpu cpu = new Cpu();
cpu.setHost("host1");
cpu.setTs(1703832681000L);
cpu.setCpuUser(0.23);
cpu.setCpuSys(0.12);

// save a row data
Result<WriteOk, Err> putResult = greptimeDB.writePOJOs(cpu).get();

// update the row data
Cpu newCpu = new Cpu();
// The same tag `host1`
newCpu.setHost("host1");
// The same time index `1703832681000`
newCpu.setTs(1703832681000L);
// The new value: cpu_user = `0.80`, cpu_sys = `0.81`
cpu.setCpuUser(0.80);
cpu.setCpuSys(0.81);

// overwrite the existing data
Result<WriteOk, Err> updateResult = greptimeDB.writePOJOs(newCpu).get();
```

请参考[此处](https://github.com/GreptimeTeam/greptimedb-ingester-java/tree/main/ingester-example/src/main/java/io/greptime)获取更多代码示例。

%}


{template ingester-lib-debug-logs%

### 调试日志

ingester SDK 提供了用于调试的指标和日志。
请参考 [Metrics & Display](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/docs/metrics-display.md) 和 [Magic Tools](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/docs/magic-tools.md) 了解如何启用或禁用日志。

%}

{template more-ingestion-examples%

请参考[示例](https://github.com/GreptimeTeam/greptimedb-ingester-java/tree/main/ingester-example/src/main/java/io/greptime)获取更多完全可运行的代码片段和常用方法的解释。

%}

{template ingester-lib-reference%

- [API 文档](https://javadoc.io/doc/io.greptime/ingester-protocol/latest/index.html)

%}

{template recommended-query-library%

Java 数据库连接（JDBC）是 JavaSoft 规范的标准应用程序编程接口（API），它允许 Java 程序访问数据库管理系统。

许多数据库，如 MySQL 或 PostgreSQL，都已经基于 JDBC API 实现了自己的驱动程序。
由于 GreptimeDB [支持多种协议](/user-guide/clients/overview.md)，这里我们使用 MySQL 协议作为示例来演示如何使用 JDBC。
如果你希望使用其他协议，只需要将 MySQL 驱动程序替换为相应的驱动程序。

%}

{template query-library-installation%

如果你使用的是 [Maven](https://maven.apache.org/)，请将以下内容添加到 pom.xml 的依赖项列表中：

```xml
<!-- MySQL usage dependency -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>
```

%}

{template query-library-connect%

这里我们使用 MySQL 作为示例来演示如何连接到 GreptimeDB。

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

你需要一个 properties 文件来存储数据库连接信息，将其放在 Resources 目录中并命名为 `db-connection.properties`。文件内容如下：

```txt
# DataSource
db.database-driver=com.mysql.cj.jdbc.Driver
db.url=jdbc:mysql://localhost:4002/public
db.username=
db.password=
```

或者你可以从[这里](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/ingester-example/src/main/resources/db-connection.properties)获取文件。

%}

{template query-library-raw-sql%

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

请参考[此处](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/ingester-example/src/main/java/io/greptime/QueryJDBC.java)获取更多可执行代码。

%}

{template query-lib-doc-link%

- [JDBC 在线教程](https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html)

%}

</docs-template>
