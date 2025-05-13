---
keywords: [Jaeger, traces, query, experimental, HTTP endpoint]
description: 介绍如何使用 Jaeger 查询 GreptimeDB 中的 traces 数据。
---

# Jaeger 查询（实验功能）

:::warning

Jaeger 查询接口目前仍处于实验阶段，在未来的版本中可能会有所调整。

:::

GreptimeDB 目前支持以下 [Jaeger](https://www.jaegertracing.io/) 查询接口：

- `/api/services`: 获取所有 Service。
- `/api/operations?service={service}`: 获取指定 Service 的所有 Operations。
- `/api/services/{service}/operations`: 获取指定 Service 的所有 Operations。
- `/api/traces`: 根据查询参数获取 traces 数据。

你可以使用 Grafana 的 [Jaeger 插件](https://grafana.com/docs/grafana/latest/datasources/jaeger/) 或者 [Jaeger UI](https://github.com/jaegertracing/jaeger-ui) 来查询 GreptimeDB 中的 traces 数据。

目前 GreptimeDB 对 Jaeger 协议接口在 `/v1/jaeger` 路径下。

## 快速开始

我们将以 Grafana 中使用 Jaeger 插件为例，介绍如何查询 GreptimeDB 中的 traces 数据。在开始之前，请确保你已经正常启动了 GreptimeDB。

### 启动应用生成 traces 数据并写入 GreptimeDB

你可以参考 [OpenTelemetry 官方文档](https://opentelemetry.io/docs/languages/) 来选择任意你熟悉的编程语言来生成 traces 并将其写入到 GreptimeDB 中。你也可以参考[配置 OpenTelemetry Collector](/user-guide/traces/read-write.md#opentelemetry-collector) 文档。

### 配置 Jaeger 插件

1. 打开 Grafana，添加 Jaeger 数据源：

   ![添加 Jaeger 数据源](/add-jaeger-data-source.jpg)

2. 根据实际情况，填写 Jaeger 地址，然后 **Save and Test** 即可。比如：

   ```
   http://localhost:4000/v1/jaeger
   ```

3. 使用 Jaeger Explore 来查看数据：

   ![Jaeger Explore](/jaeger-explore.png)

### 为获取 Operations 接口添加时间范围

默认地，我们没有为 `GET /api/operations` 和 `GET /api/services/{service}/operations` 添加时间范围参数，当 traces 数据量较大时，这可能会导致查询时间过长。此时你可以基于自己的场景以 HTTP Header 的形式添加时间范围参数，比如：

```
x-greptime-jaeger-time-range-for-operations: 3 days
```

这表示只返回最近 3 天的 Operations 数据。

这个 Header 可设置在 Jaeger Data Source 的 **HTTP Headers** 中，比如：

![设置 HTTP Headers](/jaeger-http-header-for-time-range.jpg)
