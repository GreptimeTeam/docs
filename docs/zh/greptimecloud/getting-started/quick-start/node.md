
使用下面的命令收集系统指标数据，例如 CPU 和内存使用情况，并将其发送到 GreptimeCloud。一旦成功发送，这些指标就可以在 GreptimeCloud 控制台中查看。

```shell
npx greptime-cloud-quick-start --host=<host> --db=<dbname> --username=<username> --password=<password>
```

该 Demo 基于 OTLP/http 采集并发送数据，源代码位于 [Github](https://github.com/GreptimeCloudStarters/quick-start-node-js).
