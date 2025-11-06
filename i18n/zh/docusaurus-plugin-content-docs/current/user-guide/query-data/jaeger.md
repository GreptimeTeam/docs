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

你可以使用 Grafana 的 [Jaeger 插件](https://grafana.com/docs/grafana/latest/datasources/jaeger/) 或者 [Jaeger UI](https://github.com/jaegertracing/jaeger-ui) 来查询 GreptimeDB 中的 traces 数据。当你在使用 Jaeger UI 的时候，可将 `packages/jaeger-ui/vite.config.mts` 的 `proxyConfig` 配置为 GreptimeDB 的地址，比如：

```ts
const proxyConfig = {
  target: 'http://localhost:4000/v1/jaeger',
  secure: false,
  changeOrigin: true,
  ws: true,
  xfwd: true,
};
```

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
