---
keywords: [从 Loki 迁移, Loki Push API, 日志迁移, Grafana Alloy, 日志 Pipeline]
description: 介绍如何从 Loki 迁移到 GreptimeDB，包括 Loki 兼容写入、双写切换、数据模型映射以及基于 Pipeline 的日志解析。
---

# 从 Loki 迁移

本指南介绍如何将 Loki 日志写入迁移到 GreptimeDB。
GreptimeDB 支持 Loki Push API 写入日志，因此现有的 Loki 兼容写入端通常只需少量配置变更即可将日志发送到 GreptimeDB。

GreptimeDB 的 Loki 兼容端点用于日志写入。
对于查询和仪表盘，请使用 GreptimeDB SQL、[全文检索](/user-guide/logs/fulltext-search.md)、[GreptimeDB Dashboard](/getting-started/installation/greptimedb-dashboard.md) 以及 [Grafana 集成](/user-guide/integrations/grafana.md)，而不是 LogQL。

## 迁移前须知

请先检查当前 Loki 部署，并决定日志在 GreptimeDB 中的存储方式：

* 梳理所有向 Loki 写入日志的组件，例如 Grafana Alloy、OpenTelemetry Collector、Promtail、Fluent Bit、Vector 或自定义客户端。
* 规划目标 GreptimeDB 数据库和表名。如果没有提供表名 Header，GreptimeDB 会将 Loki 日志写入 `loki_logs`。
* 检查 Loki stream labels。GreptimeDB 会将 labels 存储为标签列，因此应避免使用 request ID、user ID、trace ID 等高基数字段作为 label。
* 确认是否只需要保存原始日志行，还是需要使用 GreptimeDB Pipeline 将日志行解析为结构化列。
* 规划历史数据迁移。GreptimeDB 不会直接导入 Loki chunk 或 index 文件；请通过原始日志源、归档文件或导出的记录，将历史日志重放到 GreptimeDB 的日志写入 API。

对于新的采集器配置，推荐使用 [Grafana Alloy](/user-guide/integrations/alloy.md)。
如果仍在使用已有的 Loki 兼容客户端，可以通过修改 Loki Push URL 并添加 GreptimeDB Header，将其重定向到 GreptimeDB。

## 迁移步骤

### 配置 GreptimeDB Loki 端点

将 Loki Push 请求发送到：

```text
http{s}://<host>:4000/v1/loki/api/v1/push
```

使用以下 GreptimeDB 专用 Header：

| Header | 是否必需 | 说明 |
| --- | --- | --- |
| `X-Greptime-DB-Name` | 否 | 目标数据库名，默认值为 `public`。 |
| `X-Greptime-Log-Table-Name` | 否 | 目标日志表名，默认值为 `loki_logs`。 |
| `Authorization` | 取决于部署 | 使用 Base64 编码的 `<username>:<password>` 进行 Basic 认证。 |
| `X-Greptime-Pipeline-Name` 或 `X-Greptime-Log-Pipeline-Name` | 否 | 在写入前用于解析 Loki 条目的 Pipeline 名称。 |

GreptimeDB 接受与 Loki 相同的 Push 请求体格式：

* `Content-Type: application/x-protobuf`：Snappy 压缩的 Loki `PushRequest`。
* `Content-Type: application/json`：包含顶层 `streams` 数组的 JSON 请求体。

以下 JSON 请求可用于快速检查连通性：

```bash
curl -X POST "http://localhost:4000/v1/loki/api/v1/push" \
  -H "Content-Type: application/json" \
  -H "X-Greptime-DB-Name: public" \
  -H "X-Greptime-Log-Table-Name: loki_demo_logs" \
  --data-raw '{
    "streams": [
      {
        "stream": {
          "job": "api",
          "env": "prod"
        },
        "values": [
          ["1731748568804293888", "request completed", {"trace_id": "abc"}]
        ]
      }
    ]
  }'
```

