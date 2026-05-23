# SQL COPY Export Guide

## Failure recovery

If a SQL `COPY` command fails, do not retry blindly.

Capture:

- exact command or SQL statement, with secrets redacted
- full error message and status code
- GreptimeDB version from `greptime_app_version`, if available
- COPY mode: user-executed, agent-executed without retrieval, or agent-executed plus `kubectl cp`
- target format: `parquet`, `csv.gz`, or `json.gz`
- target path on the self-monitoring filesystem, with secrets redacted

Use version-aware documentation lookup:

1. If GreptimeDB version is known, look for docs matching exact version or closest matching stable version.
2. If exact version is unavailable, use the closest lower supported release.
3. Use `nightly` docs only for nightly builds or when stable docs clearly do not contain the feature.
4. If version is unknown, use current stable docs and note uncertainty.

Docs URL patterns:

- Latest stable `1.0`: root paths, e.g. `https://docs.greptime.com/reference/sql/copy/`.
- Nightly: `/nightly/`, e.g. `https://docs.greptime.com/nightly/reference/sql/copy/`.
- Historical releases: `/<version>/`, e.g. `https://docs.greptime.com/0.17/reference/sql/copy/`.
- Do not assume `/1.0/...` is the latest stable path.

Core docs:

- SQL `COPY`: `https://docs.greptime.com/reference/sql/copy/`
- HTTP API: `https://docs.greptime.com/user-guide/protocols/http/`
- HTTP endpoints: `https://docs.greptime.com/reference/http-endpoints/`
- CLI data export: `https://docs.greptime.com/reference/command-lines/utilities/data/`
- Timezone: `https://docs.greptime.com/user-guide/timezone/`
- General troubleshooting: `https://docs.greptime.com/user-guide/deployments-administration/troubleshooting/`
- Docs repo: `https://github.com/GreptimeTeam/docs`

Apply the smallest correction: fix unsupported options, path requirements, server filesystem access, response size, or timezone ambiguity. Record failed command, doc reference, correction, and final command in `commands/` and `summary/gaps_and_risks.md`.

## SQL COPY TO export

Use SQL `COPY TO` as a supported export method when HTTP port export is unavailable or the user prefers server-side files. Before using SQL `COPY TO`, ask the user to choose exactly one of the three supported `COPY TO` modes. Include output format, chunking plan, expected row count, self-monitoring filesystem output path, whether files will be retrieved, local artifact directory target path, and manual script fallback when applicable.

GreptimeDB HTTP port export is preferred when the HTTP port is reachable, especially when the user prefers local output without remote retrieval. Follow [`export-http.md`](export-http.md) instead of inventing another transfer path.

Critical location rule: `COPY TO '<path>'` writes on the self-monitoring GreptimeDB server-side or pod-local filesystem. It does not write to the agent/client local filesystem. The local artifact directory receives exported data files only when the confirmed mode includes `kubectl cp` retrieval. Otherwise, the local artifact directory contains scripts, manifest entries, expected remote paths, and user download instructions, but not the remote data files.

Use [`sql-cheatsheet.md`](sql-cheatsheet.md) for common `COPY TO` Parquet, row-count, and caution templates before searching docs or launching subagents for syntax.

If interactive controls are supported, present the three supported modes as a single-select picker and ask only the selected mode's required values with true free-text/textbox controls. If no true textbox exists, ask plain text questions for those values.

Supported modes:

1. **User-executed `COPY TO`** — the agent generates ready-to-run SQL/shell scripts with concrete self-monitoring filesystem output paths in the local artifact directory; the user runs them manually and downloads files manually.
2. **Agent-executed `COPY TO`, no retrieval** — the user confirms and the agent runs non-MCP SQL over HTTP/MySQL/PostgreSQL, possibly through `kubectl port-forward`, then leaves output files on the self-monitoring filesystem for the user to download later.
3. **Agent-executed `COPY TO` + `kubectl cp` retrieval** — the user confirms and the agent runs non-MCP SQL over HTTP/MySQL/PostgreSQL, then uses `kubectl cp` to retrieve the output files into the local artifact directory.

