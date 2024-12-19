---
keywords: [InfluxDB, 系统指标, 数据收集, Bash 脚本, 数据可视化]
description: 介绍如何通过 InfluxDB line protocol 收集系统指标数据并将其发送到 GreptimeCloud。
---

# InfluxDB Line Protocol

## 创建服务
import Includecreateservice from './create-service.md' 

<Includecreateservice/>

## 写入数据

为了通过 InfluxDB line protocol 快速开始，我们可以使用 Bash 脚本收集系统指标，例如 CPU 和内存使用情况，并将其发送到 GreptimeCloud。
源代码位于 [GitHub](https://github.com/GreptimeCloudStarters/quick-start-influxdb-line-protocol).

```shell
curl -L https://raw.githubusercontent.com/GreptimeCloudStarters/quick-start-influxdb-line-protocol/main/quick-start.sh | bash -s -- -e https://<host>/v1/influxdb/write -d <dbname> -u <username> -p <password>
```

## 数据可视化
import Includevisualizedata from './visualize-data.md' 

<Includevisualizedata/>
