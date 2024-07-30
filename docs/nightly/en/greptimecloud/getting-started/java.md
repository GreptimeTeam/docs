# Java

## Create Service
<!--@include: ./create-service.md-->

## Write data

Use the following command to collect JVM runtime metrics, such as CPU and memory usage, and send them to GreptimeDB.
This demo is based on OpenTelemetry OTLP/http. The source code is available on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-java).

```shell
curl -L https://github.com/GreptimeCloudStarters/quick-start-java/releases/latest/download/greptime-quick-start-java-all.jar \
--output quick-start.jar && java -jar quick-start.jar -e https://<host>/v1/otlp/v1/metrics -db <dbname> -u <username> -p <password>
```


## Visualize Data
<!--@include: ./visualize-data.md-->
