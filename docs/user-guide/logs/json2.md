---
keywords: [JSON2, JSON, logs, structured logs, type hints, json_get]
description: Learn how to use the JSON2 type in GreptimeDB, including table creation, type hints, JSON field access, and current limitations.
---

# JSON2 Type

JSON2 is a JSON type in GreptimeDB designed for logs and semi-structured data.
It stores fields inside JSON in a structured, columnar form so that frequently
used fields can be read, filtered, and aggregated efficiently like regular 
columns, while still preserving the flexibility of JSON for dynamic schemas.

:::note
JSON2 is currently in Beta, and some capabilities are still being improved.
:::

## Quick Start

The following example creates an API access log table, inserts a few request
logs, and queries fields from JSON2. Fixed fields are stored in regular columns,
while fields in `attrs` use JSON2 because their structure may vary but they are
still queried frequently.

### Create a table

When creating a table, you can declare a JSON2 column with the `JSON2` type.
Currently, JSON2 can only be used in append-only tables, so you must set 
`'append_mode' = 'true'` when creating the table.

```sql
CREATE TABLE application_logs (
    ts TIMESTAMP TIME INDEX,
    app_name STRING,
    log_level STRING,
    `message` STRING,
    attrs JSON2,
) WITH (
    'append_mode' = 'true'
);
```

### Insert JSON data

When writing to a JSON2 column, you can insert a JSON object. The following data
includes one successful request, one slow request, and one failed request:

```sql
INSERT INTO application_logs
VALUES
    (
        1,
        'checkout',
        'INFO',
        'request completed',
        '{"trace_id":"8f3a1c","user":{"id":1001,"name":"Alice"},"http":{"method":"POST","path":"/v1/orders","status":200},"latency_ms":42.8}'
    ),
    (
        2,
        'checkout',
        'WARN',
        'slow request',
        '{"trace_id":"8f3a1d","user":{"id":1002,"name":"Bob"},"http":{"method":"POST","path":"/v1/orders","status":200},"latency_ms":386.4}'
    ),
    (
        3,
        'checkout',
        'ERROR',
        'request failed',
        '{"trace_id":"8f3a1e","user":{"id":1003},"http":{"method":"POST","path":"/v1/orders","status":500},"latency_ms":71.2,"error":true}'
    );
```

### Query JSON fields

You can read fields from JSON2 directly with dot paths:

```sql
SELECT
    ts,
    app_name,
    attrs.trace_id AS trace_id,
    attrs.user.name AS user_name,
    attrs.http.status AS status,
    attrs.latency_ms AS latency_ms,
    attrs.error AS error
FROM application_logs
ORDER BY ts;
```

The query result is:

| ts | app_name | trace_id | user_name | status | latency_ms | error |
| --- | --- | --- | --- | --- | --- | --- |
| 1970-01-01 00:00:00.001 | checkout | 8f3a1c | Alice | 200 | 42.8 | NULL |
| 1970-01-01 00:00:00.002 | checkout | 8f3a1d | Bob | 200 | 386.4 | NULL |
| 1970-01-01 00:00:00.003 | checkout | 8f3a1e | NULL | 500 | 71.2 | true |

You can also use JSON functions and cast the return type explicitly:

```sql
SELECT
    json_get(attrs, 'http.path')::STRING AS path,
    json_get(attrs, 'http.status')::INT8 AS status,
    json_get(attrs, 'latency_ms')::DOUBLE AS latency_ms,
    json_get(attrs, 'error')::BOOLEAN AS error
FROM application_logs
WHERE json_get(attrs, 'http.status')::INT8 >= 500
    OR json_get(attrs, 'latency_ms')::DOUBLE > 300
ORDER BY ts;
```

The query result is:

| path | status | latency_ms | error |
| --- | --- | --- | --- |
| /v1/orders | 200 | 386.4 | NULL |
| /v1/orders | 500 | 71.2 | 1 |

You can also aggregate fields, for example to count requests, errors, and average
latency for each API path:

