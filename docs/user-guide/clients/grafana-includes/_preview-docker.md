### Quick preview using Docker

Greptime provides a docker compose file that integrates GreptimeDB, Prometheus, Prometheus Node Exporter, Grafana, and this plugin together so you can quickly experience the GreptimeDB data source plugin.

```shell
git clone https://github.com/GreptimeTeam/greptimedb-grafana-datasource.git
cd docker
docker compose up
```

You can also try out this plugin from a Grafana docker image:

```shell
docker run -d -p 3000:3000 --name=grafana --rm \
  -e "GF_INSTALL_PLUGINS=https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/download/info8fcc-greptimedb-datasource.zip;info8fcc" \
  grafana/grafana-oss
```