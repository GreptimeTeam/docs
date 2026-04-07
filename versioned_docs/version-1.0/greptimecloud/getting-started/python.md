---
keywords: [Python, data ingestion, system metrics, OpenTelemetry, GreptimeCloud]
description: Instructions on creating a service, writing data using Python, and visualizing data in GreptimeDB.
---

# Python

## Create Service
import Includecreateservice from './create-service.md' 

<Includecreateservice/>

## Write data

Run the following command with Python 3.10+ to collect system metric data, such as CPU and memory usage, and sends them to GreptimeDB. This demo is based on OpenTelemetry OTLP/http. The source code is available on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-python).

:::tip
[pipx](https://pypa.github.io/pipx/) is a tool to help you install and run end-user applications written in Python.
:::

```shell
pipx run --no-cache greptime-cloud-quick-start -e https://<host>/v1/otlp/v1/metrics -db <dbname> -u <username> -p <password>
```


## Visualize Data
import Includevisualizedata from './visualize-data.md' 

<Includevisualizedata/>
