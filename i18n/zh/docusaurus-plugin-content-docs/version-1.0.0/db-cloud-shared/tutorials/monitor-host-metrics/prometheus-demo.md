### 准备

- [Docker](https://www.docker.com/)

### 示例

我们将使用 [node exporter](https://github.com/prometheus/node_exporter) 来监控系统，并通过 Prometheus 将指标发送到 GreptimeDB。

首先，创建一个名为 `quick-start-prometheus` 的新目录来托管我们的项目，创建名为 `compose.yml` 的 docker-compose 文件，并添加以下内容：

```yaml
services:
  prometheus:
    image: prom/prometheus:VAR::prometheusVersion
    container_name: prometheus
    depends_on:
      - node_exporter
    ports:
      - 9090:9090
    volumes:
      - ./prometheus-greptimedb.yml:/etc/prometheus/prometheus.yml:ro

  node_exporter:
    image: quay.io/prometheus/node-exporter:VAR::nodeExporterVersion
    container_name: node_exporter
    ports:
      - 9100:9100
    command:
      - '--path.rootfs=/'
```

以上的配置文件将启动 Prometheus 和 node exporter。接下来，创建一个名为 `prometheus-greptimedb.yml` 的新文件，并添加以下内容：

```yaml
# my global config
global:
  scrape_interval: 15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.
  # scrape_timeout is set to the global default (10s).

# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: 'node'
    static_configs:
      - targets: ['node_exporter:9100']

remote_write:
  - url: https://<host>/v1/prometheus/write?db=<dbname>
    basic_auth:
      username: <username>
      password: <password>
```

通过上面的配置文件，Prometheus 从 node exporter 中抓取指标并将其发送到 GreptimeDB。有关 `<host>`, `<dbname>`, `<username>` 和 `<password>` 的信息，请参考 [GreptimeDB](/user-guide/integrations/prometheus.md) 或 [GreptimeCloud](/greptimecloud/integrations/prometheus.md) 中的 Prometheus 文档。

最后启动 Docker 容器：

```bash
docker-compose up
```
