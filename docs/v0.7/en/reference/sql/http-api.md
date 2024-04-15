# HTTP API

To submit a SQL query to the GreptimeDB server via HTTP API, use the following format:

```shell
curl -X POST \
  -H 'Authorization: Basic {{authentication}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql={{SQL-statement}}' \
http://{{API-host}}/v1/sql?db={{db-name}}
```

## Method

Use the POST method to submit the SQL statement to the server.

## Header

- `Authorization`: The credential. Required if you are using GreptimeDB with authentication enabled. Please refer to [authentication](/user-guide/clients/http-api.md#authentication).
- `Content-Type`: `application/x-www-form-urlencoded`.
- `X-Greptime-Timezone`: The time zone for the current SQL query. Optional. Please refer to [time zone](/user-guide/clients/http-api.md#authentication#time-zone).

## Query params

- `db`: The database name. Required if you are using GreptimeDB with authentication enabled. Otherwise, it can be omitted if you are using the default `public` database.

## Body

- `sql`: The SQL statement. Required.

## Response

The response is a JSON object.

- `code`: the result integer code. Zero means success, otherwise failure.
- `output`: the SQL executed result, including schema and rows.

## Example

Please refer to [table management](/user-guide/table-management.md#http-api), [write data](/user-guide/write-data/sql.md#http-api) and [query data](/user-guide/query-data/sql.md#http-api) in user guide.
