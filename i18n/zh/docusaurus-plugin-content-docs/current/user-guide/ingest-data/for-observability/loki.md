---
keywords: [Loki, 日志数据, API 信息, 示例代码, 数据模型]
description: 介绍如何使用 Loki 将日志数据发送到 GreptimeDB，包括 API 信息、示例代码和数据模型映射。
---

# Loki

## 使用方法

### API

要通过原始 HTTP API 将日志发送到 GreptimeDB，请使用以下信息：

* URL: `http{s}://<host>/v1/loki/api/v1/push`
* Headers:
  * `X-Greptime-DB-Name`: `<dbname>`
  * `Authorization`: `Basic` 认证，这是一个 Base64 编码的 `<username>:<password>` 字符串。更多信息，请参考 [认证](https://docs.greptime.com/user-guide/deployments-administration/authentication/static/) 和 [HTTP API](https://docs.greptime.com/user-guide/protocols/http#authentication)。
  * `X-Greptime-Log-Table-Name`: `<table_name>`（可选）- 存储日志的表名。如果未提供，默认表名为 `loki_logs`。

请求使用二进制 protobuf 编码负载，定义的格式与 [logproto.proto](https://github.com/grafana/loki/blob/main/pkg/logproto/logproto.proto) 相同。

### 示例代码

[Grafana Alloy](https://grafana.com/docs/alloy/latest/) 是一个供应商中立的 OpenTelemetry (OTel) Collector 发行版。Alloy 独特地结合了社区中最好的开源可观测性信号。

它提供了一个 Loki 导出器，可以用来将日志发送到 GreptimeDB。以下是一个配置示例：

```hcl
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
        "job" = "greptime"
        "from" = "alloy"
    }
}
```

我们监听文件 `/tmp/foo.txt` 并将日志发送到 GreptimeDB。日志存储在表 `loki_demo_logs` 中，并带有 label `job` 和 `from`。

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

没有 label 的默认表结构：

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

- greptime_timestamp: 日志的时间戳。
- line: 日志消息。

如果你指定了外部 label，我们会将它们添加为表结构中的 tag。例如上面的 `job` 和 `from`。
在这种写入方式下不能手动指定，所有 label 都被视为 tag 并且类型为字符串。请不要尝试使用 SQL 提前创建表来指定 tag 列，这会导致类型不匹配而写入失败。

### 示例

以下是表结构的示例：

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