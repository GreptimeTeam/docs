# Tracing

GreptimeDB 支持分布式链路追踪。 GreptimeDB 使用基于 gRPC 的 OTLP 协议导出所有采集到的 Span。用户可以使用 [Jaeger](https://www.jaegertracing.io/)、[Tempo](https://grafana.com/oss/tempo/) 等支持基于 gRPC 的 OTLP 协议后端接收 GreptimeDB 采集到的 Span。 

在配置中的 [logging 部分](./configuration.md#logging-选项) 有对 tracing 的相关配置项说明，[standalone.example.toml](https://github.com/GreptimeTeam/greptimedb/blob/main/config/standalone.example.toml) 的 logging 部分提供了参考配置项。

## 教程：使用 Jaeger 追踪 GreptimeDB 调用链路

[Jaeger](https://www.jaegertracing.io/) 是一个开源的、端到端的分布式链路追踪系统，最初由 Uber 开发并开源。它的目标是帮助开发人员监测和调试复杂的微服务架构中的请求流程。

Jaeger 支持基于 gRPC 的 OTLP 协议，所以 GreptimeDB 可以将跟踪数据导出到 Jaeger。 以下教程向您展示如何部署和使用 Jaeger 来跟踪 GreptimeDB。

### 步骤一：部署 Jaeger

使用 jaeger 官方提供的 `all-in-one` docker 镜像启动一个 Jaeger 实例：

```bash
docker run --rm -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 14250:14250 \
  -p 14268:14268 \
  -p 14269:14269 \
  -p 9411:9411 \
  jaegertracing/all-in-one:latest
```

### 步骤二：部署 GreptimeDB

编写配置文件，允许 GreptimeDB 进行链路追踪。将下面的配置项保存为文件 `config.toml`

```Toml
[logging]
enable_otlp_tracing = true
```

之后使用 standalone 模式启动 GreptimeDB

```bash
greptime standalone start -c config.toml
```

参考章节 [Mysql](../clients/mysql.md) 如何连接到 GreptimeDB。在 Mysql Client 中运行下面的 SQL 语句：

```sql
CREATE TABLE host (
  ts timestamp(3) time index,
  host STRING PRIMARY KEY,
  val BIGINT,
);

INSERT INTO TABLE host VALUES
    (0,     'host1', 0),
    (20000, 'host2', 5);

SELECT * FROM host ORDER BY ts;

DROP TABLE host;
```

### 步骤三：在 Jaeger 中获取 trace 信息

1. 转到 http://127.0.0.1:16686/ 并选择“Search”选项卡。
2. 在服务下拉列表中选择 `greptime-standalone` 服务。
3. 单击 **Find Traces** 以显示追踪到的链路信息。

![JaegerUI](/jaegerui.png)

![Select-tracing](/select-tracing.png)