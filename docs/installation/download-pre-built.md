# Pre-built Binaries

You can try out GreptimeDB with our test builds.
released on
[Github](https://github.com/GreptimeTeam/greptimedb/releases)
and [Docker hub](https://hub.docker.com/r/greptime/greptimedb). Note that
GreptimeDB is currently under intense development.
So these binaries are not ready to be used under production environment at the moment.

## Local Install

For Linux and MacOS users, you can download latest build of GreptimeDB using:

```shell
curl -L https://raw.githubusercontent.com/GreptimeTeam/greptimedb/develop/scripts/install.sh | sh
./greptime standalone start
```

## Docker

```shell
docker pull greptime/greptimedb
docker run -p 4002:4002 -v "$(pwd):/tmp/greptimedb" greptime/greptimedb standalone start
```
