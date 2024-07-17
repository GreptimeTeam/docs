# 使用 Pipeline 写入日志

本文档介绍如何通过 HTTP 接口使用指定的 Pipeline 进行处理后将日志写入 GreptimeDB。

在写入日志之前，请先阅读 [Pipeline 配置](pipeline-config.md)和[管理 Pipeline](manage-pipelines.md) 完成配置的设定和上传。

## HTTP API

您可以使用以下命令通过 HTTP 接口写入日志：

```shell
curl -X "POST" "http://localhost:4000/v1/events/logs?db=<db-name>&table=<table-name>&pipeline_name=<pipeline-name>&version=<pipeline-version>" \
     -H 'Content-Type: application/json' \
     -d "$<log-items>"
```


## Query 参数

此接口接受以下参数：

- `db`：数据库名称。
- `table`：表名称。
- `pipeline_name`：[Pipeline](./pipeline-config.md) 名称。
- `version`：Pipeline 版本。

## Body 数据格式

请求体支持 NDJSON 和 JSON Array 格式，其中每个 JSON 对象代表一条日志记录。


## 示例

请参考快速开始中的[写入日志](quick-start.md#写入日志)部分。