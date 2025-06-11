---
keywords: [链路追踪, 分布式追踪, Jaeger, OTLP 协议, tracing 采样率]
description: 介绍 GreptimeDB 的分布式链路追踪功能，包括如何使用 Jaeger 进行追踪和配置 tracing 采样率。
---

# 链路追踪

GreptimeDB 支持分布式链路追踪。GreptimeDB 使用基于 gRPC 的 OTLP 协议导出所有采集到的 Span。您可以使用 [Jaeger](https://www.jaegertracing.io/)、[Tempo](https://grafana.com/oss/tempo/) 等支持基于 gRPC 的 OTLP 协议后端接收 GreptimeDB 采集到的 Span。 

在配置中的 [logging 部分](/user-guide/deployments-administration/configuration.md#logging-选项) 有对 tracing 的相关配置项说明，[standalone.example.toml](https://github.com/GreptimeTeam/greptimedb/blob/VAR::greptimedbVersion/config/standalone.example.toml) 的 logging 部分提供了参考配置项。

## 教程：使用 Jaeger 追踪 GreptimeDB 调用链路

[Jaeger](https://www.jaegertracing.io/) 是一个开源的、端到端的分布式链路追踪系统，最初由 Uber 开发并开源。它的目标是帮助开发人员监测和调试复杂的微服务架构中的请求流程。

Jaeger 支持基于 gRPC 的 OTLP 协议，所以 GreptimeDB 可以将跟踪数据导出到 Jaeger。以下教程向您展示如何部署和使用 Jaeger 来跟踪 GreptimeDB。

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

参考章节 [Mysql](/user-guide/protocols/mysql.md) 如何连接到 GreptimeDB。在 Mysql Client 中运行下面的 SQL 语句：

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

## 指南：如何配置 tracing 采样率

GreptimeDB 提供了许多协议与接口，用于数据的插入、查询等功能。您可以通过 tracing 采集到每种操作的调用链路。但是对于某些高频操作，将所有该操作的 tracing 都采集下来，可能没有必要而且浪费存储空间。这个时候，您可以使用 `tracing_sample_ratio` 来对各种操作 tracing 的采样率进行设置，这样能够很大程度上减少导出 tracing 的数量并有利于系统观测。

GreptimeDB 根据接入的协议，还有该协议对应的操作，对所有 tracing 进行了分类：

| **protocol** | **request_type**                                                                                                                                                                                                      |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| grpc         | inserts / query.sql / query.logical_plan / query.prom_range / query.empty / ddl.create_database / ddl.create_table / ddl.alter / ddl.drop_table / ddl.truncate_table / ddl.empty / deletes / row_inserts / row_deletes |
| mysql        |                                                                                                                                                                                                                       |
| postgres     |                                                                                                                                                                                                                       |
| otlp         | metrics / traces                                                                                                                                                                                                      |
| opentsdb     |                                                                                                                                                                                                                       |
| influxdb     | write_v1 / write_v2                                                                                                                                                                                                   |
| prometheus   | remote_read / remote_write / format_query / instant_query / range_query / labels_query / series_query / label_values_query                                                                                                          |
| http         | sql / promql       

您可以通过 `tracing_sample_ratio` 来配置不同 tracing 的采样率。

```toml
[logging]
enable_otlp_tracing = true
[logging.tracing_sample_ratio]
default_ratio = 0.0
[[logging.tracing_sample_ratio.rules]]
protocol = "mysql"
ratio = 1.0
[[logging.tracing_sample_ratio.rules]]
protocol = "grpc"
request_types = ["inserts"]
ratio = 0.3
```

上述配置制定了两条采样规则，并制定了默认采样率，GreptimeDB 会根据您提供的采样规则，从第一条开始匹配，并使用第一条匹配到的采样规则作为该 tracing 的采样率，如果没有任何规则匹配，则 `default_ratio` 会被作为默认采样率被使用。采样率的范围是 `[0.0, 1.0]`, `0.0` 代表所有 tracing 都不采样，`1.0` 代表采样所有 tracing。

比如上面提供的规则，使用 mysql 协议接入的所有调用都将被采样，使用 grpc 插入的数据会被采样 30%，其余所有 tracing 都不会被采样。
