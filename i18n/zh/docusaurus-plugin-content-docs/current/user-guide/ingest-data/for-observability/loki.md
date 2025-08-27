---
keywords: [Loki, 日志数据, API 信息, 示例代码, 数据模型]
description: 介绍如何使用 Loki 将日志数据发送到 GreptimeDB，包括 API 信息、示例代码和数据模型映射。
---

# Loki

## 使用方法

### API

要通过原始 HTTP API 将日志发送到 GreptimeDB，请使用以下信息：

* **URL**: `http{s}://<host>/v1/loki/api/v1/push`
* **Headers**:
  * `X-Greptime-DB-Name`: `<dbname>`
  * `Authorization`: `Basic` 认证，这是一个 Base64 编码的 `<username>:<password>` 字符串。更多信息，请参考 [认证](https://docs.greptime.com/user-guide/deployments-administration/authentication/static/) 和 [HTTP API](https://docs.greptime.com/user-guide/protocols/http#authentication)。
  * `X-Greptime-Log-Table-Name`: `<table_name>`（可选）- 存储日志的表名。如果未提供，默认表名为 `loki_logs`。

请求使用二进制 protobuf 编码负载。定义的格式与 [logproto.proto](https://github.com/grafana/loki/blob/main/pkg/logproto/logproto.proto) 相同。

### 示例代码

[Grafana Alloy](https://grafana.com/docs/alloy/latest/) 是一个供应商中立的 OpenTelemetry (OTel) Collector 发行版。Alloy 独特地结合了社区中最好的开源可观测性信号。

它提供了一个 Loki 导出器，可以用来将日志发送到 GreptimeDB。以下是一个配置示例：

```
loki.source.file "greptime" {
  targets = [
    {__path__ = "/tmp/foo.txt"},
  ]
  forward_to = [loki.write.greptime_loki.receiver]
}

loki.write "greptime_loki" {
    endpoint {
        url = "${GREPTIME_SCHEME:=http}://${GREPTIME_HOST:=greptimedb}:${GREPTIME_PORT:=4000}/v1/loki/api/v1/push"
        headers  = {
          "x-greptime-db-name" = "${GREPTIME_DB:=public}",
          "x-greptime-log-table-name" = "${GREPTIME_LOG_TABLE_NAME:=loki_demo_logs}",
        }
    }
    external_labels = {
        "job" = "greptime",
        "from" = "alloy",
    }
}
```

此配置从文件 `/tmp/foo.txt` 读取日志并将其发送到 GreptimeDB。日志存储在表 `loki_demo_logs` 中，并带有 label `job` 和 `from`。

更多信息，请参考 [Grafana Alloy loki.write 文档](https://grafana.com/docs/alloy/latest/reference/components/loki/loki.write/)。

你可以运行以下命令来检查表中的数据：

```sql
SELECT * FROM loki_demo_logs;
+----------------------------+------------------------+--------------+-------+----------+
| greptime_timestamp         | line                   | filename     | from  | job      |
+----------------------------+------------------------+--------------+-------+----------+
| 2024-11-25 11:02:31.256251 | Greptime is very cool! | /tmp/foo.txt | alloy | greptime |
+----------------------------+------------------------+--------------+-------+----------+
1 row in set (0.01 sec)
```

## 数据模型

Loki 日志数据模型根据以下规则映射到 GreptimeDB 数据模型：

**没有 label 的默认表结构：**

```sql
DESC loki_demo_logs;
+--------------------+---------------------+------+------+---------+---------------+
| Column             | Type                | Key  | Null | Default | Semantic Type |
+--------------------+---------------------+------+------+---------+---------------+
| greptime_timestamp | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| line               | String              |      | YES  |         | FIELD         |
+--------------------+---------------------+------+------+---------+---------------+
5 rows in set (0.00 sec)
```

- `greptime_timestamp`: 日志条目的时间戳
- `line`: 日志消息内容

如果您指定了 label，它们将作为 tag 添加到表结构中（如上例中的 `job` 和 `from`）。

**重要说明：**
- 您不能手动指定 label；所有 label 都被视为字符串类型的 tag
- 请不要尝试使用 SQL 预先创建表来指定 tag 列，这会导致类型不匹配和写入失败

### 表结构示例

以下是带有 label 的表结构示例：

```sql
DESC loki_demo_logs;
+--------------------+---------------------+------+------+---------+---------------+
| Column             | Type                | Key  | Null | Default | Semantic Type |
+--------------------+---------------------+------+------+---------+---------------+
| greptime_timestamp | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| line               | String              |      | YES  |         | FIELD         |
| filename           | String              | PRI  | YES  |         | TAG           |
| from               | String              | PRI  | YES  |         | TAG           |
| job                | String              | PRI  | YES  |         | TAG           |
+--------------------+---------------------+------+------+---------+---------------+
5 rows in set (0.00 sec)
```

```sql
SHOW CREATE TABLE loki_demo_logs\G
*************************** 1. row ***************************
       Table: loki_demo_logs
Create Table: CREATE TABLE IF NOT EXISTS `loki_demo_logs` (
  `greptime_timestamp` TIMESTAMP(9) NOT NULL,
  `line` STRING NULL,
  `filename` STRING NULL,
  `from` STRING NULL,
  `job` STRING NULL,
  TIME INDEX (`greptime_timestamp`),
  PRIMARY KEY (`filename`, `from`, `job`)
)

ENGINE=mito
WITH(
  append_mode = 'true'
)
1 row in set (0.00 sec)
```

## 在 Loki Push API 中使用 pipeline

:::warning 实验性特性
此实验性功能可能存在预期外的行为，其功能未来可能发生变化。
:::

从 `v0.15` 版本开始，GreptimeDB 支持使用 pipeline 来处理 Loki Push 请求。
您可以简单地设置 HTTP 头 `x-greptime-pipeline-name` 为目标 pipeline 名称来启用 pipeline 处理。

**注意：** 当请求数据通过 pipeline 引擎时，GreptimeDB 会为 label 和元数据列名添加前缀：
- 每个 label 名前添加 `loki_label_` 前缀
- 每个结构化元数据名前添加 `loki_metadata_` 前缀
- 原始的 Loki 日志行被命名为 `loki_line`

### Pipeline 示例

以下是一个完整的示例，演示如何在 Loki Push API 中使用 Pipeline。

**步骤 1：准备日志文件**

假设我们有一个名为 `logs.json` 的日志文件，包含 JSON 格式的日志条目：
```json
{"timestamp":"2025-08-21 14:23:17.892","logger":"sdk.tool.DatabaseUtil","level":"ERROR","message":"Connection timeout exceeded for database pool","trace_id":"a7f8c92d1e4b4c6f9d2e5a8b3f7c1d9e","source":"application"}
{"timestamp":"2025-08-21 14:23:18.156","logger":"core.scheduler.TaskManager","level":"WARN","message":"Task queue capacity reached 85% threshold","trace_id":"b3e9f4a6c8d2e5f7a1b4c7d9e2f5a8b3","source":"scheduler"}
{"timestamp":"2025-08-21 14:23:18.423","logger":"sdk.tool.NetworkUtil","level":"INFO","message":"Successfully established connection to remote endpoint","trace_id":"c5d8e7f2a9b4c6d8e1f4a7b9c2e5f8d1","source":"network"}
```

每一行都是一个独立的 JSON 对象，包含日志信息。

**步骤 2：创建 Pipeline 配置**

以下是解析 JSON 日志条目的 pipeline 配置：
```yaml
# pipeline.yaml
version: 2
processors:
  - vrl:
      source: |
        message = parse_json!(.loki_line)
        target = {
          "log_time": parse_timestamp!(message.timestamp, "%Y-%m-%d %T%.3f"),
          "log_level": message.level,
          "log_source": message.source,
          "logger": message.logger,
          "message": message.message,
          "trace_id": message.trace_id,
        }
        . = target
transform:
  - field: log_time
    type: time, ms
    index: timestamp
```

请注意，输入字段名为 `loki_line`，它包含来自 Loki 的原始日志行。

**步骤 3：配置 Grafana Alloy**

准备一个 Alloy 配置文件来读取日志文件并将其发送到 GreptimeDB：
```
loki.source.file "greptime" {
  targets = [
    {__path__ = "/logs.json"},
  ]
  forward_to = [loki.write.greptime_loki.receiver]
}

loki.write "greptime_loki" {
    endpoint {
        url = "http://127.0.0.1:4000/v1/loki/api/v1/push"
        headers = {
            "x-greptime-pipeline-name" = "pp",
        }
    }
    external_labels = {
        "job" = "greptime",
        "from" = "alloy",
    }
}
```

**步骤 4：部署和运行**

1. 首先，启动您的 GreptimeDB 实例。

2. 上传 pipeline 配置：

```bash
curl -X "POST" "http://localhost:4000/v1/events/pipelines/pp" -F "file=@pipeline.yaml"
```

3. 启动 Alloy Docker 容器来处理日志：
```shell
docker run --rm \
    -v ./config.alloy:/etc/alloy/config.alloy \
    -v ./logs.json:/logs.json \
    --network host \
    grafana/alloy:latest \
      run --server.http.listen-addr=0.0.0.0:12345 --storage.path=/var/lib/alloy/data \
      /etc/alloy/config.alloy
```

**步骤 5：验证结果**

日志处理完成后，您可以验证它们是否已成功摄取和解析。数据库日志将显示摄取活动。

使用 MySQL 客户端查询表以查看解析的日志数据：
```sql
mysql> show tables;
+-----------+
| Tables    |
+-----------+
| loki_logs |
| numbers   |
+-----------+
2 rows in set (0.00 sec)

mysql> select * from loki_logs limit 1 \G
*************************** 1. row ***************************
  log_time: 2025-08-21 14:23:17.892000
 log_level: ERROR
log_source: application
    logger: sdk.tool.DatabaseUtil
   message: Connection timeout exceeded for database pool
  trace_id: a7f8c92d1e4b4c6f9d2e5a8b3f7c1d9e
1 row in set (0.01 sec)
```

此输出演示了 pipeline 引擎已成功解析原始 JSON 日志行，并将结构化数据提取到单独的列中。

有关 pipeline 配置和功能的更多详细信息，请参考[pipeline 文档](/user-guide/logs/pipeline-config.md)。
