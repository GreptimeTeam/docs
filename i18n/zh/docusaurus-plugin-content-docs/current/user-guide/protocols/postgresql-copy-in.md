---
keywords: [PostgreSQL, COPY FROM STDIN, CSV, JSONL, InfluxDB, Arrow IPC, OTLP, Prometheus Remote Write]
description: 通过 PostgreSQL 连接使用 COPY FROM STDIN 向 GreptimeDB 写入数据，了解各格式的数据编码、目标表和写入选项。
---

# PostgreSQL COPY FROM STDIN

如果应用只能通过数据库协议访问 GreptimeDB，可以用 `COPY FROM STDIN` 从 PostgreSQL 客户端流式写入数据，无需另建 HTTP 或 gRPC 连接，也不用把每批数据转换成 SQL `INSERT` 语句。在 [GreptimeDB 的写入基准测试](https://github.com/GreptimeTeam/greptimedb/pull/9297)中，每批写入 1,000 行时，COPY 的吞吐量为每秒 84.1 万行，而相同负载下通过 PostgreSQL 协议执行 `INSERT` 为每秒 4.9 万行，前者是后者的 10 倍以上。实际吞吐量取决于负载和批次大小。

[PostgreSQL 社区正在探索如何让 COPY 支持可扩展的格式](https://www.postgresql.org/message-id/20231204.153548.2126325458835528809.kou%40clear-code.com)。GreptimeDB 把这个想法付诸实践：例如，导出工具可以用已有的 PostgreSQL 驱动直接发送 OTLP 或 Arrow 数据，无需再实现一套传输协议。客户端和工具开发者不必等待 PostgreSQL 上游支持这些格式，就可以开发并验证新的集成方式。

`STDIN` 表示数据来自客户端，而不是服务器上的文件。数据库和身份凭据由连接指定，原本通过 HTTP 请求头或 URL 参数传入的选项写在 `WITH` 子句中。

单独执行一条 `COPY` 语句，然后通过客户端的 COPY API 发送数据并结束传输。必须显式指定 `FORMAT`：目前不支持 PostgreSQL 默认的 `text` 格式和原生的 `binary` 行格式。选项写作 `选项名 值`，中间不加等号。字符串值用单引号括起。布尔选项可以省略值，表示 `true`（例如 `HEADER`）。未知选项或重复指定的选项会导致报错。成功后服务器返回 `COPY n`，其中 `n` 为相应写入接口返回的计数。

| `FORMAT` | 发送的数据 | `COPY` 后是否指定表名 | 是否需要提前建表 |
| --- | --- | --- | --- |
| `csv` | CSV 文本 | 必须指定，可附带列名列表 | 需要 |
| `jsonl` | 每行一个 JSON 对象 | 必须指定，可附带列名列表 | 需要 |
| `influxdb` | 行协议文本 | 不支持，由 measurement 决定表名 | 默认不需要 |
| `arrow` | 一个 Arrow IPC 流 | 必须指定，不支持列名列表 | 需要，即使设置了 `auto_create_table true` |
| `otlp`（指标） | 一条未经压缩的指标导出请求 | 不支持，由指标名称决定表名 | 默认不需要 |
| `otlp`（日志或链路） | 一条未经压缩的日志或链路导出请求 | 可选，不支持列名列表 | 默认不需要，指定表名时也一样 |
| `promwrite` | 一条压缩后的 Remote Write protobuf 请求 | 不支持，由各时间序列的指标名称决定表名 | 默认不需要 |

对于 InfluxDB、OTLP 和 Remote Write，**每次 COPY 缓冲一个完整请求**，发送的数据最多为 64 MiB。共享的请求内存限额也可能使较小的请求被拒绝。数据量较大时，请拆成多个完整请求，分别执行 COPY；将同一请求分多次发送不能绕过限制。CSV、JSONL 和 Arrow 则按批次写入，后续批次失败时，先前的批次可能已经写入表中。

## Python 客户端示例（Psycopg 3）

下面的示例通过 GreptimeDB 的 PostgreSQL 端口写入两条 InfluxDB 行协议记录。无需提前建表，记录中的 `room_temperature` 就是目标表名。先安装 Psycopg 3：

```shell
python -m pip install 'psycopg[binary]'
```

以下脚本连接本地 GreptimeDB 实例。要连接其他实例，请修改连接字符串：

```python
import psycopg

with psycopg.connect("postgresql://greptime@localhost:4003/public", autocommit=True) as conn:
    with conn.cursor() as cur:
        with cur.copy("COPY FROM STDIN WITH (FORMAT influxdb, precision 'ms')") as copy:
            copy.write(b"room_temperature,room=kitchen celsius=21.5 1735689600000\n")
            copy.write(b"room_temperature,room=office celsius=22.0 1735689600000\n")
        print(cur.statusmessage)  # COPY 2
```

如果数据已经按所选格式编码，请使用 `copy.write()`，不要使用会按 PostgreSQL 行格式编码的 `copy.write_row()`。示例中的两次写入属于同一个 COPY 请求。退出 `cur.copy()` 代码块即结束传输，不需要发送 `psql` 使用的 `\.` 标记。

## CSV

先创建目标表，再在 `COPY` 后指定表名，如下方的 `psql` 示例所示。单独一行 `\.` 表示输入结束。`HEADER` 会跳过首条记录，但不会按表头名称调整列顺序。请按输入顺序指定列名；省略列名列表时，使用表定义中的列顺序。

```sql
CREATE TABLE readings (ts TIMESTAMP TIME INDEX, host STRING, temperature DOUBLE);
COPY readings (ts, host, temperature) FROM STDIN WITH (FORMAT csv, HEADER);
ts,host,temperature
2025-01-01T00:00:00Z,web01,21.5
\.
SELECT * FROM readings;
```

| 选项 | 取值与默认值 | 含义 |
| --- | --- | --- |
| `HEADER` | 布尔值，默认 `false` | 跳过首条输入记录。 |
| `DELIMITER` | 单字节字符，默认 `','` | 字段分隔符，不能与 `QUOTE` 相同。 |
| `QUOTE` | 单字节字符，默认 `'"'` | 用于包围字段的引号字符。 |
| `ESCAPE` | 单字节字符，默认为 `QUOTE` 的值 | 用于转义字段内部的引号。 |
| `NULL` | 仅支持 `''`（默认） | 空字段（包括 `""`）会被解析为 NULL。不支持自定义 NULL 标记。 |

时间戳请使用日期时间字符串。未指定偏移量时使用会话时区。CSV 不支持写入 JSON 列和二进制列。

## JSON Lines（JSONL）

在 `COPY` 后指定一张已有的表，每行发送一个 JSON 对象。键名与列名匹配，键的顺序不影响写入。以下示例沿用 CSV 示例中的 `readings` 表。第二条记录没有 `temperature` 键，因此该列写入 NULL：

```sql
COPY readings (ts, host, temperature) FROM STDIN WITH (FORMAT jsonl);
{"host":"web01","temperature":22.5,"ts":"2025-01-01T00:01:00Z"}
{"host":"web02","ts":"2025-01-01T00:01:00Z"}
\.
```

`json` 是 `jsonl` 的别名，同样不接受由多条记录组成的 JSON 数组。`WITH` 子句中除 `FORMAT` 外没有其他选项。数据按目标列类型直接解析，不经过 Pipeline。时间戳字符串未指定偏移量时使用会话时区。不支持写入 JSON 列和二进制列。

## InfluxDB 行协议

不能在 `COPY` 后指定表名。每行数据中的 measurement 就是目标表名；表不存在时，GreptimeDB 默认会自动建表。发送与 InfluxDB 写入请求体相同的文本。`influxdb_line` 是 `influxdb` 的别名。以下示例在 `psql` 中向 `cpu` 写入一条记录：

```sql
COPY FROM STDIN WITH (FORMAT influxdb, precision 'ms');
cpu,host=web01 usage=0.75 1735689600000
\.
```

| 选项 | 取值与默认值 | 含义 |
| --- | --- | --- |
| `precision` | `'ns'`（默认）或 `'n'`、`'us'` 或 `'u'`、`'ms'`、`'s'`、`'m'`、`'h'` | 输入时间戳的单位。例如，HTTP 查询参数 `?precision=ms` 对应 COPY 选项 `precision 'ms'`。 |

## Arrow IPC

发送 Arrow IPC **流**（先发送 schema，再发送记录批次），而不是 IPC 文件或 Flight protobuf 消息。必须在 `COPY` 后指定已有表。GreptimeDB 使用 Arrow Flight 批量写入接口，按 IPC 字段名匹配目标列。不支持在 COPY 语句中指定列名列表。

```sql
COPY readings FROM STDIN WITH (FORMAT arrow, auto_create_table true, insert_skip_wal false);
```

| 选项 | 取值与默认值 | 含义 |
| --- | --- | --- |
| `auto_create_table` | 布尔值，省略时沿用现有的写入时 schema 演进策略 | 允许添加缺少的列。即使设为 `true`，目标表也必须已经存在。 |
| `insert_skip_wal` | 布尔值，省略时沿用现有 WAL 设置 | 设为 `true` 会在此次 COPY 中跳过预写日志，降低数据持久性。 |

与 Flight 按批次确认不同，COPY 只在结束时返回总行数。

## OpenTelemetry (OTLP)

`signal` 必须与发送的 protobuf 消息类型一致：`'metrics'`（默认）对应 `ExportMetricsServiceRequest`，`'logs'` 对应 `ExportLogsServiceRequest`，`'traces'` 对应 `ExportTraceServiceRequest`。直接发送序列化后的消息，不要压缩，也不要附加 HTTP 请求头或 gRPC 帧头。`otlp_metrics` 是 `otlp` 的别名。

例如，假设 `cur` 是 Psycopg 3 游标，`request` 是 OpenTelemetry 的 `ExportLogsServiceRequest`。直接写入消息字节，不要使用驱动的行编码接口：

```python
with cur.copy("COPY app_logs FROM STDIN WITH (FORMAT otlp, signal 'logs')") as copy:
    copy.write(request.SerializeToString())
```

| 选项 | 信号 | 取值与含义 |
| --- | --- | --- |
| `signal` | 全部 | `'metrics'`（默认）、`'logs'` 或 `'traces'`。选择 protobuf 消息类型。 |
| `promote_all_resource_attrs` | 指标 | 布尔值，默认 `false`。设为 `true` 时保留除 `resource_attrs` 所列属性之外的全部资源属性。 |
| `resource_attrs` | 指标 | 用分号分隔的字符串，例如 `'service.name;host.id'`。列出要保留的属性；当 `promote_all_resource_attrs` 为 `true` 时，则列出要排除的属性。 |
| `promote_scope_attrs` | 指标 | 布尔值，默认 `false`。指定是否保留 scope 属性。 |
| `translation_strategy` | 指标 | 字符串，默认 `'UnderscoreEscapingWithSuffixes'`。可选值见[指标和标签名称的转换策略](/user-guide/ingest-data/for-observability/opentelemetry.md#兼容-prometheus)。 |
| `table_name` | 日志、链路 | 字符串。覆盖目标表名，对应 `x-greptime-log-table-name` 或 `x-greptime-trace-table-name`。目标表的选择规则见下文。 |
| `pipeline_name` | 日志、链路 | 字符串。选择 Pipeline，对应 `x-greptime-pipeline-name`。写入链路时必须指定；直接写入日志时可省略。 |
| `pipeline_version` | 日志、链路 | 字符串。选择 Pipeline 版本，对应 `x-greptime-pipeline-version`。 |
| `pipeline_params` | 日志、链路 | 字符串，例如 `'key1=value1&key2=value2'`。传递 Pipeline 参数，对应 `x-greptime-pipeline-params`。 |
| `extract_keys` | 日志 | 用逗号分隔的字符串，例如 `'host,env'`。对应 `x-greptime-log-extract-keys`，不使用 Pipeline 时将列出的属性提取为标签。 |

写入指标时不能在 `COPY` 后指定表名。GreptimeDB 按指标名称选择目标表，默认会在表不存在时创建它。例如，HTTP 请求头 `x-greptime-otlp-metric-promote-resource-attrs: service.name;host.id` 可改写为：

```sql
COPY FROM STDIN WITH (FORMAT otlp, signal 'metrics', resource_attrs 'service.name;host.id');
```

对于日志和链路，`table_name` 优先于 `COPY` 后的表名；如果在 `COPY` 目标中指定了 schema，该 schema 仍然有效。两者均未指定时，日志和链路分别写入 `opentelemetry_logs` 和 `opentelemetry_traces`。这些表无需提前创建。所有信号均不支持指定列名列表。例如，使用 v2 链路 Pipeline 将 span 写入 `app_traces`：

```sql
COPY app_traces FROM STDIN WITH (FORMAT otlp, signal 'traces', pipeline_name 'greptime_trace_v2');
```

## Prometheus Remote Write

不能在 `COPY` 后指定表名。每个时间序列的指标名称决定其逻辑表；指标表不存在时，GreptimeDB 默认会自动建表。`physical_table` 选项用于选择底层物理表，不会覆盖时间序列的名称。发送与 HTTP POST 到 `/v1/prometheus/write` 相同的压缩 protobuf 请求体。`version` 和 `zstd` 必须与客户端实际使用的编码一致。

```sql
COPY FROM STDIN WITH (FORMAT promwrite, version 2, zstd, physical_table 'metrics');
```

| 选项 | 取值与默认值 | 含义 |
| --- | --- | --- |
| `version` | `1`（默认）或 `2`，也支持 `'v1'` 或 `'v2'` | Remote Write protobuf 消息版本。 |
| `zstd` | 布尔值，默认 `false`（Snappy） | 对于 Zstandard 压缩的请求体，设为 `true`，对应 `Content-Encoding: zstd`。 |
| `physical_table` | 可选字符串 | 对应同名 HTTP 查询参数，选择存储指标的物理表，而不是每个时间序列对应的逻辑表。 |
| `pipeline_name` | 可选字符串 | 为 v1 选择 Pipeline。 |
| `pipeline_version` | 可选字符串 | 为 v1 选择 Pipeline 版本。 |

与 HTTP 接口一样，v2 不执行 Pipeline，如果请求中包含 exemplar，同时指定 Pipeline 选项会导致报错。
