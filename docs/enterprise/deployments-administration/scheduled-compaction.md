---
keywords: [scheduled compaction, compaction cronjob, GreptimeDB Enterprise, Metasrv, plugin]
description: Configure scheduled compaction in GreptimeDB Enterprise and manage compaction jobs through the Metasrv HTTP API.
---

# Scheduled Compaction

Scheduled Compaction is a GreptimeDB Enterprise feature that periodically submits regular compaction requests for all physical Regions that have a leader in a cluster. It runs on the leader Metasrv, uses a cron expression and an IANA time zone to determine the schedule, and stores recent job reports in the Metasrv KV backend.

This feature complements GreptimeDB's automatic and [manual compaction](/user-guide/deployments-administration/manage-data/compaction.md#strict-window-compaction-strategy-swcs-and-manual-compaction). Use it when you want to compact all Regions regularly during a predictable maintenance window.

## Configure the plugin

Add the `compaction_cronjob` plugin to the Metasrv configuration:

```toml
[[plugins]]
[plugins.compaction_cronjob]
enable = true
timezone = "Asia/Shanghai"
cron = "0 0 0 * * *"
max_concurrent_regions = 4
compact_parallelism = 1
manual_trigger_cooldown_secs = 3600
max_history_jobs = 100
```

The cron expression includes seconds. For example, `0 0 0 * * *` runs at midnight every day in the configured time zone.

| Option | Default | Description |
| --- | --- | --- |
| `enable` | `false` | Enables scheduled compaction. |
| `timezone` | Local IANA time zone, or `UTC` if it cannot be detected | The time zone used to evaluate `cron`, for example `Asia/Shanghai`. |
| `cron` | `0 0 0 * * *` | The compaction schedule. |
| `max_concurrent_regions` | `4` | The maximum number of Region compaction requests submitted concurrently by one job. Must be greater than `0`. |
| `compact_parallelism` | `1` | The compaction parallelism passed to each Region request. Must be greater than `0`. |
| `manual_trigger_cooldown_secs` | `3600` | The minimum interval between a manual trigger and the most recent job, whether that job was scheduled or manually triggered. Set it to `0` to disable the cooldown. Scheduled jobs are not delayed by this option. |
| `max_history_jobs` | `100` | The maximum number of completed job reports retained in the Metasrv KV backend. Must be greater than `0`. |

Only the leader Metasrv runs the scheduler. After leadership changes, the new leader continues scheduling future jobs from the configured cron expression.

## HTTP endpoints

The plugin adds the following endpoints to the Metasrv HTTP server. Replace `<metasrv-http-address>` with the configured Metasrv HTTP address.

### Trigger a job

```bash
curl -X POST \
  "http://<metasrv-http-address>/admin/compaction_cronjob/trigger"
```

Send this request to the leader Metasrv. The request waits for the job to finish submitting Region compaction requests and returns its report.

- Returns `409 Conflict` when sent to a follower Metasrv.
- Returns `429 Too Many Requests` when the manual trigger is still within `manual_trigger_cooldown_secs` of the most recent scheduled or manual job.
- Returns `500 Internal Server Error` for other failures.

### Get a job

```bash
curl --get \
  --data-urlencode "job_id=2026-06-16T00:00:00+00:00" \
  "http://<metasrv-http-address>/admin/compaction_cronjob/job"
```

The `job_id` is returned by the trigger and job-list endpoints. It is an RFC 3339 timestamp and should be URL encoded. The endpoint returns `404 Not Found` when the job does not exist.

### List recent jobs

```bash
curl --get \
  --data-urlencode "limit=20" \
  "http://<metasrv-http-address>/admin/compaction_cronjob/jobs"
```

Jobs are ordered by scheduled time in descending order. The optional `limit` parameter defaults to `20`.

## Job report

The trigger and query endpoints return JSON job reports. A completed successful job resembles:

```json
{
  "job_id": "2026-06-16T00:00:00+00:00",
  "scheduled_at": "2026-06-16T00:00:00Z",
  "started_at": "2026-06-16T00:00:00.010Z",
  "finished_at": "2026-06-16T00:00:01.010Z",
  "status": "succeeded",
  "execution_result": {
    "total_regions": 8,
    "submitted_regions": 8,
    "failed_regions": []
  }
}
```

Possible job states are `running`, `succeeded`, and `partial_failed`. A failed job carries its reason as `{"failed": "<reason>"}`. The execution result records how many Region requests were attempted and submitted, together with Region-level submission failures.
