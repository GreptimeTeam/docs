---
keywords: [Prometheus, 系统指标, 数据收集, 配置示例, Docker 启动命令, 数据可视化]
description: 介绍如何使用 Prometheus 收集系统指标数据并将其发送到 GreptimeCloud，包括配置文件示例和 Docker 启动命令。
---

# Prometheus

## 创建服务
import Includecreateservice from './create-service.md' 

<Includecreateservice/>

## 写入数据

### 如果你已经有正在运行的 Prometheus 实例

将下面的内容添加到你的 Prometheus 配置文件中。

```yaml
remote_write:
  - url: https://<host>/v1/prometheus/write?db=<dbname>
    basic_auth:
        username: <username>
        password: <password>
```

### 或者你期望启动一个全新的实例

启动一个 Docker 容器，将示例数据写入 GreptimeCloud 数据库：

```shell
docker run --rm -e GREPTIME_URL='https://<host>/v1/prometheus/write?db=<dbname>' -e GREPTIME_USERNAME='<username>' -e GREPTIME_PASSWORD='<password>' --name greptime-node-exporter greptime/node-exporter
```

:::tip NOTE
为了防止不小心退出 Docker 容器，你可能想以“detached”模式运行它：在 `docker run` 命令中添加 `-d` 参数即可。
:::

## 数据可视化
import Includevisualizedata from './visualize-data.md' 

<Includevisualizedata/>
