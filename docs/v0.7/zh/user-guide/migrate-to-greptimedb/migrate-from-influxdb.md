# 从 InfluxDB 迁移

InfluxDB 是知名的时间序列数据库。
随着时间序列数据量的增长，
它可能无法满足用户在性能、可扩展性和成本方面的需求。

GreptimeDB 是高性能的时间序列数据库，专为云时代的基础设施而设计，
使用户受益于良好的弹性结构和高性价比的存储。

从 InfluxDB 迁移到 GreptimeDB 将会是不错的选择。
本文档将帮助你了解这两个数据库的数据模型之间的区别，并指导你完成迁移过程。

## 数据模型的区别

你可能已经熟悉了 [InfluxDB 的关键概念](https://docs.influxdata.com/influxdb/v2/reference/key-concepts/)，
reptimeDB 的 [数据模型](../concepts/data-model.md) 是值得探索的新领域。
让我们从相似和不同之处开始：

- 两者都是[无 schema 写入](/user-guide/write-data/overview#自动生成表结构)的解决方案，这意味着在写入数据之前无需定义表结构。
- 在 InfluxDB 中，一个点代表一条数据记录，包含一个 measurement、tag 集、field 集和时间戳。
  在 GreptimeDB 中，它被表示为时间序列表中的一行数据。
  表名对应于 measurement，列由三种类型组成：Tag、Field 和 Timestamp。
- GreptimeDB 使用 `TimestampNanosecond` 作为来自 [InfluxDB 行协议 API](/user-guide/write-data/influxdb-line) 的时间戳数据类型。
- GreptimeDB 使用 `Float64` 作为来自 InfluxDB 行协议 API 的数值数据类型。

让我们以 InfluxDB 文档中的[示例数据](https://docs.influxdata.com/influxdb/v2/reference/key-concepts/data-elements/#sample-data)为例：

|_time|_measurement|location|scientist|_field|_value|
|---|---|---|---|---|---|
|2019-08-18T00:00:00Z|census|klamath|anderson|bees|23|
|2019-08-18T00:00:00Z|census|portland|mullen|ants|30|
|2019-08-18T00:06:00Z|census|klamath|anderson|bees|28|
|2019-08-18T00:06:00Z|census|portland|mullen|ants|32|

上述数据的 InfluxDB 行协议格式为：

```shell
census,location=klamath,scientist=anderson bees=23 1566086400000000000
census,location=portland,scientist=mullen ants=30 1566086400000000000
census,location=klamath,scientist=anderson bees=28 1566086760000000000
census,location=portland,scientist=mullen ants=32 1566086760000000000
```

在 GreptimeDB 数据模型中，上述数据将被表示为 `census` 表中的以下内容：

```sql
+----------+-----------+------+---------------------+------+
| location | scientist | bees | ts                  | ants |
+----------+-----------+------+---------------------+------+
| klamath  | anderson  |   23 | 2019-08-18 00:00:00 | NULL |
| klamath  | anderson  |   28 | 2019-08-18 00:06:00 | NULL |
| portland | mullen    | NULL | 2019-08-18 00:00:00 |   30 |
| portland | mullen    | NULL | 2019-08-18 00:06:00 |   32 |
+----------+-----------+------+---------------------+------+
```

`census` 表结构如下：

```sql
+-----------+----------------------+------+------+---------+---------------+
| Column    | Type                 | Key  | Null | Default | Semantic Type |
+-----------+----------------------+------+------+---------+---------------+
| location  | String               | PRI  | YES  |         | TAG           |
| scientist | String               | PRI  | YES  |         | TAG           |
| bees      | Float64              |      | YES  |         | FIELD         |
| ts        | TimestampNanosecond  | PRI  | NO   |         | TIMESTAMP     |
| ants      | Float64              |      | YES  |         | FIELD         |
+-----------+----------------------+------+------+---------+---------------+
```

## 数据库连接信息

在写入或查询数据之前，了解 InfluxDB 和 GreptimeDB 之间的数据库连接信息的差异很重要。

- **Token**：InfluxDB API 中的 token 用于身份验证，与 GreptimeDB 身份验证相同。
  当使用 InfluxDB 的客户端库或 HTTP API 与 GreptimeDB 交互时，你可以使用 `<greptimedb_user:greptimedb_password>` 作为 token。
- **Organization**：GreptimeDB 中没有组织。
- **Bucket**：在 InfluxDB 中，bucket 是时间序列数据的容器，与 GreptimeDB 中的数据库名称相同。

## 写入数据

GreptimeDB 兼容 InfluxDB 的行协议格式，包括 v1 和 v2。
这意味着你可以轻松地从 InfluxDB 迁移到 GreptimeDB。

### HTTP API

你可以使用以下 HTTP API 请求将 measurement 写入 GreptimeDB：

::: code-group

```shell [InfluxDB line protocol v2]
curl -X POST 'http://<greptimedb-host>:4000/v1/influxdb/api/v2/write?db=<db-name>' \
  -H 'authorization: token <greptime_user:greptimedb_password>' \
  -d 'census,location=klamath,scientist=anderson bees=23 1566086400000000000'
```

```shell [InfluxDB line protocol v1]
curl 'http://<greptimedb-host>:4000/v1/influxdb/write?db=<db-name>&u=<greptime_user>&p=<greptimedb_password>' \
  -d 'census,location=klamath,scientist=anderson bees=23 1566086400000000000'
```

:::

### Telegraf

GreptimeDB 支持 InfluxDB 行协议也意味着 GreptimeDB 与 Telegraf 兼容。
要配置 Telegraf，只需将 `http://<greptimedb-host>:4000` URL 添加到 Telegraf 配置中：

::: code-group

```toml [InfluxDB line protocol v2]
[[outputs.influxdb_v2]]
  urls = ["http://<greptimedb-host>:4000/v1/influxdb"]
  token = "<greptime_user>:<greptimedb_password>"
  bucket = "<db-name>"
  ## 留空即可
  organization = ""
```

```toml [InfluxDB line protocol v1]
[[outputs.influxdb]]
  urls = ["http://<greptimedb-host>:4000/v1/influxdb"]
  database = "<db-name>"
  username = "<greptime_user>"
  password = "<greptimedb_password>"
```
:::

### 客户端库

使用 InfluxDB 客户端库写入数据到 GreptimeDB 非常直接且简单。
你只需在客户端配置中包含 URL 和身份验证信息。

例如：

::: code-group

```js [Node.js]
'use strict'
/** @module write
**/

import { InfluxDB, Point } from '@influxdata/influxdb-client'

/** 环境变量 **/
const url = 'http://<greptimedb-host>:4000/v1/influxdb'
const token = '<greptime_user>:<greptimedb_password>'
const org = ''
const bucket = '<db-name>'

const influxDB = new InfluxDB({ url, token })
const writeApi = influxDB.getWriteApi(org, bucket)
writeApi.useDefaultTags({ region: 'west' })
const point1 = new Point('temperature')
  .tag('sensor_id', 'TLM01')
  .floatField('value', 24.0)
writeApi.writePoint(point1)

```

```python [Python]
import influxdb_client
from influxdb_client.client.write_api import SYNCHRONOUS

bucket = "<db-name>"
org = ""
token = "<greptime_user>:<greptimedb_password>"
url="http://<greptimedb-host>:4000/v1/influxdb"

client = influxdb_client.InfluxDBClient(
    url=url,
    token=token,
    org=org
)

write_api = client.write_api(write_options=SYNCHRONOUS)

p = influxdb_client.Point("my_measurement").tag("location", "Prague").field("temperature", 25.3)
write_api.write(bucket=bucket, org=org, record=p)

```

```go [Go]
bucket := "<db-name>"
org := ""
token := "<greptime_user>:<greptimedb_password>"
url := "http://<greptimedb-host>:4000/v1/influxdb"
client := influxdb2.NewClient(url, token)
writeAPI := client.WriteAPIBlocking(org, bucket)

p := influxdb2.NewPoint("stat",
    map[string]string{"unit": "temperature"},
    map[string]interface{}{"avg": 24.5, "max": 45},
    time.Now())
writeAPI.WritePoint(context.Background(), p)
client.Close()

```

```java [Java]
private static String url = "http://<greptimedb-host>:4000/v1/influxdb";
private static String org = "";
private static String bucket = "<db-name>";
private static char[] token = "<greptime_user>:<greptimedb_password>".toCharArray();

public static void main(final String[] args) {

    InfluxDBClient influxDBClient = InfluxDBClientFactory.create(url, token, org, bucket);
    WriteApiBlocking writeApi = influxDBClient.getWriteApiBlocking();
    Point point = Point.measurement("temperature")
            .addTag("location", "west")
            .addField("value", 55D)
            .time(Instant.now().toEpochMilli(), WritePrecision.MS);

    writeApi.writePoint(point);
    influxDBClient.close();
}
```

```php [PHP]
$client = new Client([
    "url" => "http://<greptimedb-host>:4000/v1/influxdb",
    "token" => "<greptime_user>:<greptimedb_password>",
    "bucket" => "<db-name>",
    "org" => "",
    "precision" => InfluxDB2\Model\WritePrecision::S
]);

$writeApi = $client->createWriteApi();

$dateTimeNow = new DateTime('NOW');
$point = Point::measurement("weather")
        ->addTag("location", "Denver")
        ->addField("temperature", rand(0, 20))
        ->time($dateTimeNow->getTimestamp());
$writeApi->write($point);
```

:::

除了上述语言之外，GreptimeDB 还支持其他 InfluxDB 支持的客户端库。
你可以通过参考上面提供的连接信息代码片段，使用你喜欢的语言编写代码。

## 迁移数据

如果你不需要所有历史数据，可以将数据同时写入 GreptimeDB 和 InfluxDB。
一段时间后，可以停止向 InfluxDB 写入数据，只写入 GreptimeDB。
当使用 InfluxDB 客户端库时，需要创建两个客户端实例，一个用于 GreptimeDB，一个用于 InfluxDB。

如果你需要迁移所有历史数据，请按照以下步骤操作。

### 从 InfluxDB v2 服务器导出数据

首先，使用 InfluxDB CLI 获取 bucket ID：

```shell
influx bucket list
```

你将看到类似以下的输出：

```shell
ID               Name           Retention Shard group duration Organization ID  Schema Type
22bdf03ca860e351 _monitoring    168h0m0s  24h0m0s              41fabbaf2d6c2841 implicit
b60a6fd784bae5cb _tasks         72h0m0s   24h0m0s              41fabbaf2d6c2841 implicit
9a79c1701e579c94 example-bucket infinite  168h0m0s             41fabbaf2d6c2841 implicit
```

假设你想要从 `example-bucket` 迁移数据，那么 ID 为 `9a79c1701e579c94`。
登录到部署 InfluxDB v2 的服务器，并运行以下命令以导出数据为 InfluxDB 行协议格式：

```shell
# 引擎路径通常为 "/var/lib/influxdb2/engine/"
export ENGINE_PATH="<engine-path>"
# 导出 example-bucket 中的所有数据（ID=9a79c1701e579c94）
influxd inspect export-lp --bucket-id 9a79c1701e579c94 --engine-path $ENGINE_PATH --output-path influxdb_export.lp
```

输出类似如下的数据：

```shell
{"level":"info","ts":1713227837.139161,"caller":"export_lp/export_lp.go:219","msg":"exporting TSM files","tsm_dir":"/var/lib/influxdb2/engine/data/9a79c1701e579c94","file_count":0}
{"level":"info","ts":1713227837.1399868,"caller":"export_lp/export_lp.go:315","msg":"exporting WAL files","wal_dir":"/var/lib/influxdb2/engine/wal/9a79c1701e579c94","file_count":1}
{"level":"info","ts":1713227837.1669333,"caller":"export_lp/export_lp.go:204","msg":"export complete"}
```

:::tip 提示
你可以指定更具体的数据集进行导出，例如指定 measurement 和时间范围。详细信息请参考 [`influxd inspect export-lp`](https://docs.influxdata.com/influxdb/v2/reference/cli/influxd/inspect/export-lp/)。
:::

### 导入数据到 GreptimeDB

将 `influxdb_export.lp` 文件复制到工作目录：

```shell
cp influxdb2:/influxdb_export.lp influxdb_export.lp
```

在将数据导入 GreptimeDB 之前，如果数据文件过大，建议将数据文件拆分为多个片段：

```shell
split -l 1000 -d -a 10 influxdb_export.lp influxdb_export_slice.
# -l [line_count]    Create split files line_count lines in length.
# -d                 Use a numeric suffix instead of a alphabetic suffix.
# -a [suffix_length] Use suffix_length letters to form the suffix of the file name.
```

通过 HTTP API 将数据导入 GreptimeDB：

```
for file in influxdb_export_slice.*; do
    curl -i -H "Authorization: token <greptime_user>:$<greptimedb_password>" \
        -X POST "https://<greptimedb-host>/v1/influxdb/api/v2/write?db=<db-name>" \
        --data-binary @${file}
    # avoid rate limit in the hobby plan
    sleep 1
done
```

## 查询数据

GreptimeDB 不支持 Flux 和 InfluxQL，而是使用 SQL 和 PromQL。

SQL 是一种通用的用于管理和操作关系数据库的语言。
具有灵活的数据检索、操作和分析功能，
减少了已经熟悉 SQL 的用户的学习曲线。

PromQL（Prometheus 查询语言）允许用户实时选择和聚合时间序列数据，
表达式的结果可以显示为图形，也可以在 Prometheus 的表达式浏览器中以表格数据的形式查看，
或通过 [HTTP API](/user-guide/query-data/promql#prometheus-http-api) 传递给外部系统。

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
   time(1h)
```

此 InfluxQL 查询计算 `monitor` 表中 `cpu`字段的最大值，
其中时间大于当前时间减去 24 小时，结果以一小时为间隔进行分组。

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
    ts,
    host,
    AVG(cpu) RANGE '1h' as mean_cpu
FROM
    monitor
WHERE
    ts > NOW() - INTERVAL '24 hours'
ALIGN '1h' TO NOW
ORDER BY ts DESC;
```

在该 SQL 查询中，
`RANGE` 子句确定了 AVG(cpu) 聚合函数的时间窗口，
而 `ALIGN` 子句设置了时间序列数据的对齐时间。
有关按时间窗口分组的更多详细信息，请参考[按时间窗口聚合数据](/user-guide/query-data/sql#按时间窗口聚合数据)文档。

在 PromQL 中，类似的查询为：

```promql
avg_over_time(monitor[1h])
```

要查询最后 24 小时的时间序列数据，
你需要执行此 PromQL 并使用 HTTP API 的 `start` 和 `end` 参数定义时间范围。
有关 PromQL 的更多信息，请参考 [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/) 文档。

## 可视化数据

推荐使用 Grafana 可视化 GreptimeDB 数据，
请参考 [Grafana 文档](/user-guide/clients/grafana)了解如何配置 GreptimeDB。
