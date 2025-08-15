---
keywords: [Python, 系统指标, 数据收集, 安装命令, 示例代码, 数据可视化]
description: 介绍如何使用 Python 收集系统指标数据并将其发送到 GreptimeCloud，包括安装命令和示例代码。
---

# Python

## 创建服务
import Includecreateservice from './create-service.md' 

<Includecreateservice/>

## 写入数据

在 Python 3.10+ 中使用下面的命令收集系统指标数据，例如 CPU 和内存使用情况，并将其发送到 GreptimeCloud。一旦成功发送，这些指标就可以在 GreptimeCloud 控制台中查看。
该 Demo 基于 OTLP/http 采集并发送数据，源代码位于 [GitHub](https://github.com/GreptimeCloudStarters/quick-start-python).

:::tip
[pipx](https://pypa.github.io/pipx/) 是一个帮助你安装和运行用 Python 编写的应用程序的工具。
:::

```shell
pipx run --no-cache greptime-cloud-quick-start -e https://<host>/v1/otlp/v1/metrics -db <dbname> -u <username> -p <password>
```

## 数据可视化
import Includevisualizedata from './visualize-data.md' 

<Includevisualizedata/>
