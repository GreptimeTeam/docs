# Quick Setup

GreptimeCloud with GreptimeDB is fully compatible with Prometheus.
This means that you can seamlessly use GreptimeCloud as a replacement for Prometheus.
For more information, please refer to the [Prometheus documentation](https://docs.greptime.com/v0.4/user-guide/clients/prometheus) in the GreptimeDB user guide.

## Remote Write and Read

GreptimeCloud instance can be configured as a Prometheus [remote write
endpoint](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_write) and [remote read endpoint](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_read).

Add the following section to your prometheus configuration.

```yaml
remote_write:
  - url: https://<host>/v1/prometheus/write?db=<dbname>
    basic_auth:
      username: <username>
      password: <password>

remote_read:
  - url: https://<host>/v1/prometheus/read?db=<dbname>
    basic_auth:
      username: <username>
      password: <password>
```

## Rule Management

Each GreptimeCloud service comes with a git repository for storing prometheus
rules and configurations. By checking your rules, GreptimeCloud's
prometheus-compatible rule engine evaluates your rules against data stored in
the database and emits alert when matches. For more details, please refer to [Rule Management](https://docs.greptime.com/v0.4/greptimecloud/integrations/prometheus/rule-management).

```shell
git clone https://<host>/promrules/git/<dbname>.git
# Copy your prometheus.yml and rules into this repo, and commit them
git add .
git commit -m "sync prometheus configuration"
git push
```

## PromQL

GreptimeDB supports PromQL (Prometheus Query Language). This means that you can use GreptimeDB as a drop-in replacement for Prometheus. Please refer to [PromQL](https://docs.greptime.com/v0.4/user-guide/query-data/promql) for more details.
