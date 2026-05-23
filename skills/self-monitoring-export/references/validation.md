# Validation Guide

After each log export, validate that exported row count matches the pre-export estimate, or is close enough to be explained by time-window drift.

Before export:

```sql
SELECT count(*) AS expected_rows
FROM _gt_logs
WHERE timestamp >= '<export_start_utc>'
  AND timestamp < '<export_end_utc>';
```

For chunked exports:

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

After export, compute or estimate actual rows:

CSV with one header row:

```bash
actual_rows=$(($(wc -l < gt_logs_incident.csv) - 1))
```

Compressed CSV:

```bash
actual_rows=$(($(gzip -cd gt_logs_incident.csv.gz | wc -l) - 1))
```

JSON lines:

```bash
actual_rows=$(wc -l < gt_logs_incident.json)
```

Arrow IPC with the skill validator:

```bash
python3 scripts/validate_arrow.py \
  logs/gt_logs_<start>_<end>.zstd.arrow \
  --expected-rows <expected_rows> \
  --min-timestamp '<export_start_utc>' \
  --max-timestamp '<export_end_utc>' \
  --schema
```

The validator prints row count, batch count, file size, SHA-256 checksum, optional schema, and expected-row mismatch status. Use the actual exported suffix, for example `.zstd.arrow` or `.lz4.arrow`.

When creating an artifact command record, prefer `commands/validate_arrow.sh` as a wrapper that calls the canonical skill `scripts/validate_arrow.py`. Do not copy the Python validator into the artifact unless the user explicitly requests a self-contained artifact.

If no local Arrow reader is available, record that exact row validation could not be performed locally and keep pre-export SQL count plus file size/checksum.

Validation rules:

- Exact match is ideal.
- Small differences can be acceptable if source table was still receiving logs and export query used `now()` or a moving boundary.
- For fixed boundaries, large differences are suspicious.
- Treat differences above 1% or 10,000 rows, whichever is larger, as requiring investigation unless clearly explained.
- For chunked exports, validate every chunk and total.

If there is a large mismatch:

1. Do not claim export is complete.
2. Re-run expected row count using exact fixed time boundaries.
3. Check whether export query used the same boundaries and filters as count query.
4. Check whether exported file was truncated, split, compressed, or overwritten.
5. Check command errors, truncated files, and failed retrieval steps.
6. Re-export missing chunk(s) only, if possible.
7. Record mismatch and remediation in `summary/gaps_and_risks.md`.

For every exported file, record expected rows, actual rows if measurable, row-count difference, file size, checksum if practical, and validation status: `validated`, `approximate`, or `not validated`.
