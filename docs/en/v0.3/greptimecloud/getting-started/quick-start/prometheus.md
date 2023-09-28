
### If you already have a Prometheus instance running
Add the following section to your Prometheus configuration.

```yaml
remote_write:
  - url: https://<host>/v1/prometheus/write?db=<dbname>
    basic_auth:
        username: <username>
        password: <password>
```

### Or if you prefer a fresh start

Spin up a Docker container to write sample data to your database:

```shell
docker run --rm -e GREPTIME_URL='https://<host>/v1/prometheus/write?db=<dbname>' -e GREPTIME_USERNAME='<username>' -e GREPTIME_PASSWORD='<password>' --name greptime-node-exporter greptime/node-exporter
```
