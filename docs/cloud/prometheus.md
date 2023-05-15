# Prometheus

## Remote Write

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

## Rule Management

Each GreptimeCloud service comes with a git repository for storing prometheus
rules and configurations. By checking your rules, GreptimeCloud's
prometheus-compatible rule engine evaluates your rules against data stored in
the database and emits alert when matches.


```shell
git clone https://<host>/promrules/git/<teamId>/<serviceName>.git
# Copy your prometheus.yml and rules into this repo, and commit them
git add .
git commit -m "sync prometheus configuration"
git push
```
