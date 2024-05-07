# 从 InfluxDB 迁移

本文档将帮助你了解 GreptimeDB 和 InfluxDB 的数据模型之间的区别，并指导你完成迁移过程。

## 数据模型的区别

你可能已经熟悉了 [InfluxDB 的关键概念](https://docs.influxdata.com/influxdb/v2/reference/key-concepts/)，
GreptimeDB 的 [数据模型](../concepts/data-model.md) 是值得了解的新事物。
让我们从相似和不同之处开始：

- 两者都是[schemaless 写入](/user-guide/write-data/overview#自动生成表结构)的解决方案，这意味着在写入数据之前无需定义表结构。
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
+---------------------+----------+-----------+------+------+
| ts                  | location | scientist | bees | ants |
+---------------------+----------+-----------+------+------+
| 2019-08-18 00:00:00 | klamath  | anderson  |   23 | NULL |
| 2019-08-18 00:06:00 | klamath  | anderson  |   28 | NULL |
| 2019-08-18 00:00:00 | portland | mullen    | NULL |   30 |
| 2019-08-18 00:06:00 | portland | mullen    | NULL |   32 |
+---------------------+----------+-----------+------+------+
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

在写入或查询数据之前，需要了解 InfluxDB 和 GreptimeDB 之间的数据库连接信息的差异。

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

## 迁移数据

你可以通过以下步骤实现从 InfluxDB 到 GreptimeDB 的数据无缝迁移：

![Double write to GreptimeDB and InfluxDB](/migrate-influxdb-to-greptimedb.drawio.svg)

1. 同时将数据写入 GreptimeDB 和 InfluxDB，以避免迁移过程中的数据丢失。
2. 从 InfluxDB 导出所有历史数据，并将数据导入 GreptimeDB。
3. 停止向 InfluxDB 写入数据，并移除 InfluxDB 服务器。

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

在将数据导入 GreptimeDB 之前，如果数据文件过大，建议将数据文件拆分为多个片段：

```shell
split -l 100000 -d -a 10 data data.
# -l [line_count]    创建长度为 line_count 行的拆分文件。
# -d                 使用数字后缀而不是字母后缀。
# -a [suffix_length] 使用 suffix_length 个字母来形成文件名的后缀。
```

你可以使用 HTTP API 导入数据，如[写入数据](#写入数据)部分所述。
下方提供的 Python 脚本将帮助你从文件中读取数据并将其导入 GreptimeDB。

创建一个名为 `ingest.py` 的 Python 文件，确保你使用的是 Python 3.9 或更高版本，然后将以下代码复制并粘贴到其中。

```python
import os
import sys
import subprocess

def process_file(file_path, url, token):
    print("Ingesting file:", file_path)
    curl_command = ['curl', '-i',
                    '-H', "authorization: token {}".format(token),
                    '-X', "POST",
                    '--data-binary', "@{}".format(file_path),
                    url]
    print(" ".join(curl_command))

    attempts = 0
    while attempts < 3:  # 最多重试三次
        result = subprocess.run(curl_command, universal_newlines=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(result)
        # 检查 curl 命令输出中是否有任何警告或错误
        output = result.stderr.lower()
        if "warning" in output or "error" in output:
            print("Warnings or errors detected. Retrying...")
            attempts += 1
        else:
            break

    if attempts == 3:
        print("Request failed after 3 attempts. Giving up.")
        sys.exit(1)

def process_directory(directory, url, token):
    file_names = []

    # 遍历目录
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            file_names.append(file_path)

    # 对文件名数组进行排序
    file_names.sort()

    # 处理每个文件
    for file_name in file_names:
        process_file(file_name, url, token)

# 检查是否提供了参数
if len(sys.argv) < 4:
    print("Please provide the directory path as the first argument, the url as the second argument and the token as the third argument.")
    sys.exit(1)

directory_path = sys.argv[1]
url = sys.argv[2]
token = sys.argv[3]

# 调用函数处理目录
process_directory(directory_path, url, token)
```

假如你的工作目录树如下：

```shell
.
├── ingest.py
└── slices
    ├── data.0000000000
    ├── data.0000000001
    ├── data.0000000002

```

在当前目录执行 Python 脚本并等待数据导入完成。

```shell
python3 ingest.py slices http://<greptimedb-host>:4000/v1/influxdb/write?db=<db-name> <token>
```
