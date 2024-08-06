---
template: ../../db-cloud-shared/migrate/migrate-from-influxdb.md
---
# Migrate from InfluxDB

<docs-template>

{template write-data-http-api%
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

%}

{template write-data-telegraf%

For detailed configuration instructions, please refer to the [Ingest Data via Telegraf](/user-guide/ingest-data/for-observerbility/telegraf.md) documentation.

%}


{template write-data-client-libs%
::: code-group

```js [Node.js]
'use strict'
/** @module write
**/

import { InfluxDB, Point } from '@influxdata/influxdb-client'

/** Environment variables **/
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

# Write script
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

%}

{template visualize-data%
It is recommended using Grafana to visualize data in GreptimeDB.
Please refer to the [Grafana documentation](/user-guide/clients/grafana) for details on configuring GreptimeDB.
%}

{template import-data-shell%

```shell
for file in data.*; do
  curl -i --retry 3 \
    -X POST "http://${GREPTIME_HOST}:4000/v1/influxdb/write?db=${GREPTIME_DB}&u=${GREPTIME_USERNAME}&p=${GREPTIME_PASSWORD}" \
    --data-binary @${file}
  sleep 1
done
```

%}

</docs-template>
