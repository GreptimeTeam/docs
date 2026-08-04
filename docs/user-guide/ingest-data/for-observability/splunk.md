---
keywords: [Splunk, HEC, HTTP Event Collector, log storage, API, data model, vector, opentelemetry]
description: Use the Splunk HTTP Event Collector (HEC) protocol to ingest log data into GreptimeDB.
---

# Splunk

## Overview

GreptimeDB implements a subset of the [Splunk HTTP Event Collector (HEC)](https://docs.splunk.com/Documentation/Splunk/latest/Data/UsetheHTTPEventCollector) protocol, so shippers that already speak HEC — Vector, the OpenTelemetry Collector, Fluent Bit — can write to GreptimeDB by changing the endpoint URL and the token.

Two ingestion endpoints are available:

- `/services/collector/event` takes structured JSON events.
- `/services/collector/raw` takes plain text and stores it verbatim.

Splunk's `index` maps to a GreptimeDB table. `host`, `source`, `sourcetype` and the keys under `fields` become tag columns, which GreptimeDB adds to the table's primary key.

Indexer acknowledgment (`/services/collector/ack`) is not implemented. The `channel` parameter is accepted and ignored.

## HTTP API

The base path is `/v1/splunk`; clients append the collector path themselves. Point your shipper at `http://${db_host}:${db_http_port}/v1/splunk`, for example `http://localhost:4000/v1/splunk`.

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/v1/splunk/services/collector/event` | `POST` | Ingest JSON events. Aliases: `/services/collector`, `/services/collector/event/1.0` |
| `/v1/splunk/services/collector/raw` | `POST` | Ingest plain text. Alias: `/services/collector/raw/1.0` |
| `/v1/splunk/services/collector/health` | `GET` | Health probe. Alias: `/services/collector/health/1.0` |

Request bodies may be gzip-compressed (`Content-Encoding: gzip`).

### Authentication

Authentication only applies when the server runs with a [user provider](/user-guide/deployments-administration/authentication/overview.md). Without one, requests are accepted unauthenticated.

HEC clients send `Authorization: Splunk <token>`. GreptimeDB reads the token as `username:password`:

```
Authorization: Splunk greptime_user:greptime_pwd
```

`Authorization: Basic <base64>` is also accepted.

:::warning
Most Splunk clients default to a single opaque token with no colon in it. GreptimeDB rejects such a token with HEC code `4`. Configure the client's token as `<username>:<password>`.
:::

The health endpoint is public and never requires a token.

## Ingest JSON events

`POST /v1/splunk/services/collector/event`

The body is one or more HEC event objects. They may be concatenated with any separator or none at all, or wrapped in a top-level JSON array — GreptimeDB accepts both batch forms.

### Field mapping

| HEC field | Maps to |
| --- | --- |
| `time` | The `greptime_timestamp` time index |
| `index` | The table name |
| `host`, `source`, `sourcetype` | Tag columns |
| keys under `fields` | Tag columns, one per key |
| `event` and any remaining keys | Data columns |

`time` is epoch seconds and may be fractional. Values at or above `1e12` are read as milliseconds instead. If `time` is absent or `null`, the server's ingest time is used.

:::warning
A `time` that is present but unparsable is an error, not a fallback — the request fails with HEC code `6`. The same applies to `?time=` on the raw endpoint.
:::

### Table routing

The table is resolved in this order:

1. The event's `index`, coerced into a valid table name. Characters outside `[A-Za-z0-9_:\-.@#]` become `_`, and an underscore is prepended when the first character is not valid. For example `my index/2026` becomes `my_index_2026`.
2. The `table` query parameter.
3. The default table `splunk_logs`.

### Query parameters

| Parameter | Description |
| --- | --- |
| `db` | Target database. Defaults to `public`. |
| `table` | Fallback table name, used when the event carries no `index`. |
| `pipeline_name` | Pipeline to run. Defaults to the built-in `greptime_identity`. |
| `version` | Pipeline version. Defaults to the latest version. |

:::tip NOTE
Only these parameters are honored on this endpoint. Other log-ingestion parameters such as `msg_field`, `custom_time_index`, and `ignore_errors` have no effect here.
:::

### Example

```bash
curl -X POST "http://localhost:4000/v1/splunk/services/collector/event" \
  -H "Authorization: Splunk greptime_user:greptime_pwd" \
  -H "Content-Type: application/json" \
  -d '{"time":1785312000,"host":"web-01","source":"/var/log/nginx/access.log","sourcetype":"nginx:access","index":"splunk_events","fields":{"env":"prod","region":"us-west"},"event":{"status":200,"path":"/api/v1/health","latency_ms":12}}
{"time":1785312001,"host":"web-02","source":"/var/log/nginx/access.log","sourcetype":"nginx:access","index":"splunk_events","fields":{"env":"prod","region":"eu-central"},"event":{"status":503,"path":"/api/v1/orders","latency_ms":841}}'
```

A successful write returns:

```json
{"code":0,"text":"Success"}
```

The table `splunk_events` is created on the first write:

```sql
DESC TABLE splunk_events;
```

```
+--------------------+---------------------+------+------+---------+---------------+
| Column             | Type                | Key  | Null | Default | Semantic Type |
+--------------------+---------------------+------+------+---------+---------------+
| greptime_timestamp | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| env                | String              | PRI  | YES  |         | TAG           |
| event.latency_ms   | Int64               |      | YES  |         | FIELD         |
| event.path         | String              |      | YES  |         | FIELD         |
| event.status       | Int64               |      | YES  |         | FIELD         |
| host               | String              | PRI  | YES  |         | TAG           |
| region             | String              | PRI  | YES  |         | TAG           |
| source             | String              | PRI  | YES  |         | TAG           |
| sourcetype         | String              | PRI  | YES  |         | TAG           |
+--------------------+---------------------+------+------+---------+---------------+
```

The default pipeline flattens the nested `event` object, which is why the data columns are named `event.status`, `event.path`, and `event.latency_ms`.

```sql
SELECT * FROM splunk_events ORDER BY greptime_timestamp;
```

```
+---------------------+------+------------------+----------------+--------------+--------+------------+---------------------------+--------------+
| greptime_timestamp  | env  | event.latency_ms | event.path     | event.status | host   | region     | source                    | sourcetype   |
+---------------------+------+------------------+----------------+--------------+--------+------------+---------------------------+--------------+
| 2026-07-29 08:00:00 | prod |               12 | /api/v1/health |          200 | web-01 | us-west    | /var/log/nginx/access.log | nginx:access |
| 2026-07-29 08:00:01 | prod |              841 | /api/v1/orders |          503 | web-02 | eu-central | /var/log/nginx/access.log | nginx:access |
+---------------------+------+------------------+----------------+--------------+--------+------------+---------------------------+--------------+
```

New keys appearing under `fields` on a later write are added as tag columns and joined to the primary key automatically.

## Ingest raw text

`POST /v1/splunk/services/collector/raw`

The body is stored verbatim in a `message` column. GreptimeDB does not parse its content — use a [custom pipeline](#using-a-pipeline) reading `message` if you need structure.

:::warning
By default the **entire body is one event**, so multi-line payloads such as stack traces stay intact. To split the body into several events, pass `linebreaker` with the delimiter you want, percent-encoded — `?linebreaker=%0A` splits on newlines. Whitespace-only segments are dropped.
:::

Metadata is request-level on this endpoint: it comes from query parameters and applies to every event in the request.

### Query parameters

| Parameter | Description |
| --- | --- |
| `host`, `source`, `sourcetype` | Tag columns applied to every event in the request. |
| `index` | Table name, sanitized the same way as the `index` field on `/event`. |
| `time` | Epoch timestamp applied to every event. Defaults to ingest time. |
| `table` | Fallback table name when `index` is absent. |
| `linebreaker` | Percent-encoded literal delimiter used to split the body. Without it, the whole body is one event. |
| `pipeline_name` | Pipeline to run. Defaults to `greptime_identity`. |
| `version` | Pipeline version. |
| `db` | Target database. Defaults to `public`. |
| `channel` | Accepted and ignored. Also accepted as the `x-splunk-request-channel` header. |

### Example

```bash
printf 'line one\nline two\nline three\n' | curl -X POST \
  "http://localhost:4000/v1/splunk/services/collector/raw?index=splunk_raw&host=web-01&source=app.log&sourcetype=applog&linebreaker=%0A" \
  -H "Authorization: Splunk greptime_user:greptime_pwd" \
  --data-binary @-
```

This writes three rows. Dropping `linebreaker` from the same request writes one row containing all three lines.

```sql
SHOW CREATE TABLE splunk_raw;
```

```sql
CREATE TABLE IF NOT EXISTS `splunk_raw` (
  `greptime_timestamp` TIMESTAMP(9) NOT NULL,
  `host` STRING NULL,
  `message` STRING NULL,
  `source` STRING NULL,
  `sourcetype` STRING NULL,
  TIME INDEX (`greptime_timestamp`),
  PRIMARY KEY (`host`, `source`, `sourcetype`)
)

ENGINE=mito
WITH(
  'comment' = 'Created on insertion',
  append_mode = 'true'
)
```

## Using a pipeline

Both endpoints run every event through a [pipeline](/user-guide/logs/manage-pipelines.md). The default is the built-in `greptime_identity`, which maps each input key to a column of the same name.

Override it with the `pipeline_name` query parameter or the `x-greptime-pipeline-name` header. When both are present, the query parameter wins. Use `version` to pin a specific pipeline version.

:::warning
Promoting `host`, `source`, `sourcetype`, and the `fields` keys to tag columns only happens on the default `greptime_identity` path. A custom pipeline owns its output schema, so declare the columns you want indexed in the pipeline itself.
:::

## Response codes

The response body is `{"text": ..., "code": ...}`, matching HEC. Clients branch on `code`.

| Code | Meaning |
| --- | --- |
| `0` | Success |
| `2` | Token is required |
| `4` | Invalid token |
| `5` | No data |
| `6` | Invalid data format, including an unparsable `time` or `version` |
| `7` | Incorrect index, meaning the resolved table name is invalid |
| `8` | Internal server error |
| `12` | Event field is required |
| `13` | Event field cannot be blank |
| `17` | Returned by the health endpoint to report a healthy collector |

:::warning
Validation rejects the whole request. If any event in a batch has a missing, blank, or unparsable field, none of the events in that batch are written — the endpoint does not skip bad events and keep the rest.
:::

## Vector

Vector's [`splunk_hec_logs`](https://vector.dev/docs/reference/configuration/sinks/splunk_hec_logs/) sink writes to GreptimeDB with no other changes:

```toml
[sinks.greptime]
type = "splunk_hec_logs"
inputs = ["my_source"]
endpoint = "http://localhost:4000/v1/splunk"
default_token = "greptime_user:greptime_pwd"
index = "vector_logs"
compression = "gzip"
encoding.codec = "json"
```

- `endpoint`: the `/v1/splunk` base path, without a collector path. Vector appends that itself.
- `default_token`: must be `<username>:<password>`, not an opaque token.
- `index`: the target table.
- `encoding.codec`: required by this sink.
- `endpoint_target`: `event` by default, which uses `/services/collector/event`. Set it to `raw` for the raw endpoint.

To use the raw endpoint instead:

```toml
[sinks.greptime]
type = "splunk_hec_logs"
inputs = ["my_source"]
endpoint = "http://localhost:4000/v1/splunk"
default_token = "greptime_user:greptime_pwd"
index = "vector_raw_logs"
endpoint_target = "raw"
encoding.codec = "text"
batch.max_events = 1
```

Vector concatenates batched events with no separator, so on the raw endpoint a whole batch arrives as one event. Either set `batch.max_events = 1` as above, pass a `linebreaker`, or stay on the default `event` target.

## OpenTelemetry Collector

The [`splunk_hec` exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/splunkhecexporter/README.md) is configured the same way:

```yaml
exporters:
  splunk_hec:
    endpoint: "http://localhost:4000/v1/splunk/services/collector"
    token: "greptime_user:greptime_pwd"
    index: "otel_logs"
    tls:
      insecure: true

service:
  pipelines:
    logs:
      receivers: [otlp]
      exporters: [splunk_hec]
```

Unlike Vector, this exporter expects the full collector path in `endpoint`.
