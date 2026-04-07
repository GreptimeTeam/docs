---
keywords: [Go, 系统指标, 数据收集, 安装命令, 示例代码, 数据可视化]
description: 介绍如何使用 Go 收集系统指标数据并将其发送到 GreptimeCloud，包括安装命令和示例代码。
---

# Go

## 创建服务
import Includecreateservice from './create-service.md' 

<Includecreateservice/>

## 写入数据

使用下面的命令收集系统指标数据，例如 CPU 和内存使用情况，并将其发送到 GreptimeCloud。一旦成功发送，这些指标就可以在 GreptimeCloud 控制台中查看。
该 Demo 基于 OTLP/http 采集并发送数据，源代码位于 [GitHub](https://github.com/GreptimeCloudStarters/quick-start-go).

```shell
go run github.com/GreptimeCloudStarters/quick-start-go@latest -endpoint=https://<host>/v1/otlp/v1/metrics -db=<dbname> -username=<username> -password=<password>
```

## 数据可视化
import Includevisualizedata from './visualize-data.md' 

<Includevisualizedata/>