### 双写 Loki 和 GreptimeDB

迁移期间，请同时写入 Loki 和 GreptimeDB，直到完成写入、保留策略、仪表盘和告警验证。

以下 Alloy 示例保留现有 Loki sink，并新增一个 GreptimeDB Loki 兼容 sink：

```hcl
loki.source.file "app" {
  targets = [
    {__path__ = "/var/log/app/*.log"},
  ]
  forward_to = [loki.process.app.receiver]

  file_match {
    enabled = true
  }
}

loki.process "app" {
  forward_to = [
    loki.write.existing_loki.receiver,
    loki.write.greptimedb.receiver,
  ]

  stage.static_labels {
    values = {
      job = "app",
      env = "prod",
    }
  }
}

loki.write "existing_loki" {
  endpoint {
    url = "http://loki:3100/loki/api/v1/push"
  }
}

loki.write "greptimedb" {
  endpoint {
    url = "http://greptimedb:4000/v1/loki/api/v1/push"
    headers = {
      "X-Greptime-DB-Name"        = "public",
      "X-Greptime-Log-Table-Name" = "loki_app_logs",
    }

    basic_auth {
      username = "<greptime_user>"
      password = "<greptimedb_password>"
    }
  }
}
```

如果你的采集器已经配置了 Loki 输出，迁移初期请先保持 labels 和处理阶段不变。
只修改 GreptimeDB sink 的 URL、数据库 Header、表名 Header 和认证配置。
该示例遵循 [Grafana Alloy 指南](/user-guide/ingest-data/for-observability/alloy.md)中的 Loki 组件模式：`loki.source.file` 读取文件，`loki.process` 在 Loki pipeline 中保留 label 处理，`loki.write.endpoint` 则承载 GreptimeDB URL、自定义 Header 以及可选的 Basic 认证配置。
由于该示例在 `__path__` 中使用了 glob 匹配模式，`file_match` 会启用 Alloy 内置的文件发现能力，将该模式展开为实际匹配的文件。如果你使用的是明确的文件路径，可以省略 `file_match`。

### 验证直接写入的数据模型

不使用 Pipeline 时，GreptimeDB 会将 Loki 条目存储在原始日志表中：

| Loki 数据 | GreptimeDB 列 |
| --- | --- |
| Entry timestamp | `greptime_timestamp` 时间索引 |
| Log line | `line` 字段列 |
| Structured metadata | `structured_metadata` JSON 字段列 |
| Stream labels | 字符串标签列 |

直接写入时，请让 GreptimeDB 在首次写入时自动创建表。
不要通过 SQL 预先创建直接写入表来指定 label 列。
Labels 是动态的，会成为自动生成表结构中的标签列。
如果需要自定义表结构，请使用 Pipeline，并根据 Pipeline 配置创建表。

使用 SQL 验证写入结果：

```sql
DESC loki_app_logs;

SELECT greptime_timestamp, line, job, env, structured_metadata
FROM loki_app_logs
ORDER BY greptime_timestamp DESC
LIMIT 10;
```

也可以检查该表是否被识别为 Loki 日志数据：

```sql
SELECT table_schema, table_name, signal_type, source
FROM information_schema.table_semantics
WHERE table_name = 'loki_app_logs';
```

也可以打开 `http://<host>:4000/dashboard` 访问 [GreptimeDB Dashboard](/getting-started/installation/greptimedb-dashboard.md)，并使用 Log View 查询写入的日志。

### 使用 Pipeline 解析 Loki 日志行

