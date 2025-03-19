
### 如果你已经有正在运行的 Prometheus 实例

将下面的内容添加到你的 Prometheus 配置文件中。

```yaml
remote_write:
  - url: https://<host>/v1/prometheus/write?db=<dbname>
    basic_auth:
        username: <username>
        password: <password>
```

### 或者你期望启动一个全新的实例

启动一个 Docker 容器，将示例数据写入 GreptimeCloud 数据库：

```shell
docker run --rm -e GREPTIME_URL='https://<host>/v1/prometheus/write?db=<dbname>' -e GREPTIME_USERNAME='<username>' -e GREPTIME_PASSWORD='<password>' --name greptime-node-exporter greptime/node-exporter
```
