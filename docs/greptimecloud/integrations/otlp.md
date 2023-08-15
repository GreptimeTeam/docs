# OpenTelemetry Protocol(OTLP)

GreptimeDB can be used as a collector to receive OpenTelemetry Metrics via the OTLP/HTTP protocol. To send OpenTelemetry Metrics to GreptimeDB through Opentelemetry exporter SDK libraries, use the following information:

* URL: `https://<host>/v1/otlp/v1/metrics`
* Method: `POST`
* Headers:
  * `Content-Type`: `application/x-protobuf`
  * `X-Greptime-DB-Name`: `<dbName>`
  * `Authorization`: `Basic` authentication, it is a Base64 encoded string of `<username>:<Your service password>`. For more information, please refer to [Authentication](https://docs.greptime.com/user-guide/clients/authentication) and [HTTP API](https://docs.greptime.com/user-guide/clients/http-api#authentication)
