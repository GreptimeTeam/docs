# Java

<!--@include: ./introduction.md-->

## Prerequisites

<!--@include: ./prerequisites.md-->

## Write Data

Use the following command to collect system metric data and send them to GreptimeDB.

```shell
curl -L https://github.com/GreptimeCloudStarters/quick-start-java/releases/download/v0.1.3/quick-start-java-0.1.3-SNAPSHOT-all.jar \
--output quick-start.jar && java -jar quick-start.jar
```

This demo is based on [OpenTelemetry](https://opentelemetry.io/) OTLP/http. The source code is available on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-java).

## Visualize Data with Grafana

<!--@include: ./visualize-data.md-->

## Next Steps

<!--@include: ./next-steps.md-->
