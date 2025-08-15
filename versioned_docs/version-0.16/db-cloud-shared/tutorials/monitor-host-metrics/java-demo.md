### Prerequisites

- [JDK 17](https://openjdk.org/projects/jdk/17/)
- [IntelliJ IDEA](https://www.jetbrains.com/idea/)

### Example Application

In this section, we will create a quick start demo and showcase the core code to collect JVM runtime metrics and send them to GreptimeDB. The demo is based on [OTLP/HTTP](https://opentelemetry.io/). For reference, you can obtain the entire demo on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-java).

To begin, create a new directory named `quick-start-java` to host our project, then use IDEA to create a new project in the directory. Choose `Java` as the Language, `Gradle` as the Build System, `JDK 17` as the Project SDK, `Groovy` as the Gradle DSL, then click `Create` button.

Install the required packages in `build.gradle`:

```groovy
dependencies {
    implementation 'io.opentelemetry:opentelemetry-api:1.28.0'
    implementation 'io.opentelemetry:opentelemetry-sdk:1.28.0'
    implementation 'io.opentelemetry:opentelemetry-exporter-otlp:1.28.0'
    implementation 'io.opentelemetry:opentelemetry-semconv:1.28.0-alpha'
    implementation 'io.opentelemetry.instrumentation:opentelemetry-runtime-metrics:1.26.0-alpha'
}
```

Once the required packages are installed, write the code to create a metric export object that sends metrics to GreptimeDB. For the configuration about the exporter, please refer to OTLP integration documentation in [GreptimeDB](/user-guide/protocols/opentelemetry.md) or [GreptimeCloud](/greptimecloud/integrations/otlp.md).

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

Then attach the exporter to the MeterProvider and start the JVM runtime metrics collection:

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

For more details about the code, you can refer to the [OpenTelemetry Documentation](https://opentelemetry.io/docs/instrumentation/java/getting-started/).

Congratulations on successfully completing the core section of the demo! You can now run the complete demo by following the instructions in the `README.md` file on the [GitHub repository](https://github.com/GreptimeCloudStarters/quick-start-java).
