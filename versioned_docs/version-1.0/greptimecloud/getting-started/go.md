---
keywords: [Go SDK, system metrics, data visualization, OpenTelemetry]
description: Instructions on creating a service, writing data using Go, and visualizing data in GreptimeDB.
---

# Go

## Create Service
import Includecreateservice from './create-service.md' 

<Includecreateservice/>

## Write data

The following command collects system metric data, such as CPU and memory usage, and sends them to GreptimeDB. This demo is based on OpenTelemetry OTLP/http. The source code is available on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-go).

```shell
go run github.com/GreptimeCloudStarters/quick-start-go@latest -endpoint=https://<host>/v1/otlp/v1/metrics -db=<dbname> -username=<username> -password=<password>
```

## Visualize Data
import Includevisualizedata from './visualize-data.md' 

<Includevisualizedata/>
