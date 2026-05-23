# HTTP Port Export Guide

Use GreptimeDB HTTP port export when the self-monitoring HTTP port is reachable. Prefer this path because the same `/v1/sql` endpoint can run discovery SQL and export local files. Internally, exports use Arrow IPC files written directly into the local artifact directory.

Use the GreptimeDB HTTP SQL endpoint:

```text
POST /v1/sql?db=<database>&format=arrow
```

Do not set an HTTP timeout header in generated HTTP port commands.

Request Arrow IPC compression by default:

1. prefer `zstd`
2. fall back to `lz4`

Use [`../scripts/http_arrow_export.sh`](../scripts/http_arrow_export.sh) for agent-executed HTTP port exports. The script requests `compression=zstd` first and `compression=lz4` second, writes the requested Arrow IPC compression format into the file suffix, saves response headers next to the output file, fails on HTTP errors, and validates with [`../scripts/validate_arrow.py`](../scripts/validate_arrow.py) when PyArrow is available.

Run this canonical skill script directly. In the artifact directory, record a wrapper invocation such as `commands/run_http_export.sh`; do not copy `http_arrow_export.sh` itself unless the user explicitly requests a self-contained artifact.

Record the requested Arrow IPC compression in `manifest.md`. The script writes files as `.zstd.arrow` or `.lz4.arrow` based on the successful `compression=` request. Do not request HTTP response decompression for this default path; GreptimeDB Arrow IPC compression is controlled by the SQL endpoint `compression=` query parameter.

Before exporting, confirm:

- HTTP host/port and database, usually HTTP port `4000` and database `public`
- auth method, if required
- selected time windows and chunking plan
- local artifact directory
- Arrow IPC compression preference: default `zstd`, fallback `lz4`
- validation method: PyArrow preferred

Sample bounded request shape using the script:

```bash
scripts/http_arrow_export.sh \
  --url "http://<host>:<port>" \
  --db "public" \
  --sql "SELECT * FROM public._gt_logs WHERE timestamp >= '<sample_start_utc>' AND timestamp < '<sample_end_utc>' ORDER BY timestamp LIMIT 10" \
  --output "logs/http_arrow_sample.arrow" \
  --headers "metadata/http_arrow_sample.headers"
```

This produces `logs/http_arrow_sample.zstd.arrow` when the `zstd` request succeeds, or `logs/http_arrow_sample.lz4.arrow` when it falls back to `lz4`.

Full export chunks should use fixed UTC boundaries and write files under `logs/`:

```bash
scripts/http_arrow_export.sh \
  --url "http://<host>:<port>" \
  --db "public" \
  --sql "SELECT * FROM public._gt_logs WHERE timestamp >= '<chunk_start_utc>' AND timestamp < '<chunk_end_utc>' ORDER BY timestamp" \
  --output "logs/gt_logs_<chunk_start>_<chunk_end>.arrow" \
  --headers "metadata/gt_logs_<chunk_start>_<chunk_end>.headers"
```

Save generated command records as:

```text
commands/run_http_export.sh
commands/validate_arrow.sh
```

Validation:

1. check the local file exists and size is non-zero
2. record the first and last bytes if useful for binary signature checks
3. validate Arrow IPC stream with `scripts/validate_arrow.py`
4. validate row count against pre-export count
5. record schema fields and timestamp type in `summary/export_report.md`

PyArrow validation example:

```bash
python3 scripts/validate_arrow.py logs/http_arrow_sample.zstd.arrow --schema
```

If validation fails, do not claim the export is complete. Record the failure in `summary/gaps_and_risks.md`, keep the response headers, and re-check the HTTP port query, selected Arrow IPC compression, and local PyArrow support before retrying.
