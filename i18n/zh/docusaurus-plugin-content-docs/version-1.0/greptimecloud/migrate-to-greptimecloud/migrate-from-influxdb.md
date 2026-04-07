---
keywords: [InfluxDB, 迁移, HTTP API, Telegraf, 客户端库, 数据可视化]
description: 介绍如何从 InfluxDB 迁移到 GreptimeCloud，包括获取数据库连接信息、通过 HTTP API 和 Telegraf 写入数据、使用客户端库写入数据以及数据可视化。
---

import DocTemplate from '../../db-cloud-shared/migrate/migrate-from-influxdb.md' 

# 从 InfluxDB 迁移

<DocTemplate>

<div id="get-database-connection-information">

打开 [GreptimeCloud 控制台](https://greptime.cloud) 点击 `Manage Your Data` 下的 `Connection Information`.
你可以找到 GreptimeDB URL，数据库名称，以及 token 所需的 username 和 password。

</div>

<div id="write-data-http-api">
<Tabs>

<TabItem value="InfluxDB line protocol v2" label="InfluxDB line protocol v2">

```shell
curl -X POST 'https://<host>/v1/influxdb/api/v2/write?bucket=<db-name>' \
  -H 'authorization: token <greptime_user:greptimedb_password>' \
  -d 'census,location=klamath,scientist=anderson bees=23 1566086400000000000'
```

</TabItem>

<TabItem value="InfluxDB line protocol v1" label="InfluxDB line protocol v1">

```shell
curl 'https://<host>/v1/influxdb/write?db=<db-name>&u=<greptime_user>&p=<greptimedb_password>' \
  -d 'census,location=klamath,scientist=anderson bees=23 1566086400000000000'
```

</TabItem>

</Tabs>

</div>

<div id="write-data-telegraf">


<Tabs>

<TabItem value="InfluxDB line protocol v2" label="InfluxDB line protocol v2">

```toml
[[outputs.influxdb_v2]]
  urls = ["https://<host>/v1/influxdb"]
  token = "<greptime_user>:<greptimedb_password>"
  bucket = "<db-name>"
  ## 留空即可
  organization = ""
```

</TabItem>

<TabItem value="InfluxDB line protocol v1" label="InfluxDB line protocol v1">

```toml
[[outputs.influxdb]]
  urls = ["https://<host>/v1/influxdb"]
  database = "<db-name>"
  username = "<greptime_user>"
  password = "<greptimedb_password>"
```

</TabItem>
</Tabs>

</div>

<div id="write-data-client-libs">
<Tabs>

<TabItem value="Node.js" label="Node.js">

```js
'use strict'
/** @module write
**/

import { InfluxDB, Point } from '@influxdata/influxdb-client'

/** 环境变量 **/
const url = 'https://<host>/v1/influxdb'
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

</TabItem>


<TabItem value="Python" label="Python">

```python
import influxdb_client
from influxdb_client.client.write_api import SYNCHRONOUS

bucket = "<db-name>"
org = ""
token = "<greptime_user>:<greptimedb_password>"
url="https://<host>/v1/influxdb"

client = influxdb_client.InfluxDBClient(
    url=url,
    token=token,
    org=org
)

write_api = client.write_api(write_options=SYNCHRONOUS)

p = influxdb_client.Point("my_measurement").tag("location", "Prague").field("temperature", 25.3)
write_api.write(bucket=bucket, org=org, record=p)

```

</TabItem>

<TabItem value="Go" label="Go">

```go
bucket := "<db-name>"
org := ""
token := "<greptime_user>:<greptimedb_password>"
url := "https://<host>/v1/influxdb"
client := influxdb2.NewClient(url, token)
writeAPI := client.WriteAPIBlocking(org, bucket)

p := influxdb2.NewPoint("stat",
    map[string]string{"unit": "temperature"},
    map[string]interface{}{"avg": 24.5, "max": 45},
    time.Now())
writeAPI.WritePoint(context.Background(), p)
client.Close()

```

</TabItem>

<TabItem value="Java" label="Java">

```java
private static String url = "https://<host>/v1/influxdb";
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

</TabItem>

<TabItem value="PHP" label="PHP">

```php
$client = new Client([
    "url" => "https://<host>/v1/influxdb",
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

</TabItem>

</Tabs>

</div>

<div id="visualize-data">

GreptimeCloud 控制台提供了名为 Workbench 的数据可视化工作台。
打开 [控制台](https://greptime.cloud), 在 `Manage Your Data` 下选择 `Web Dashboard`，
然后创建一个新的 Workbench 文件，
即可按需求创建图表。

</div>

<div id="import-data-shell">

```shell
for file in data.*; do
  curl -i --retry 3 \
    -X POST "https://${GREPTIME_HOST}/v1/influxdb/write?db=${GREPTIME_DB}&u=${GREPTIME_USERNAME}&p=${GREPTIME_PASSWORD}" \
    --data-binary @${file}
  sleep 1
done
```

</div>

</DocTemplate>
