import DocTemplate from './quick-start-template.md' 


# InfluxDB Line Protocol

<DocTemplate>

<div id="write-data">

<!--@include: ../../db-cloud-shared/quick-start/influxdb.md-->

```shell
curl -L https://raw.githubusercontent.com/GreptimeCloudStarters/quick-start-influxdb-line-protocol/main/quick-start.sh | bash -s -- -e http://localhost:4000/v1/influxdb/write
```

</div>

</DocTemplate>
