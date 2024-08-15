# Prometheus

import Includeintroduction from './introduction.md' 

<Includeintroduction/>

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

Then run the following command:

```shell
docker-compose up
```

After every service starts successfully, the host metrics will be collected and sent to GreptimeDB.

## Visualize Data with Grafana

import Includevisualizedatabygrafana from './visualize-data-by-grafana.md' 

<Includevisualizedatabygrafana/>

## Next Steps

import Includenextsteps from './next-steps.md' 

<Includenextsteps/>
