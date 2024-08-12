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

:::tip NOTE
InfluxDB uses its own authentication format, see [InfluxDB](./influxdb-line.md) for details.
:::

## Write data

* [SQL](../write-data/sql.md)
* [OpenTSDB](../write-data/opentsdb.md)

## Query data

* [SQL](../query-data/sql.md)
