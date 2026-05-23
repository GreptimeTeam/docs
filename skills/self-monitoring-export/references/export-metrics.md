# Metrics Export Guide

Only export metrics that are relevant to detected log errors or user symptom.

Before exporting metric tables:

1. verify the table exists with `SHOW TABLES FROM public;`
2. estimate row count
3. use the same time window as logs unless a wider window is justified
4. ask confirmation for large ranges

Example SQL COPY:

```sql
COPY (
  SELECT *
  FROM greptime_datanode_region_request_fail_count
  WHERE greptime_timestamp >= '<export_start_utc>'
    AND greptime_timestamp < '<export_end_utc>'
  ORDER BY greptime_timestamp
) TO '/tmp/greptime_datanode_region_request_fail_count.parquet'
WITH (FORMAT = 'parquet');
```

Example HTTP port export:

```bash
scripts/http_arrow_export.sh \
  --url "http://<host>:4000" \
  --db "public" \
  --sql "SELECT * FROM greptime_datanode_region_request_fail_count WHERE greptime_timestamp >= '<export_start_utc>' AND greptime_timestamp < '<export_end_utc>' ORDER BY greptime_timestamp" \
  --output "metrics/greptime_datanode_region_request_fail_count.arrow"
```

The script writes `metrics/greptime_datanode_region_request_fail_count.zstd.arrow` when the `zstd` request succeeds, or `.lz4.arrow` when it falls back.
