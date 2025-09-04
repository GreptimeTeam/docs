This guide will help you understand the differences between the data models of GreptimeDB and InfluxDB, and guide you through the migration process.

## Data model in difference

To understand the differences between the data models of InfluxDB and GreptimeDB, please refer to the [Data Model](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md#data-model) in the Ingest Data documentation.

## Database connection information

Before you begin writing or querying data, it's crucial to comprehend the differences in database connection information between InfluxDB and GreptimeDB.

- **Token**: The InfluxDB API token, used for authentication, aligns with the GreptimeDB authentication. When interacting with GreptimeDB using InfluxDB's client libraries or HTTP API, you can use `<greptimedb_user:greptimedb_password>` as the token.
- **Organization**: Unlike InfluxDB, GreptimeDB does not require an organization for connection.
- **Bucket**: In InfluxDB, a bucket serves as a container for time series data, which is equivalent to the database name in GreptimeDB.

<InjectContent id="get-database-connection-information" content={props.children}/>

## Ingest data

GreptimeDB is compatible with both v1 and v2 of InfluxDB's line protocol format,
facilitating a seamless migration from InfluxDB to GreptimeDB.

### HTTP API

To write a measurement to GreptimeDB, you can use the following HTTP API request:

<InjectContent id="write-data-http-api" content={props.children}/>

### Telegraf

GreptimeDB's support for the Influxdb line protocol ensures its compatibility with Telegraf.
To configure Telegraf, simply add GreptimeDB URL into Telegraf configurations:

<InjectContent id="write-data-telegraf" content={props.children}/>

### Client libraries

Writing data to GreptimeDB is a straightforward process when using InfluxDB client libraries.
Simply include the URL and authentication details in the client configuration.

For example:

<InjectContent id="write-data-client-libs" content={props.children}/>

In addition to the languages previously mentioned,
GreptimeDB also accommodates client libraries for other languages supported by InfluxDB.
You can code in your language of choice by referencing the connection information and code snippets provided earlier.

## Query data

GreptimeDB does not support Flux and InfluxQL, opting instead for SQL and PromQL.

SQL is a universal language designed for managing and manipulating relational databases.
With flexible capabilities for data retrieval, manipulation, and analytics,
it is also reduce the learning curve for users who are already familiar with SQL.

PromQL (Prometheus Query Language) allows users to select and aggregate time series data in real time,
The result of an expression can either be shown as a graph, viewed as tabular data in Prometheus's expression browser,
or consumed by external systems via the [HTTP API](/user-guide/query-data/promql.md#prometheus-http-api).

Suppose you are querying the maximum cpu usage from the `monitor` table, recorded over the past 24 hours.
In influxQL, the query might look something like this:

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

This InfluxQL query computes the maximum value of the `cpu` field from the `monitor` table,
considering only the data where the time is within the last 24 hours.
The results are then grouped into one-hour intervals.

In Flux, the query might look something like this:

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
    ts > NOW() - '24 hours'::INTERVAL
ALIGN '1h' TO NOW
ORDER BY ts DESC;
```

In this SQL query,
the `RANGE` clause determines the time window for the `AVG(cpu)` aggregation function,
while the `ALIGN` clause sets the alignment time for the time series data.
For more information on time window grouping, please refer to the [Aggregate data by time window](/user-guide/query-data/sql.md#aggregate-data-by-time-window) document.

The similar query in PromQL would be something like:

```promql
avg_over_time(monitor[1h])
```
To query time series data from the last 24 hours,
you need to execute this PromQL, using the `start` and `end` parameters of the HTTP API to define the time range.
For more information on PromQL, please refer to the [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/) document.

## Visualize data

<InjectContent id="visualize-data" content={props.children}/>

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
For guidance on writing data to GreptimeDB using the InfluxDB line protocol, please refer to the [Ingest Data](#ingest-data) section.

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
The script provided below will help you in reading data from the files and importing it into GreptimeDB.

Suppose you are in the directory where the data files are stored:

```shell
.
├── data.0000000000
├── data.0000000001
├── data.0000000002
...
```

Replace the following placeholders with your GreptimeDB connection information to setup the environment variables:

```shell
export GREPTIME_USERNAME=<greptime_username>
export GREPTIME_PASSWORD=<greptime_password>
export GREPTIME_HOST=<host>
export GREPTIME_DB=<db-name>
```

Import the data from the files into GreptimeDB:

<InjectContent id="import-data-shell" content={props.children}/>

If you need a more detailed migration plan or example scripts, please provide the specific table structure and data volume. The [GreptimeDB official community](https://github.com/orgs/GreptimeTeam/discussions) will offer further support. Welcome to join the [Greptime Slack](http://greptime.com/slack).
