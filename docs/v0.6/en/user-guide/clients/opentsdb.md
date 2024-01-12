# OpenTSDB

## Telnet

:::tip NOTE
At the moment, authentication of OpenTSDB protocol over TCP is not yet supported. If there is a authentication with GreptimeDB, please use [HTTP endpoints](#http-api).
:::

The GreptimeDB is listening on port `4242` by default to receive metrics via `telnet`. You can open
your favorite terminal and type `telnet 127.0.0.1 4242` to connect to GreptimeDB.

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

GreptimeDB also supports OpenTSDB through HTTP API. For information on how to set up authentication, please refer to [HTTP API](./http-api.md).

## Write Data

Please refer to [write data](../write-data/opentsdb.md).
