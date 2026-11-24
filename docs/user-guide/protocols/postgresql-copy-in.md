---
keywords: [PostgreSQL, COPY FROM STDIN, CSV, JSONL, InfluxDB, Arrow IPC, OTLP, Prometheus Remote Write]
description: Stream data into GreptimeDB over a PostgreSQL connection using COPY FROM STDIN. Choose a payload format, destination, and ingestion options.
---

# PostgreSQL COPY FROM STDIN

If your application can reach GreptimeDB only through a database protocol, `COPY FROM STDIN` lets it stream data from a PostgreSQL client without opening an HTTP or gRPC connection. It also avoids converting each batch into SQL `INSERT` statements. In a [GreptimeDB ingestion benchmark](https://github.com/GreptimeTeam/greptimedb/pull/9297), COPY sustained 841,000 rows/s with 1,000-row batches versus 49,000 rows/s for PostgreSQL `INSERT` on the same workload: more than 10× the throughput. Results depend on the workload and batch size.

[PostgreSQL developers have been working on extensible COPY formats](https://www.postgresql.org/message-id/20231204.153548.2126325458835528809.kou%40clear-code.com). GreptimeDB puts that idea into practice: an exporter can send an OTLP or Arrow payload through an existing PostgreSQL driver instead of implementing another transport. This gives client and tool authors a way to test new integrations without waiting for upstream PostgreSQL to support these formats.

`STDIN` means the data comes from the client, not from a file on the server. The connection supplies the database and credentials. Options normally passed as HTTP headers or query parameters go in `WITH`.

Send the `COPY` statement on its own, then write the payload through the client's COPY API and finish the copy. Specify `FORMAT` explicitly: neither PostgreSQL's default `text` format nor its native `binary` row format is supported. Use `option value`, not `option = value`. Enclose string values in single quotes. A boolean option written without a value means `true` (for example, `HEADER`). Unknown or duplicate options are rejected. On success the server returns `COPY n`, where `n` is the count reported by that ingestion interface.

| `FORMAT` | What to send | Table name after `COPY` | Create the table first? |
| --- | --- | --- | --- |
| `csv` | CSV text | Required; optional column list | Yes |
| `jsonl` | One JSON object per line | Required; optional column list | Yes |
| `influxdb` | Line protocol text | Not supported; the measurement names the table | No, by default |
| `arrow` | One Arrow IPC stream | Required; no column list | Yes, even with `auto_create_table true` |
| `otlp` (metrics) | One uncompressed metrics export request | Not supported; the metric name determines the table | No, by default |
| `otlp` (logs or traces) | One uncompressed logs or traces export request | Optional; no column list | No, by default (including named targets) |
| `promwrite` | One compressed Remote Write protobuf request | Not supported; each series identifies its metric table | No, by default |

InfluxDB, OTLP, and Remote Write buffer **one request per COPY**, up to 64 MiB of payload. The shared request-memory limit can reject a smaller request. For larger imports, send multiple complete requests in separate COPY operations; splitting the same payload across network writes does not bypass the limit. CSV, JSONL, and Arrow instead write batches as they arrive. If a later batch fails, earlier batches can remain in the table.

## Python client example (Psycopg 3)

This example writes two InfluxDB line protocol records through GreptimeDB's PostgreSQL port. You don't need to create a table first: `room_temperature` in the payload names the destination table. Install Psycopg 3:

```shell
python -m pip install 'psycopg[binary]'
```

Run this script against a local GreptimeDB instance, or change the connection string for your deployment:

```python
import psycopg

with psycopg.connect("postgresql://greptime@localhost:4003/public", autocommit=True) as conn:
    with conn.cursor() as cur:
        with cur.copy("COPY FROM STDIN WITH (FORMAT influxdb, precision 'ms')") as copy:
            copy.write(b"room_temperature,room=kitchen celsius=21.5 1735689600000\n")
            copy.write(b"room_temperature,room=office celsius=22.0 1735689600000\n")
        print(cur.statusmessage)  # COPY 2
```

Use `copy.write()` for data already encoded in the chosen format, not `copy.write_row()`, which encodes PostgreSQL rows. Both writes above belong to one COPY request. Leaving the `cur.copy()` block finishes the request; don't send the `\.` marker used by `psql`.

## CSV

Create the destination table first, then name it after `COPY`, as in this `psql` example. The line containing `\.` ends client input. `HEADER` skips the first record; it does not use the header names to reorder columns. List the columns in input order, or omit the list to use table order.

```sql
CREATE TABLE readings (ts TIMESTAMP TIME INDEX, host STRING, temperature DOUBLE);
COPY readings (ts, host, temperature) FROM STDIN WITH (FORMAT csv, HEADER);
ts,host,temperature
2025-01-01T00:00:00Z,web01,21.5
\.
SELECT * FROM readings;
```

| Option | Value and default | Meaning |
| --- | --- | --- |
| `HEADER` | Boolean; default `false` | Skip the first input record. |
| `DELIMITER` | One printable ASCII character or a tab; default `','` | Field separator. Must differ from `QUOTE`. |
| `QUOTE` | One printable ASCII character or a tab; default `'"'` | Encloses a quoted field. |
| `ESCAPE` | One printable ASCII character or a tab; defaults to `QUOTE` | Escapes a quote inside a quoted field. |
| `NULL` | Only `''` (default) | An empty field, even `""`, is NULL. Custom NULL markers are not supported. |

Use date/time strings for timestamps. Strings without an offset use the session time zone. JSON and binary columns are not supported by the CSV decoder.

## JSON Lines (JSONL)

Name an existing table after `COPY` and send one JSON object per line. Keys match columns by name, not by position. For example, with the `readings` table from the CSV example, the second record sets `temperature` to NULL because the key is absent:

```sql
COPY readings (ts, host, temperature) FROM STDIN WITH (FORMAT jsonl);
{"host":"web01","temperature":22.5,"ts":"2025-01-01T00:01:00Z"}
{"host":"web02","ts":"2025-01-01T00:01:01Z"}
\.
```

`json` is an alias for `jsonl`; it does not accept a JSON array of records. There are no `WITH` options beyond `FORMAT`. Values are decoded directly into the target columns without a pipeline. Timestamp strings without an offset use the session time zone. JSON and binary target columns are not supported.

## InfluxDB line protocol

Do not name a table after `COPY`. Each line names its measurement, and GreptimeDB creates missing measurement tables by default. Send the same text as an InfluxDB write body. `influxdb_line` is an alias for `influxdb`. This `psql` example writes to the `cpu` measurement:

```sql
COPY FROM STDIN WITH (FORMAT influxdb, precision 'ms');
cpu,host=web01 usage=0.75 1735689600000
\.
```

| Option | Value and default | Meaning |
| --- | --- | --- |
| `precision` | `'ns'` (default) or `'n'`, `'us'` or `'u'`, `'ms'`, `'s'`, `'m'`, `'h'` | Unit of timestamps in the input. For example, the HTTP query parameter `?precision=ms` becomes `precision 'ms'`. |

## Arrow IPC

Send an Arrow IPC **stream** (schema followed by record batches), not an IPC file or a Flight protobuf envelope. Name an existing table after `COPY`. GreptimeDB uses the Arrow Flight bulk write path and matches fields by name. Do not supply a COPY column list.

```sql
COPY readings FROM STDIN WITH (FORMAT arrow, auto_create_table true, insert_skip_wal false);
```

| Option | Value and default | Meaning |
| --- | --- | --- |
| `auto_create_table` | Boolean; omit to use the existing schema-on-write policy | Allow missing columns to be added. The target table must already exist even when this option is `true`. |
| `insert_skip_wal` | Boolean; omit to keep the current WAL setting | Set to `true` to skip the write-ahead log for this COPY, reducing durability. |

COPY returns one final row count rather than Flight's per-batch acknowledgments.

## OpenTelemetry (OTLP)

Set `signal` to match the protobuf message you send: `'metrics'` (default) for `ExportMetricsServiceRequest`, `'logs'` for `ExportLogsServiceRequest`, or `'traces'` for `ExportTraceServiceRequest`. Send the serialized message itself, without HTTP headers, compression, or a gRPC frame. `otlp_metrics` is an alias for `otlp`.

For example, given a Psycopg 3 cursor `cur` and an OpenTelemetry `ExportLogsServiceRequest` named `request`, send the raw bytes rather than using the driver's row encoder:

```python
with cur.copy("COPY app_logs FROM STDIN WITH (FORMAT otlp, signal 'logs')") as copy:
    copy.write(request.SerializeToString())
```

| Option | Signal | Value and meaning |
| --- | --- | --- |
| `signal` | All | `'metrics'` (default), `'logs'`, or `'traces'`. Selects the protobuf message type. |
| `promote_all_resource_attrs` | Metrics | Boolean, default `false`. Promote all resource attributes except those listed in `resource_attrs`. |
| `resource_attrs` | Metrics | Semicolon-separated string, e.g. `'service.name;host.id'`. Lists attributes to keep, or to exclude if `promote_all_resource_attrs` is `true`. |
| `promote_scope_attrs` | Metrics | Boolean, default `false`. Promote scope attributes. |
| `translation_strategy` | Metrics | String, default `'UnderscoreEscapingWithSuffixes'`. See [accepted metric and label name translation strategies](/user-guide/ingest-data/for-observability/opentelemetry.md#prometheus-compatibility). |
| `table_name` | Logs, traces | String. Overrides the destination, like `x-greptime-log-table-name` or `x-greptime-trace-table-name`. See the routing rules below. |
| `pipeline_name` | Logs, traces | String. Selects a pipeline, like `x-greptime-pipeline-name`. Required for traces; omit for direct log ingestion. |
| `pipeline_version` | Logs, traces | String. Selects a pipeline version, like `x-greptime-pipeline-version`. |
| `pipeline_params` | Logs, traces | String, e.g. `'key1=value1&key2=value2'`. Passes parameters like `x-greptime-pipeline-params`. |
| `extract_keys` | Logs | Comma-separated string, e.g. `'host,env'`. Like `x-greptime-log-extract-keys`, extracts attributes during direct log ingestion. New columns are tags; existing columns keep their role (for example, a `host` field remains a field). |

For metrics, do not name a table after `COPY`. GreptimeDB routes by metric name and creates missing tables by default. For example, to send the equivalent of the HTTP header `x-greptime-otlp-metric-promote-resource-attrs: service.name;host.id`:

```sql
COPY FROM STDIN WITH (FORMAT otlp, signal 'metrics', resource_attrs 'service.name;host.id');
```

For logs and traces, `table_name` overrides the table named after `COPY`; a qualified COPY target still selects the schema. If neither is given, the defaults are `opentelemetry_logs` and `opentelemetry_traces`. These tables need not exist beforehand. No signal accepts a column list. For example, to write spans to `app_traces` with the v2 trace pipeline:

```sql
COPY app_traces FROM STDIN WITH (FORMAT otlp, signal 'traces', pipeline_name 'greptime_trace_v2');
```

## Prometheus Remote Write

Do not name a table after `COPY`. The metric name in each series determines the logical table; GreptimeDB creates missing metric tables by default. Use `physical_table` to select the backing table, not to override the series name. Send the same compressed protobuf body that you would POST to `/v1/prometheus/write`. Set `version` and `zstd` to match the bytes the client has already encoded.

```sql
COPY FROM STDIN WITH (FORMAT promwrite, version 2, zstd, physical_table 'metrics');
```

| Option | Value and default | Meaning |
| --- | --- | --- |
| `version` | `1` (default) or `2`; also accepts `'v1'` or `'v2'` | Remote Write protobuf message version. |
| `zstd` | Boolean; default `false` (Snappy) | Set to `true` for a Zstandard-compressed body, like `Content-Encoding: zstd`. |
| `physical_table` | Optional string | Like the HTTP `physical_table` query parameter, selects the backing physical table, not the logical table for each series. |
| `pipeline_name` | Optional string | Selects a pipeline for v1. |
| `pipeline_version` | Optional string | Selects the pipeline version for v1. |

As on the HTTP endpoint, v2 does not apply pipelines. A v2 request with exemplars is rejected if `pipeline_name` is set. Setting only `pipeline_version` does not trigger this check.
