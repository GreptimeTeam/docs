---
keywords: [Java, JVM 指标, 数据收集, 下载命令, 示例代码, 数据可视化]
description: 介绍如何使用 Java 收集 JVM 运行时指标数据并将其发送到 GreptimeCloud，包括下载命令和示例代码。
---

# Java

## 创建服务
import Includecreateservice from './create-service.md' 

<Includecreateservice/>

## 写入数据

使用下面的命令收集 jvm 运行时的指标数据，例如 CPU 和内存使用情况，并将其发送到 GreptimeCloud。一旦成功发送，这些指标就可以在 GreptimeCloud 控制台中查看。该 Demo 基于 OTLP/http 采集并发送数据，源代码位于 [GitHub](https://github.com/GreptimeCloudStarters/quick-start-java).

```shell
curl -L https://github.com/GreptimeCloudStarters/quick-start-java/releases/latest/download/greptime-quick-start-java-all.jar \
--output quick-start.jar && java -jar quick-start.jar -e https://<host>/v1/otlp/v1/metrics -db <dbname> -u <username> -p <password>
```

## 数据可视化
import Includevisualizedata from './visualize-data.md' 

<Includevisualizedata/>
