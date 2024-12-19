---
keywords: [OpenTelemetry, OTLP, metrics, logs, 数据模型]
description: 介绍如何使用 OpenTelemetry Protocol (OTLP) 将观测数据（如 metrics 和 logs）导出到 GreptimeDB，包括示例代码和数据模型的映射规则。
---

# OpenTelemetry Protocol (OTLP)

[OpenTelemetry](https://opentelemetry.io/) 是一个供应商中立的开源可观测性框架，用于检测、生成、收集和导出观测数据，例如 traces, metrics 和 logs。
OpenTelemetry Protocol (OTLP) 定义了观测数据在观测源和中间进程（例如收集器和观测后端）之间的编码、传输机制。
## Metrics

### OTLP/HTTP

import Includeotlpmetrycsintegration from '../../../db-cloud-shared/clients/otlp-metrics-integration.md' 

<Includeotlpmetrycsintegration/>

#### 示例代码

下面是一些编程语言设置请求的示例代码：

<Tabs>

<TabItem value="TypeScript" label="TypeScript">

```ts
const auth = Buffer.from(`${username}:${password}`).toString('base64')
const exporter = new OTLPMetricExporter({
    url: `https://${dbHost}/v1/otlp/v1/metrics`,
    headers: {
        Authorization: `Basic ${auth}`,
        "X-Greptime-DB-Name": db,
    },
    timeoutMillis: 5000,
})
```

</TabItem>

<TabItem value="Go" label="Go">

```Go
auth := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", *username, *password)))
exporter, err := otlpmetrichttp.New(
    context.Background(),
    otlpmetrichttp.WithEndpoint(*dbHost),
    otlpmetrichttp.WithURLPath("/v1/otlp/v1/metrics"),
    otlpmetrichttp.WithHeaders(map[string]string{
        "X-Greptime-DB-Name": *dbName,
        "Authorization":      "Basic " + auth,
    }),
    otlpmetrichttp.WithTimeout(time.Second*5),
)
```

</TabItem>

<TabItem value="Java" label="Java">

```Java
String endpoint = String.format("https://%s/v1/otlp/v1/metrics", dbHost);
String auth = username + ":" + password;
String b64Auth = new String(Base64.getEncoder().encode(auth.getBytes()));
OtlpHttpMetricExporter exporter = OtlpHttpMetricExporter.builder()
                .setEndpoint(endpoint)
                .addHeader("X-Greptime-DB-Name", db)
                .addHeader("Authorization", String.format("Basic %s", b64Auth))
                .setTimeout(Duration.ofSeconds(5))
                .build();
```

</TabItem>

<TabItem value="Python" label="Python">

```python
auth = f"{username}:{password}"
b64_auth = base64.b64encode(auth.encode()).decode("ascii")
endpoint = f"https://{host}/v1/otlp/v1/metrics"
exporter = OTLPMetricExporter(
    endpoint=endpoint,
    headers={"Authorization": f"Basic {b64_auth}", "X-Greptime-DB-Name": db},
    timeout=5)
```

</TabItem>

</Tabs>

你可以在 Github 中找到可执行的 Demo：[Go](https://github.com/GreptimeCloudStarters/quick-start-go), [Java](https://github.com/GreptimeCloudStarters/quick-start-java), [Python](https://github.com/GreptimeCloudStarters/quick-start-python), and [Node.js](https://github.com/GreptimeCloudStarters/quick-start-node-js).

:::tip 注意
示例代码可能会根据 OpenTelemetry 的发展发生变化，因此建议你参考 OpenTelemetry 官方文档以获取最新信息。
:::

关于示例代码，请参考 Opentelementry 的官方文档获取它所支持的编程语言获取更多信息。

#### 数据模型

OTLP 指标数据模型按照下方的规则被映射到 GreptimeDB 数据模型中：

- Metric 的名称将被作为 GreptimeDB 表的名称，当表不存在时会自动创建。
- 所有的 Attribute ，包含 resource 级别、scope 级别和 data_point 级别，都被作为 GreptimeDB 表的 tag 列。
- 数据点的时间戳被作为 GreptimeDB 的时间戳索引，列名 `greptime_timestamp`。
- Gauge/Sum 两种类型的数据点数据被作为 field 列，列名 `greptime_value`。
- Summary 类型的每个 quantile 被作为单独的数据列，列名 `greptime_pxx`，其中 xx 是 quantile 的数据，如  90 / 99 等。
- Histogram 和 ExponentialHistogram 暂时未被支持，我们可能在后续版本中推出 Histogram 数据类型来原生支持这两种类型。

## Logs

### OTLP/HTTP

import Includeotlplogintegration from '../../../db-cloud-shared/clients/otlp-logs-integration.md' 

<Includeotlplogintegration/>

#### 示例代码

以下是一些关于如何使用 Grafana Alloy 将 OpenTelemetry 日志发送到 GreptimeDB 的示例代码：

```hcl
loki.source.file "greptime" {
  targets = [
    {__path__ = "/tmp/foo.txt"},
  ]
  forward_to = [otelcol.receiver.loki.greptime.receiver]
}