For `COPY TO`, use Parquet first. Do not use CSV/JSON unless the user explicitly needs text output, downstream tools cannot read Parquet, or the GreptimeDB version/export target does not support Parquet.

When using SQL `COPY`, ask which mode to use:

1. User executes `COPY TO` manually.
2. Agent executes `COPY TO`; user downloads from the self-monitoring filesystem later.
3. Agent executes `COPY TO`; agent retrieves files with `kubectl cp`.

If interactive controls are supported, present those modes as a single-select prompt. Then ask only the selected mode's required values with true free-text/textbox controls, or plain text questions if no true textbox exists.

`COPY TO` requires a non-MCP SQL/HTTP execution path such as HTTP SQL endpoint, MySQL/PostgreSQL SQL client, `kubectl port-forward` to one of those endpoints, or a user-executed script. MCP must not be used to run the `COPY TO` statement. Regardless of which mode is selected, the final handoff must be represented in the local artifact directory.

Do not assume the GreptimeDB server filesystem is the user's local machine. Treat server-side local paths, including pod-local paths like `/tmp/...`, as remote paths until retrieved.

Make retrieval explicit:

```text
COPY writes the files on the self-monitoring filesystem, not this client. Choose whether I should retrieve them with kubectl cp or leave them for you to download manually.
```

If the user chooses agent-executed `COPY TO` without retrieval, state this explicitly:

```text
I will run COPY TO and leave the files on the self-monitoring filesystem, for example under `/tmp/greptimedb-incident-export/`. The local artifact directory will record paths and download instructions, but it will not contain the data files until you download them.
```

When using the pod-local option:

- choose a dedicated directory, for example `/tmp/greptimedb-incident-export/<incident-id>/`
- record the pod name, namespace, container, absolute file path, and expected file list
- warn that files may be lost if the pod restarts, is rescheduled, or `/tmp` is cleaned
- warn the user to download files promptly if pod lifecycle changes may delete pod-local data
- include later-download commands if the user has `kubectl cp` access, but do not require immediate download

The only agent-side retrieval method offered as a user-facing option is:

1. `kubectl cp`

If `kubectl cp` is unavailable, do not offer alternate transfer modes. Use user-executed `COPY TO` or agent-executed `COPY TO` without retrieval.

## Manual COPY TO script fallback

If the user chooses manual execution or the agent cannot execute the confirmed commands, provide a ready-to-run `COPY TO` script for the user to execute manually.

The script must be directly executable after copy/paste. Do not leave placeholders such as `<export_start_utc>`, `<path>`, `<pod>`, or `<chunk_start_utc>` in the final script. If any required value is unknown, ask the user for that value before producing the final script.

The manual script must:

- use fixed UTC boundaries
- export complete logs, not sampled/top/error-only rows
- prefer Parquet
- include chunked statements for large windows
- use concrete output paths, endpoints, and time boundaries collected from the user or discovered earlier
- include comments that explain what the script does, not comments requiring user edits
- include a post-export row-count validation query
- avoid embedding secrets in the script

Save or present it as `commands/manual_copy_to.sql` in the local artifact directory when an artifact layout is being created. The file content should be final executable SQL, not a template.

If values are missing, ask a focused question before generating the script:

```text
I can generate a ready-to-run COPY TO SQL script, but I still need the final output path on the self-monitoring filesystem where GreptimeDB can write Parquet files.
```

Single-file Parquet template:

```sql
-- Manual GreptimeDB incident log export.
-- Output path is on the self-monitoring filesystem, not the client side.

-- Pre-export validation count.
SELECT count(*) AS expected_rows
FROM _gt_logs
WHERE timestamp >= '<export_start_utc>'
  AND timestamp < '<export_end_utc>';

COPY (
  SELECT *
  FROM _gt_logs
  WHERE timestamp >= '<export_start_utc>'
    AND timestamp < '<export_end_utc>'
  ORDER BY timestamp
) TO '/tmp/greptimedb-incident-export/<incident-id>/gt_logs_<export_start>_<export_end>.parquet'
WITH (FORMAT = 'parquet');
```

Chunked Parquet template:

