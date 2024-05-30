# GreptimeDB Standalone

You can try out GreptimeDB with our test builds released on the [Download page](https://greptime.com/download).

We use the simplest configuration for you to get started. For a comprehensive list of configurations available in GreptimeDB, see the [configuration documentation](/user-guide/operations/configuration.md).

## Binary

### Linux and macOS

For Linux and macOS users, you can download the latest build of the `greptime` binary by using the following commands:

```shell
curl -fsSL \
  https://raw.githubusercontent.com/greptimeteam/greptimedb/main/scripts/install.sh | sh
```

Once the download is completed, the binary file `greptime` will be stored in your current directory.

You can run GreptimeDB in the standalone mode:

```shell
./greptime standalone start
```

:::tip NOTE
GreptimeDB binds to `127.0.0.1` by default. If you need to accept connections from other addresses, you can start with the following parameters.
```shell
./greptime standalone start --http-addr 0.0.0.0:4000 --rpc-addr 0.0.0.0:4001 --mysql-addr 0.0.0.0:4002 --postgres-addr 0.0.0.0:4003
```

You can also refer to the [Configuration](../../user-guide/operations/configuration.md) document to modify the bind address in the configuration file.

If the computer running GreptimeDB is directly exposed to the internet, binding to `0.0.0.0` is dangerous and will expose the instance to everybody on the internet.
:::


### Windows

If you have WSL([Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/about)) enabled, you can lunch a latest Ubuntu and run GreptimeDB like above!

Otherwise please download the GreptimeDB binary for Windows at our [official site](https://greptime.com/resources), and unzip the downloaded artifact.

To run GreptimeDB in standalone mode, open a terminal (like Powershell) at the directory where the GreptimeDB binary locates, and execute:

```shell
.\greptime standalone start
```

:::tip NOTE
GreptimeDB binds to `127.0.0.1` by default. If you need to accept connections from other addresses, you can start with the following parameters.
```shell
.\greptime standalone start --http-addr 0.0.0.0:4000 --rpc-addr 0.0.0.0:4001 --mysql-addr 0.0.0.0:4002 --postgres-addr 0.0.0.0:4003
```

You can also refer to the [Configuration](../../user-guide/operations/configuration.md) document to modify the bind address in the configuration file.

If the computer running GreptimeDB is directly exposed to the internet, binding to `0.0.0.0` is dangerous and will expose the instance to everybody on the internet.
:::


## Docker

Make sure the [Docker](https://www.docker.com/) is already installed. If not, you can follow the official [documents](https://www.docker.com/get-started/) to install Docker.

```shell
docker run -p 4000-4003:4000-4003 \
-v "$(pwd)/greptimedb:/tmp/greptimedb" \
--name greptime --rm \
greptime/greptimedb:<%greptimedb-version%> standalone start \
--http-addr 0.0.0.0:4000 \
--rpc-addr 0.0.0.0:4001 \
--mysql-addr 0.0.0.0:4002 \
--postgres-addr 0.0.0.0:4003
```

:::tip NOTE
To avoid accidently exit the Docker container, you may want to run it in the "detached" mode: add the `-d` flag to
the `docker run` command.
:::

The data will be stored in the `greptimedb/` directory in your current directory.

If you want to use another version of GreptimeDB's image, you can download it from our [GreptimeDB Dockerhub](https://hub.docker.com/r/greptime/greptimedb). In particular, we support GreptimeDB based on CentOS, and you can try image `greptime/greptimedb-centos`.

:::tip NOTE
If you are using a Docker version lower than [v23.0](https://docs.docker.com/engine/release-notes/23.0/), you may experience problems with insufficient permissions when trying to run the command above, due to a [bug](https://github.com/moby/moby/pull/42681) in the older version of Docker Engine.

You can:

1. Set `--security-opt seccomp=unconfined`, for example:

   ```shell
   docker run --security-opt seccomp=unconfined -p 4000-4003:4000-4003 \
   -v "$(pwd)/greptimedb:/tmp/greptimedb" \
   --name greptime --rm \
   greptime/greptimedb:<%greptimedb-version%> standalone start \
   --http-addr 0.0.0.0:4000 \
   --rpc-addr 0.0.0.0:4001 \
   --mysql-addr 0.0.0.0:4002 \
   --postgres-addr 0.0.0.0:4003
   ```

2. Upgrade the Docker version to v23.0.0 or higher;
   :::

## Next Steps

Learn how to write data to GreptimeDB and visualize it using Grafana in the [Quick Start](../quick-start/overview.md).
