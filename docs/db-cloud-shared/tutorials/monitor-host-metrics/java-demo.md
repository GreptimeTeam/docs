
### Prerequisites

* [JDK 17](https://openjdk.org/projects/jdk/17/)
* [IntelliJ IDEA](https://www.jetbrains.com/idea/)

### Example Application

Now we will create a quick start demo step by step to collect JVM runtime metrics and send them to Greptime. The demo is based on [OTLP/HTTP](https://opentelemetry.io/). For reference, you can view the complete demo on [Github](https://github.com/GreptimeCloudStarters/quick-start-java).


To begin, create a new directory named `quick-start-java` to house our project. Then use IDEA to create a new project in the directory. Choose `Java` as the Language, `Gradle` as the Build System, `JDK 17` as the Project SDK, `Groovy` as the Gradle DSL, then click `Create` button.

Update `build.gradle` with the following:

```groovy
plugins {
    id 'application'
}

repositories {
    mavenCentral()
}

jar {
    manifest {
        attributes("Main-Class": "demo.App")
    }
}

dependencies {
    implementation 'io.opentelemetry:opentelemetry-api:1.28.0'
    implementation 'io.opentelemetry:opentelemetry-sdk:1.28.0'
    implementation 'io.opentelemetry:opentelemetry-exporter-otlp:1.28.0'
    implementation 'io.opentelemetry:opentelemetry-semconv:1.28.0-alpha'
    implementation 'io.opentelemetry.instrumentation:opentelemetry-runtime-metrics:1.26.0-alpha'
    implementation 'commons-cli:commons-cli:1.5.0'
}

application {
    mainClass = 'demo.App'
}
```

Next, create a new file named `App.java` at `src/main/java/demo` and add the following:

```java
package demo;

import static io.opentelemetry.semconv.resource.attributes.ResourceAttributes.SERVICE_NAME;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.exporter.otlp.http.metrics.OtlpHttpMetricExporter;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.export.PeriodicMetricReader;
import io.opentelemetry.sdk.resources.Resource;

import java.time.Duration;
import org.apache.commons.cli.*;
import java.util.Base64;

import io.opentelemetry.instrumentation.runtimemetrics.*;

/**
 * Example of using a Long Gauge to measure execution time of method. The gauge callback will get
 * executed every collection interval. This is useful for expensive measurements that would be
 * wastefully to calculate each request.
 */
public final class App {

    static OpenTelemetry initOpenTelemetry(String dbHost, String db, String username, String password) {
        // Include required service.name resource attribute on all spans and metrics
        Resource resource =
                Resource.getDefault()
                        .merge(Resource.builder()
                                .put(SERVICE_NAME, "greptime-cloud-quick-start-java").build());
        String endpoint = String.format("https://%s/v1/otlp/v1/metrics", dbHost);
        String auth = username + ":" + password;
        String b64Auth = new String(Base64.getEncoder().encode(auth.getBytes()));

        OpenTelemetrySdk openTelemetrySdk =
                OpenTelemetrySdk.builder()
                        .setMeterProvider(
                                SdkMeterProvider
                                        .builder()
                                        .setResource(resource)
                                        .registerMetricReader(
                                                PeriodicMetricReader
                                                        .builder(OtlpHttpMetricExporter.builder()
                                                                .setEndpoint(endpoint)
                                                                .addHeader("x-greptime-db-name", db)
                                                                .addHeader("Authorization", String.format("Basic %s", b64Auth))
                                                                .setTimeout(Duration.ofSeconds(5))
                                                                .build())
                                                        .setInterval(Duration.ofSeconds(2))
                                                        .build())
                                        .build())
                        .buildAndRegisterGlobal();
        Runtime.getRuntime().addShutdownHook(new Thread(openTelemetrySdk::close));
        return openTelemetrySdk;
    }

    static String getCmdArgValue(String argName ,String[] args){
        Options options = new Options();
        Option dbHost = new Option("h", "host", true, "The host address of the GreptimeCloud database");
        Option db = new Option("db", "database", true, "The database of the GreptimeCloud database");
        Option username = new Option("u", "username", true, "The username of the database");
        Option password = new Option("p", "password", true, "The password of the database");
        options.addOption(dbHost);
        options.addOption(db);
        options.addOption(username);
        options.addOption(password);
        CommandLine cmd;
        CommandLineParser parser = new BasicParser();
        HelpFormatter helper = new HelpFormatter();
        try {
            cmd = parser.parse(options, args);
            if (cmd.hasOption(argName)) {
                String arg = cmd.getOptionValue(argName);
                return arg;
            }
        } catch (ParseException e) {
            System.out.println(e.getMessage());
            helper.printHelp("Usage:", options);
            System.exit(-1);
        }
        helper.printHelp("Usage:", options);
        System.exit(-1);
        return "";
    }
    public static void main(String[] args) throws Exception {
        String dbHost = getCmdArgValue("host", args);
        String db = getCmdArgValue("database", args);
        String username = getCmdArgValue("username", args);
        String password = getCmdArgValue("password", args);

        OpenTelemetry openTelemetry = initOpenTelemetry(dbHost, db, username, password);
        BufferPools.registerObservers(openTelemetry);
        Classes.registerObservers(openTelemetry);
        Cpu.registerObservers(openTelemetry);
        GarbageCollector.registerObservers(openTelemetry);
        MemoryPools.registerObservers(openTelemetry);
        Threads.registerObservers(openTelemetry);
        System.out.println("Sending metrics...");
        while (true) {
            Thread.sleep(2000);
        }
    }
}

```

The code above utilizes the `opentelemetry-runtime-metrics` package to collect host metrics and the `opentelemetry-exporter-otlp` package to send the metrics to Greptime. It defines a `main` function that parse command-line arguments and extract the values of the database host address, database name, username, and password first.

Additionally, there is a `initOpenTelemetry` function that initializes the OpenTelemetry SDK with the `OtlpHttpMetricExporter` and `PeriodicMetricReader` to send metrics to Greptime.

For more details about the code, you can refer to the [OpenTelemetry Documentation](https://opentelemetry.io/docs/instrumentation/java/getting-started/).

Now we can run the application:

```shell
./gradlew run --args="-h <host> -db <dbname> -u <username> -p <password>"
```
