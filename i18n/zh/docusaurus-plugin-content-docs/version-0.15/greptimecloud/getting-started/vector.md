---
keywords: [系统指标, 数据收集, 配置示例, 启动命令, 数据可视化]
description: 介绍如何使用 Vector 收集系统指标数据并将其发送到 GreptimeCloud，包括配置文件示例和启动命令。
---

# Vector

## 创建服务
import Includecreateservice from './create-service.md'

<Includecreateservice/>

## 写入数据

将下方配置写在 `vector.toml` 文件中，配置内容为将 [host_metrics](https://vector.dev/docs/reference/configuration/sources/host_metrics/) 作为 Vector source，将 GreptimeCloud 作为 Vector sink destination。

```toml
[sources.in]
type = "host_metrics"
scrape_interval_secs = 30

[sinks.cloud]
inputs = ["in"]
type = "greptimedb"
endpoint = "<host>:5001"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
tls = {}
new_naming = true
```

然后使用配置文件启动 Vector：

```shell
vector --config vector.toml
```

## 数据可视化
import Includevisualizedata from './visualize-data.md'

<Includevisualizedata/>
