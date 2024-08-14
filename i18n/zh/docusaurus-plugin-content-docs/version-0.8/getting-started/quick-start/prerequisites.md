
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

networks: {}
```

然后执行以下命令：

```shell
docker-compose up
```

:::tip 注意
接下来的步骤假设你按照上面的文档安装了 GreptimeDB 和 Grafana。
:::

当你成功启动 GreptimeDB 之后，可以使用以下命令验证数据库状态：

```shell
curl http://127.0.0.1:4000/status
```

如果数据库正在运行，你将看到类似如下的输出：

```json
{
  "source_time": "2024-05-30T07:59:52Z",
  "commit": "05751084e7bbfc5e646df7f51bb7c3e5cbf16d58",
  "branch": "HEAD",
  "rustc_version": "rustc 1.79.0-nightly (f9b161492 2024-04-19)",
  "hostname": "977898bbda4f",
  "version": "0.8.1"
}
```
