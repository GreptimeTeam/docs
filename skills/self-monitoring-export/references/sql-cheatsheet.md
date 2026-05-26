# GreptimeDB SQL Cheatsheet

Use these built-in templates before launching subagents or searching docs for common GreptimeDB syntax. Search docs only when:

- the query fails
- the discovered GreptimeDB version differs materially from the syntax here
- a storage provider or export option is not covered here
- the user asks for version-specific proof

MCP boundary: these templates include both read-only analysis SQL and export SQL. Run only read-only `SELECT` / `SHOW` / `DESCRIBE` queries through MCP. Never run `COPY`, `COPY TO`, `COPY DATABASE`, or export-writing SQL through MCP.

## Schema and table discovery

```sql
SHOW TABLES FROM public;
DESCRIBE TABLE _gt_logs;
```

## Self-monitoring cluster labels

```sql
SELECT `cluster`, namespace, count(*) AS rows
FROM _gt_logs
WHERE timestamp >= now() - INTERVAL '2' DAY
GROUP BY `cluster`, namespace
ORDER BY rows DESC;
```

`cluster` may need backticks because it can parse as a keyword.

## GreptimeDB version from self-monitoring

```sql
SELECT
  app,
  version,
  short_version,
  `cluster`,
  namespace,
  count(DISTINCT pod) AS pods,
  max(greptime_timestamp) AS last_seen
FROM greptime_app_version
WHERE greptime_timestamp >= now() - INTERVAL '1' HOUR
GROUP BY app, version, short_version, `cluster`, namespace
ORDER BY app, version, short_version;
```

## Time bucketing with `date_trunc`

Hourly log level counts:

```sql
SELECT
  date_trunc('hour', timestamp) AS hour,
  level,
  count(*) AS cnt
FROM _gt_logs
WHERE timestamp >= '<start_utc>'
  AND timestamp < '<end_utc>'
GROUP BY hour, level
ORDER BY hour, level;
```

Minute-level refinement:

```sql
SELECT
  date_trunc('minute', timestamp) AS minute,
  level,
  count(*) AS cnt
FROM _gt_logs
WHERE timestamp >= '<start_utc>'
  AND timestamp < '<end_utc>'
GROUP BY minute, level
ORDER BY minute, level;
```

## Time bucketing with `date_bin`

Syntax:

```sql
date_bin(INTERVAL '<bucket>', <timestamp_column>, '<origin_timestamp>'::TIMESTAMP)
```

The origin defaults to Unix epoch UTC in docs. Use an explicit origin for portability.

Ten-minute buckets:

```sql
SELECT
  date_bin(INTERVAL '10' MINUTE, timestamp, '1970-01-01 00:00:00'::TIMESTAMP) AS bucket,
  level,
  count(*) AS cnt
FROM _gt_logs
WHERE timestamp >= '<start_utc>'
  AND timestamp < '<end_utc>'
GROUP BY bucket, level
ORDER BY bucket, level;
```

## Description-driven keyword discovery

Use this before generic `ERROR` / `WARN` aggregation. Pick keywords from the user's description, [`signal-index.md`](signal-index.md), and source-code lookup when the description has no direct log keyword match.

Minute-level counts for targeted signals:

```sql
SELECT
  date_trunc('minute', timestamp) AS minute,
  level,
  role,
  target,
  count(*) AS cnt
FROM _gt_logs
WHERE timestamp >= '<start_utc>'
  AND timestamp < '<end_utc>'
  AND (
    lower(message) LIKE '%<keyword_1>%'
    OR lower(message) LIKE '%<keyword_2>%'
    OR lower(err) LIKE '%<keyword_1>%'
    OR lower(err) LIKE '%<keyword_2>%'
    OR lower(target) LIKE '%<component_or_module>%'
    OR lower(role) LIKE '%<role>%'
  )
GROUP BY minute, level, role, target
ORDER BY minute, cnt DESC;
```

