
使用下面的命令收集 jvm 运行时的指标数据，例如 CPU 和内存使用情况，并将其发送到 GreptimeCloud。一旦成功发送，这些指标就可以在 GreptimeCloud 控制台中查看。


```shell
curl -L https://github.com/GreptimeCloudStarters/quick-start-java/releases/download/v0.1.2/quick-start-java-0.1.2-SNAPSHOT-all.jar --output quick-start.jar && java -jar quick-start.jar -h <host> -db <dbname> -u <username> -p <password>
```

该 Demo 基于 OTLP/http 采集并发送数据，源代码位于 [GitHub](https://github.com/GreptimeCloudStarters/quick-start-java).
