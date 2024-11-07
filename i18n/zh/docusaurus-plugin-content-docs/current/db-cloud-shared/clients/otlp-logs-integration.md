GreptimeDB 是一个可观测性后端，能够通过 [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) 协议原生地消费 OpenTelemetry 日志。

#### API

要通过 OpenTelemetry SDK 库将 OpenTelemetry 日志发送到 GreptimeDB，请使用以下信息：

* **URL:** `https://<host>/v1/otlp/v1/logs`
* **Headers:**
  * `X-Greptime-DB-Name`: `<dbname>`
  * `Authorization`: `Basic` 认证，这是一个 Base64 编码的 `<username>:<password>` 字符串。更多信息，请参考 [鉴权](https://docs.greptime.cn/user-guide/deployments/authentication/static/) 和 [HTTP API](https://docs.greptime.cn/user-guide/protocols/http#authentication)。
  * `X-Greptime-Log-Table-Name`: `<table_name>`（可选）- 存储日志的表名。如果未提供，默认表名为 `opentelemetry_logs`。
  * `X-Greptime-Log-Extract-Keys`: `<extract_keys>`（可选）- 从属性中提取对应 key 的值到表的顶级字段。key 应以逗号（`,`）分隔。例如，`key1,key2,key3` 将从属性中提取 `key1`、`key2` 和 `key3`，并将它们提升到日志的顶层，设置为标签。如果提取的字段类型是数组、浮点数或对象，将返回错误。如果提供了 pipeline name，此设置将被忽略。
  * `X-Greptime-Log-Pipeline-Name`: `<pipeline_name>`（可选）- 处理日志的 pipeline 名称。如果未提供，将使用 `X-Greptime-Log-Extract-Keys` 来处理日志。
  * `X-Greptime-Log-Pipeline-Version`: `<pipeline_version>`（可选）- 处理日志的 pipeline 的版本。如果未提供，将使用 pipeline 的最新版本。

请求使用二进制 protobuf 编码负载，因此您需要使用支持 `HTTP/protobuf` 的包。

:::tip 提示
包名可能会根据 OpenTelemetry 的更新而变化，因此我们建议您参考官方 OpenTelemetry 文档以获取最新信息。
:::

有关 OpenTelemetry SDK 的更多信息，请参考您首选编程语言的官方文档。