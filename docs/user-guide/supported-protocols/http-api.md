# HTTP API

## Introduction

The GreptimeDB HTTP API is based on standard HTTP protocol and is easy to work with off-the-shelf HTTP clients.

The GreptimeDB dashboard is a web console based on HTTP API.

Available API:

- /sql
- /scripts and /run-script
- /opentsdb to support OpenTSDB protocol
- /influxdb to support InfluxDB line protocol
- /prometheus to support Prometheus Endpoints

All these APIs are under the parent resource /v1,  which specifies the current HTTP API version.

## `/sql`

`/sql` executes SQL statements and returns results.

For more information about SQL, please refer to the SQL reference document.

For example:

``` shell
curl -G  http://localhost:4000/v1/sql  --data-urlencode "sql=select * from numbers limit 5"
```

`/sql` also supports POST method:

``` shell
curl  -XPOST -G  http://localhost:4000/v1/sql  --data-urlencode "sql=select * from numbers limit 5"
```

The returned JSON result is shown  below:

``` json
{
  "code": 0,
  "output": [{
    "records": {
      "schema": {
        "column_schemas": [
          {
            "name": "number",
            "data_type": "UInt32"
          }
        ]
      },
      "rows": [
        [
          0
        ],
        [
          1
        ],
        [
          2
        ],
        [
          3
        ],
        [
          4
        ]
      ]
    }
  }],
  "execution_time_ms": 2
}
```

### Parameters and Result

`/sql` only accepts one parameter:

- sql: the SQL statement.

The API Result contains:

- code: the result integer code. Zero means success, otherwise failure.
- output: the SQL executed result, including schema and rows.

### Examples

Create table via SQL:

```shell
curl  -v -XPOST -G  http://localhost:4000/v1/sql  --data-urlencode "sql=CREATE TABLE HTTP_API_TEST(name STRING, value DOUBLE, ts TIMESTAMP default CURRENT_TIMESTAMP, PRIMARY KEY(name), TIME INDEX(ts))"
```

```json
{"code":0,"output":[{"affectedrows":1}],"execution_time_ms":10}
```

Insert data:

```shell
 curl  -v -XPOST -G http://localhost:4000/v1/sql  --data-urlencode "sql=INSERT INTO HTTP_API_TEST(name, value) VALUES('hello', 1), ('world', 2)"
```

```json
{"code":0,"output":[{"affectedrows":2}],"execution_time_ms":6}
```

Query data:

```shell
 curl -v -XGET -G http://localhost:4000/v1/sql  --data-urlencode "sql=SELECT * from HTTP_API_TEST"
```

```
{
  "code": 0,
  "output": [{
    "records": {
      "schema": {
        "column_schemas": [
          {
            "name": "name",
            "data_type": "String"
          },
          {
            "name": "value",
            "data_type": "Float64"
          },
          {
            "name": "ts",
            "data_type": "Timestamp"
          }
        ]
      },
      "rows": [
        [
          "hello",
          1,
          1667802991224
        ],
        [
          "world",
          2,
          1667802991224
        ]
      ]
    }
  }],
  "execution_time_ms": 7
}
```

## `/scripts` and `/run-script`

`/scripts` submits a Python script into GreptimeDB.

Save a python script such as `test.py`:

```python
@coprocessor(args = ["number"],
             returns = [ "number" ],
             sql = "select number from numbers limit 5")
def square(number):
    return number * 2
```

Submits it to database:

```
curl --data-binary @test.py -XPOST \
      "http://localhost:4000/v1/scripts?name=square"
```

```
{"code":0}
```

The python script is inserted into the `scripts` table and compiled automatically:

```shell
curl -G  http://localhost:4000/v1/sql  --data-urlencode "sql=select * from scripts"
```

```json
{
  "code": 0,
  "output": [{
    "records": {
      "schema": {
        "column_schemas": [
          {
            "name": "name",
            "data_type": "String"
          },
          {
            "name": "script",
            "data_type": "String"
          },
          {
            "name": "engine",
            "data_type": "String"
          },
          {
            "name": "timestamp",
            "data_type": "Timestamp"
          },
          {
            "name": "gmt_created",
            "data_type": "Timestamp"
          },
          {
            "name": "gmt_modified",
            "data_type": "Timestamp"
          }
        ]
      },
      "rows": [
        [
          "square",
          "@coprocessor(args = [\"number\"],\n             returns = [ \"number\" ],\n             sql = \"select number from numbers\")\ndef square(number):\n    return number * 2\n",
          "python",
          0,
          1667803482357,
          1667803482357
        ]
      ]
    }
  }],
  "execution_time_ms": 4
}
```

You can also execute the script via `/run-script`:

```shell
curl -XPOST -G "http://localhost:4000/v1/run-script?name=square"
```

```json
{
  "code": 0,
  "output": [{
    "records": {
      "schema": {
        "column_schemas": [
          {
            "name": "number",
            "data_type": "Float64"
          }
        ]
      },
      "rows": [
        [
          0
        ],
        [
          2
        ],
        [
          4
        ],
        [
          6
        ],
        [
          8
        ]
      ]
    }
  }],
  "execution_time_ms": 8
}
```

### Parameters and Result for Python scripts

`/scripts` accepts a query parameter name for naming the script and processes the POST method body as the script file content.

`/run-script` runs the compiled script and returns the output which is the same as the query result in /sql API.

## OpenAPI docs

An [OAS](https://swagger.io/specification/) compatible OpenAPI specification is
available at `http://localhost:4000/v1/private/api.json`. We also provided Redoc
UI at `http://localhost:4000/v1/private/docs` for convenience.

## Result codes table

| Code | Description                                         |
|:-----|:----------------------------------------------------|
| 0    | success                                             |
| 1000 | Unknown error                                       |
| 1001 | Unsupported operation                               |
| 1002 | Unexpected error, maybe there is a BUG              |
| 1003 | Internal error                                      |
| 1004 | Invalid arguments                                   |
| 2000 | SQL syntax error                                    |
| 3000 | Fail to create a plan for the query                 |
| 3001 | Fail to execute a query plan                        |
| 4000 | Table already exists                                |
| 4001 | Table not found                                     |
| 4002 | Column not found                                    |
| 4003 | Column already exists                               |
| 5000 | Storage is temporarily unable to handle the request |
| 6000 | Runtime resources exhausted                         |
