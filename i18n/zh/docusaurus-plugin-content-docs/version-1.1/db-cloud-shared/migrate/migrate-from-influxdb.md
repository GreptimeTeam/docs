本文档将帮助你了解 GreptimeDB 和 InfluxDB 的数据模型之间的区别，并指导你完成迁移过程。

## 数据模型的区别

要了解 InfluxDB 和 GreptimeDB 的数据模型之间的差异，请参考写入数据文档中的[数据模型](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md#数据模型)。

InfluxDB 行协议数据与 GreptimeDB 表的映射关系如下：

| InfluxDB | GreptimeDB |
| --- | --- |
| Measurement | 表 |
| Tag | 主键列 |
| Field | 字段列 |
| Timestamp | `greptime_timestamp` 时间索引列 |

写入有代表性的样本数据后，请在开始完整迁移前检查每个自动创建的表。将 `measurement_name` 替换为样本数据中的 measurement 名称：

```sql
DESC TABLE measurement_name;
SHOW CREATE TABLE measurement_name;
```

确认列类型和主键列符合预期，尤其是 measurement 包含高基数 tag 时。如果需要使用不同的表结构，请在导入数据前[手动创建表](/user-guide/deployments-administration/manage-data/basic-table-operations.md#创建表)。

## 数据库连接信息

在写入或查询数据之前，需要了解 InfluxDB 和 GreptimeDB 之间的数据库连接信息的差异。

- **Token**：InfluxDB API 中的 token 用于身份验证，与 GreptimeDB 身份验证相同。
  当使用 InfluxDB 的客户端库或 HTTP API 与 GreptimeDB 交互时，你可以使用 `<greptimedb_user:greptimedb_password>` 作为 token。
- **Organization**：GreptimeDB 中没有组织。
- **Bucket**：InfluxDB 的 bucket 对应 GreptimeDB 数据库。v2 写入 API 使用 `bucket`，v1 写入 API 使用 `db`。
- **Database**：写入前请确认目标数据库已经存在。自托管 GreptimeDB 默认提供 `public` 数据库；其他数据库需要通过 [`CREATE DATABASE`](/user-guide/deployments-administration/manage-data/basic-table-operations.md#创建数据库) 创建。

<InjectContent id="get-database-connection-information" content={props.children}/>

## 写入数据

GreptimeDB 兼容 InfluxDB 的行协议格式，包括 v1 和 v2。
这意味着你可以轻松地从 InfluxDB 迁移到 GreptimeDB。

### HTTP API

你可以使用以下 HTTP API 请求将 measurement 写入 GreptimeDB：

<InjectContent id="write-data-http-api" content={props.children}/>

`precision` 参数必须与请求体中的时间戳精度一致。可选值为 `ns`、`us`、`ms` 和 `s`，默认值为 `ns`。详情请参考 [InfluxDB 行协议文档](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md#协议)。

### Telegraf

GreptimeDB 支持 InfluxDB 行协议也意味着 GreptimeDB 与 Telegraf 兼容。
要配置 Telegraf，只需将 GreptimeDB 的 URL 添加到 Telegraf 配置中：

<InjectContent id="write-data-telegraf" content={props.children}/>

### 客户端库

使用 InfluxDB 客户端库写入数据到 GreptimeDB 非常直接且简单。
你只需在客户端配置中包含 URL 和身份验证信息。

例如：

<InjectContent id="write-data-client-libs" content={props.children}/>

除了上述语言之外，GreptimeDB 还支持其他 InfluxDB 支持的客户端库。
你可以通过参考上面提供的连接信息代码片段，使用你喜欢的语言编写代码。

## 查询数据

GreptimeDB 不支持 Flux 和 InfluxQL，请将这些查询迁移为 SQL 或 PromQL。

下表汇总了常见的 InfluxQL 到 GreptimeDB SQL 映射：

| InfluxQL | GreptimeDB SQL |
| --- | --- |
| Measurement | 表 |
| Tag 或 Field | 列 |
| `time` | 时间索引列，例如 `greptime_timestamp` |
| `GROUP BY time()` | [Range Query](/reference/sql/range.md) 或 [`date_bin()`](/reference/sql/functions/df-functions.md#date_bin) |
| 查询每个分组的最新数据点 | [`row_number()`](/reference/sql/functions/df-functions.md#row_number) 窗口函数 |
| `difference()` 或 `elapsed()` | [`lag()`](/reference/sql/functions/df-functions.md#lag) 或 [`lead()`](/reference/sql/functions/df-functions.md#lead) 窗口函数 |

更多查询改写示例请参考[从 InfluxDB 到 GreptimeDB 迁移指南](https://greptime.cn/blogs/2026-06-02-influxdb-to-greptimedb-migration-guide)。

PromQL（Prometheus 查询语言）允许用户实时选择和聚合时间序列数据，
表达式的结果可以显示为图形，也可以在 Prometheus 的表达式浏览器中以表格数据的形式查看，
或通过 [HTTP API](/user-guide/query-data/promql.md#prometheus-http-api) 传递给外部系统。

假设你要查询过去 24 小时内记录的 `monitor` 表中的最大 CPU。
在 InfluxQL 中，查询如下：

```sql [InfluxQL]
SELECT 
   MAX("cpu") 
FROM 
   "monitor" 
WHERE 
   time > now() - 24h 
GROUP BY 
   time(1h), "host"
```

此 InfluxQL 查询计算 `monitor` 表中 `cpu` 字段的最大值，
其中时间大于当前时间减去 24 小时，结果按 host 和一小时的时间窗口分组。

该查询在 Flux 中的表达如下：

```flux [Flux]
from(bucket: "public")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "monitor")
  |> aggregateWindow(every: 1h, fn: max)
```

在 GreptimeDB SQL 中，类似的查询为：

```sql [SQL]
SELECT
    greptime_timestamp,
    host,
    MAX(cpu) RANGE '1h' AS max_cpu
FROM
    monitor
WHERE
    greptime_timestamp > NOW() - '24 hours'::INTERVAL
ALIGN '1h' TO NOW BY (host)
ORDER BY greptime_timestamp DESC;
```

在该 SQL 查询中，
`RANGE` 子句确定了 `MAX(cpu)` 聚合函数的时间窗口，
而 `ALIGN` 子句设置了时间序列数据的对齐时间。
有关按时间窗口分组的更多详细信息，请参考[按时间窗口聚合数据](/user-guide/query-data/sql.md#按时间窗口聚合数据)文档。

在 PromQL 中，类似的查询为：

```promql
max_over_time(monitor{__field__="cpu"}[1h])
```

`[1h]` 范围选择器定义回看窗口。要像上面的 SQL 查询一样每小时输出一个结果，请将此 PromQL 作为范围查询执行：使用 HTTP API 的 `start` 和 `end` 参数定义时间范围，并通过 `step=1h` 定义求值间隔。
有关 PromQL 的更多信息，请参考 [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/) 文档。

## 可视化数据

<InjectContent id="visualize-data" content={props.children}/>

## 迁移数据

你可以通过以下步骤实现从 InfluxDB 到 GreptimeDB 的数据无缝迁移：

![Double write to GreptimeDB and InfluxDB](/migrate-influxdb-to-greptimedb.drawio.svg)

1. 同时将数据写入 GreptimeDB 和 InfluxDB，以避免迁移过程中的数据丢失。
2. 从 InfluxDB 导出所有历史数据，并将数据导入 GreptimeDB。
3. 验证表结构、行数、时间范围和关键查询结果。
4. 将读流量逐步切换到 GreptimeDB。
5. 验证通过后停止向 InfluxDB 写入数据。

### 双写 GreptimeDB 和 InfluxDB

将数据双写 GreptimeDB 和 InfluxDB 是迁移过程中防止数据丢失的有效策略。
当使用 InfluxDB 的[客户端库](#client-libraries)时，你可以建立两个客户端实例，一个用于 GreptimeDB，另一个用于 InfluxDB。
有关如何使用 InfluxDB 行协议将数据写入 GreptimeDB 的操作，请参考[写入数据](#write-data)部分。

如果无需保留所有历史数据，
你可以双写一段时间以积累所需的最新数据，
然后停止向 InfluxDB 写入数据并仅使用 GreptimeDB。
如果需要完整迁移所有历史数据，请按照接下来的步骤操作。

### 从 InfluxDB v1 服务器导出数据

创建一个临时目录来存储 InfluxDB 的导出数据。

```shell
mkdir -p /path/to/export
```

使用 InfluxDB 的 [`influx_inspect export` 命令](https://docs.influxdata.com/influxdb/v1/tools/influx_inspect/#export) 导出数据。

```shell
influx_inspect export \
  -database <db-name> \ 
  -end <end-time> \
  -lponly \
  -datadir /var/lib/influxdb/data \
  -waldir /var/lib/influxdb/wal \
  -out /path/to/export/data
```

- `-database` 指定要导出的数据库。
- `-end` 指定要导出的数据的结束时间。
必须是[RFC3339 格式](https://datatracker.ietf.org/doc/html/rfc3339)，例如 `2024-01-01T00:00:00Z`。
你可以使用同时写入 GreptimeDB 和 InfluxDB 时的时间戳作为结束时间。
- `-lponly` 指定只导出行协议数据。
- `-datadir` 指定数据目录的路径，请见[InfluxDB 数据设置](https://docs.influxdata.com/influxdb/v1/administration/config/#data-settings)中的配置。
- `-waldir` 指定 WAL 目录的路径，请见[InfluxDB 数据设置](https://docs.influxdata.com/influxdb/v1/administration/config/#data-settings)中的配置。
- `-out` 指定输出目录。

导出的 InfluxDB 行协议数据类似如下：

```txt
disk,device=disk1s5s1,fstype=apfs,host=bogon,mode=ro,path=/ inodes_used=356810i 1714363350000000000
diskio,host=bogon,name=disk0 iops_in_progress=0i 1714363350000000000
disk,device=disk1s6,fstype=apfs,host=bogon,mode=rw,path=/System/Volumes/Update inodes_used_percent=0.0002391237988702021 1714363350000000000
...
```

### 从 InfluxDB v2 服务器导出数据

创建一个临时目录来存储 InfluxDB 的导出数据。

```shell
mkdir -p /path/to/export
```

使用 InfluxDB 的 [`influx inspect export-lp` 命令](https://docs.influxdata.com/influxdb/v2/reference/cli/influxd/inspect/export-lp/) 导出数据。

```shell
influxd inspect export-lp \
  --bucket-id <bucket-id> \
  --engine-path /var/lib/influxdb2/engine/ \
  --end <end-time> \
  --output-path /path/to/export/data
```

- `--bucket-id` 指定要导出的 bucket ID。
- `--engine-path` 指定引擎目录的路径，请见[InfluxDB 数据设置](https://docs.influxdata.com/influxdb/v2.0/reference/config-options/#engine-path)中的配置。
- `--end` 指定要导出的数据的结束时间。
必须是[RFC3339 格式](https://datatracker.ietf.org/doc/html/rfc3339)，例如 `2024-01-01T00:00:00Z`。
你可以使用同时写入 GreptimeDB 和 InfluxDB 时的时间戳作为结束时间。
- `--output-path` 指定输出目录。

命令行的执行结果类似如下：

```json
{"level":"info","ts":1714377321.4795408,"caller":"export_lp/export_lp.go:219","msg":"exporting TSM files","tsm_dir":"/var/lib/influxdb2/engine/data/307013e61d514f3c","file_count":1}
{"level":"info","ts":1714377321.4940555,"caller":"export_lp/export_lp.go:315","msg":"exporting WAL files","wal_dir":"/var/lib/influxdb2/engine/wal/307013e61d514f3c","file_count":1}
{"level":"info","ts":1714377321.4941633,"caller":"export_lp/export_lp.go:204","msg":"export complete"}
```

导出的 InfluxDB 行协议数据类似如下：

```txt
cpu,cpu=cpu-total,host=bogon usage_idle=80.4448912910468 1714376180000000000
cpu,cpu=cpu-total,host=bogon usage_idle=78.50167052182304 1714376190000000000
cpu,cpu=cpu-total,host=bogon usage_iowait=0 1714375700000000000
cpu,cpu=cpu-total,host=bogon usage_iowait=0 1714375710000000000
...
```

### 导入数据到 GreptimeDB

对于大数据集，建议按 measurement 和时间范围分批导出及导入，记录已完成的批次以便断点续传，并将大文件拆分为较小的片段：

```shell
split -l 100000 -d -a 10 data data.
# -l [line_count]    创建长度为 line_count 行的拆分文件。
# -d                 使用数字后缀而不是字母后缀。
# -a [suffix_length] 使用 suffix_length 个字母来形成文件名的后缀。
```

你可以使用 HTTP API 导入数据，如[写入数据](#写入数据)部分所述。
下方提供的脚本将帮助你从文件中读取数据并将其导入 GreptimeDB。

假设你的当前位置是存储数据文件的目录：

```shell
.
├── data.0000000000
├── data.0000000001
├── data.0000000002
...
```

将 GreptimeDB 的连接信息设置到环境变量中：

```shell
export GREPTIME_USERNAME=<greptime_username>
export GREPTIME_PASSWORD=<greptime_password>
export GREPTIME_HOST=<host>
export GREPTIME_DB=<db-name>
```

将数据导入到 GreptimeDB：

<InjectContent id="import-data-shell" content={props.children}/>

### 验证导入的数据

切换读流量前，请逐个对比 InfluxDB 和 GreptimeDB 中的 measurement。至少应验证行数、时间范围、字段非空数量和关键聚合结果。例如：

```sql
SELECT
    COUNT(*) AS row_count,
    COUNT(cpu) AS cpu_value_count,
    MIN(greptime_timestamp) AS min_ts,
    MAX(greptime_timestamp) AS max_ts
FROM monitor;

SELECT host, COUNT(*) AS row_count
FROM monitor
GROUP BY host
ORDER BY row_count DESC;
```

逐步切换读流量期间应保持双写。只有上述检查和应用关键查询均符合预期后，才能停止向 InfluxDB 写入数据。

如果您需要更详细的迁移方案或示例脚本，请提供具体的表结构和数据量信息。[GreptimeDB 官方社区](https://github.com/orgs/GreptimeTeam/discussions)将为您提供进一步的支持。欢迎加入 [Greptime Slack](http://greptime.com/slack) 社区交流。
