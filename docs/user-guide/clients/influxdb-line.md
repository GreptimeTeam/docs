# InfluxDB Line

## Authentication

GreptimeDB is compatible with InfluxDB's line protocol authentication format, both v1 and v2.

**[V2 protocol](https://docs.influxdata.com/influxdb/v1.8/tools/api/?t=Auth+Enabled#apiv2query-http-endpoint)**

InfluxDB's V2 protocol uses a format much like HTTP's standard basic authentication scheme. We can write data easily through InfluxDB's line protcol.

```shell
❯ curl 'http://localhost:4000/v1/influxdb/write?db=public' \
    -H 'authorization: token greptime_user:greptime_pwd' \
    -d 'monitor,host=host1 cpu=1.2 1664370459457010101'
```

Note: replace `greptime_user(username)`, `greptime_pwd(password)` with your configured username and password.

**[V1 protocol](https://docs.influxdata.com/influxdb/v1.8/tools/api/?t=Auth+Enabled#query-string-parameters-1)**

GreptimeDB also supports InfluxDB's V1 authentication format. Add `u` for user and `p` for password to the HTTP query string as shown below:

```shell
❯ curl 'http://localhost:4000/v1/influxdb/write?db=public&u=greptime_user&p=greptime_pwd' \
    -d 'monitor,host=host2 cpu=1.2 1678679359062504960'
```

Note: replace `greptime_user(username)`, `greptime_pwd(password)` with your configured username and password.

## PING

Additionally, GreptimeDB also provides support for the `ping` and `health` APIs of InfluxDB.

Use `curl` to request `ping` API.

```shell
curl -i "127.0.0.1:4000/v1/influxdb/ping"
```

```shell
HTTP/1.1 204 No Content
date: Wed, 22 Feb 2023 02:29:44 GMT
```

Use `curl` to request `health` API.

```shell
curl -i "127.0.0.1:4000/v1/influxdb/health"
```

```shell
HTTP/1.1 200 OK
content-length: 0
date: Wed, 22 Feb 2023 02:30:46 GMT
```

## Write Data

Please refer to [write data](../write-data/influxdb-line.md).


