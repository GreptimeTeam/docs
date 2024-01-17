
<!--@include: ../../../db-cloud-shared/quick-start/java.md-->

```shell
curl -L https://github.com/GreptimeCloudStarters/quick-start-java/releases/latest/download/greptime-quick-start-java-all.jar \
--output quick-start.jar && java -jar quick-start.jar -e https://<host>/v1/otlp/v1/metrics -db <dbname> -u <username> -p <password>
```
