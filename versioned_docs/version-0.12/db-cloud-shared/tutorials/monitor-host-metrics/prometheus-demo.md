### Prerequisites

- [Docker](https://www.docker.com/)

### Example

We will use [node exporter](https://github.com/prometheus/node_exporter) to monitor the host system and send metrics to GreptimeDB via [Prometheus](https://prometheus.io/).

To begin, create a new directory named `quick-start-prometheus` to host our project. Create a docker compose file named `compose.yml` and add the following:

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

The configuration file above will start a Prometheus server and a node exporter. Next, create a new file named `prometheus-greptimedb.yml` and add the following:

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

The configuration file above configures Prometheus to scrape metrics from the node exporter and send them to GreptimeDB. For the configuration about `<host>`, `<dbname>`, `<username>`, and `<password>`, please refer to the Prometheus documentation in [GreptimeDB](/user-guide/integrations/prometheus.md) or [GreptimeCloud](/greptimecloud/integrations/prometheus.md).

Finally, start the containers:

```bash
docker-compose up
```
