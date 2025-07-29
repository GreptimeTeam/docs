---
 keywords: [Java SDK, 数据写入, 安装 JDK, 连接数据库, 插入数据, 调试日志, 性能指标]
 description: 介绍如何使用 GreptimeDB 提供的 Java ingester SDK 写入数据，包括安装、连接、插入数据和调试日志等内容。
 ---

# Java Ingester for GreptimeDB

GreptimeDB 提供了用于高吞吐量数据写入的 ingester 库。
它使用 gRPC 协议，支持无 schema 写入，无需在写入数据前创建表。
更多信息请参考 [自动生成表结构](/user-guide/ingest-data/overview.md#自动生成表结构)。

GreptimeDB 提供的 Java ingester SDK 是一个轻量级、高性能的客户端，专为高效的时间序列数据摄入而设计。它利用 gRPC 协议提供非阻塞、纯异步的 API，在保持与应用程序无缝集成的同时提供高吞吐数据摄入。

该客户端提供针对各种性能要求和使用场景优化的多种摄入方法。你可以选择最适合你特定需求的方法——无论你需要低延迟操作的简单一元写入，还是处理大量时间序列数据时最大效率的高吞吐量批量流式传输。

## 架构

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

- **API Layer**：为客户端应用程序提供与 GreptimeDB 交互的上层接口
- **Data Model**：定义时间序列数据的结构和组织，包括表和 schemas
- **Transport Layer**：处理通信逻辑、请求路由和客户端管理
- **Network Layer**：使用 Arrow Flight 和 gRPC 底层协议通信

## 使用方法

### 安装

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

配置依赖项后，请确保它们对项目可用。这可能需要在 IDE 中刷新项目或运行依赖项管理器。

### 客户端初始化

GreptimeDB Ingester Java 客户端的入口点是 `GreptimeDB` 类。你可以通过调用静态创建方法并传入适当的配置选项来创建客户端实例。

```java
// GreptimeDB 在默认目录 "greptime" 中有一个名为 "public" 的默认数据库，
// 我们可以将其用作测试数据库
String database = "public";
// 默认情况下，GreptimeDB 使用 gRPC 协议在端口 4001 上监听。
// 我们可以提供多个指向同一 GreptimeDB 集群的端点。
// 客户端将基于负载均衡策略调用这些端点。
// 客户端执行定期健康检查并自动将请求路由到健康节点，
// 为你的应用程序提供容错能力和改进的可靠性。
String[] endpoints = {"127.0.0.1:4001"};
// 设置认证信息。
AuthInfo authInfo = new AuthInfo("username", "password");
GreptimeOptions opts = GreptimeOptions.newBuilder(endpoints, database)
        // 如果数据库不需要认证，我们可以使用 `AuthInfo.noAuthorization()` 作为参数。
        .authInfo(authInfo)
        // 如果你的服务器由 TLS 保护，请启用安全连接
        //.tlsOptions(new TlsOptions())
        // 好的开始 ^_^
        .build();

// 初始化客户端
// 注意：客户端实例是线程安全的，应作为全局单例重用
// 以获得更好的性能和资源利用率。
GreptimeDB client = GreptimeDB.create(opts);
```

### 写入数据

Ingester 通过 `Table` 抽象为写入数据到 GreptimeDB 提供了统一的方法。所有数据写入操作，包括高级 API，都建立在这个基础结构之上。要写入数据，你需要创建一个 `Table` 为其填充时间序列数据，最后将其写入数据库。

#### 创建和写入表

定义表结构并创建表：

```java
// 创建表结构
TableSchema schema = TableSchema.newBuilder("metrics")
    .addTag("host", DataType.String)
    .addTag("region", DataType.String)
    .addField("cpu_util", DataType.Float64)
    .addField("memory_util", DataType.Float64)
    .addTimestamp("ts", DataType.TimestampMillisecond)
    .build();

// 从 schema 创建表数据容器
Table table = Table.from(schema);

// 向表中添加行
// 值必须按照结构中定义的顺序提供
// 在这种情况下：addRow(host, region, cpu_util, memory_util, ts)
table.addRow("host1", "us-west-1", 0.42, 0.78, System.currentTimeMillis());
table.addRow("host2", "us-west-2", 0.46, 0.66, System.currentTimeMillis());
// 添加更多行
// ..

// 把表标记为完成以使其不可变。这将最终确定表的数据内容以进行写入。
// 如果用户忘记调用此方法，它将在表数据写入前自动在内部调用
table.complete();

// 写入数据库
CompletableFuture<Result<WriteOk, Err>> future = client.write(table);
```

GreptimeDB 支持使用 [JSON 类型数据](/reference/sql/data-types.md#json-类型) 存储复杂的数据结构。你可以在表结构中定义 JSON 列，并使用 Map 对象插入数据：

```java
// 为 sensor_readings 构建表结构
TableSchema sensorReadings = TableSchema.newBuilder("sensor_readings")
        // 省略创建其他列的代码
        // ...
        // 将列类型指定为 JSON        
        .addField("attributes", DataType.Json)
        .build();

// ...
// 使用 map 插入 JSON 数据
Map<String, Object> attr = new HashMap<>();
attr.put("location", "factory-1");
sensorReadings.addRow(<other-column-values>... , attr);
```

##### TableSchema

`TableSchema` 定义了写入数据到 GreptimeDB 的结构。它指定表结构，包括列名、语义类型和数据类型。有关列语义类型（`Tag`、`Timestamp`、`Field`）的详细信息，请参考 [数据模型](/user-guide/concepts/data-model.md) 文档。

##### Table

`Table` 接口表示可以写入到 GreptimeDB 的数据。它提供添加行和操作数据的方法。本质上，`Table` 将数据临时存储在内存中，允许你在将数据发送到数据库之前累积多行进行批处理，这比写入单个行显著提高了写入效率。

表经历几个不同的生命周期阶段：

1. **创建**：使用 `Table.from(schema)` 从 schema 初始化表
2. **数据添加**：使用 `addRow()` 方法用行填充表
3. **完成**：添加所有行后使用 `complete()` 冻结表不允许再修改
4. **写入**：将完成的表发送到数据库

重要提醒：
- 表不是线程安全的，应该单线程访问
- 写入后不能重用表 - 需要为每个写入操作创建新实例
- 关联的 `TableSchema` 是不可变的，可以在多个操作中安全地复用

### 写入操作

虽然在通过 SDK 向 GreptimeDB 写入数据时会自动创建时间序列表，
但你仍然可以配置表选项。
SDK 支持以下表选项：

- `auto_create_table`：默认为 `True`。如果设置为 `False`，表示表已经存在且不需要自动创建，这可以提高写入性能。
- `ttl`、`append_mode`、`merge_mode`：更多详情请参考 [表选项](/reference/sql/create.md#table-options)。

你可以使用 `Context` 设置表选项。
例如，要设置 `ttl` 选项，请使用以下代码：

```java
Context ctx = Context.newDefault();
// 添加提示使数据库创建具有指定 TTL（生存时间）的表
ctx = ctx.withHint("ttl", "3d");
// 将压缩算法设置为 Zstd。
ctx = ctx.withCompression(Compression.Zstd);
// 写入数据到 GreptimeDB 时使用 ctx
CompletableFuture<Result<WriteOk, Err>> future = client.write(Arrays.asList(table1, table2), WriteOp.Insert, ctx);
```

有关如何向 GreptimeDB 写入数据，请参阅以下部分。

### 批量写入

批量写入允许你在单个请求中向多个表写入数据。它返回 `CompletableFuture<Result<WriteOk, Err>>` 是一个典型的异步编程方式。

对于大多数使用场景，这是向 GreptimeDB 写入数据的推荐方式。

```java
// 批量写入 API
CompletableFuture<Result<WriteOk, Err>> future = client.write(table1, table2, table3);

// 出于性能考虑，SDK 被设计为纯异步的。
// 返回值是一个 CompletableFuture 对象。如果你想立即获取
// 结果，可以调用 `future.get()`，这将阻塞直到操作完成。
// 对于生产环境，建议使用回调或
// CompletableFuture API 等非阻塞方法。
Result<WriteOk, Err> result = future.get();
```

### 流式写入

流式写入 API 维护到 GreptimeDB 的持久连接，以便进行具有速率限制的连续数据摄入。它允许通过单个流向多个表写入数据。

以下场景推荐使用此 API：
- 中小规模的连续数据收集
- 通过一个连接管道写入多个表的数据
- 简单性和便利性比最大吞吐量更重要的情况

```java
// 创建流写入器
StreamWriter<Table, WriteOk> writer = client.streamWriter();

// 写入多个表
writer.write(table1)
      .write(table2)
      .write(table3);

// 完成流并获取结果
CompletableFuture<WriteOk> result = writer.completed();
```

你还可以为流式写入设置速率限制：

```java
// 限制为每秒 1000 个数据点
StreamWriter<Table, WriteOk> writer = client.streamWriter(1000);
```

### Bulk 写入

Bulk 写入 API 提供了一种高性能、内存高效的机制，用于将大量时间序列数据摄入到 GreptimeDB 中。它利用堆外内存管理，在写入大批量数据时实现最佳吞吐量。

**重要说明**：
1. **需要手动创建表**：Bulk API **不会**自动创建表。你必须事先创建表，使用以下方法之一：
   - 常规写入 API（支持自动创建表），或
   - SQL DDL 语句（CREATE TABLE）
2. **Schema 匹配**：Bulk API 中的表模板必须与现有表结构完全匹配。
3. **列类型**：对于 Bulk API，目前要求使用 `addField()` 而不是 `addTag()`。`Tag` 列是 GreptimeDB 中主键的一部分，但 Bulk API 尚不支持带有 `Tag` 列的表。此限制将在未来版本中得到解决。

此 API 仅支持每个流写入一个表，并处理大数据量（每次写入可高达 200MB+），具有自适应流量控制。性能优势包括：
- 使用 Arrow 缓冲区的堆外内存管理减少不必要的内置拷贝
- 高效的二进制序列化和数据传输
- 可选压缩选项
- 批量操作

此方法特别适用于：
- 大规模批处理和数据迁移
- 高吞吐量日志和传感器数据摄入
- 具有苛刻性能要求的时间序列应用程序
- 处理高频数据收集的系统

以下是使用批处理写入 API 的典型模式：

```java
// 使用表结构创建 BulkStreamWriter
try (BulkStreamWriter writer = greptimeDB.bulkStreamWriter(schema)) {
    // 写入多个批次
    for (int batch = 0; batch < batchCount; batch++) {
        // 为此批次获取 TableBufferRoot
        Table.TableBufferRoot table = writer.tableBufferRoot(1000); // 列缓冲区大小

        // 向批次添加行
        for (int row = 0; row < rowsPerBatch; row++) {
            Object[] rowData = generateRow(batch, row);
            table.addRow(rowData);
        }

        // 完成表以准备传输
        table.complete();

        // 发送批次并获取完成的 future
        CompletableFuture<Integer> future = writer.writeNext();

        // 等待批次被处理（可选）
        Integer affectedRows = future.get();

        System.out.println("Batch " + batch + " wrote " + affectedRows + " rows");
    }

    // 发出流完成信号
    writer.completed();
}
```

#### 配置

可以使用多个选项配置 Bulk API 以优化性能：

```java
BulkWrite.Config cfg = BulkWrite.Config.newBuilder()
        .allocatorInitReservation(64 * 1024 * 1024L) // 自定义内存分配：64MB 初始保留
        .allocatorMaxAllocation(4 * 1024 * 1024 * 1024L) // 自定义内存分配：4GB 最大分配
        .timeoutMsPerMessage(60 * 1000) // 每个请求 60 秒超时
        .maxRequestsInFlight(8) // 并发控制：配置 8 个最大并发请求
        .build();
// 启用 Zstd 压缩
Context ctx = Context.newDefault().withCompression(Compression.Zstd);

BulkStreamWriter writer = greptimeDB.bulkStreamWriter(schema, cfg, ctx);
```

### 资源管理

使用完客户端后正确关闭客户端很重要：

```java
// 优雅地关闭客户端
client.shutdownGracefully();
```

### 性能调优

#### 压缩选项

Ingester 支持各种压缩算法以降低网络带宽占用并提高吞吐量。

```java
// 将压缩算法设置为 Zstd
Context ctx = Context.newDefault().withCompression(Compression.Zstd);
```

#### 写入操作比较

了解不同写入方法的性能特征对于优化数据摄入至关重要。

| 写入方法 | API | 吞吐量 | 延迟 | 内存效率 | CPU 使用 | 最佳用途 | 限制 |
|----------|-----|---------|------|----------|----------|----------|------|
| Batching Write | `write(tables)` | 较好 | 良好 | 高 | 较高 | 简单应用程序，低延迟需求 | 大量数据的吞吐量较低 |
| Streaming Write | `streamWriter()` | 中等 | 良好 | 中等 | 中等 | 连续数据流，中等吞吐量 | 比常规写入更复杂 |
| Bulk Write | `bulkStreamWriter()` | 最佳 | 较高 | 最佳 | 中等 | 最大吞吐量，大批量操作 | 延迟较高，需要手动创建表 |

#### 缓冲区大小优化

使用 `BulkStreamWriter` 时，你可以配置列缓冲区大小：

```java
// 获取具有特定列缓冲区大小的表缓冲区
Table.TableBufferRoot table = bulkStreamWriter.tableBufferRoot(columnBufferSize);
```

此选项可以显著提高数据转换为底层格式的速度。为了获得最佳性能，我们建议将列缓冲区大小设置为 1024 或更大，具体取决于你的特定工作负载特征和可用内存。

### 导出指标

Ingester 公开全面的指标，使你能够监控其性能、健康状况和操作状态。

有关可用指标及其使用的详细信息，请参考 [Ingester Prometheus Metrics](https://github.com/GreptimeTeam/greptimedb-ingester-java/tree/main/ingester-prometheus-metrics) 文档。

## API 文档和示例
- [API 参考](https://javadoc.io/doc/io.greptime/ingester-protocol/latest/index.html)
- [示例](https://github.com/GreptimeTeam/greptimedb-ingester-java/tree/main/ingester-example/)

## FAQ

### 为什么我会遇到一些连接异常？

使用 GreptimeDB Java ingester SDK 时，你可能会遇到一些连接异常。
例如，异常是"`Caused by: java.nio.channels.UnsupportedAddressTypeException`"、
"`Caused by: java.net.ConnectException: connect(..) failed: Address family not supported by protocol`" 或
"`Caused by: java.net.ConnectException: connect(..) failed: Invalid argument`"。当你确定
GreptimeDB 服务器正在运行，并且其端点可达时。

这些连接异常可能都是因为在打包过程中，gRPC 的 `io.grpc.NameResolverProvider` 服务提供程序没有
打包到最终的 JAR 中。所以修复方法可以是：

- 如果你使用 Maven Assembly 插件，请将 `metaInf-services` 容器描述符处理程序添加到你的 assembly 
  文件中，如下所示：
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
- 如果你使用 Maven Shade 插件，可以添加 `ServicesResourceTransformer`：
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

## Ingester 库参考

- [API 文档](https://javadoc.io/doc/io.greptime/ingester-protocol/latest/index.html)
