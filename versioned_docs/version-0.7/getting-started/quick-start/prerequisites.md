
Before trying GreptimeDB, we need to have GreptimeDB and Grafana installed and running locally.

* [GreptimeDB](https://greptime.com/) is used for storing and querying data.
* [Grafana](https://grafana.com/) is used for visualizing data.

Here we use [Docker Compose](https://docs.docker.com/compose/) to start GreptimeDB and Grafana. To do this, create a `docker-compose.yml` file with the following content:

```yaml
services:
  grafana:
    image: grafana/grafana-oss:9.5.15
    container_name: grafana
    ports:
      - 3000:3000

  greptime:
    image: greptime/greptimedb:v0.7.2
    container_name: greptimedb
    ports:
      - 4000:4000
      - 4001:4001
      - 4002:4002
      - 4003:4003
    command: "standalone start --http-addr 0.0.0.0:4000 --rpc-addr 0.0.0.0:4001 --mysql-addr 0.0.0.0:4002 --postgres-addr 0.0.0.0:4003"
    volumes:
      - ./greptimedb:/tmp/greptimedb

networks: {}
```

Then run the following command:

```shell
docker-compose up
```

:::tip NOTE
The following steps assume that you have followed the documentation above, which uses Docker Compose to install GreptimeDB and Grafana.
:::
