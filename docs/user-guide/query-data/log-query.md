---
keywords: [log query, logs, search, experimental, HTTP endpoint]
description: Documentation for GreptimeDB's experimental log query endpoint, which provides a dedicated HTTP interface for searching and processing log data.
---

# Log Query (Experimental)

:::warning
The log query endpoint feature is currently experimental and may change in future releases.
:::

GreptimeDB provides a dedicated HTTP endpoint for filtering and processing log data. SQL remains available for the same tables.

## Endpoint

```http
POST /v1/logs
```

## Headers
- [Authorization](/user-guide/protocols/http.md#authentication)
- `Content-Type`: `application/json`

## Request Format

The request body is a JSON object. Because this API is experimental, its JSON schema can change between releases. The Nightly schema is defined by [`LogQuery`](https://github.com/GreptimeTeam/greptimedb/blob/main/src/log-query/src/log_query.rs).

## Response

This endpoint has the same response format as the SQL query endpoint. Please refer to the [SQL query response](/user-guide/protocols/http/#response) for more details.

## Limitations

- If `limit.fetch` is omitted, the endpoint returns at most 1000 entries by default. An explicit `fetch` value overrides this default.
- Requires a time index column. String search filters apply to string/text expressions, while typed comparison filters can be applied to compatible numeric, boolean, and string expressions.

## Example

The following example uses the current Nightly request schema:

```shell
curl -X "POST" "http://localhost:4000/v1/logs" \
    -H "Authorization: Basic <base64-encoded-credentials>" \
    -H "Content-Type: application/json" \
    -d $'
    {
        "table": {
            "catalog_name": "greptime",
            "schema_name": "public",
            "table_name": "my_logs"
        },
        "time_filter": {
            "start": "2025-01-23"
        },
        "limit": {
            "fetch": 1
        },
        "columns": [
            "message"
        ],
        "filters": {
            "Single": {
                "expr": {
                    "NamedIdent": "message"
                },
                "filters": [
                    {
                        "Contains": "production"
                    }
                ]
            }
        },
        "context": "None",
        "exprs": []
    }
'
```

In this query, we are searching for log entries in the `greptime.public.my_logs` table that contain the word `production` in `message` field. We also specify the time filter to fetch logs in `2025-01-23`, and limit the result to 1 entry.

The response will be similar to the following:

```json
{
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "message",
              "data_type": "String"
            }
          ]
        },
        "rows": [
          [
            "Everything is in production"
          ]
        ],
        "total_rows": 1
      }
    }
  ],
  "execution_time_ms": 30
}
```
