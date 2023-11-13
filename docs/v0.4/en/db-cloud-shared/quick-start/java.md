
Use the following command to collect JVM runtime metrics, such as CPU and memory usage, and send them to GreptimeDB.
This demo is based on OpenTelemetry OTLP/http. The source code is available on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-java).

```shell
curl -L https://github.com/GreptimeCloudStarters/quick-start-java/releases/download/v0.1.2/quick-start-java-0.1.2-SNAPSHOT-all.jar --output quick-start.jar && java -jar quick-start.jar -h <host> -db <dbname> -u <username> -p <password>
```
