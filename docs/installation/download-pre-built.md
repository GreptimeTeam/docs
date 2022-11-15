# Pre-built Binaries

You can always try out GreptimeDB with our test builds. The build will be
released on
[Github](https://github.com/GreptimeTeam/greptimedb/releases/tag/v0.1.0-alpha.3)
and [Docker hub](https://hub.docker.com/r/greptime/greptimedb). Note that
GreptimeDB is in heavy development.
So these binaries are not suitable for production usage at the moment.

## Local Install

For Linux and MacOS users, you can download latest build of GreptimeDB using:

```shell
curl -L https://raw.githubusercontent.com/GreptimeTeam/greptimedb/develop/scripts/install.sh | sh
./greptimedb standalone start
```

## Docker

```shell
docker pull greptime/greptimedb
docker run -p 4002:4002 -v "$(pwd):/tmp/greptimedb" greptime/greptimedb standalone start
```
