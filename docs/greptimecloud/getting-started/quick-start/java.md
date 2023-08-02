
Use the following command collects JVM runtime metrics, such as CPU and memory usage, and sends it to GreptimeCloud. Once the metrics are sent successfully, they can be viewed on the GreptimeCloud dashboard.

```shell
curl -L https://github.com/GreptimeCloudStarters/quick-start-java/releases/download/v0.1.1/quick-start-java-0.1.1-SNAPSHOT-all.jar --output quick-start.jar && java -jar quick-start.jar -h <host> -db <dbname> -u <username> -p <password>
```

The command line is supported by a quick start demo based on OTLP/http. The source code is available on [Github](https://github.com/GreptimeCloudStarters/quick-start-java).
