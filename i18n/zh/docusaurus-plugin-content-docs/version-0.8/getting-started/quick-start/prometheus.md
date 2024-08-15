# Prometheus

import Includeintroduction from './introduction.md' 

<Includeintroduction/>

## 写入数据

### 配置

我们使用 Prometheus [node_exporter](https://github.com/prometheus/node_exporter) 作为收集数据的示例。
首先创建一个名为 `prometheus.yml` 的文件，将以下配置复制到其中。

```yml
global:
  scrape_interval: 10s # The default is every 1 minute.
  evaluation_interval: 10s # The default is every 1 minute.
  # scrape_timeout is set to the global default (10s).

scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: "node"
    static_configs:
      - targets: ["node_exporter:9100"]

remote_write:
  - url: http://greptimedb:4000/v1/prometheus/write?db=public
```

配置中将 `remote_write` 的 URL 设置为 GreptimeDB 的 URL，并将收集指标的间隔设置为 10 秒。URL 中的 `greptimedb` 是 Docker 网络中 GreptimeDB 的服务名。

### 启动服务

我们使用 [Docker Compose](https://docs.docker.com/compose/) 启动 GreptimeDB、Prometheues、node_exporter 和 Grafana。首先创建一个名为 `docker-compose.yml` 的文件，将以下内容复制到其中：

```yaml
services:
  grafana:
    image: grafana/grafana-oss:9.5.15
    container_name: grafana
    ports:
      - 127.0.0.1:3000:3000

  greptime:
    image: greptime/greptimedb:v0.8.2
    container_name: greptimedb
    ports:
      - 127.0.0.1:4000:4000
      - 127.0.0.1:4001:4001
      - 127.0.0.1:4002:4002
      - 127.0.0.1:4003:4003
    command: "standalone start --http-addr 0.0.0.0:4000 --rpc-addr 0.0.0.0:4001 --mysql-addr 0.0.0.0:4002 --postgres-addr 0.0.0.0:4003"
    volumes:
      - ./greptimedb:/tmp/greptimedb

  prometheus:
    image: prom/prometheus:v2.52.0
    container_name: prometheus
    depends_on:
      - node_exporter
    ports:
      - 127.0.0.1:9090:9090
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro

  node_exporter:
    image: quay.io/prometheus/node-exporter:v1.8.0
    container_name: node_exporter_local
    ports:
      - 127.0.0.1:9100:9100
    command:
      - '--path.rootfs=/'

networks: {}
```

然后执行以下命令：

```shell
docker-compose up
```
当所有服务成功启动后，主机指标将被收集并发送到 GreptimeDB。

## 使用 Grafana 可视化数据

import Includevisualizedatabygrafana from './visualize-data-by-grafana.md' 

<Includevisualizedatabygrafana/>

## 下一步

import Includenextsteps from './next-steps.md' 

<Includenextsteps/>
