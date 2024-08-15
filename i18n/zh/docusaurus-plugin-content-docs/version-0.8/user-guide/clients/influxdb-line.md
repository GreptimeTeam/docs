# InfluxDB Line Protocol

## 鉴权

Greptime 完全兼容 InfluxDB line protocol 的鉴权格式，包括 v1 和 v2。

**[v2 协议](https://docs.influxdata.com/influxdb/v1.8/tools/api/?t=Auth+Enabled#apiv2query-http-endpoint)**

InfluxDB 的 v2 协议使用的格式很像 HTTP 的标准基本鉴权方案，我们可以通过 InfluxDB 的 line protocol 轻松写入数据。在下方的示例代码中，请注意将 `greptime_user(username)`, `greptime_pwd(password)` 替换为用户自己配置的用户名和密码。

```shell
curl 'http://localhost:4000/v1/influxdb/api/v2/write?db=public' \
    -H 'authorization: token greptime_user:greptime_pwd' \
    -d 'monitor,host=host1 cpu=1.2 1664370459457010101'
```

**[v1 协议](https://docs.influxdata.com/influxdb/v1.8/tools/api/?t=Auth+Enabled#query-string-parameters-1)**

GreptimeDB 同样支持 InfluxDB 的 v1 鉴权格式。在 HTTP 查询字符串中添加 `u` 代表用户，`p` 代表密码，请注意将 `greptime_user(username)`, `greptime_pwd(password)` 替换为用户自己配置的用户名和密码，如下所示：

```shell
curl 'http://localhost:4000/v1/influxdb/write?db=public&u=greptime_user&p=greptime_pwd' \
    -d 'monitor,host=host2 cpu=1.2 1678679359062504960'
```

## PING

GreptimeDB 同样支持 InfluxDB 的 `ping` 和 `health` API。

使用 `curl` 请求 `ping` API：

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

## 写入数据

请参考 [写入数据](../write-data/influxdb-line.md).
