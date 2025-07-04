---
keywords: [Prometheus, remote write, HTTP API, PromQL, integration]
description: Guide for integrating Prometheus with GreptimeCloud, including remote write configuration, HTTP API access, and using PromQL.
---

# Prometheus

GreptimeCloud with GreptimeDB is fully compatible with Prometheus. This ensures
a seamless transition, allowing you to use GreptimeCloud as a direct replacement
for Prometheus. For more details, please refer to the [Prometheus
documentation](https://docs.greptime.com/user-guide/integrations/prometheus) in
the GreptimeDB user guide.

## Prometheus Remote Write

GreptimeCloud instance can be configured as a Prometheus [remote write
endpoint](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_write).

Append the following section to your Prometheus configuration.

```yaml
remote_write:
  - url: https://<host>/v1/prometheus/write?db=<dbname>
    basic_auth:
      username: <username>
      password: <password>

```

## Prometheus HTTP API and PromQL

Directly access this database through Prometheus API endpoint:

- URL root: `https://<host>/v1/prometheus`
- Database name: include HTTP header `x-greptime-db-name` with value `<dbname>`
- Authentication: utilize Basic authentication using the instance's username and
  password

This is an example of invoking the Prometheus HTTP API to ping:

```shell
curl -X GET \
  -H "x-greptime-db-name: <dbname>" \
  -u "<username>:<password>" \
  "https://<host>/v1/prometheus/api/v1/query?query=1"
```

GreptimeDB supports PromQL (Prometheus Query Language). This means that you can
use GreptimeDB as a drop-in replacement for Prometheus, with Grafana or any
other tools.

Please refer to
[PromQL](https://docs.greptime.com/user-guide/integrations/prometheus#prometheus-query-language)
for more details.
