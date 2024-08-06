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

## POST SQL Statements

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
- The SQL statement should be included in the body of the request.
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

For more information about making SQL requests using the HTTP API, please refer to the [API documentation](/reference/sql/http-api.md).

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

For information on how the time zone affects data inserts and queries, please refer to the SQL documents in the [Ingest Data](../ingest-data/for-iot/sql.md#time-zone) and [Query Data](../query-data/sql.md#time-zone) sections.

## Write data

* [SQL](../ingest-data/for-iot/sql.md)
* [OpenTSDB](../ingest-data/for-iot/opentsdb.md)

## Query data

* [SQL](../query-data/sql.md)