如果 Loki 日志行包含 JSON、logfmt、Nginx access logs 或其他需要展开为可查询列的结构化格式，请使用 GreptimeDB Pipeline。
如果使用 AI 编码代理来创建 Pipeline，可以为它提供 [`greptimedb-pipeline` Skill](/faq-and-others/vibecoding.md#greptimedb-skills)，帮助它生成、dry-run 并迭代 Pipeline 配置。

当请求中包含 `X-Greptime-Pipeline-Name` 或 `X-Greptime-Log-Pipeline-Name` 时，GreptimeDB 会将每条 Loki 条目按以下输入字段送入 Pipeline：

| Pipeline 输入字段 | 说明 |
| --- | --- |
| `greptime_timestamp` | Loki 条目的时间戳。 |
| `loki_line` | 原始 Loki 日志行。 |
| `loki_label_<name>` | Loki stream label 值。 |
| `loki_metadata_<name>` | Loki structured metadata 值。 |

例如，假设 Alloy 读取以下 ZooKeeper 日志文件：

```text
2015-08-25 11:23:58,959 - WARN  [LearnerHandler-/10.10.34.11:45441:Leader@574] - Committing zxid 0xf00000000 from /10.10.34.13:2888 not first!
2015-08-25 11:23:58,960 - WARN  [LearnerHandler-/10.10.34.11:45441:Leader@576] - First is 0x0
2015-08-25 11:23:58,960 - INFO  [LearnerHandler-/10.10.34.11:45441:Leader@598] - Have quorum of supporters; starting up and setting last processed zxid: 0xf00000000
2015-08-25 11:26:27,891 - INFO  [/10.10.34.13:3888:QuorumCnxManager$Listener@493] - Received connection request /10.10.34.12:57513
2015-08-25 11:26:27,897 - INFO  [WorkerReceiver[myid=3]:FastLeaderElection@542] - Notification: 2 (n.leader), 0xd0000001b (n.zxid), 0x1 (n.round), LOOKING (n.state), 2 (n.sid), 0xd (n.peerEPoch), LEADING (my state)
2015-08-25 11:26:27,898 - INFO  [WorkerReceiver[myid=3]:FastLeaderElection@542] - Notification: 3 (n.leader), 0xd0000001b (n.zxid), 0x3 (n.round), LOOKING (n.state), 2 (n.sid), 0xe (n.peerEPoch), LEADING (my state)
2015-08-25 11:26:28,138 - INFO  [LearnerHandler-/10.10.34.12:38330:LearnerHandler@263] - Follower sid: 2 : info : org.apache.zookeeper.server.quorum.QuorumPeer$QuorumServer@7761c32f
2015-08-25 11:26:28,159 - INFO  [LearnerHandler-/10.10.34.12:38330:LearnerHandler@318] - Synchronizing with Follower sid: 2 maxCommittedLog=0x0 minCommittedLog=0x0 peerLastZxid=0xd0000001b
2015-08-25 11:26:28,159 - INFO  [LearnerHandler-/10.10.34.12:38330:LearnerHandler@395] - Sending SNAP
2015-08-25 11:26:28,159 - INFO  [LearnerHandler-/10.10.34.12:38330:LearnerHandler@419] - Sending snapshot last zxid of peer is 0xd0000001b  zxid of leader is 0xf00000000sent zxid of db as 0xf00000000
```

创建一个 Pipeline，提取 ZooKeeper 时间戳、日志级别、线程、源码行号和消息：

```yaml
# zk_pipeline.yaml
version: 2
processors:
  - regex:
      fields:
        - loki_line, zk
      patterns:
        - '^(?<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) - (?<level>[A-Z]+)\s+\[(?<thread>.*)@(?<source_line>\d+)\] - (?<message>.*)$'
      ignore_missing: true
  - date:
      fields:
        - zk_timestamp
      formats:
        - "%Y-%m-%d %H:%M:%S,%3f"
      timezone: "UTC"
  - select:
      fields:
        - zk_timestamp
        - zk_level
        - zk_thread
        - zk_source_line
        - zk_message
        - loki_label_job
        - loki_label_env
transform:
  - field: zk_timestamp
    type: time
    index: timestamp
  - fields:
      - zk_level
      - loki_label_job
      - loki_label_env
    type: string
    tag: true
  - field: zk_thread
    type: string
    index: inverted
  - field: zk_source_line
    type: int32
  - field: zk_message
    type: string
    index: fulltext
```

示例日志中的时间戳没有包含时区。请将 `timezone` 设置为日志生产端使用的时区。

上传 Pipeline：

```bash
curl -X POST "http://localhost:4000/v1/pipelines/zk_logs" \
  -F "file=@zk_pipeline.yaml"
```

然后在 GreptimeDB Loki sink 中添加 Pipeline Header：

```hcl
loki.write "greptimedb" {
  endpoint {
    url = "http://greptimedb:4000/v1/loki/api/v1/push"
    headers = {
      "X-Greptime-DB-Name"        = "public",
      "X-Greptime-Log-Table-Name" = "loki_zookeeper_logs",
      "X-Greptime-Pipeline-Name"  = "zk_logs",
    }
  }
}
```

Alloy 通过该 sink 发送 ZooKeeper 日志文件后，GreptimeDB 会先应用该 Pipeline，再将处理后的行写入 `loki_zookeeper_logs`。

通过 Pipeline 写入后，可以查询结构化列：

```sql
SELECT
  zk_timestamp,
  loki_label_job AS job,
  loki_label_env AS env,
  zk_level,
  zk_thread,
  zk_source_line,
  zk_message
FROM loki_zookeeper_logs
WHERE zk_level = 'WARN'
ORDER BY zk_timestamp DESC
LIMIT 10;
```

如需在解析后的 message 字段上使用全文检索，请参阅[全文检索](/user-guide/logs/fulltext-search.md)。

### 迁移历史日志

完整迁移历史日志时，应将数据重放到 GreptimeDB，而不是复制 Loki 存储文件。
常见做法包括：

* 使用 Alloy、Vector、Fluent Bit 或自定义脚本，从原始日志文件或对象存储归档中重放日志。
* 将选定的 Loki 查询结果导出为按行分隔的记录，转换为 Loki Push JSON 后写入 GreptimeDB。
* 仅回填切换后必须可查询的保留窗口，并通过双写覆盖新增数据。

回填时，请保留原始纳秒时间戳，以便 GreptimeDB 保留事件发生时间。
建议按有限时间范围分批导入，便于验证和重试。

### 切换读写流量

在停止写入 Loki 之前，请验证：

* 每个重要 service、namespace 和 environment 的最新日志都已写入 GreptimeDB。
* 同一时间窗口内的行数或抽样记录与 Loki 匹配。
* GreptimeDB 保留策略满足日志保留要求。
* 仪表盘和告警已从 LogQL 改写为 SQL 或 GreptimeDB 日志查询。
* 常用检索列已经具备全文索引或跳数索引。

验证完成后，从采集器配置中移除 Loki sink，仅保留 GreptimeDB sink 作为日志目的端。

## 故障排查

### 不支持的 Content-Type

Loki protobuf Push 客户端请设置 `Content-Type` 为 `application/x-protobuf`；JSON 请求请设置为 `application/json`。

### Protobuf decode 或 Snappy 错误

Loki protobuf Push 请求体必须经过 Snappy 压缩。
不要发送未经过 Snappy 压缩的原始 protobuf 字节。

### GreptimeDB 中缺少 labels

请检查 `loki.write` 之前的采集器处理阶段。
只有发送请求时仍保留在 Loki stream 上的 labels 才会成为 GreptimeDB 标签列。

### 表结构不匹配

对于 Loki 直接写入，请让 GreptimeDB 自动创建表。
如果需要自定义表结构，请使用 Pipeline，并根据 Pipeline 配置生成或创建表。

## 相关文档

* [Loki 协议](/user-guide/ingest-data/for-observability/loki.md)
* [Grafana Alloy](/user-guide/ingest-data/for-observability/alloy.md)
* [管理 Pipeline](/user-guide/logs/manage-pipelines.md)
* [全文检索](/user-guide/logs/fulltext-search.md)
