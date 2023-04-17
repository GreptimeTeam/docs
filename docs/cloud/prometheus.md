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

## Configuration

You can sync your prometheus configuration files via git operations.

```shell
git clone https://<host>/promrules/git/<teamId>/<serviceName>.git

copy your prometheus.yml and rules into this repo, and commit them

git push
```
