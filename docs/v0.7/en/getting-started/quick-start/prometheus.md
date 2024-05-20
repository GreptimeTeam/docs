# Prometheus

<!--@include: ./introduction.md-->

## Write data

### Configure

We use Prometheus [node_exporter](https://github.com/prometheus/node_exporter) as an example to collect data.
To do this, create a file named `prometheus.yml` and copy the following content into it.

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

The configuration sets the `remote_write` URL to the Greptime URL and sets the interval for collecting metrics to 10 seconds. The host `greptimedb` in the URL is the service name of GreptimeDB in the Docker network.

### Start Services

We use [Docker Compose](https://docs.docker.com/compose/) to start GreptimeDB, Prometheues, node_exporter and Grafana. To do this, create a `docker-compose.yml` file with the following content:

```yaml
services:
  grafana:
    image: grafana/grafana-oss:<%grafana-version%>
    container_name: grafana
    ports:
      - 3000:3000

  greptime:
    image: greptime/greptimedb:<%greptimedb-version%>
    container_name: greptimedb
    ports:
      - 4000:4000
      - 4001:4001
      - 4002:4002
      - 4003:4003
    command: "standalone start --http-addr 0.0.0.0:4000 --rpc-addr 0.0.0.0:4001 --mysql-addr 0.0.0.0:4002 --postgres-addr 0.0.0.0:4003"
    volumes:
      - ./greptimedb:/tmp/greptimedb

  prometheus:
    image: prom/prometheus:<%prometheus-version%>
    container_name: prometheus
    depends_on:
      - node_exporter
    ports:
      - 9090:9090
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro

  node_exporter:
    image: quay.io/prometheus/node-exporter:<%node-exporter-version%>
    container_name: node_exporter_local
    ports:
      - 9100:9100
    command:
      - '--path.rootfs=/'

networks: {}
```

Then run the following command:

```shell
docker-compose up
```

After every service starts successfully, the host metrics will be collected and sent to GreptimeDB.

## Visualize Data with Grafana

<!--@include: ./visualize-data-by-grafana.md-->

## Next Steps

<!--@include: ./next-steps.md-->
