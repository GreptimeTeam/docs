# Go

## Create Service
<!--@include: ./create-service.md-->

## Write data

The following command collects system metric data, such as CPU and memory usage, and sends them to GreptimeDB. This demo is based on OpenTelemetry OTLP/http. The source code is available on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-go).

```shell
go run github.com/GreptimeCloudStarters/quick-start-go@latest -endpoint=https://<host>/v1/otlp/v1/metrics -db=<dbname> -username=<username> -password=<password>
```

## Visualize Data
<!--@include: ./visualize-data.md-->