Top targeted categories:

```sql
SELECT
  date_bin(INTERVAL '15' MINUTE, timestamp, '1970-01-01 00:00:00'::TIMESTAMP) AS bucket,
  level,
  role,
  target,
  message,
  err,
  count(*) AS cnt
FROM _gt_logs
WHERE timestamp >= '<start_utc>'
  AND timestamp < '<end_utc>'
  AND (
    lower(message) LIKE '%<keyword_1>%'
    OR lower(message) LIKE '%<keyword_2>%'
    OR lower(err) LIKE '%<keyword_1>%'
    OR lower(err) LIKE '%<keyword_2>%'
    OR lower(target) LIKE '%<component_or_module>%'
    OR lower(role) LIKE '%<role>%'
  )
GROUP BY bucket, level, role, target, message, err
ORDER BY cnt DESC
LIMIT 100;
```

Exact source-string spot check:

```sql
SELECT
  timestamp,
  level,
  role,
  pod,
  target,
  message,
  err
FROM _gt_logs
WHERE timestamp >= '<start_utc>'
  AND timestamp < '<end_utc>'
  AND (
    message LIKE '%<Exact source log string>%'
    OR err LIKE '%<Exact source error string>%'
  )
ORDER BY timestamp
LIMIT 200;
```

## Fallback error/warn aggregation

Use this as fallback or sanity check after description-driven discovery. Do not treat top `ERROR` / `WARN` categories as the primary signal when the user described a specific failure mode.

Fifteen-minute buckets for top fallback categories:

```sql
SELECT
  date_bin(INTERVAL '15' MINUTE, timestamp, '1970-01-01 00:00:00'::TIMESTAMP) AS bucket,
  level,
  role,
  target,
  message,
  err,
  count(*) AS cnt
FROM _gt_logs
WHERE timestamp >= '<start_utc>'
  AND timestamp < '<end_utc>'
  AND level IN ('ERROR', 'WARN')
GROUP BY bucket, level, role, target, message, err
ORDER BY cnt DESC
LIMIT 100;
```

## Range query aggregation

GreptimeDB supports range aggregation syntax:

```sql
SELECT
  ts,
  host,
  avg(cpu) RANGE '10s' FILL LINEAR
FROM monitor
ALIGN '5s' TO '2023-12-01T00:00:00'
BY (host)
ORDER BY ts ASC;
```

For incident log discovery, prefer normal SQL `date_trunc` or `date_bin` aggregations unless range-query syntax is already proven in the target version and table shape.

## Top fallback error/warn categories

Use this as fallback or sanity check. Prefer the description-driven keyword templates above for the main incident-window search.

```sql
SELECT
  date_trunc('hour', timestamp) AS hour,
  level,
  role,
  target,
  message,
  err,
  count(*) AS cnt
FROM _gt_logs
WHERE timestamp >= '<start_utc>'
  AND timestamp < '<end_utc>'
  AND level IN ('ERROR', 'WARN')
GROUP BY hour, level, role, target, message, err
ORDER BY cnt DESC
LIMIT 100;
```

## Row-count preflight

Total rows:

```sql
SELECT count(*) AS expected_rows
FROM _gt_logs
WHERE timestamp >= '<export_start_utc>'
  AND timestamp < '<export_end_utc>';
```

Hourly rows for chunk planning:

```sql
SELECT
  date_trunc('hour', timestamp) AS hour,
  count(*) AS expected_rows
FROM _gt_logs
WHERE timestamp >= '<export_start_utc>'
  AND timestamp < '<export_end_utc>'
GROUP BY hour
ORDER BY hour;
```

## Complete SELECT for analysis spot checks only

Use this only for read-only analysis spot checks. Do not use MCP result download as the final incident log export; final data export must use HTTP port export or one of the supported `COPY TO` modes.

