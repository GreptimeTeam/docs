# Java

<!--@include: ./introduction.md-->

## Prerequisites

<!--@include: ./prerequisites.md-->

## Write Data

<!--@include: ../../db-cloud-shared/quick-start/java.md-->

If you have started GreptimeDB using the [Prerequisites section](#prerequisites), you can use the following command to write data:

```shell
curl -L https://github.com/GreptimeCloudStarters/quick-start-java/releases/download/v0.1.3/quick-start-java-0.1.3-SNAPSHOT-all.jar \
--output quick-start.jar && java -jar quick-start.jar  -h localhost -db public -P 4000 --no-secure
```

## Visualize Data with Grafana

<!--@include: ./visualize-data.md-->

## Next Steps

<!--@include: ./next-steps.md-->
