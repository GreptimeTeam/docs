# Node.js

## 创建服务
<!--@include: ./create-service.md-->

## 写入数据

使用下面的命令收集系统指标数据，例如 CPU 和内存使用情况，并将其发送到 GreptimeCloud。一旦成功发送，这些指标就可以在 GreptimeCloud 控制台中查看。
该 Demo 基于 OTLP/http 采集并发送数据，源代码位于 [GitHub](https://github.com/GreptimeCloudStarters/quick-start-node-js).

```shell
npx greptime-cloud-quick-start@latest --endpoint=https://<host>/v1/otlp/v1/metrics --db=<dbname> --username=<username> --password=<password>
```

## 数据可视化
<!--@include: ./visualize-data.md-->
