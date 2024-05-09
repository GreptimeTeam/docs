---
template: ../../db-cloud-shared/migrate/migrate-from-influxdb.md
---
# Migrate from InfluxDB

<docs-template>

{template write-data-http-api%
::: code-group

```shell [InfluxDB line protocol v2]
curl -X POST 'https://<host>/v1/influxdb/api/v2/write?db=<db-name>' \
  -H 'authorization: token <greptime_user:greptimedb_password>' \
  -d 'census,location=klamath,scientist=anderson bees=23 1566086400000000000'
```

```shell [InfluxDB line protocol v1]
curl 'https://<host>/v1/influxdb/write?db=<db-name>&u=<greptime_user>&p=<greptimedb_password>' \
  -d 'census,location=klamath,scientist=anderson bees=23 1566086400000000000'
```

:::

%}

{template write-data-telegraf%


::: code-group

```toml [InfluxDB line protocol v2]
[[outputs.influxdb_v2]]
  urls = ["https://<host>/v1/influxdb"]
  token = "<greptime_user>:<greptimedb_password>"
  bucket = "<db-name>"
  ## Leave empty
  organization = ""
```

```toml [InfluxDB line protocol v1]
[[outputs.influxdb]]
  urls = ["https://<host>/v1/influxdb"]
  database = "<db-name>"
  username = "<greptime_user>"
  password = "<greptimedb_password>"
```
:::

%}

### Client libraries

Writing data to GreptimeDB is a straightforward process when using InfluxDB client libraries.
Simply include the URL and authentication details in the client configuration.

For example:

{template write-data-client-libs%
::: code-group

```js [Node.js]
'use strict'
/** @module write
**/

import { InfluxDB, Point } from '@influxdata/influxdb-client'

/** Environment variables **/
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


```python [Python]
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

# Write script
write_api = client.write_api(write_options=SYNCHRONOUS)

p = influxdb_client.Point("my_measurement").tag("location", "Prague").field("temperature", 25.3)
write_api.write(bucket=bucket, org=org, record=p)

```

```go [Go]
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

```java [Java]
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

```php [PHP]
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

:::

%}

{template visualize-data%
It is recommanded using Grafana to visualize data in GreptimeDB.
Please refer to the [Grafana documentation](/user-guide/clients/grafana) for details on configuring GreptimeDB.
%}

## Migrate data

For a seamless migration of data from InfluxDB to GreptimeDB, you can follow these steps:

![Double write to GreptimeDB and InfluxDB](/migrate-influxdb-to-greptimedb.drawio.svg)

1. Write data to both GreptimeDB and InfluxDB to avoid data loss during migration.
2. Export all historical data from InfluxDB and import the data into GreptimeDB.
3. Stop writing data to InfluxDB and remove the InfluxDB server.

### Write data to both GreptimeDB and InfluxDB simultaneously

