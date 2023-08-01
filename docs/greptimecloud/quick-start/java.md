
1. Download the jar file from the [release page](https://github.com/GreptimeCloudStarters/quick-start-java/releases).

```shell
curl -L https://github.com/GreptimeCloudStarters/quick-start-java/releases/download/v0.1.1/quick-start-java-0.1.1-SNAPSHOT-all.jar --output quick-start.jar
```

2. The following command collects JVM runtime metrics, such as CPU and memory usage, and sends it to GreptimeCloud. Once the metrics are sent successfully, they can be viewed on the GreptimeCloud dashboard.

```shell

java -jar quick-start.jar -h <host> -db <dbname> -u <username> -p <password>
```

This command line is supported by a [quick start demo](https://github.com/GreptimeCloudStarters/quick-start-java), which uses OpenTelemetry Protocol to export metrics. 
