# Prometheus

GreptimeCloud instance can be configured as a [Prometheus remote write
endpoint](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_write).

Add this `remote_write` section to your prometheus configuration.

```yaml
remote_write:
  - url: https://<host>/v1/prometheus/write?db=<dbname>
    basic_auth:
      username: <username>
      passowrd: #paste your service password
```
