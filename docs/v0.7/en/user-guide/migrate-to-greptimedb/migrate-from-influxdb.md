# Migrate from InfluxDB


## Data model in difference

While you are likely familiar with [InfluxDB key concepts](https://docs.influxdata.com/influxdb/v2/reference/key-concepts/), the [data model](../concepts/data-model.md) of GreptimeDB is something new to explore.
Let's start with similarities and differences:

- Both solutions are [schemaless](/user-guide/write-data/overview#automatic-schema-generation), which means there is no need to define a schema before writing data.
- In InfluxDB, a point represents a single data record with a measurement, tag set, field set, and a timestamp. In GreptimeDB, it is represented as a row of data in the time-series table. The table name corresponds to the measurement, and the columns consist of three types: Tag, Field, and Timestamp.
- GreptimeDB uses `TimestampNanosecond` as the data type for timestamp data from the [InfluxDB line protocol API](/user-guide/write-data/influxdb-line).
- GreptimeDB uses `Float64` as the data type for numeric data from the InfluxDB line protocol API.

Let’s consider the following [sample data](https://docs.influxdata.com/influxdb/v2/reference/key-concepts/data-elements/#sample-data) borrowed from InfluxDB docs as an example:

|_time|_measurement|location|scientist|_field|_value|
|---|---|---|---|---|---|
|2019-08-18T00:00:00Z|census|klamath|anderson|bees|23|
|2019-08-18T00:00:00Z|census|portland|mullen|ants|30|
|2019-08-18T00:06:00Z|census|klamath|anderson|bees|28|
|2019-08-18T00:06:00Z|census|portland|mullen|ants|32|

The InfluxDB line protocol format for the above data is:


```shell
census,location=klamath,scientist=anderson bees=23 1566086400000000000
census,location=portland,scientist=mullen ants=30 1566086400000000000
census,location=klamath,scientist=anderson bees=28 1566086760000000000
census,location=portland,scientist=mullen ants=32 1566086760000000000
```

In GreptimeDB data model the above data be represented as the following in `census` table:

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

The schema of `census` table is as following:

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

## Database connection information

Before writing or querying data, it is important to understand the differences in database connection information between InfluxDB and GreptimeDB.

- Token: The InfluxDB API token is used for authentication and is the same as the GreptimeDB authentication. You can use `<greptimedb_user:greptimedb_password>` as the token when interacting with GreptimeDB using InfluxDB's client libraries or HTTP API.
- Organization: There is no organization when connecting to GreptimeDB.
- Bucket: In InfluxDB, a bucket is a container for time series data. It is the same as the database name in GreptimeDB.

## Write data

GreptimeDB is compatible with InfluxDB's line protocol format, both v1 and v2.
Which means you can easily migrate from InfluxDB to GreptimeDB.

### HTTP API

To write a measurement to GreptimeDB, you can use the following HTTP API request:

::: code-group

```shell [Influxdb line protocol v2]
curl -X POST 'http://<greptimedb-host>:4000/v1/influxdb/api/v2/write?db=<db-name>' \
  -H 'authorization: token <greptime_user:greptimedb_password>' \
  -d 'census,location=klamath,scientist=anderson bees=23 1566086400000000000'
```

```shell [Influxdb line protocol v1]
curl 'http://<greptimedb-host>:4000/v1/influxdb/write?db=<db-name>&u=<greptime_user>&p=<greptimedb_password>' \
  -d 'census,location=klamath,scientist=anderson bees=23 1566086400000000000'
```

:::

### Telegraf

Support of InfluxDB line protocol also means GreptimeDB is compatible with Telegraf.
To configure Telegraf, simply add `http://<greptimedb-host>:4000` URL to Telegraf configs:

::: code-group

```toml [Influxdb line protocol v2]
[[outputs.influxdb_v2]]
  urls = ["http://<greptimedb-host>:4000/v1/influxdb"]
  token = "<greptime_user>:<greptimedb_password>"
  bucket = "<db-name>"
  ## Leave empty
  organization = ""
```

```toml [Influxdb line protocol v1]
[[outputs.influxdb]]
  urls = ["http://<greptimedb-host>:4000/v1/influxdb"]
  database = "<db-name>"
  username = "<greptime_user>"
  password = "<greptimedb_password>"
```
:::

### Client libraries

Writing data to GreptimeDB is straightforward when using InfluxDB client libraries.
All you need to do is include the URL and authentication details in the client configuration.

For example:

::: code-group

```js [Node.js]
'use strict'
/** @module write
 * Writes a data point to InfluxDB using the Javascript client library with Node.js.
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

Besides the languages mentioned above, GreptimeDB also supports client libraries for other languages that InfluxDB supports.
You can write code in your preferred language by referring to the connection information code snippets provided above.

## Migrate data

If you do not need all historical data, you can double write data to both GreptimeDB and InfluxDB.
After a period of time, you can stop writing to InfluxDB and only write to GreptimeDB.
When using InfluxDB client libraries, you need to create two instances of clients, one for GreptimeDB and one for InfluxDB.

If you need to migrate all historical data, please follow these steps.

### Export Data from InfluxDB v2 Server

Let's get the bucket ID to be migrated with InfluxDB CLI:

```shell
influx bucket list
```

You'll get outputs look like the following:

```shell
ID               Name           Retention Shard group duration Organization ID  Schema Type
22bdf03ca860e351 _monitoring    168h0m0s  24h0m0s              41fabbaf2d6c2841 implicit
b60a6fd784bae5cb _tasks         72h0m0s   24h0m0s              41fabbaf2d6c2841 implicit
9a79c1701e579c94 example-bucket infinite  168h0m0s             41fabbaf2d6c2841 implicit
```

Supposed you'd like to migrate data from `example-bucket`, then the ID is `9a79c1701e579c94`.

Log in to the server you deployed InfluxDB v2 and run the following command to export data in InfluxDB Line Protocol format:

```shell
# The engine path is often "/var/lib/influxdb2/engine/".
export ENGINE_PATH="<engine-path>"
# Export all the data in example-bucket (ID=9a79c1701e579c94).
influxd inspect export-lp --bucket-id 9a79c1701e579c94 --engine-path $ENGINE_PATH --output-path influxdb_export.lp
```

The outputs look like the following:

```shell
{"level":"info","ts":1713227837.139161,"caller":"export_lp/export_lp.go:219","msg":"exporting TSM files","tsm_dir":"/var/lib/influxdb2/engine/data/9a79c1701e579c94","file_count":0}
{"level":"info","ts":1713227837.1399868,"caller":"export_lp/export_lp.go:315","msg":"exporting WAL files","wal_dir":"/var/lib/influxdb2/engine/wal/9a79c1701e579c94","file_count":1}
{"level":"info","ts":1713227837.1669333,"caller":"export_lp/export_lp.go:204","msg":"export complete"}
```

:::tip Tip
You can specify more concrete data sets, like measurements and time range, to be exported. Please refer to the [`influxd inspect export-lp`](https://docs.influxdata.com/influxdb/v2/reference/cli/influxd/inspect/export-lp/) manual for details.
:::

### Import Data to GreptimeDB

Copy the `influxdb_export.lp` file to a working directory.

```shell
cp influxdb2:/influxdb_export.lp influxdb_export.lp
```

Before importing data to GreptimeDB, if the data file is too large, it's recommended to split the data file into multiple slices:

```shell
split -l 1000 -d -a 10 influxdb_export.lp influxdb_export_slice.
# -l [line_count]    Create split files line_count lines in length.
# -d                 Use a numeric suffix instead of a alphabetic suffix.
# -a [suffix_length] Use suffix_length letters to form the suffix of the file name.
```

Now, import data to GreptimeDB via the HTTP API:

```
for file in influxdb_export_slice.*; do
    curl -i -H "Authorization: token <greptime_user>:$<greptimedb_password>" \
        -X POST "https://<greptimedb-host>/v1/influxdb/api/v2/write?db=<db-name>" \
        --data-binary @${file}
    # avoid rate limit in the hobby plan
    sleep 1
done
```

## Query data

GreptimeDB does not support Flux and InfluxQL. Instead, it utilizes SQL and PromQL.

SQL is a universal language designed for managing and manipulating relational databases.
With flexible capabilities for data retrieval, manipulation, and analytics,
it is also reduce the learning curve for users who are already familiar with SQL.

PromQL (Prometheus Query Language) lets the user select and aggregate time series data in real time,
The result of an expression can either be shown as a graph, viewed as tabular data in Prometheus's expression browser,
or consumed by external systems via the [HTTP API](/user-guide/query-data/promql#prometheus-http-api).

Suppose you are querying the max cpu from the `monitor` table that has been recorded over the past 24 hours.
In influxQL, the query would be something like:

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

This InfluxQL query calculates the max value of the `cpu` field from the `monitor` table,
where the time is greater than the current time minus 24 hours.
The results are grouped in one-hour intervals.

In Flux, the query would be something like:

```flux [Flux]
from(bucket: "public")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "monitor")
  |> aggregateWindow(every: 1h, fn: max)
```

The similar query in GreptimeDB SQL would be:

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

In this SQL query,
the `RANGE` clause determines the time window for the AVG(cpu) aggregation function,
while the `ALIGN` clause sets the alignment time for the time series data.
For additional details on grouping by time window, please refer to the [Aggregate data by time window](/user-guide/query-data/sql#aggregate-data-by-time-window) document.

The similar query in PromQL would be something like:

```promql
avg_over_time(monitor[1h])
```

To query the last 24 hours of time series data,
you need to execute this PromQL with the `start` and `end` parameters of the HTTP API to define the time range.
For more information on PromQL, please refer to the [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/) document.

## Visualize data

It is recommanded using Grafana to visualize data in GreptimeDB.
Please refer to the [Grafana documentation](/user-guide/clients/grafana) for details on configuring GreptimeDB.