```sql
-- Critical window: first error burst.
COPY (
  SELECT *
  FROM _gt_logs
  WHERE timestamp >= '<critical_start_utc>'
    AND timestamp < '<critical_end_utc>'
  ORDER BY timestamp
) TO '/tmp/greptimedb-incident-export/<incident-id>/gt_logs_critical_<critical_start>_<critical_end>.parquet'
WITH (FORMAT = 'parquet');

-- Possibly useful context window: WARN ramp before peak.
COPY (
  SELECT *
  FROM _gt_logs
  WHERE timestamp >= '<context_start_utc>'
    AND timestamp < '<context_end_utc>'
  ORDER BY timestamp
) TO '/tmp/greptimedb-incident-export/<incident-id>/gt_logs_context_<context_start>_<context_end>.parquet'
WITH (FORMAT = 'parquet');
```

## Format preference

Prefer export formats in this order:

1. `parquet` — default and preferred for all COPY incident exports, large windows, and typed offline analysis.
2. `csv` with `compression_type = 'gzip'` — text fallback; extension `.csv.gz`.
3. `json` with `compression_type = 'gzip'` — only when JSON is explicitly needed; extension `.json.gz`.

Do not choose CSV/JSON for large exports unless text output is required or Parquet is not usable.

## Server-side examples

Use the canonical templates in [`sql-cheatsheet.md`](sql-cheatsheet.md) first. These examples are kept here for quick COPY-specific context.

Parquet:

```sql
COPY (
  SELECT *
  FROM _gt_logs
  WHERE timestamp >= '<export_start_utc>'
    AND timestamp < '<export_end_utc>'
  ORDER BY timestamp
) TO '/tmp/gt_logs_incident.parquet'
WITH (FORMAT = 'parquet');
```

Compressed CSV fallback:

```sql
COPY (
  SELECT *
  FROM _gt_logs
  WHERE timestamp >= '<export_start_utc>'
    AND timestamp < '<export_end_utc>'
  ORDER BY timestamp
) TO '/tmp/gt_logs_incident.csv.gz'
WITH (
  FORMAT = 'csv',
  compression_type = 'gzip',
  TIMESTAMP_FORMAT = '%Y-%m-%dT%H:%M:%S%.f'
);
```

Compressed JSON fallback:

```sql
COPY (
  SELECT *
  FROM _gt_logs
  WHERE timestamp >= '<export_start_utc>'
    AND timestamp < '<export_end_utc>'
  ORDER BY timestamp
) TO '/tmp/gt_logs_incident.json.gz'
WITH (
  FORMAT = 'json',
  compression_type = 'gzip',
  TIMESTAMP_FORMAT = '%Y-%m-%dT%H:%M:%S%.f'
);
```

Remember:

- `COPY TO` writes on the self-monitoring GreptimeDB filesystem, not the client side.
- Prefer Parquet; use compressed CSV/JSON only when needed.
- Only the `kubectl cp` mode retrieves data files into the local artifact directory.

## Download server-side COPY files with Kubernetes

Use only if the user selected **Agent-executed `COPY TO` + `kubectl cp` retrieval** and confirmed enough Kubernetes access.

Confirm:

- Kubernetes namespace
- self-monitoring GreptimeDB pod name
- container name, if multiple containers
- server-side export path
- local destination path
- permission to run `kubectl cp`

Discovery:

```bash
kubectl get pods -n <namespace>
kubectl get pods -n <namespace> | grep monitor
```

Copy file:

```bash
kubectl cp \
  -n <namespace> \
  <pod>:/tmp/gt_logs_incident.parquet \
  ./incident/logs/gt_logs_incident.parquet
```

With container:

```bash
kubectl cp \
  -n <namespace> \
  -c <container> \
  <pod>:/tmp/gt_logs_incident.parquet \
  ./incident/logs/gt_logs_incident.parquet
```

Do not offer `kubectl exec`, tarball streaming, ad-hoc HTTP response export, or PostgreSQL `\copy` as alternatives. If `kubectl cp` is unavailable, use user-executed `COPY TO`, agent-executed `COPY TO` without retrieval, or HTTP port export.
