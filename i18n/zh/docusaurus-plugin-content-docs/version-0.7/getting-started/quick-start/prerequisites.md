
在开始之前，我们需要在本地安装并运行 GreptimeDB 和 Grafana。

* [GreptimeDB](https://greptime.com/) 用于存储和查询数据。
* [Grafana](https://grafana.com/) 用于可视化数据。

这里我们使用 [Docker Compose](https://docs.docker.com/compose/) 来启动 GreptimeDB 和 Grafana。为此，创建一个 `docker-compose.yml` 文件，内容如下：

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

然后执行以下命令：

```shell
docker-compose up
```

:::tip 注意
接下来的步骤假设你按照上面的文档安装了 GreptimeDB 和 Grafana。
:::
