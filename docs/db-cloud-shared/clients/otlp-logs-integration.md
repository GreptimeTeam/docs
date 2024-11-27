GreptimeDB is an observability backend to consume OpenTelemetry Logs natively via [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) protocol.

#### API

To send OpenTelemetry Logs to GreptimeDB through OpenTelemetry SDK libraries, use the following information:

* URL: `http{s}://<host>/v1/otlp/v1/logs`
* Headers:
  * `X-Greptime-DB-Name`: `<dbname>`
  * `Authorization`: `Basic` authentication, which is a Base64 encoded string of `<username>:<password>`. For more information, please refer to [Authentication](https://docs.greptime.com/user-guide/deployments/authentication/static/) and [HTTP API](https://docs.greptime.com/user-guide/protocols/http#authentication).
  * `X-Greptime-Log-Table-Name`: `<table_name>` (optional) - The table name to store the logs. If not provided, the default table name is `opentelemetry_logs`.
  * `X-Greptime-Log-Extract-Keys`: `<extract_keys>` (optional) - The keys to extract from the attributes. The keys should be separated by commas (`,`). For example, `key1,key2,key3` will extract the keys `key1`, `key2`, and `key3` from the attributes and promote them to the top level of the log, setting them as tags. If the field type is array, float, or object, an error will be returned. If a pipeline is provided, this setting will be ignored.
  * `X-Greptime-Log-Pipeline-Name`: `<pipeline_name>` (optional) - The pipeline name to process the logs. If not provided, the extract keys will be used to process the logs.
  * `X-Greptime-Log-Pipeline-Version`: `<pipeline_version>` (optional) - The pipeline version to process the logs. If not provided, the latest version of the pipeline will be used.

The request uses binary protobuf to encode the payload, so you need to use packages that support `HTTP/protobuf`.

:::tip NOTE
The package names may change according to OpenTelemetry, so we recommend that you refer to the official OpenTelemetry documentation for the most up-to-date information.
:::

For more information about the OpenTelemetry SDK, please refer to the official documentation for your preferred programming language.