otelcol.receiver.loki "greptime" {
  output {
    logs = [otelcol.exporter.otlphttp.greptimedb_logs.input]
  }
}

otelcol.auth.basic "credentials" {
  username = "${GREPTIME_USERNAME}"
  password = "${GREPTIME_PASSWORD}"
}

otelcol.exporter.otlphttp "greptimedb_logs" {
  client {
    endpoint = "${GREPTIME_SCHEME:=http}://${GREPTIME_HOST:=greptimedb}:${GREPTIME_PORT:=4000}/v1/otlp/"
    headers  = {
      "X-Greptime-DB-Name" = "${GREPTIME_DB:=public}",
      "x-greptime-log-table-name" = "demo_logs",
      "x-greptime-log-extract-keys" = "filename,log.file.name,loki.attribute.labels",
    }
    auth     = otelcol.auth.basic.credentials.handler
  }
}
```

此示例监听文件的变化，并通过 OTLP 协议将最新的值发送到 GreptimeDB。

:::tip 提示
上述示例代码可能会因 OpenTelemetry 的更新而过时。我们建议您参考 OpenTelemetry 和 Grafana Alloy 的官方文档以获取最新信息。
:::

有关示例代码的更多信息，请参考您首选编程语言的官方文档。

#### 数据模型

OTLP 日志数据模型根据以下规则映射到 GreptimeDB 数据模型：

默认表结构：

```sql
+-----------------------+---------------------+------+------+---------+---------------+
| Column                | Type                | Key  | Null | Default | Semantic Type |
+-----------------------+---------------------+------+------+---------+---------------+
| timestamp             | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| trace_id              | String              |      | YES  |         | FIELD         |
| span_id               | String              |      | YES  |         | FIELD         |
| severity_text         | String              |      | YES  |         | FIELD         |
| severity_number       | Int32               |      | YES  |         | FIELD         |
| body                  | String              |      | YES  |         | FIELD         |
| log_attributes        | Json                |      | YES  |         | FIELD         |
| trace_flags           | UInt32              |      | YES  |         | FIELD         |
| scope_name            | String              | PRI  | YES  |         | TAG           |
| scope_version         | String              |      | YES  |         | FIELD         |
| scope_attributes      | Json                |      | YES  |         | FIELD         |
| scope_schema_url      | String              |      | YES  |         | FIELD         |
| resource_attributes   | Json                |      | YES  |         | FIELD         |
| resource_schema_url   | String              |      | YES  |         | FIELD         |
+-----------------------+---------------------+------+------+---------+---------------+
17 rows in set (0.00 sec)
```

- 您可以使用 `X-Greptime-Log-Table-Name` 指定存储日志的表名。如果未提供，默认表名为 `opentelemetry_logs`。
- 所有属性，包括资源属性、范围属性和日志属性，将作为 JSON 列存储在 GreptimeDB 表中。
- 日志的时间戳将用作 GreptimeDB 中的时间戳索引，列名为 `timestamp`。建议使用 `time_unix_nano` 作为时间戳列。如果未提供 `time_unix_nano`，将使用 `observed_time_unix_nano`。