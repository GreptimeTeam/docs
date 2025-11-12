---
keywords: [Node.js, data ingestion, system metrics, OpenTelemetry, GreptimeCloud]
description: Instructions on creating a service, writing data using Node.js, and visualizing data in GreptimeDB.
---

# Node.js

## Create Service
import Includecreateservice from './create-service.md' 

<Includecreateservice/>

## Write data

The following command collects system metric data, such as CPU and memory usage, and sends them to GreptimeCloud. This demo is based on OpenTelemetry OTLP/http. The source code is available on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-node-js).

```shell
npx greptime-cloud-quick-start@latest --endpoint=https://<host>/v1/otlp/v1/metrics --db=<dbname> --username=<username> --password=<password>
```

## Visualize Data
import Includevisualizedata from './visualize-data.md' 

<Includevisualizedata/>
