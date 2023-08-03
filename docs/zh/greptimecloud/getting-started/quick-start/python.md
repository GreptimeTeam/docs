
在 Python 3.10+ 中使用下面的命令收集系统指标数据，例如 CPU 和内存使用情况，并将其发送到 GreptimeCloud。一旦成功发送，这些指标就可以在 GreptimeCloud 控制台中查看。

```shell
pipx run --no-cache greptime-cloud-quick-start -host <host> -db <dbname> -u <username> -p <password>
```

该 Demo 基于 OTLP/http 采集并发送数据，源代码位于 [Github](https://github.com/GreptimeCloudStarters/quick-start-node-python).

:::tip
[pipx](https://pypa.github.io/pipx/) 是一个帮助你安装和运行用 Python 编写的应用程序的工具。
:::