```sql
SELECT
    json_get(attrs, 'http.path')::STRING AS path,
    COUNT(*) AS requests,
    SUM(CASE WHEN json_get(attrs, 'error')::BOOLEAN THEN 1 ELSE 0 END) AS errors,
    ROUND(AVG(json_get(attrs, 'latency_ms')::DOUBLE), 1) AS avg_latency_ms
FROM application_logs
GROUP BY json_get(attrs, 'http.path')::STRING;
```

The query result is:

| path | requests | errors | avg_latency_ms |
| --- | --- | --- | --- |
| /v1/orders | 3 | 1 | 166.8 |

## Syntax

### JSON Field Type hints

JSON2 supports type hints, which let you declare concrete data types for 
subpaths. Once declared, these subpaths are stored using the specified types,
which provides query performance close to regular columns and enforces type
validation during writes.

The basic syntax for a type hint is:

```sql
json_column JSON2 (
    path.to.field DATA_TYPE [NULL | NOT NULL] [DEFAULT literal]
)
```

Type hint paths use dot notation. For example, `user.id` refers to the following
JSON path: `{"user":{"id":...}}`.

If a JSON key itself contains a dot, wrap that path segment in double quotes.
For example, `"service.name"` means a key named `service.name` in the root object,
not a nested path `service.name`.

Type hints currently support the following data types:

- `STRING`
- `BIGINT`
- `BIGINT UNSIGNED`
- `DOUBLE`
- `BOOLEAN`

Type hints allow `NULL` by default. If you specify `NOT NULL`, that path must
exist in the written JSON.

As shown in the quick start example above, type hints can be declared directly
in the `CREATE TABLE` statement. For example, you can define the `attrs` JSON2
column with type hints for commonly queried subpaths:

```sql
CREATE TABLE application_logs (
    ts TIMESTAMP TIME INDEX,
    app_name STRING,
    log_level STRING,
    `message` STRING,
    attrs JSON2 (
        trace_id STRING,
        user.id BIGINT,
        user.name STRING DEFAULT 'anonymous',
        http.method STRING,
        http.path STRING,
        http.status BIGINT,
        latency_ms DOUBLE,
        error BOOLEAN DEFAULT false
    )
) WITH (
    'append_mode' = 'true'
);
```

### `json_get` UDF

`json_get` reads a nested field from JSON2 by path. It returns a string by
default. If you want to specify the return type directly, add a cast after the
function.

The basic syntax of `json_get` is:

```sql
json_get(json_column, 'path.to.field')::TYPE
```

`json_get` can be used in `SELECT`, `WHERE`, `GROUP BY`, and other SQL clauses
that accept expressions. For example:

```sql
SELECT
    json_get(attrs, 'trace_id')::STRING AS trace_id,
    json_get(attrs, 'http.status')::BIGINT AS status,
    json_get(attrs, 'latency_ms')::DOUBLE AS latency_ms
FROM application_logs
WHERE json_get(attrs, 'http.status')::BIGINT >= 500;
```

### Dot syntax

You can read JSON2 subpaths directly with dot syntax:

```sql
json_column.path.to.field
```

Dot syntax can be used in `SELECT`, `WHERE`, `GROUP BY`, and other SQL clauses
that accept expressions. For example:

```sql
SELECT
    attrs.trace_id,
    attrs.http.status,
    attrs.latency_ms
FROM application_logs
WHERE attrs.http.status >= 500;
```

## Roadmap

JSON2 is currently in Beta and still has the following limitations. Future
releases will continue to improve these capabilities:

- Support JSON2 in non-append-only tables.
- Support writing non-object or empty-object JSON root values such as arrays,
  strings, numbers, booleans, `null`, and `{}`.
- Support querying the JSON2 root column itself. For now, query specific
  subpaths such as `attrs.http.status` or `json_get(attrs, 'http.status')`.
- Support subscript access to elements inside JSON arrays. For now, you can
  query `attrs.items`, but not `attrs.items[0]` or `json_get(attrs, 'items[0]')`.
- Support functions such as `json_get_string`, `json_get_int`,
  `json_get_float`, and `json_get_bool` for JSON2.
- Extend supported type hint data types, such as time-related types like
  `TIMESTAMP`.
- Support index options such as `INVERTED INDEX` and `SKIPPING INDEX` for type
  hints.
- Support writing JSON2 through OTLP and other ingestion paths.
