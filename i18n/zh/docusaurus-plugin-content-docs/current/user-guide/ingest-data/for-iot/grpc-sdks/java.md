---
keywords: [Java SDK, 数据写入, 安装 JDK, 连接数据库, 插入数据, 调试日志, 性能指标]
description: 介绍如何使用 GreptimeDB 提供的 Java ingester SDK 写入数据，包括安装、连接、插入数据和调试日志等内容。
---

import DocTemplate from './template.md' 

# Java

<DocTemplate>

<div id="ingester-lib-introduction">

GreptimeDB 提供的 Java ingester SDK 是一个轻量级库，具有以下特点：

- 基于 SPI 的可扩展网络传输层，提供了使用 gRPC 框架的默认实现。
- 非阻塞、纯异步的易于使用的 API。
- 默认情况下自动收集各种性能指标，然后可以配置并将其写入本地文件。
- 能够对关键对象进行内存快照，配置并将其写入本地文件。这对于解决复杂问题很有帮助。

</div>

<div id="quick-start-demos">

你可以通过[快速开始 Demo](https://github.com/GreptimeTeam/greptimedb-ingester-java/tree/main/ingester-example/src/main/java/io/greptime) 来了解如何使用 GreptimeDB Java SDK。

</div>

<div id="ingester-lib-installation">

1. 安装 Java 开发工具包（JDK）

确保你的系统已安装 JDK 8 或更高版本。有关如何检查 Java 版本并安装 JDK 的更多信息，请参见 [Oracle JDK 安装概述文档](https://www.oracle.com/java/technologies/javase-downloads.html)

2. 将 GreptimeDB Java SDK 添加为依赖项

如果你使用的是 [Maven](https://maven.apache.org/)，请将以下内容添加到 pom.xml 的依赖项列表中：

```xml
<dependency>
    <groupId>io.greptime</groupId>
    <artifactId>ingester-all</artifactId>
    <version>VAR::javaSdkVersion</version>
</dependency>
```

最新版本可以在 [这里](https://central.sonatype.com/search?q=io.greptime&name=ingester-all) 查看。

配置依赖项后，请确保它们对项目可用，这可能需要在 IDE 中刷新项目或运行依赖项管理器。

</div>

<div id="ingester-lib-connect">


下方的代码展示了以最简单的配置连接到 GreptimeDB 的方法。
如果想要自定义连接选项，请参考 [API 文档](#ingester-库参考)。
请注意每个选项的注释，它们提供了对其各自角色的详细解释。

```java
// GreptimeDB 默认 database 为 "public"，默认 catalog 为 "greptime"，
// 我们可以将其作为测试数据库使用
String database = "public";
// 默认情况下，GreptimeDB 使用 gRPC 协议在监听端口 4001。
// 我们可以提供多个指向同一 GreptimeDB 集群的 endpoints，
// 客户端将根据负载均衡策略调用这些 endpoints。
String[] endpoints = {"127.0.0.1:4001"};
// 设置鉴权信息
AuthInfo authInfo = new AuthInfo("username", "password");
GreptimeOptions opts = GreptimeOptions.newBuilder(endpoints, database)
        // 如果数据库不需要鉴权，我们可以使用 AuthInfo.noAuthorization() 作为参数。
        .authInfo(authInfo)
        // 如果服务配置了 TLS ，设置 TLS 选项来启用安全连接
        //.tlsOptions(new TlsOptions())
        // 好的开始 ^_^
        .build();

GreptimeDB client = GreptimeDB.create(opts);
```

</div>

<div id="set-table-options">

你可以使用 `Context` 设置表选项。
例如，使用以下代码设置 `ttl` 选项：

```java
Context ctx = Context.newDefault();
ctx.withHint("ttl", "3d");
// 使用 ctx 对象写入数据
// `cpuMetric` 和 `memMetric` 是定义的数据对象，之后的章节中有详细描述
CompletableFuture<Result<WriteOk, Err>> future = greptimeDB.write(Arrays.asList(cpuMetric, memMetric), WriteOp.Insert, ctx);
```

</div>

<div id="low-level-object">

```java
// 为 CPU 指标构建表结构
TableSchema cpuMetricSchema = TableSchema.newBuilder("cpu_metric")
        .addTag("host", DataType.String) // 主机的标识符
        .addTimestamp("ts", DataType.TimestampMillisecond) // 毫秒级的时间戳
        .addField("cpu_user", DataType.Float64) // 用户进程的 CPU 使用率
        .addField("cpu_sys", DataType.Float64) // 系统进程的 CPU 使用率
        .build();

// 根据定义的模式创建表
Table cpuMetric = Table.from(cpuMetricSchema);

// 单行的示例数据
String host = "127.0.0.1"; // 主机标识符
long ts = System.currentTimeMillis(); // 当前时间戳
double cpuUser = 0.1; // 用户进程的 CPU 使用率（百分比）
double cpuSys = 0.12; // 系统进程的 CPU 使用率（百分比）

// 将一行数据插入表中
// 注意：参数必须按照定义的表结构的列顺序排列：host, ts, cpu_user, cpu_sys
cpuMetric.addRow(host, ts, cpuUser, cpuSys);
```

</div>

<div id="create-rows">

```java
// 创建表结构
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

// 添加行数据
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
// 插入数据

// 考虑到尽可能提升性能和降低资源占用，SDK 设计为纯异步的。
// 返回值是一个 future 对象。如果你想立即获取结果，可以调用 `future.get()`。
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

// 写入数据到流中
writer.write(cpuMetric);
writer.write(memMetric);

// 你可以对流执行操作，例如删除前 5 行
writer.write(cpuMetric.subRange(0, 5), WriteOp.Delete);
```

在所有数据写入完毕后关闭流式写入。
一般情况下，连续写入数据时不需要关闭流式写入。

```java
// 完成流式写入
CompletableFuture<WriteOk> future = writer.completed();
WriteOk result = future.get();
LOG.info("Write result: {}", result);
```

</div>


<div id="high-level-style-object">

GreptimeDB Java Ingester SDK 允许我们使用基本的 POJO 对象进行写入。虽然这种方法需要使用 Greptime 的注解，但它们很容易使用。

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

// 添加行
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

写入 POJO 对象：

```java
// 插入数据

CompletableFuture<Result<WriteOk, Err>> puts = greptimeDB.writePOJOs(cpus, memories);

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
StreamWriter<List<?>, WriteOk> writer = greptimeDB.streamWriterPOJOs();

// 写入数据到流中
writer.write(cpus);
writer.write(memories);

// 你可以对流执行操作，例如删除前 5 行
writer.write(cpus.subList(0, 5), WriteOp.Delete);
```

在所有数据写入完毕后关闭流式写入。
一般情况下，连续写入数据时不需要关闭流式写入。

```java
// 完成流式写入
CompletableFuture<WriteOk> future = writer.completed();
WriteOk result = future.get();
LOG.info("Write result: {}", result);
```

</div>

<div id="ingester-json-type">

在[低层级 API](#低层级-api) 中，
你可以使用 `addField` 方法将列类型指定为 `DataType.Json` 来添加 JSON 列，
然后使用 Map 对象添加 JSON 数据。

```java
// 为 sensor_readings 表构建表结构
TableSchema sensorReadings = TableSchema.newBuilder("sensor_readings")
        // 此处省略了创建其他列的代码
        // ...
        // 将列类型指定为 JSON
        .addField("attributes", DataType.Json)
        .build();

// ...
// 使用 map 添加 JSON 数据
Map<String, Object> attr = new HashMap<>();
attr.put("location", "factory-1");
sensorReadings.addRow(<other-column-values>... , attr);

// 以下省略了写入数据的代码
// ...
```

在[高层级 API](#高层级-api) 中，你可以在 POJO 对象中指定列类型为 `DataType.Json`。

```java
@Metric(name = "sensor_readings")
public class Sensor {
    // 此处省略了创建其他列的代码
    // ...
    // 将列类型指定为 JSON
    @Column(name = "attributes", dataType = DataType.Json)
    private Map<String, Object> attributes;
    // ...
}

Sensor sensor = new Sensor();
// ...
// 使用 map 添加 JSON 数据
Map<String, Object> attr = new HashMap<>();
attr.put("action", "running");
sensor.setAttributes(attr);

// 以下省略了写入数据的代码
// ...
```

</div>

<div id="ingester-lib-debug-logs">

## 调试日志

Java SDK 提供了用于调试的指标和日志。
请参考 [Metrics & Display](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/docs/metrics-display.md) 和 [Magic Tools](https://github.com/GreptimeTeam/greptimedb-ingester-java/blob/main/docs/magic-tools.md) 了解如何启用或禁用日志。

</div>

<div id="ingester-lib-reference">

- [API 文档](https://javadoc.io/doc/io.greptime/ingester-protocol/latest/index.html)

</div>

</DocTemplate>
