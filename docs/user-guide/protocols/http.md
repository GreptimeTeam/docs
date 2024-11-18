# HTTP API

GreptimeDB provides HTTP APIs for interacting with the database.

## Headers

### Authentication

GreptimeDB supports the built-in `Basic` authentication scheme in the HTTP API. To set up authentication, follow these steps:

1. Encode your username and password using the `<username>:<password>` format and the `Base64` algorithm.
2. Attach your encoded credentials to the HTTP request header using the `Authorization: Basic <base64-encoded-credentials>` format.

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

### Time zone

GreptimeDB supports the `X-Greptime-Timezone` header in HTTP requests.
It is used to specify the timezone for the current SQL query.

For example, the following request uses the time zone `+1:00` for the query:

```bash
curl -X POST \
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

### TIMEOUT

GreptimeDB supports the `X-Greptime-Timeout` header in HTTP requests.
It is used to specify the timeout for the current SQL query.

For example, the following request set `120s` timeout for the query:

```bash
curl -X POST \
-H 'X-Greptime-Timeout: 120s' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=show tables' \
http://localhost:4000/v1/sql
```

## POST SQL statements

You can use the GreptimeDB HTTP API to post SQL statements and interact with the database.
For example, to insert data into the `monitor` table, use the following command:

```shell
curl -X POST \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=INSERT INTO monitor VALUES ("127.0.0.1", 1667446797450, 0.1, 0.4), ("127.0.0.2", 1667446798450, 0.2, 0.3), ("127.0.0.1", 1667446798450, 0.5, 0.2)' \
  http://localhost:4000/v1/sql?db=public
```

- The API endpoint is `/v1/sql`.
- The authentication header is optional. For more information, refer to the [Authentication](#authentication) section.
- The SQL statement should be included in the body of the request as `sql` parameter.
- The `db` parameter in the URL is optional and specifies the database to use. The default value is `public`.

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

### Alternative formats

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

Call the SQL API with `table` format as an example:

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

## POST PromQL Queries

GreptimeDB also exposes an custom HTTP API for querying with PromQL, and returning
GreptimeDB's data frame output. You can find it on `/promql` path under the
current stable API version `/v1`. For example:

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
