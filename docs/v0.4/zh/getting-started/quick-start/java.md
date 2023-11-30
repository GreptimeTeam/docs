# Java

<!--@include: ./introduction.md-->

## 准备事项

<!--@include: ./prerequisites.md-->

## 写入数据

<!--@include: ../../db-cloud-shared/quick-start/java.md-->

```shell
curl -L https://github.com/GreptimeCloudStarters/quick-start-java/releases/latest/download/greptime-quick-start-java-all.jar \
--output quick-start.jar && java -jar quick-start.jar -e http://localhost:4000/v1/otlp/v1/metrics
```

## 使用 Grafana 可视化数据

<!--@include: ./visualize-data-by-grafana.md-->

## 下一步

<!--@include: ./next-steps.md-->
