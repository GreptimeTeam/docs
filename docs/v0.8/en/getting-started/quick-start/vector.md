# Vector

<!--@include: ./introduction.md-->

## Write data

### Configure

Create a file named `vector.toml` and copy the following content into it.

```toml
[sources.in]
type = "host_metrics"
scrape_interval_secs = 5

[sinks.greptime]
inputs = ["in"]
type = "greptimedb"
endpoint = "greptimedb:4001"
dbname = "public"
```

The configuration collects [host_metrics](https://vector.dev/docs/reference/configuration/sources/host_metrics/) as a Vector source and uses local GreptimeDB as the sink destination.
The host `greptimedb` in the endpoint is the service name of GreptimeDB in the Docker network.

### Start

Here we use [Docker Compose](https://docs.docker.com/compose/) to start GreptimeDB, Vector and Grafana. To do this, create a `docker-compose.yml` file with the following content:

```yaml
services:
  grafana:
    image: grafana/grafana-oss:<%grafana-version%>
    container_name: grafana
    ports:
      - 127.0.0.1:3000:3000

  greptime:
    image: greptime/greptimedb:<%greptimedb-version%>
    container_name: greptimedb
    ports:
      - 127.0.0.1:4000:4000
      - 127.0.0.1:4001:4001
      - 127.0.0.1:4002:4002
      - 127.0.0.1:4003:4003
    command: "standalone start --http-addr 0.0.0.0:4000 --rpc-addr 0.0.0.0:4001 --mysql-addr 0.0.0.0:4002 --postgres-addr 0.0.0.0:4003"
    volumes:
      - ./greptimedb:/tmp/greptimedb

  vector:
    image: timberio/vector:<%vector-version%>
    container_name: vector
    ports:
      - 127.0.0.1:8686:8686
    volumes:
      - ./vector.toml:/etc/vector/vector.toml:ro

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
