# Pre-built Binaries

You can try out GreptimeDB with our test builds released on [GitHub](https://github.com/GreptimeTeam/greptimedb/releases) and [Docker hub](https://hub.docker.com/r/greptime/greptimedb). Note that GreptimeDB is currently under intense development. So these binaries are **not ready to be used in the production environment**.

## One-line Installation

For Linux and macOS users, you can download the latest build of the `greptime` binary by using the following commands:

```shell
curl -L https://raw.githubusercontent.com/GreptimeTeam/greptimedb/develop/scripts/install.sh | sh
```

When the download is finished, the binary `greptime` will store in your current directory. 

You can run the GreptimeDB in standalone mode:

```shell
./greptime standalone start
```

## Docker

Make sure the [Docker](https://www.docker.com/) is already installed. If not, you can follow the official [documents](https://www.docker.com/get-started/) to install Docker.

```shell
docker run -p 4000-4004:4000-4004 \
-p 4242:4242 -v "greptime-vol:/tmp/greptimedb" \
--name greptime --rm \
greptime/greptimedb standalone start
```

If you want to use another version of the GreptimeDB image, you can download it from our [GreptimeDB Dockerhub](https://hub.docker.com/r/greptime/greptimedb).

**Note**:

If the Docker version you are using is lower than [v23.0](https://docs.docker.com/engine/release-notes/23.0/), then you will encounter the problem of insufficient permissions when starting the above command (a [bug](https://github.com/moby/moby/pull/42681) of the old version of Docker Engine).

You can:

1. Set  `--security-opt seccomp=unconfined`, for example:

   ```shell
   docker run --security-opt seccomp=unconfined -p 4000-4004:4000-4004 \
   -p 4242:4242 -v "greptime-vol:/tmp/greptimedb" \
   --name greptime --rm \
   greptime/greptimedb standalone start
   ```

2. Upgrade the Docker version to v23.0.0 or higher;


## Next Steps

Now you have greptimedb up and running locally, check our [Getting Started](../getting-started/overview.md) guide to create your first table.