Writing data to both GreptimeDB and InfluxDB simultaneously is a practical strategy to avoid data loss during migration.
By utilizing InfluxDB's [client libraries](#client-libraries),
you can set up two client instances - one for GreptimeDB and another for InfluxDB.
For guidance on writing data to GreptimeDB using the InfluxDB line protocol, please refer to the [write data](#write-data) section.

If retaining all historical data isn't necessary,
you can simultaneously write data to both GreptimeDB and InfluxDB for a specific period to accumulate the required recent data. 
Subsequently, cease writing to InfluxDB and continue exclusively with GreptimeDB.
If a complete migration of all historical data is needed, please proceed with the following steps.

### Export data from InfluxDB v1 Server

Create a temporary directory to store the exported data of InfluxDB.

```shell
mkdir -p /path/to/export
```

Use the [`influx_inspect export` command](https://docs.influxdata.com/influxdb/v1/tools/influx_inspect/#export) of InfluxDB to export data.

```shell
influx_inspect export \
  -database <db-name> \ 
  -end <end-time> \
  -lponly \
  -datadir /var/lib/influxdb/data \
  -waldir /var/lib/influxdb/wal \
  -out /path/to/export/data
```

- The `-database` flag specifies the database to be exported.
- The `-end` flag specifies the end time of the data to be exported.
Must be in [RFC3339 format](https://datatracker.ietf.org/doc/html/rfc3339), such as `2024-01-01T00:00:00Z`.
You can use the timestamp when simultaneously writing data to both GreptimeDB and InfluxDB as the end time.
- The `-lponly` flag specifies that only the Line Protocol data should be exported.
- The `-datadir` flag specifies the path to the data directory, as configured in the [InfluxDB data settings](https://docs.influxdata.com/influxdb/v1/administration/config/#data-settings).
- The `-waldir` flag specifies the path to the WAL directory, as configured in the [InfluxDB data settings](https://docs.influxdata.com/influxdb/v1/administration/config/#data-settings).
- The `-out` flag specifies the output directory.

The exported data in InfluxDB line protocol looks like the following:

```txt
disk,device=disk1s5s1,fstype=apfs,host=bogon,mode=ro,path=/ inodes_used=356810i 1714363350000000000
diskio,host=bogon,name=disk0 iops_in_progress=0i 1714363350000000000
disk,device=disk1s6,fstype=apfs,host=bogon,mode=rw,path=/System/Volumes/Update inodes_used_percent=0.0002391237988702021 1714363350000000000
...
```

### Export Data from InfluxDB v2 Server

Create a temporary directory to store the exported data of InfluxDB.

```shell
mkdir -p /path/to/export
```

Use the [`influx inspect export-lp` command](https://docs.influxdata.com/influxdb/v2/reference/cli/influxd/inspect/export-lp/) of InfluxDB to export data in the bucket to line protocol.

```shell
influxd inspect export-lp \
  --bucket-id <bucket-id> \
  --engine-path /var/lib/influxdb2/engine/ \
  --end <end-time> \
  --output-path /path/to/export/data
```

- The `--bucket-id` flag specifies the bucket ID to be exported.
- The `--engine-path` flag specifies the path to the engine directory, as configured in the [InfluxDB data settings](https://docs.influxdata.com/influxdb/v2.0/reference/config-options/#engine-path).
- The `--end` flag specifies the end time of the data to be exported. Must be in [RFC3339 format](https://datatracker.ietf.org/doc/html/rfc3339), such as `2024-01-01T00:00:00Z`.
You can use the timestamp when simultaneously writing data to both GreptimeDB and InfluxDB as the end time.
- The `--output-path` flag specifies the output directory.

The outputs look like the following:

```json
{"level":"info","ts":1714377321.4795408,"caller":"export_lp/export_lp.go:219","msg":"exporting TSM files","tsm_dir":"/var/lib/influxdb2/engine/data/307013e61d514f3c","file_count":1}
{"level":"info","ts":1714377321.4940555,"caller":"export_lp/export_lp.go:315","msg":"exporting WAL files","wal_dir":"/var/lib/influxdb2/engine/wal/307013e61d514f3c","file_count":1}
{"level":"info","ts":1714377321.4941633,"caller":"export_lp/export_lp.go:204","msg":"export complete"}
```

The exported data in InfluxDB line protocol looks like the following:

```txt
cpu,cpu=cpu-total,host=bogon usage_idle=80.4448912910468 1714376180000000000
cpu,cpu=cpu-total,host=bogon usage_idle=78.50167052182304 1714376190000000000
cpu,cpu=cpu-total,host=bogon usage_iowait=0 1714375700000000000
cpu,cpu=cpu-total,host=bogon usage_iowait=0 1714375710000000000
...
```

### Import Data to GreptimeDB

Before importing data to GreptimeDB, if the data file is too large, it's recommended to split the data file into multiple slices:

```shell
split -l 100000 -d -a 10 data data.
# -l [line_count]    Create split files line_count lines in length.
# -d                 Use a numeric suffix instead of a alphabetic suffix.
# -a [suffix_length] Use suffix_length letters to form the suffix of the file name.
```

You can import data using the HTTP API as described in the [write data section](#http-api).
The Python script provided below will help you in reading data from the files and importing it into GreptimeDB.

Create a Python file named `ingest.py`, ensuring you're using Python version 3.9 or later, and then copy and paste the following code into it.

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
    while attempts < 3:  # Retry up to 3 times
        result = subprocess.run(curl_command, universal_newlines=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(result)
        # Check if there are any warnings or errors in the curl command output
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

    # Walk through the directory
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            file_names.append(file_path)

    # Sort the file names array
    file_names.sort()

    # Process each file
    for file_name in file_names:
        process_file(file_name, url, token)

# Check if the arguments are provided
if len(sys.argv) < 4:
    print("Please provide the directory path as the first argument, the url as the second argument and the token as the third argument.")
    sys.exit(1)

directory_path = sys.argv[1]
url = sys.argv[2]
token = sys.argv[3]

# Call the function to process the directory
process_directory(directory_path, url, token)
```

Suppose your dictionary tree is as following:

```shell
.
├── ingest.py
└── slices
    ├── data.0000000000
    ├── data.0000000001
    ├── data.0000000002

```

Execute the Python script in the current directory and wait for the data import to complete.

{template import-data-shell%

```shell
python3 ingest.py slices https://<host>/v1/influxdb/write?db=<db-name> <token>
```

%}

</docs-template>
