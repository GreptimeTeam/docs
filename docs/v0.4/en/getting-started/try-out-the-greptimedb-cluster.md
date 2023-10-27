# Try Out the GreptimeDB Cluster

The GreptimeDB cluster can run in the mode to scale horizontally.

## Install gtctl and run playground

[gtctl](https://github.com/GreptimeTeam/gtctl) is the cli tool for managing the GreptimeDB cluster. You can use the following one-line installation(only for Linux and macOS):

```
curl -fsSL \
  https://raw.githubusercontent.com/greptimeteam/gtctl/develop/hack/install.sh | sh
```

Once the download is completed, the binary file `gtctl` will be stored in your current directory.

The **fastest** way to experience the GreptimeDB cluster is to use the playground:

```
./gtctl playground
```

When the command is executed, the playground will be started in the foreground. You can use `Ctrl+C` to stop the playground. The playground will deploy the minimal GreptimeDB cluster in bare-metal mode on your host.
