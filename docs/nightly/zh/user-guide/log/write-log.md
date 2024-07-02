# 配合 Pipeline 写入日志

我们提供了专门的 http 接口进行日志的写入，接口如下：

```shell
curl -X "POST" "http://localhost:4000/v1/events/logs?db=public&table=logs&pipeline_name=test" \
     -H 'Content-Type: application/json' \
     -d $'{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}
{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}
{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}
{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}'
```

上述命令返回结果如下：

```json
{"output":[{"affectedrows":4}],"execution_time_ms":22}
```

此接口包含了以下参数：

- `db`：数据库名称。
- `table`：表名称。
- `pipeline_name`：[Pipeline](./log-pipeline.md) 名称。

body 可以为 ndjson 和 json array 格式，每个元素为一个 json 对象，对应一条日志。
