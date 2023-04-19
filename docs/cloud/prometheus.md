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

1.
```shell
git clone https://<host>/promrules/git/<teamId>/<serviceName>.git
```

2. copy your prometheus.yml and rules into this repo, and commit them

3.
```shell
git add .
```
4.
```
git commit -m "sync prometheus configuration"
```

5.
```shell
git push
```
