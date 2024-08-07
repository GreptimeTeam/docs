# Vector

import Includeintroduction from './introduction.md' 

<Includeintroduction/>

## 写入数据

### 配置

创建一个名为 `vector.toml` 的文件，并将以下内容复制到其中。

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

该配置将 [host_metrics](https://vector.dev/docs/reference/configuration/sources/host_metrics/) 作为 Vector 源，并使用本地 GreptimeDB 作为接收端。`endpoint` 地址中的 `greptimedb` 是 Docker 网络中 GreptimeDB 的服务名。

### 启动服务

我们使用 [Docker Compose](https://docs.docker.com/compose/) 启动 GreptimeDB、Vector 和 Grafana。首先创建一个名为 `docker-compose.yml` 的文件，将以下内容复制到其中：

```yaml
services:
  grafana:
    image: grafana/grafana-oss:<%grafana-version%>
    container_name: grafana
    ports:
      - 3000:3000

  greptime:
    image: greptime/greptimedb:v0.10.0-nightly-20240722
    container_name: greptimedb
    ports:
      - 4000:4000
      - 4001:4001
      - 4002:4002
      - 4003:4003
    command: "standalone start --http-addr 0.0.0.0:4000 --rpc-addr 0.0.0.0:4001 --mysql-addr 0.0.0.0:4002 --postgres-addr 0.0.0.0:4003"
    volumes:
      - ./greptimedb:/tmp/greptimedb

  vector:
    image: timberio/vector:<%vector-version%>
    container_name: vector
    ports:
      - 8686:8686
    volumes:
      - ./vector.toml:/etc/vector/vector.toml:ro

networks: {}
```

然后执行以下命令：

```shell
docker-compose up
```

当所有服务成功启动后，主机指标将被收集并发送到 GreptimeDB。

## Visualize Data with Grafana

import Includevisualizedatabygrafana from './visualize-data-by-grafana.md' 

<Includevisualizedatabygrafana/>

## Next Steps

import Includenextsteps from './next-steps.md' 

<Includenextsteps/>
