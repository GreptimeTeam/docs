---
keywords: [Prometheus, data ingestion, remote write, Docker, GreptimeCloud]
description: Instructions on creating a service, writing data using Prometheus, and visualizing data in GreptimeDB.
---

# Prometheus

## Create Service
import Includecreateservice from './create-service.md' 

<Includecreateservice/>

## Write data

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

:::tip NOTE
To avoid accidently exit the Docker container, you may want to run it in the "detached" mode: add the `-d` flag to
the `docker run` command.
:::

## Visualize Data
import Includevisualizedata from './visualize-data.md' 

<Includevisualizedata/>
