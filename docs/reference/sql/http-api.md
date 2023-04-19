# HTTP API

```shell
curl -X POST \
  -H 'Authorization: Basic {{authentication}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql={{SQL-statement}}' \
http://{{API-host}}/v1/sql?db={{db-name}}
```

#### Method

Use POST method to submit the SQL statement to server.

#### Header

* `Authorization`: The credential. Required if starting GreptimeDB with authorized users. Please refer to [authentication](/user-guide/clients.md#HTTP-API).
* `Content-Type`: `application/x-www-form-urlencoded`.

#### Query params

* `db`: The database name. Required if starting GreptimeDB with authorized users, otherwise can be omitted if you are using the default `public` database.

#### Body

* `sql`: The SQL statement. Required.

#### Response

The response is a JSON object.

* `code`: the result integer code. Zero means success, otherwise failure.
* `output`: the SQL executed result, including schema and rows.

#### Example

Please refer to [Table Management](/user-guide/table-management.md#http-api), [Write Data](/user-guide/write-data.md#sql) and [Query Data](/user-guide/query-data.md#sql) in user guide.
