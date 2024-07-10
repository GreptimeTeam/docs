# 使用 Pipeline 写入日志

本文档介绍如何通过 HTTP 接口使用指定的 Pipeline 进行处理后将日志写入 GreptimeDB

## 写入日志的 HTTP 接口

您可以使用以下命令通过 HTTP 接口写入日志：

```shell
curl -X "POST" "http://localhost:4000/v1/events/logs?db=public&table=logs&pipeline_name=test" \
     -H 'Content-Type: application/json' \
     -d $'{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}
{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}
{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}
{"time":"2024-05-25 20:16:37.217","id1":"2436","id2":"2528","type":"I","logger":"INTERACT.MANAGER","log":"ClusterAdapter:enter sendTextDataToCluster\\n"}'
```

执行上述命令后，您将收到如下响应：

```json
{"output":[{"affectedrows":4}],"execution_time_ms":22}
```

## 参数说明

此接口接受以下参数：

- `db`：数据库名称。
- `table`：表名称。
- `pipeline_name`：[Pipeline](./log-pipeline.md) 名称。

## 请求数据格式

请求体支持 ndjson 和 json array 格式，其中每个 JSON 对象代表一条日志记录。