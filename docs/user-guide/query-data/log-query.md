---
keywords: [log query, logs, search, experimental, HTTP endpoint]
description: Documentation for GreptimeDB's experimental log query endpoint, which provides a dedicated HTTP interface for searching and processing log data.
---

# Log Query (Experimental)

::: warning
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
