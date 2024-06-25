---
template: ../../db-cloud-shared/clients/grafana-integration.md
---
# Grafana

<docs-template>

{template prometheus-server-url%

```txt
http://<host>:4000/v1/prometheus
```

%}

{template preview-greptimedb-using-docker%

### 使用 Docker 快速预览

Greptime 提供了一个 docker compose 文件，
将 GreptimeDB、Prometheus、Prometheus Node Exporter、Grafana 和该插件集成在一起，
以便你能够快速体验 GreptimeDB 数据源插件。

```shell
git clone https://github.com/GreptimeTeam/greptimedb-grafana-datasource.git
cd docker
docker compose up
```

你也可以从 Grafana 的 docker 镜像中试用此插件：

```shell
docker run -d -p 3000:3000 --name=grafana --rm \
  -e "GF_INSTALL_PLUGINS=https://github.com/GreptimeTeam/greptimedb-grafana-datasource/releases/latest/download/info8fcc-greptimedb-datasource.zip;info8fcc" \
  grafana/grafana-oss
```

%}

{template greptime-data-source-connection-url%

```txt
http://<host>:4000
```

%}

</docs-template>
