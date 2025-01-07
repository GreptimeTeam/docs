---
keywords: [InfluxDB, line protocol, system metrics, data visualization]
description: Instructions on creating a service, writing data using InfluxDB Line Protocol, and visualizing data in GreptimeDB.
---

# InfluxDB Line Protocol

## Create Service
import Includecreateservice from './create-service.md' 

<Includecreateservice/>

## Write data

To quickly get started with InfluxDB line protocol, we can use Bash to collect system metrics, such as CPU and memory usage, and send it to GreptimeDB. The source code is available on [GitHub](https://github.com/GreptimeCloudStarters/quick-start-influxdb-line-protocol).

```shell
curl -L https://raw.githubusercontent.com/GreptimeCloudStarters/quick-start-influxdb-line-protocol/main/quick-start.sh | bash -s -- -e https://<host>/v1/influxdb/write -d <dbname> -u <username> -p <password>
```

## Visualize Data
import Includevisualizedata from './visualize-data.md' 

<Includevisualizedata/>
