---
template: quick-start-template.md
---

# Java

<docs-template>

{template write-data%


<!--@include: ../../db-cloud-shared/quick-start/java.md-->

```shell
curl -L https://github.com/GreptimeCloudStarters/quick-start-java/releases/latest/download/greptime-quick-start-java-all.jar \
--output quick-start.jar && java -jar quick-start.jar -e http://localhost:4000/v1/otlp/v1/metrics
```

%}

</docs-template>
