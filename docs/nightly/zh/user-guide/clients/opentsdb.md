# OpenTSDB

## Telnet

:::tip 注意
当前，GreptimeDB 还不支持 TCP 协议的 OpenTSDB 鉴权。如果你的 GreptimeDB 配置了鉴权，请使用 [HTTP API](#http-api)。
:::

GreptimeDB 默认监听 `4242` 端口来接收 `telnet` 协议发来的数据。打开终端，输入 `telnet 127.0.0.1 4242` 连接到本地的 GreptimeDB。

```shell
~ % telnet 127.0.0.1 4242
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
put sys.cpu.system 1667892080 3 host=web01 dc=hz
quit
Connection closed by foreign host.
~ %
```

## HTTP API

GreptimeDB 同样支持通过 HTTP API 写入 OpenTSDB 协议数据。请参考 [HTTP API](./http-api.md) 获取鉴权相关的信息。

## 写入数据

请参考 [写入数据](../write-data/opentsdb.md).
