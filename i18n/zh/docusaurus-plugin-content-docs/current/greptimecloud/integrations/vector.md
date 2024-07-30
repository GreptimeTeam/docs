import DocTemplate from '../../db-cloud-shared/clients/vector-integration.md' 


# Vector

<DocTemplate>

<div id="toml-config">

要在 GreptimeCloud 中使用 Vector，你需要使用 Vector 版本 `0.37` 及以上。
当使用你的 GreptimeCloud 实例时，最小配置可以是：

```toml
# sample.toml

[sources.in]
type = "host_metrics"

[sinks.my_sink_id]
inputs = ["in"]
type = "greptimedb"
endpoint = "<host>:5001"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
tls = {}
```

</div>

</DocTemplate>
