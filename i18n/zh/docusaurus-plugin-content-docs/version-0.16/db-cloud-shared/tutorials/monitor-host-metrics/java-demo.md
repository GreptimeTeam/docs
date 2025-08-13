### 准备

- [JDK 17](https://openjdk.org/projects/jdk/17/)
- [IntelliJ IDEA](https://www.jetbrains.com/idea/)

### 示例 Demo

在本节中，我们将创建一个快速开始的 Demo，并展示收集 JVM runtime metrics 并发送到 GreptimeDB 的核心代码。该 Demo 基于[OTLP/HTTP](https://opentelemetry.io/)。你可以在 [GitHub](https://github.com/GreptimeCloudStarters/quick-start-java) 上获取整个 Demo 以作参考。

首先创建一个名为 `quick-start-java` 的新目录来托管我们的项目，然后使用 IDEA 在该目录中创建一个新项目。选择 Java 作为语言，Gradle 作为构建系统，JDK 17 作为项目 SDK，Groovy 作为 Gradle DSL，然后点击 Create 按钮。

在 build.gradle 中安装所需的包：

```groovy
dependencies {
    implementation 'io.opentelemetry:opentelemetry-api:1.28.0'
    implementation 'io.opentelemetry:opentelemetry-sdk:1.28.0'
    implementation 'io.opentelemetry:opentelemetry-exporter-otlp:1.28.0'
    implementation 'io.opentelemetry:opentelemetry-semconv:1.28.0-alpha'
    implementation 'io.opentelemetry.instrumentation:opentelemetry-runtime-metrics:1.26.0-alpha'
}
```

安装完依赖后，编写代码创建一个 Metric Exporter 对象，用于将 metrics 发送到 GreptimeDB。
请参考 [GreptimeDB](/user-guide/protocols/opentelemetry.md) 或 [GreptimeCloud](/greptimecloud/integrations/otlp.md) 中的 OTLP 集成文档获取 exporter 的相关配置。

```java
String endpoint = String.format("https://%s/v1/otlp/v1/metrics", dbHost);
String auth = username + ":" + password;
String b64Auth = new String(Base64.getEncoder().encode(auth.getBytes()));
OtlpHttpMetricExporter exporter = OtlpHttpMetricExporter.builder()
                .setEndpoint(endpoint)
                .addHeader("X-Greptime-DB-Name", db)
                .addHeader("Authorization", String.format("Basic %s", b64Auth))
                .setTimeout(Duration.ofSeconds(5))
                .build();
```

将 exporter 附加到 MeterProvider 并开始收集 JVM runtime metrics：

```java
PeriodicMetricReader metricReader = PeriodicMetricReader
        .builder(exporter)
        .setInterval(Duration.ofSeconds(5))
        .build();
SdkMeterProvider meterProvider = SdkMeterProvider
        .builder()
        .setResource(resource)
        .registerMetricReader(metricReader)
        .build();

OpenTelemetrySdk openTelemetrySdk = OpenTelemetrySdk.builder()
        .setMeterProvider(meterProvider)
        .buildAndRegisterGlobal();
Runtime.getRuntime().addShutdownHook(new Thread(openTelemetrySdk::close));
BufferPools.registerObservers(openTelemetry);
Classes.registerObservers(openTelemetry);
Cpu.registerObservers(openTelemetry);
GarbageCollector.registerObservers(openTelemetry);
MemoryPools.registerObservers(openTelemetry);
Threads.registerObservers(openTelemetry);
```

请参考 [OpenTelemetry 文档](https://opentelemetry.io/docs/instrumentation/java/getting-started/) 获取有关代码的更多详细信息。

恭喜你完成了 Demo 的核心部分！现在可以按照 [GitHub 库](https://github.com/GreptimeCloudStarters/quick-start-java)中 `README.md` 文件中的说明运行完整的 Demo。
