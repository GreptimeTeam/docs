# HTTP API

## Authentication

GreptimeDB supports the built-in `Basic` authentication scheme in HTTP API for **SQL** language and **OpenTSDB** protocol.
To set up authentication, do the following:

1. Encode your username and password using `Base64` algorithm.
2. Attach your encoded credentials to the HTTP request header using the format `Authorization: Basic <base64-encoded-credentials>`.

Here's an example:

```shell
curl -X POST \
-H 'Authorization: Basic Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=show tables' \
http://localhost:4000/v1/sql?db=public
```

```json
{
  "code": 0,
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "Tables",
              "data_type": "String"
            }
          ]
        },
        "rows": [
          ["numbers"]
        ]
      }
    }
  ],
  "execution_time_ms": 1
}
```

* `Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=` is `greptime_user:greptime_pwd` encoded using Base64. Remember to replace it with your own configured username and password and encode them using Base64.
* The `public` in the URL is the name of your database, which is required with authorization.

::: tip NOTE
InfluxDB uses its own authentication format, see [InfluxDB](./influxdb-line.md) for details.
:::

## Time zone

GreptimeDB supports the `X-Greptime-Timezone` header in HTTP requests.
It is used to specify the timezone for the current SQL query.

For example, the following request uses the time zone `+1:00` for the query:

```bash
curl -X POST \
-H 'X-Greptime-Timezone: +1:00' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=SHOW VARIABLES time_zone;' \
http://localhost:4000/v1/sql?db=public
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

For information on how the time zone affects data inserts and queries, please refer to the SQL documents in the [write data](../write-data/sql.md#time-zone) and [query data](../query-data/sql.md#time-zone) sections.

## Write data

* [SQL](../write-data/sql.md)
* [OpenTSDB](../write-data/opentsdb.md)

## Query data

* [SQL](../query-data/sql.md)