```sql
SELECT *
FROM _gt_logs
WHERE timestamp >= '<export_start_utc>'
  AND timestamp < '<export_end_utc>'
ORDER BY timestamp;
```

## `COPY TO` query-result export: Parquet

Run this only through non-MCP SQL/HTTP access or provide it as a user-executed script.

```sql
COPY (
  SELECT *
  FROM _gt_logs
  WHERE timestamp >= '<export_start_utc>'
    AND timestamp < '<export_end_utc>'
  ORDER BY timestamp
) TO '<self_monitoring_filesystem_path>/gt_logs_<start>_<end>.parquet'
WITH (FORMAT = 'parquet');
```

## Local/server-side Parquet path

`COPY TO` writes on the GreptimeDB server node, not the agent/client machine.

```sql
COPY (
  SELECT *
  FROM _gt_logs
  WHERE timestamp >= '<export_start_utc>'
    AND timestamp < '<export_end_utc>'
  ORDER BY timestamp
) TO '/tmp/greptimedb-incident-export/<incident-id>/gt_logs_<start>_<end>.parquet'
WITH (FORMAT = 'parquet');
```

## HTTP port export

Use this when the user chooses GreptimeDB HTTP port export. See [`export-http.md`](export-http.md). Do not set an HTTP timeout header. Use GreptimeDB's `compression=` query parameter through the script, not HTTP `Accept-Encoding`.

```bash
scripts/http_arrow_export.sh \
  --url "http://<host>:<port>" \
  --db "public" \
  --sql "SELECT * FROM public._gt_logs WHERE timestamp >= '<export_start_utc>' AND timestamp < '<export_end_utc>' ORDER BY timestamp" \
  --output './greptimedb-incident-<id>/logs/gt_logs_<start>_<end>.arrow' \
  --headers './greptimedb-incident-<id>/metadata/gt_logs_<start>_<end>.headers'
```

The script writes `gt_logs_<start>_<end>.zstd.arrow` if the `zstd` request succeeds, or `gt_logs_<start>_<end>.lz4.arrow` if it falls back to `lz4`.

## CSV/JSON fallbacks

Use CSV/JSON only when the user needs text output or Parquet is unavailable. `compression_type` applies to CSV/JSON, not Parquet.

```sql
COPY (
  SELECT *
  FROM _gt_logs
  WHERE timestamp >= '<export_start_utc>'
    AND timestamp < '<export_end_utc>'
  ORDER BY timestamp
) TO '<self_monitoring_filesystem_path>/gt_logs_<start>_<end>.csv.gz'
WITH (
  FORMAT = 'csv',
  compression_type = 'gzip',
  TIMESTAMP_FORMAT = '%Y-%m-%dT%H:%M:%S%.f'
);
```

## COPY DATABASE caution

`COPY DATABASE` can export database-level data with `FORMAT = 'parquet'`, `START_TIME`, `END_TIME`, and `PARALLELISM`, but this skill normally exports selected `_gt_logs` query windows instead of whole databases.

Cautions:

- `START_TIME` is inclusive.
- `END_TIME` is exclusive.
- `COPY DATABASE` path must end with `/`.
- Whole-database export is usually too broad for incident handoff unless the user explicitly requests it.

## COPY TO STDOUT caution

PostgreSQL `COPY ... TO STDOUT` is separate from server-side file export. It is PostgreSQL-only, query-result only, and supports `text`/`csv`/`binary` style output rather than Parquet file export. Do not confuse it with `COPY TO '<path>' WITH (FORMAT = 'parquet')`.

## Common export cautions

- `COPY TO` writes on the self-monitoring GreptimeDB filesystem, not automatically into the local artifact directory.
- Include retrieval instructions only when the user chose `kubectl cp`; otherwise record that the user will download files manually.
- Use `/` in paths for portability; avoid Windows `\` path separators in SQL examples.
- Never put secrets into reports. Redact credentials in saved command files unless the user explicitly asks to store them.
