# Discovery Guide

## Timezone rules

Use UTC internally whenever possible.

Always report both:

- UTC time
- User timezone time

Do not assume timestamps are UTC without checking. For HTTP SQL, prefer:

```text
X-Greptime-Timezone: UTC
```

Prefer RFC3339 timestamps with explicit offsets when forming queries.

## Verify access and inspect schema

Do not assume schema.

```sql
SHOW TABLES FROM public;
DESCRIBE TABLE _gt_logs;
```

Identify:

- timestamp column
- level column
- cluster / namespace labels
- pod / role labels
- message / err fields

Common `_gt_logs` columns may include:

```text
timestamp
level
target
role
pod
message
err
cluster
namespace
```

If MCP is available but the user is unsure whether it points to the self-monitoring instance that monitors the GreptimeDB cluster being investigated, verify by checking whether `_gt_logs` exists and whether self-monitoring metric/log tables are present.

## Discover cluster and namespace

```sql
SELECT `cluster`, namespace, count(*) AS rows
FROM _gt_logs
WHERE timestamp >= now() - INTERVAL '2' DAY
GROUP BY `cluster`, namespace
ORDER BY rows DESC;
```

Note: `cluster` may need backticks because it can be parsed as a keyword.

## Discover GreptimeDB version

First check whether `greptime_app_version` exists:

```sql
SHOW TABLES FROM public;
```

If available:

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

If unavailable, ask the user for version only if relevant to the engineering handoff.

## Discover candidate incident windows

Start from the user's abnormal-behavior description, not from generic `ERROR` / `WARN` counts. Use [`signal-index.md`](signal-index.md) to map the description to likely roles, source modules, log keywords, and metrics. If the description does not directly map to known log keywords, inspect GreptimeDB source code first. Do not assume a user-local repository; follow [`../references.md`](../references.md), clone <https://github.com/GreptimeTeam/greptimedb> into a temporary source checkout, prefer the investigated GreptimeDB version, fall back to main when no matching version is available, or use remote source search when cloning is unavailable.

Use [`sql-cheatsheet.md`](sql-cheatsheet.md) for common GreptimeDB time-bucketing templates before searching docs or launching subagents for syntax.

When using HTTP SQL, save small aggregate outputs with [`../scripts/http_sql_query.sh`](../scripts/http_sql_query.sh). Keep discovery queries narrow and aggregated; do not use Arrow bulk export for routine discovery.

Description-driven workflow:

1. Extract symptoms from the user description: affected operation, visible error, role/pod if known, approximate time, and recovery signal.
2. Pick one or more entries from [`signal-index.md`](signal-index.md).
3. Build a targeted log filter from role, target, message, and err keywords.
4. Query around the user-provided time first if available; otherwise use a short recent range such as 2 days.
5. Check related metrics only after `SHOW TABLES FROM public;` proves the metric tables exist.
6. Rank candidate windows by symptom match, source-derived keyword match, metric correlation, and temporal clustering.

Targeted keyword discovery example:

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
    OR lower(err) LIKE '%<keyword_1>%'
    OR lower(target) LIKE '%<component_or_module>%'
    OR lower(role) LIKE '%<role>%'
  )
GROUP BY minute, level, role, target
ORDER BY minute, cnt DESC;
```

Use source-derived strings literally when possible:

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

Use generic level aggregation only as a fallback or sanity check:

```sql
SELECT
  date_trunc('hour', timestamp) AS hour,
  level,
  count(*) AS cnt
FROM _gt_logs
WHERE timestamp >= now() - INTERVAL '2' DAY
GROUP BY hour, level
ORDER BY hour, level;
```

Fallback top error/warn categories:

```sql
SELECT
  date_trunc('hour', timestamp) AS hour,
  target,
  message,
  err,
  count(*) AS cnt
FROM _gt_logs
WHERE timestamp >= now() - INTERVAL '2' DAY
  AND level IN ('ERROR', 'WARN')
GROUP BY hour, target, message, err
ORDER BY cnt DESC
LIMIT 100;
```

If the user provided approximate time, search around that time first, but still include pre-window warnings that match the chosen signal index entry or source-derived keyword set.

## Refine the window

Prefer `date_trunc` or `date_bin` examples from [`sql-cheatsheet.md`](sql-cheatsheet.md). Search docs only if the query fails or the target GreptimeDB version requires different syntax.

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

If supported:

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

## Decide export window

Default rules:

- Exact spike known: export `T-30min` to `T+30min`.
- Ramp-up: export from first anomaly minus 30min to recovery plus 30min.
- Related WARNs precede ERROR: start from first related WARN.
- Meta, heartbeat, region migration, or repartition appears involved: widen to `T-2h` to `T+2h`.
- Storage/network timeouts appear intermittent: include at least one full retry cycle before and after.
- Unsure: export a wider window, but ask for confirmation if large.

## Long-range export strategy

If the suspected incident range is very long, do not mechanically export all logs for the entire range. First compress the investigation into ranked windows:

1. **Critical windows** — must export. These include the first anomaly, peak error period, recovery period, and any state-transition period such as leader change, region migration, repartition, heartbeat loss/recovery, storage timeout burst, or compaction/manifest failure burst.
2. **Possibly useful context windows** — export when they explain buildup or recovery. These include related WARN ramps, intermittent retries, low-frequency precursors, or metric spikes that precede the main error burst.
3. **Low-signal background range** — do not export by default. Summarize with counts/aggregations and only export if the user explicitly confirms.

For long ranges, produce an export plan with multiple windows instead of one huge window:

```text
Critical windows:
- <start_utc> to <end_utc>: first ERROR burst / peak / recovery

Possibly useful context windows:
- <start_utc> to <end_utc>: WARN ramp before errors

Not exported by default:
- <start_utc> to <end_utc>: low-signal background; summarized only
```

Each exported window must still be continuous within itself and must include all log levels for that window, not only matching errors. If the user asks for the full long range after seeing the plan, estimate row count and require explicit confirmation.

## Signal-to-metric index

Use [`signal-index.md`](signal-index.md) for the maintained symptom-to-source/keyword/metric map. Before querying metrics as SQL tables, always run `SHOW TABLES FROM public;`. Do not assume a generic `public.metrics` table exists.
