# Integration

GreptimeCloud instance can be configured as a Prometheus [remote write
endpoint](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_write) and [remote read endpoint](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_read).

Add the following section to your prometheus configuration.

```yaml
remote_write:
  - url: https://<host>/v1/prometheus/write?db=<dbname>
    basic_auth:
      username: <username>
      password: #paste your service password

remote_read:
- url: http://<host>/v1/prometheus/read?db=<dbname>
  basic_auth:
    username: <username>
    password: #paste your service password
```
