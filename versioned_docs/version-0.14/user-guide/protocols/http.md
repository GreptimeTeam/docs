---
keywords: [HTTP API, authentication, timeout settings, health checks, configuration, SQL queries]
description: Guide on using HTTP APIs to interact with GreptimeDB, including authentication, timeout settings, health checks, configuration, and SQL queries.
---

# HTTP API

GreptimeDB provides HTTP APIs for interacting with the database. For a complete list of available APIs, please refer to the [HTTP Endpoint](/reference/http-endpoints.md).

## Base URL

The base URL of API is `http(s)://{{host}}:{{port}}/`.

- For the GreptimeDB instance running on the local machine,
  with default port configuration `4000`,
  the base URL is `http://localhost:4000/`.
  You can change the server host and port in the [configuration](/user-guide/deployments/configuration#protocol-options) file.

- For GreptimeCloud, the base URL is `https://{{host}}/`.
  You can find the host in 'Connection Information' at the GreptimeCloud console.

In the following sections, we use `http://{{API-host}}/` as the base URL to demonstrate the API usage.

## Common headers

### Authentication

Assume that you have already configured the database [authentication](/user-guide/deployments/authentication/overview.md) correctly,
GreptimeDB supports the built-in `Basic` authentication scheme in the HTTP API. To set up authentication, follow these steps:

1. Encode your username and password using the `<username>:<password>` format and the `Base64` algorithm.
2. Attach your encoded credentials to the one of the following HTTP header:
-  `Authorization: Basic <base64-encoded-credentials>` 
-  `x-greptime-auth: Basic <base64-encoded-credentials>` 

Here's an example. If you want to connect to GreptimeDB using the username `greptime_user` and password `greptime_pwd`, use the following command:

```shell
curl -X POST \
-H 'Authorization: Basic Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=show tables' \
http://localhost:4000/v1/sql
```

In this example, `Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=` represents the Base64-encoded value of `greptime_user:greptime_pwd`. Make sure to replace it with your own configured username and password, and encode them using Base64.

:::tip NOTE
InfluxDB uses its own authentication format, see [InfluxDB](./influxdb-line-protocol.md) for details.
:::

### Timeout

GreptimeDB supports the `X-Greptime-Timeout` header in HTTP requests.
It is used to specify the timeout for the request running in the database server.

For example, the following request set `120s` timeout for the request:

```bash
curl -X POST \
-H 'Authorization: Basic {{authentication}}' \
-H 'X-Greptime-Timeout: 120s' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=show tables' \
http://localhost:4000/v1/sql
```

## Admin APIs

:::tip NOTE
These endpoint cannot be used in GreptimeCloud.
:::

### Check database health

You can use the `/health` endpoint to check the health of the GreptimeDB server.
For more information,
please refer to [Check Database Health](/getting-started/installation/overview.md#check-database-health).

### Check Database Status

You can use the `/status` endpoint to check the status of the GreptimeDB server.

```shell
curl http://{{API-host}}/status
```

For example:

```shell
curl http://localhost:4000/status
```

The output contains the database version and source code information,
which will be similar to the following:

```json
{
  "source_time": "2024-11-08T06:34:49Z",
  "commit": "0e0c4faf0d784f25fed8f26e7000f1f869c88587",
  "branch": "main",
  "rustc_version": "rustc 1.84.0-nightly (e92993dbb 2024-10-18)",
  "hostname": "local",
  "version": "0.9.5"
}
```

### Get GreptimeDB server configuration

You can use the `/config` endpoint to get the [TOML configuration](/user-guide/deployments/configuration.md#configuration-file-options) of the GreptimeDB server.

```shell
curl http://{{API-host}}/config
```

For example:

```shell
curl http://localhost:4000/config
```

The output contains the configuration information of the GreptimeDB server.

```toml
enable_telemetry = true
user_provider = "static_user_provider:file:user"
init_regions_in_background = false
init_regions_parallelism = 16

[http]
addr = "127.0.0.1:4000"
timeout = "30s"
body_limit = "64MiB"
is_strict_mode = false

# ...
```

## POST SQL statements

To submit a SQL query to the GreptimeDB server via HTTP API, use the following format:

```shell
curl -X POST \
  -H 'Authorization: Basic {{authentication}}' \
  -H 'X-Greptime-Timeout: {{time precision}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql={{SQL-statement}}' \
http://{{API-host}}/v1/sql
```

### Headers

- [`Authorization`](#authentication)
- [`X-Greptime-Timeout`](#timeout)
- `Content-Type`: `application/x-www-form-urlencoded`.
- `X-Greptime-Timezone`: The time zone for the current SQL query. Optional. Please refer to [time zone](#time-zone).

### Query string parameters

- `db`: The database name. Optional. If not provided, the default database `public` will be used.
- `format`: The output format. Optional. 
  In addition to the default JSON format, the HTTP API also allows you to
  customize output format by providing the `format` query parameter with following
  values:
  - `influxdb_v1`: [influxdb query
    API](https://docs.influxdata.com/influxdb/v1/tools/api/#query-http-endpoint)
    compatible format. Additional parameters:
    - `epoch`: `[ns,u,µ,ms,s,m,h]`, returns epoch timestamps with the specified
      precision
  - `csv`: output in comma separated values
  - `arrow`: [Arrow IPC
    format](https://arrow.apache.org/docs/python/feather.html). Additional
    parameters:
    - `compression`: `zstd` or `lz4`, default: no compression
  - `table`: ASCII table format for console output

### Body

- `sql`: The SQL statement. Required.

### Response

The response is a JSON object containing the following fields:

- `output`: The SQL executed result. Please refer to the examples blow to see the details.
- `execution_time_ms`: The execution time of the statement in milliseconds.

### Examples

#### `INSERT` statement

For example, to insert data into the `monitor` table of database `public`, use the following command:

```shell
curl -X POST \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=INSERT INTO monitor VALUES ("127.0.0.1", 1667446797450, 0.1, 0.4), ("127.0.0.2", 1667446798450, 0.2, 0.3), ("127.0.0.1", 1667446798450, 0.5, 0.2)' \
  http://localhost:4000/v1/sql?db=public
```

The response will contain the number of affected rows:

```shell
{"output":[{"affectedrows":3}],"execution_time_ms":11}
```

#### `SELECT` statement

You can also use the HTTP API to execute other SQL statements.
For example, to retrieve data from the `monitor` table:

```shell
curl -X POST \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "sql=SELECT * FROM monitor" \
  http://localhost:4000/v1/sql?db=public
```

The response will contain the queried data in JSON format:

```json
{
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "host",
              "data_type": "String"
            },
            {
              "name": "ts",
              "data_type": "TimestampMillisecond"
            },
            {
              "name": "cpu",
              "data_type": "Float64"
            },
            {
              "name": "memory",
              "data_type": "Float64"
            }
          ]
        },
        "rows": [
          [
            "127.0.0.1",
            1720728000000,
            0.5,
            0.1
          ]
        ],
        "total_rows": 1
      }
    }
  ],
  "execution_time_ms": 7
}
```

The response contains the following fields:

- `output`: The execution result.
  - `records`: The query result.
    - `schema`: The schema of the result, including the schema of each column.
    - `rows`: The rows of the query result, where each row is an array containing the corresponding values of the columns in the schema.
- `execution_time_ms`: The execution time of the statement in milliseconds.

#### Time zone

GreptimeDB supports the `X-Greptime-Timezone` header in HTTP requests.
It is used to specify the timezone for the current SQL query.

For example, the following request uses the time zone `+1:00` for the query:

```bash
curl -X POST \
-H 'Authorization: Basic {{authentication}}' \
-H 'X-Greptime-Timezone: +1:00' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=SHOW VARIABLES time_zone;' \
http://localhost:4000/v1/sql
```

After the query, the result will be:

```json
{
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "TIME_ZONE",
              "data_type": "String"
            }
          ]
        },
        "rows": [
          [
            "+01:00"
          ]
        ]
      }
    }
  ],
  "execution_time_ms": 27
}
```

For information on how the time zone affects data inserts and queries, please refer to the SQL documents in the [Ingest Data](../ingest-data/for-iot/sql.md#time-zone) and [Query Data](../query-data/sql.md#time-zone) sections.

#### Query data with `table` format output

You can use the `table` format in the query string parameters to get the output in ASCII table format.

```shell
curl -X POST \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "sql=SELECT * FROM monitor" \
  http://localhost:4000/v1/sql?db=public&format=table
```

Output

```
┌─host────────┬─ts────────────┬─cpu─┬─memory─┐
│ "127.0.0.1" │ 1667446797450 │ 0.1 │ 0.4    │
│ "127.0.0.1" │ 1667446798450 │ 0.5 │ 0.2    │
│ "127.0.0.2" │ 1667446798450 │ 0.2 │ 0.3    │
└─────────────┴───────────────┴─────┴────────┘
```

#### Query data with `influxdb_v1` format output

You can use the `influxdb_v1` format in the query string parameters to get the output in InfluxDB query API compatible format.

```shell
curl -X POST \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "sql=SELECT * FROM monitor" \
  http://localhost:4000/v1/sql?db=public&format=influxdb_v1&epoch=ms
```

```json
{
  "results": [
    {
      "statement_id": 0,
      "series": [
        {
          "name": "",
          "columns": [
            "host",
            "cpu",
            "memory",
            "ts"
          ],
          "values": [
            [
              ["127.0.0.1", 0.1, 0.4, 1667446797450],
              ["127.0.0.1", 0.5, 0.2, 1667446798450],
              ["127.0.0.2", 0.2, 0.3, 1667446798450]
            ]
          ]
        }
      ]
    }
  ],
  "execution_time_ms": 2
}
```

### Parse SQL with GreptimeDB's SQL dialect

To parse and understand queries written in GreptimeDB's SQL dialect for tools like dashboards, etc., you can use the `/v1/sql/parse` endpoint to obtain the structured result of an SQL query:

```shell
curl -X POST \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "sql=SELECT * FROM monitor" \
  http://localhost:4000/v1/sql/parse
```

```json
[
  {
    "Query": {
      "inner": {
        "with": null,
        "body": {
          "Select": {
            "distinct": null,
            "top": null,
            "top_before_distinct": false,
            "projection": [
              {
                "Wildcard": {
                  "opt_ilike": null,
                  "opt_exclude": null,
                  "opt_except": null,
                  "opt_replace": null,
                  "opt_rename": null
                }
              }
            ],
            "into": null,
            "from": [
              {
                "relation": {
                  "Table": {
                    "name": [
                      {
                        "value": "monitor",
                        "quote_style": null
                      }
                    ],
                    "alias": null,
                    "args": null,
                    "with_hints": [],
                    "version": null,
                    "with_ordinality": false,
                    "partitions": []
                  }
                },
                "joins": []
              }
            ],
            "lateral_views": [],
            "prewhere": null,
            "selection": null,
            "group_by": {
              "Expressions": [
                [],
                []
              ]
            },
            "cluster_by": [],
            "distribute_by": [],
            "sort_by": [],
            "having": null,
            "named_window": [],
            "qualify": null,
            "window_before_qualify": false,
            "value_table_mode": null,
            "connect_by": null
          }
        },
        "order_by": null,
        "limit": null,
        "limit_by": [],
        "offset": null,
        "fetch": null,
        "locks": [],
        "for_clause": null,
        "settings": null,
        "format_clause": null
      }
    }
  }
]
```

## POST PromQL queries

### The API returns Prometheus query result format

GreptimeDB compatible with Prometheus query language (PromQL) and can be used to query data in GreptimeDB.
For all the compatible APIs, please refer to the [Prometheus Query Language](/user-guide/query-data/promql#prometheus-http-api) documentation.

### The API returns GreptimeDB JSON format

GreptimeDB also exposes an custom HTTP API for querying with PromQL, and returning
GreptimeDB's data frame output. You can find it on `/promql` path under the
current stable API version `/v1`.
The return value of this API is in GreptimeDB's JSON format, not Prometheus's format.
For example:

```shell
curl -X GET \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -G \
  --data-urlencode 'db=public' \
  --data-urlencode 'query=avg(system_metrics{idc="idc_a"})' \
  --data-urlencode 'start=1667446797' \
  --data-urlencode 'end=1667446799' \
  --data-urlencode 'step=1s' \
  http://localhost:4000/v1/promql
```

The input parameters are similar to the [`range_query`](https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries) in Prometheus' HTTP API:

- `db=<database name>`: Required when using GreptimeDB with authorization, otherwise can be omitted if you are using the default `public` database.
- `query=<string>`: Required. Prometheus expression query string.
- `start=<rfc3339 | unix_timestamp>`: Required. The start timestamp, which is inclusive. It is used to set the range of time in `TIME INDEX` column.
- `end=<rfc3339 | unix_timestamp>`: Required. The end timestamp, which is inclusive. It is used to set the range of time in `TIME INDEX` column.
- `step=<duration | float>`: Required. Query resolution step width in duration format or float number of seconds.

Here are some examples for each type of parameter:

- rfc3339
  - `2015-07-01T20:11:00Z` (default to seconds resolution)
  - `2015-07-01T20:11:00.781Z` (with milliseconds resolution)
  - `2015-07-02T04:11:00+08:00` (with timezone offset)
- unix timestamp
  - `1435781460` (default to seconds resolution)
  - `1435781460.781` (with milliseconds resolution)
- duration
  - `1h` (1 hour)
  - `5d1m` (5 days and 1 minute)
  - `2` (2 seconds)
  - `2s` (also 2 seconds)

The result format is the same as `/sql` interface described in [Post SQL statements](#post-sql-statements) section.

```json
{
  "code": 0,
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "ts",
              "data_type": "TimestampMillisecond"
            },
            {
              "name": "AVG(system_metrics.cpu_util)",
              "data_type": "Float64"
            },
            {
              "name": "AVG(system_metrics.memory_util)",
              "data_type": "Float64"
            },
            {
              "name": "AVG(system_metrics.disk_util)",
              "data_type": "Float64"
            }
          ]
        },
        "rows": [
          [
            1667446798000,
            80.1,
            70.3,
            90
          ],
          [
            1667446799000,
            80.1,
            70.3,
            90
          ]
        ]
      }
    }
  ],
  "execution_time_ms": 5
}
```

## Post Influxdb line protocol data

<Tabs>

<TabItem value="InfluxDB line protocol V2" label="InfluxDB line protocol V2">

```shell
curl -X POST \
  -H 'Authorization: token {{username:password}}' \
  -d '{{Influxdb-line-protocol-data}}' \
  http://{{API-host}}/v1/influxdb/api/v2/write?precision={{time-precision}}
```

</TabItem>

<TabItem value="InfluxDB line protocol V1" label="InfluxDB line protocol V1">

```shell
curl -X POST \
  -d '{{Influxdb-line-protocol-data}}' \
  http://{{API-host}}/v1/influxdb/api/v1/write?u={{username}}&p={{password}}&precision={{time-precision}}
```

</TabItem>
</Tabs>

### Headers

- `Authorization`: **Unlike other APIs**, the InfluxDB line protocol APIs use the InfluxDB authentication format. For V2, it is `token {{username:password}}`.

### Query string parameters

- `u`: The username. Optional. It is the authentication username for V1.
- `p`: The password. Optional. It is the authentication password for V1.
- `db`: The database name. Optional. The default value is `public`.
- `precision`: Defines the precision of the timestamp provided in the request body. Please refer to [InfluxDB Line Protocol](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md) in the user guide.

### Body

The InfluxDB line protocol data points. Please refer to the [InfluxDB Line Protocol](https://docs.influxdata.com/influxdb/v1/write_protocols/line_protocol_tutorial/#syntax) document.

### Examples

Please refer to [InfluxDB Line Protocol](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md) in the user guide.

## API for managing Pipelines

When writing logs to GreptimeDB,
you can use HTTP APIs to manage the pipelines.
For detailed information,
please refer to the [Manage Pipelines](/user-guide/logs/manage-pipelines.md) documentation.

