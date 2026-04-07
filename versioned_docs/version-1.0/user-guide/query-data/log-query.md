---
keywords: [log query, logs, search, experimental, HTTP endpoint]
description: Documentation for GreptimeDB's experimental log query endpoint, which provides a dedicated HTTP interface for searching and processing log data.
---

# Log Query (Experimental)

:::warning
The log query endpoint feature is currently experimental and may change in future releases.
:::

GreptimeDB provides a dedicated HTTP endpoint to query log data. This feature allows you to search and process log entries using a simple query interface. This is an add-on feature to existing GreptimeDB capabilities like SQL queries and Flow computations. You can still use your existing tools and workflows to query log data like before.

## Endpoint

```http
POST /v1/logs
```

## Headers
- [Authorization](/user-guide/protocols/http.md#authentication)
- `Content-Type`: `application/json`

## Request Format

The request body should be a JSON object (this is subject to change in patch version within the experimental phase). For the latest request format, please refer to the [implementation](https://github.com/GreptimeTeam/greptimedb/blob/main/src/log-query/src/log_query.rs):

## Response

This endpoint has the same response format as the SQL query endpoint. Please refer to the [SQL query response](/user-guide/protocols/http/#response) for more details.

## Limitations

- Maximum result limit: 1000 entries
- Only supports tables with timestamp and string columns

## Example

The following example demonstrates how to query log data using the log query endpoint (notice that in this experimental phase the following example might be outdated).

```shell
curl -X "POST" "http://localhost:4000/v1/logs" \
    -H "Authorization: Basic {{authentication}}" \
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
        "filters": [
            {
                "column_name": "message",
                "filters": [
                    {
                       "Contains": "production"
                    }
                ]
            }
        ],
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
