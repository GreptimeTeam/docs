---
name: compaction-advisor
description: Assess GreptimeDB SST fragmentation and compaction window sizing, recommend window settings and compaction SQL, and report per-region before/after statistics with self-monitoring evidence.
---

# Compaction Advisor

Assess the current time-window layout before proposing compaction. Explain whether fragmentation comes from many files within a window or too little data per window. Produce a reviewable recommendation, SQL, and evidence of its scope and result; do not promise a hard work bound from a time-range argument alone.

## Execution and connection model

- Default to **SQL output only**, including discovery SELECTs, ADMIN commands, and verification queries. The user executes them and returns results. Providing an address or invoking this skill does not authorize SQL execution. Switch to agent execution only on an explicit request; permission for read queries does not authorize compaction or configuration changes.
- Reuse the conversation's language, known table, version, and timezone. Ask only for missing information that changes the plan. Use explicit UTC offsets in generated SQL. Replace template values with observed values before calling a statement ready to run.
- Record two separate connections: **business cluster** for `information_schema` and ADMIN, and **self-monitoring instance** for compaction logs and metrics. Recommend collecting the self-monitoring address at discovery time for subsequent start/completion checks. If unavailable, continue with SQL-only diagnosis and label completion evidence as incomplete.
- For each available connection, record endpoint, protocol, catalog/schema, and monitored cluster/namespace. HTTP usually uses port 4000, MySQL 4002, and PostgreSQL 4003; confirm the deployment's service ports. `CLUSTER_INFO.peer_addr` is a gRPC address, not a SQL port. Self-monitoring is commonly a separate `${cluster}-monitor-standalone` service; verify rather than assume its name or relationship to the business cluster.
- SQL-only mode needs no credentials. Offer client or port-forward instructions only when needed. Keep credentials out of SQL, generated artifacts, and reports. If HTTP execution is explicitly requested, use `/v1/sql` and UTC consistently.
- The connection discovery and schema-first approach in [self-monitoring-export](https://github.com/GreptimeTeam/docs/tree/main/skills/self-monitoring-export) is reusable. Its log-export workflow is optional and is not a prerequisite for compaction advice.

## 1. Discover capabilities and scope

Give the user a small discovery batch for the **business cluster**:

```sql
SELECT peer_id, peer_type, version, git_commit
FROM information_schema.cluster_info;

SHOW CREATE TABLE <schema>.<table>;
SHOW CREATE DATABASE <schema>;

DESCRIBE information_schema.ssts_manifest;
DESCRIBE information_schema.region_info;
DESCRIBE information_schema.region_statistics;
DESCRIBE information_schema.region_peers;
```

Resolve the table ID and its physical regions using the available `TABLES`, `REGION_PEERS`, and `REGION_INFO` schemas. Inspect the physical table for a metric-engine logical table; state which other logical tables share the physical regions before recommending a physical-table operation.

Read the actual per-region `compaction_time_window`, leader node, `state`, `manifest_version`, and `region_options` when available. Resolve table, database, and built-in option precedence for the deployed version; do not infer the effective output size from an absent table override. An unset/inferred TWCS window is not necessarily the window currently stored by each region.

Check the deployed version's [compaction syntax](https://docs.greptime.com/user-guide/deployments-administration/manage-data/compaction/) before emitting time-range commands. Schema availability does not prove pushdown. Prioritize table/region pruning and timestamp filtering; COUNT/SUM may aggregate the filtered stream without aggregate pushdown and are still useful. Inspect EXPLAIN and version-specific scan behavior: partial_filters or a FilterExec alone do not prove that manifest enumeration prunes regions. Do not assume GROUP BY, ORDER BY, LIMIT, or aggregate FILTER expressions share the same pushdown support. If a capability is missing, report it and choose a bounded fallback rather than silently scheduling a full-table compaction.

Do not plan a new batch while its regions are staging, entering staging, or undergoing conflicting DDL/repartition. Revalidate leader ownership and state before execution; discovery results can become stale.

## 2. Measure candidate windows

### Keep diagnosis bounded

Use literal `table_id = ... AND region_id = ...` predicates and direct `min_ts`/`max_ts` comparisons with typed UTC constants. Avoid casts/functions on these columns, joins for ID discovery inside the manifest query, or OR branches that bypass ownership/time predicates. Use one region at a time by default. Project only required columns; prefer summaries to row exports and avoid sorting the full inventory.

Set a diagnosis budget before queries: by default, 10 seconds per read, 60 seconds wall-clock per analysis round, at most six manifest scans, and one outstanding request. These are advisor defaults, not database defaults. Include the budget with generated SQL. With HTTP, use the deployed version's `x-greptime-timeout: 10s` and a client deadline slightly longer (for example, `curl --max-time 12`); use verified statement-timeout support for other protocols. Apply the remaining round budget as the tighter bound. A timeout means incomplete evidence, not zero matching files. Stop when either budget is reached; do not immediately retry, widen the range, or fan out requests. Client timeout alone does not prove backend work was cancelled. Compaction execution and monitoring need separate budgets; a timed-out ADMIN may still run and must not be blindly resubmitted.

A returned summary has bounded output, not necessarily bounded scan work. A selected region may still require visiting millions of manifest entries; narrower timestamps need not make that traversal cheaper. If pruning is unavailable, default to the available `REGION_STATISTICS` summary and identify the missing evidence. A small isolated test instance may use a budgeted manifest-summary fallback only after its full instance inventory is independently known to be small; record that exception and do not treat its latency as large-manifest evidence. A small selected region alone is insufficient when the implementation enumerates all regions. If any read times out, stop and return partial evidence. Do not require aggregate pushdown to proceed, and do not promise exact statistics within a deadline regardless of metadata size.

### Region baseline and window summaries

Capture the inexpensive region overview before any ADMIN, then repeat it after completion. Verify schema/role semantics first:

```sql
SELECT region_id, table_id, region_role,
       sst_num, sst_size, index_size, manifest_size, memtable_size
FROM information_schema.region_statistics
WHERE table_id = <table_id>
  AND region_id = <region_id>
  AND region_role = 'Leader';
```

These are approximate, region-wide statistics. `sst_num` and `sst_size` count owned SSTs, excluding SSTs referenced from other regions; manifest inventory counts can therefore differ. `manifest_size` reports total manifest-file bytes, not the size of just the latest checkpoint or the in-memory manifest. It is not time-window-specific. Label freshness and ownership, retain NULL as unknown, and do not scan object storage by default to obtain this overview.

Start with the affected region and a user-provided or observed historical time range. If the range is unknown, first request bounded discovery or a single explicitly identified region-level summary. Avoid repeatedly fetching all SST rows or issuing one query per hour across months.

For each candidate interval `[start, end)`, obtain:

- Visible file count `N`, total SST bytes `B`, and average `B / N` computed from the returned summary (N=0 gives no average). Keep region-wide and interval statistics separate; row and index bytes only when needed.
- Small-file count and bytes, their fractions of N and B, and the explicit byte threshold relative to the effective maximum output size. Do not infer size distribution from the average alone.
- Files overlapping the interval and files crossing its boundaries.
- Actual TWCS window membership when estimating regular compaction: assignment uses `max_ts`, not `min_ts`.

Use referring `region_id`/`table_id`, not `origin_region_id`, for ownership. Filter to the current leader's `node_id` where applicable to avoid counting replicas; omit that predicate for a standalone instance with NULL node IDs. Use `visible = true` for compaction inputs. Keep non-visible entries separate when investigating manifest metadata growth. A shared file referenced by multiple regions is not multiple unique physical objects.

Example combined summary for **one region and one interval** (conditional aggregates need not be pushed down; prefer this one-scan shape unless the deployed plan shows a better supported alternative); render numeric IDs, the byte threshold, and UTC bounds from discovery:

```sql
SELECT
  COUNT(*) AS files,
  SUM(file_size) AS sst_bytes,
  COUNT(*) FILTER (WHERE file_size < <small_file_bytes>) AS small_files,
  SUM(file_size) FILTER (WHERE file_size < <small_file_bytes>) AS small_bytes,
  COUNT(*) FILTER (WHERE min_ts < '<start_utc>'::TIMESTAMP_NS) AS crosses_start,
  COUNT(*) FILTER (WHERE max_ts >= '<end_utc>'::TIMESTAMP_NS) AS crosses_end
FROM information_schema.ssts_manifest
WHERE table_id = <table_id>
  AND region_id = <region_id>
  AND node_id = <leader_node_id>
  AND visible = true
  AND min_ts < '<end_utc>'::TIMESTAMP_NS
  AND max_ts >= '<start_utc>'::TIMESTAMP_NS;
```

The overlap predicate includes files that began before the requested range. Filtering only `min_ts >= start` would miss them. NULL time bounds are unknown coverage, not evidence that a file cannot overlap: count them separately and withhold a bounded-work claim until resolved. SUM over no rows is NULL; normalize it explicitly in the report.

For a known TWCS bucket `[bucket_start, bucket_end)`, use `max_ts >= bucket_start AND max_ts < bucket_end` to count assigned files. Keep this inventory separate from the overlap inventory; neither is an exact preview of the picker's chosen inputs. Use the deployed engine's bucket alignment.

Coarse-to-fine means a few summaries followed by refinement of promising intervals. Even with pushdown, each query can still traverse all entries in a selected region. Where supported, combine a small number of candidate windows using filtered COUNT/SUM in one scan with an enclosing time predicate. Do not replace thousands of hourly scans with thousands of aggregate expressions. Do not use `LIMIT` on a summary to claim less scan work.

## 3. Evaluate the time-window size first

Distinguish the current effective TWCS width `W`, a candidate future width `W_candidate`, the requested execution interval `[start, end)`, and SWCS's output-window width. They are different controls. Report W per region from runtime metadata, together with any configured/inferred difference.

Use a few representative closed buckets within the query budget, including normal and busier periods when available. Count by `max_ts` assignment to avoid double-counting crossing files across buckets; also report boundary-crossing uncertainty. Do not label an overlapping-file sum as bytes ingested in that interval.

| Evidence | Diagnosis and next action |
| --- | --- |
| Many small files in a bucket with substantial total bytes | Fragmentation within the current window; keep W initially and try regular compaction if its scope is acceptable. |
| Several adjacent closed buckets each contain little data, especially after regular has reduced them to one/few files | W may be too small for this region's data volume. Evaluate a larger W before repeatedly compacting the same small buckets. |
| Buckets contain substantial bytes but regular makes little progress | Investigate eligibility, runs/levels, output-size setting, staging/DDL and failures. A small average alone does not justify increasing W. |
| Large buckets exceed the input budget or cross-window files connect many buckets | Increasing W can worsen the job. Investigate scope and pressure; do not promise that a narrower ADMIN interval splits a TWCS bucket. |
| Only an active bucket, sparse samples, missing bounds or timed-out summaries | Report insufficient evidence for a new W; give the next bounded observation query. |

Generate a small set of automatic candidates such as W, 2W, and 4W, using widths and alignment supported by the deployed version. With effective positive max output size M, use an explicit heuristic target T, initially M/2, for useful output-file size; T is neither a server setting nor a promised result. For representative closed-bucket bytes B_typical, W × T/B_typical provides a rough candidate scale, not a precise forecast. Do not divide by zero or use active/incomplete buckets. Check candidates against observed sums of adjacent buckets, busier-region estimates, file count, and the input/resource budget. Compression and repeated rows can reduce output bytes. If M is unknown/unlimited, withhold an M-based recommendation until a meaningful target is established.

Prefer the smallest supported candidate with useful estimated file size and acceptable rewrite work. If the sampled candidates remain underfilled, say so; do not extrapolate to months or issue unbounded scans. Consider query time ranges, TTL/expiry behavior, late arrivals and region skew. A table-wide setting must account for busier regions, not only the smallest region. Preserve existing W when evidence does not justify a change.

Report **current W → recommended W (or keep/insufficient evidence)**, sample periods, N/B/average/small-file ratio, M/T, candidate-byte estimates, constraints and confidence. Show the arithmetic so the user can challenge it. Distinguish a future `compaction.twcs.time_window` configuration proposal from a historical SWCS rewrite: changing configuration does not prove existing SSTs were reorganized. Verify ALTER support, option inheritance and persisted runtime-window behavior for that version before generating configuration SQL; do not alter it automatically. Regular is not an arbitrary re-bucketing tool for an already established layout.

### Propose a future table-window change

Default to SQL for the user to execute. For a version supporting this option:

```sql
ALTER TABLE <schema>.<physical_table>
SET 'compaction.twcs.time_window' = '<recommended_duration>';

SHOW CREATE TABLE <schema>.<physical_table>;

SELECT region_id, node_id, compaction_time_window, region_options
FROM information_schema.region_info
WHERE table_id = <table_id>;
```

Render identifiers and duration from discovery, not arbitrary user string interpolation. Explain the previous explicit/inherited setting and the resulting table-wide scope, including other logical tables sharing a physical metric table. A region-only compaction request does not authorize a table-wide ALTER. Verify the actual runtime window after ALTER; a successful statement does not prove a historical rewrite or immediate replacement of an inferred persisted window. Keep ALTER and historical compaction as separate proposed actions, with separate execution authorization. Changing `max_output_file_size` is also a separate proposal; retain the effective value unless there is evidence to change it.

### Check memory before recommending execution

Estimate per hosting datanode, not from total cluster RAM. Record the effective container/cgroup memory limit (or verified host limit for a native process), current and recent peak usage, concurrent ingestion/query/flush/index work, and compaction jobs on that node. Use self-monitoring and deployment limits where available; `CLUSTER_INFO` is supporting evidence and its totals must be checked against cgroup limits. Do not substitute machine RAM for a smaller pod limit. Refresh measurements immediately before execution.

Collect memory from the **target**, never from the agent host. In default SQL-only mode, output the discovery/collection queries and request their results; endpoint access is not execution permission. With explicit read authorization:

1. Resolve region → leader/node using business-cluster REGION_INFO/REGION_PEERS, then inspect CLUSTER_INFO for node identity and reported memory. Confirm the deployed column names before selecting totals/usage.
2. Discover metric tables/labels on the supplied self-monitoring SQL endpoint or use its authorized Prometheus API. Match cluster, namespace, pod/container and node identity; account for restarts/migrations. Query a bounded recent interval for container usage/working-set and memory-limit metrics, reporting the chosen metric's semantics and sample timestamps. Process RSS and container usage are not interchangeable.
3. If limit metrics are unavailable, use separately authorized target Kubernetes access to inspect the relevant pod/container resource limit, or ask the operator to provide it. Do not assume access, guess kubectl context, read local `/proc` as remote evidence, or treat host-memory metrics as a pod limit. If container allocation is ambiguous or only a request (not limit) is known, keep L unknown.
4. For a local Docker test only, inspect the exact target container's configured limit and cgroup usage/peak, retaining its container ID. Cgroup lifetime peak is not a recent-window peak; label it and do not substitute it silently. Keep remote collection unvalidated if only this local fallback was tested.

Preserve measurement sources and node mapping in the report. Missing monitoring or permissions means generated collection instructions or operator-provided values, not automatic escalation to unrelated credentials. Missing/zero limits can mean unlimited or missing data; establish semantics before calculating H.

Let L be the effective memory limit, U recent peak relevant usage, and R a reserve for workload variation. As an explicit starting heuristic, reserve at least 25% of L, increasing it for observed bursts; H = max(0, L - U - R) is the remaining headroom. Do not subtract memory already included in U twice. Unknown L/U or a nonpositive H means no memory-based clearance. Return SQL for review with missing prerequisites rather than calling it safe to run.

For the candidate inputs, collect N, compressed SST bytes B, effective max output-file size M, and, when supported, `SUM(max_row_group_uncompressed_size)` as G. Add this numeric aggregate and a count of zero/NULL estimates to the existing bounded summary rather than exporting files or adding unbounded scans. Deduplicate shared inputs when needed. Current builds may estimate each merge unit by summing the maximum uncompressed row-group bytes of its inputs; verify deployed semantics. Zero/missing estimates on nonempty files are unknown, not free memory. G describes reader/merge demand, not all process allocations.

Compare estimated concurrent demand per node with H. Where inputs are known, use a stated safety margin (initially 2 × G), plus separately estimated writer/index/output buffers and work not already counted in U. Include manual table fan-out and automatic follow-ups; parallelism=1 is not a node-wide cap. Use measured pilot peaks to calibrate the next estimate. If only B is available, report B/H and a plausible decompression/overhead range supported by this workload's observations; do not invent a universal compressed-byte-to-RAM multiplier or use B < H as a safety proof. Without buffer/concurrency evidence, the estimate remains incomplete even if 2 × G fits.

M controls output file sizing, not a strict memory cap: row groups, decompression, indexes and writers consume memory independently, and multiple output files/units may be active. Compare B/M for output-count context, but do not treat M as a maximum buffer size or ceil(B/M) as a guarantee. Enlarging W can increase B, G and rewrite work; reject an attractive file-size recommendation if its estimated demand exceeds headroom. Prefer a smaller eligible batch or fewer concurrent regions; if TWCS/SWCS dependencies or unrestricted follow-ups prevent that reduction, withhold execution advice under a strict memory budget.

Check whether the deployed engine supports a compaction-memory budget and its current exhaustion policy (for example `experimental_compaction_memory_limit` and `experimental_compaction_on_exhausted`). These are server configuration, not ADMIN options, and need separate operator review. They can constrain estimated compaction allocations but are not a process RSS/OOM guarantee. Report memory as **insufficient**, **unknown**, or **headroom available under stated assumptions**, never “OOM-proof”. Monitor usage and failures during a pilot and pause subsequent submissions if headroom erodes; do not assume cancelling a client stops an already submitted compaction.

## 4. Choose the first compaction batch

Select the user's intended granularity explicitly:

| Scope | Supported command on the verified version | Limitation |
| --- | --- | --- |
| One region, regular strategy | `ADMIN COMPACT_REGION(<region_id>);` | Only region ID is accepted on current verified builds; no time range, SWCS, or per-call parallelism. Assess the region's full potential work and follow-ups. |
| Table, regular or SWCS | `ADMIN COMPACT_TABLE(...)` | Can select a time range where supported, but fans out to table regions and may trigger unrestricted follow-ups. |

Resolve the region's referring table and current leader first. For a region-scoped request, emit COMPACT_REGION only when unrestricted regular work on that region fits the assessed budget. If the user also requires time-bounded/SWCS region execution and that signature is unavailable, report the unsupported combination and propose the table alternative for review; never silently widen scope. A single-region table can use the table time-range interface after confirming it really has one region. Reuse the same before/after region and interval reports for either interface.

Prefer existing effective settings and automatic recommendations over a questionnaire of tuning knobs. Explain any heuristic threshold; it is not a server default.

1. Prefer closed historical windows with many small files and meaningful potential file reduction. Use the actual TWCS window as the initial unit. A narrower requested range still selects overlapping windows and cannot split an oversized regular-compaction bucket into a smaller input budget. Do not use the average file size alone: a long tail can be hidden by a few large files.
2. Let `M` be the effective positive output-size threshold and `B` the candidate bytes. `ceil(B / M)` is an optimistic sizing reference, not a guaranteed output count. Compute per region/window; compression, deduplication, partitioning and partial picks change the result. If `M` is zero/unlimited or unknown, do not divide by it or assume 512 MiB. Small-file thresholds such as `M / 8` are starting heuristics to adjust after seeing the distribution.
3. Bound **input bytes and file count**, not only elapsed calendar time. Choose a conservative pilot from the smaller useful historical windows and report its measured work estimate. A maximum output-file size is not a CPU, memory, or total rewrite budget. If no throughput/resource observations exist, do not claim a safe duration or hard resource cap.
4. Start with `regular` and low parallelism, usually 1, and one user-submitted batch at a time. Regular retains TWCS eligibility rules and may do no work; a single invocation need not drain a window. Repeated no-progress should lead to investigation, not blind resubmission.
5. `COMPACT_TABLE` targets the table's regions. Account for other affected regions and their leaders before treating one region's estimate as the command's cost. `parallelism=1` is not a cluster-wide concurrency cap. On versions where `COMPACT_REGION` accepts only a region ID, do not invent strategy/time-range arguments. If table fan-out exceeds the budget, report the targeting limitation instead of presenting a region-only plan as executable.
6. Consider SWCS for necessary layout reorganization or inadequate regular progress. `window` is the output time-window width; `start_time`/`end_time` select work. Smaller windows can increase output file count and read amplification. Cross-window SSTs cause transitive inclusion of dependent windows: repeated cuts of the requested range may not reduce the actual job. If expansion is unknown or too large, request more evidence and do not emit a supposedly bounded SWCS batch.

Verify automatic follow-up semantics as well as the initial manual pick. Some builds schedule an unrestricted automatic regular pick after a successful manual task; ADMIN can return before those follow-ups finish. In nightly commit `1c5d15fd3`, this was observed even with a long automatic-compaction interval and edit-trigger scheduling disabled. On affected versions, the requested time range and parallelism do not bound the entire resulting chain. State that limitation before offering execution, include possible region-wide work in the assessment, and withhold a claimed bounded batch if the user's resource budget requires strict isolation. Do not recommend undocumented settings as a workaround.

For SWCS, inspect only the required file IDs, sizes, and time bounds for the candidate closure, not full manifest rows. Deduplicate input files when summing work; files crossing windows must not be charged as independent files or assumed to distribute their bytes uniformly in time. Use the effective output-size option supported by that version; do not invent a `max_output_file_size` ADMIN argument or silently alter table/database defaults.

A suggested **regular** batch has this form:

```sql
ADMIN COMPACT_TABLE(
  '<schema>.<physical_table>',
  'regular',
  'parallelism=1,start_time=<start_utc>,end_time=<end_utc>'
);
```

Only after checking dependency expansion, an **SWCS** alternative has this form:

```sql
ADMIN COMPACT_TABLE(
  '<schema>.<physical_table>',
  'swcs',
  'window=<seconds>,parallelism=1,start_time=<start_utc>,end_time=<end_utc>'
);
```

Do not present these alternatives as two commands to execute sequentially. Return one recommended next action, its actual table/region scope, input estimate, expected benefit, uncertainty, and the corresponding verification SQL. Escape identifiers and string literals when rendering concrete commands.

## 5. Connect self-monitoring evidence to the batch

Request the self-monitoring endpoint if not already supplied; record its HTTP/SQL address and optional Prometheus address separately. Keep default user-executed mode. First give **self-monitoring-instance** discovery SQL:

```sql
SHOW TABLES FROM public;
DESCRIBE public._gt_logs;
```

Confirm the actual cluster/namespace labels, timestamp, message/error fields, and retention coverage. Discover metric tables and labels before generating metric SQL; do not assume that a Prometheus endpoint implies all metrics are SQL tables. If `_gt_logs` or metrics are unavailable, accept targeted operator logs or dashboard observations and clearly identify missing evidence.

Present the exact ADMIN SQL for review before execution. Have the user record submission/return timestamps, client elapsed time, server-reported execution time, returned result or error, intended windows, and region/node list. Report command round-trip time separately from observed task/background completion time; if completion is unknown, give the observation interval, not a fabricated duration. Search logs in a bounded **wall-clock execution interval**, not the historical SST data interval. For example, a compaction run today for July data needs today's operational logs.

After verifying these column names, adapt this query and render concrete bounds/labels for the user:

```sql
SELECT timestamp, pod, target, message, err
FROM public._gt_logs
WHERE timestamp >= '<execution_start_utc>'::TIMESTAMP
  AND timestamp < '<observation_end_utc>'::TIMESTAMP
  AND "cluster" = '<monitored_cluster>'
  AND namespace = '<namespace>'
  AND (
    lower(message) LIKE '%compact%'
    OR lower(err) LIKE '%compact%'
    OR lower(target) LIKE '%compaction%'
  )
ORDER BY timestamp
LIMIT 200;
```

This is evidence discovery, not a complete log export or proof of absence. Narrow to confirmed region/task/plan identifiers and relevant pods using structured fields where available. Otherwise match the deployed version's exact log format; a substring hit alone is not task identity. Split the observation range if the result reaches LIMIT, allow for ingest lag, and re-resolve leaders if ownership changes. Include INFO/WARN/ERROR; ERROR-only queries miss starts, success, deferral and no-op cases.

Useful signals to verify against the deployed version include `Compacted SST files`, `Successfully compacted region`, failed compaction, pending DDL, staging, and rescheduling messages. Correlate input/output counts and apply/completion events. File-production logs alone do not prove that the manifest edit was applied. A region-success event can describe one task rather than the entire requested table batch; automatic compaction can produce similar logs.

Attribute work using manual-request and scheduling events, matching task/region input/output evidence, and the surrounding flush/automatic timeline. For a controlled test, stop writes/flushes before the baseline, preserve a no-ADMIN control observation, and observe after the ADMIN returns. A long automatic-compaction interval does not disable completion-triggered follow-ups. Do not attribute all file reduction to the initial manual task.

Use available compaction request/failure counters, inflight gauges, stage/total duration, memory use, process CPU and object-store I/O to support the timeline. Candidate metric names include `greptime_mito_compaction_requests_total`, `greptime_mito_compaction_failure_total`, `greptime_mito_inflight_compaction_count`, and `greptime_mito_compaction_memory_in_use_bytes`; discover their labels and types first. Compare counter deltas with restart/reset handling. Node-wide counters, flat counters, or a zero inflight gauge alone cannot establish one batch's status.

Report status with evidence, using these distinctions:

| Status | Required interpretation |
| --- | --- |
| Submitted | User reports sending the command; retain its result and timestamps. |
| Started | Matching execution evidence for the intended region/task; receipt or queueing alone is insufficient. |
| Completed | Matching successful apply/completion evidence for the affected tasks/regions, or version-verified synchronous command semantics covering that scope. |
| No eligible work | Explicit picker/no-op evidence; distinguish from success with file reduction. |
| Deferred or failed | Matching staging/DDL/rescheduling/error evidence; state which regions remain unresolved. |
| Unknown/partial | Missing, truncated, delayed or ambiguous telemetry, or only some target regions accounted for. |

## 6. Report the result and choose the next batch

Always return a reviewable result, including failures and incomplete observations. Use these two compact tables; keep unavailable values as unknown, never invented zeroes:

| Per-region overview | Before | At ADMIN return | After observed completion / latest observation |
| --- | --- | --- | --- |
| Observation timestamp and manifest version | | | |
| Owned SST count / total bytes / average bytes | | | |
| Manifest total bytes / index bytes | | | |
| Effective TWCS window | | | |

| Selected region and data interval | Before | After | Change / interpretation |
| --- | --- | --- | --- |
| Visible referenced SST count / bytes / average | | | |
| Small-file count / fraction / threshold | | | |
| Boundary-crossing file count | | | |

Compute averages from each row's own bytes/count, not by averaging region averages. Report absolute and percentage changes where the baseline is nonzero. A missing before-manifest measurement means its change is unknown. A region-wide manifest size must not be presented as that interval's manifest size.

Alongside the tables provide current/recommended W and rationale; selected table/region scope; per-node L/U/R/H, input B/N/G, output limit M, concurrent-demand assumptions and memory assessment; exact SQL; client/server timings; manual-task status and any automatic follow-up status; log/metric evidence with wall-clock times; resource/ingestion impact; and the next recommended action. Preserve query text and raw results or their artifact paths so another engineer can investigate. SQL-only mode initially provides the report structure and asks for results rather than filling in guessed numbers.

Poll with a finite observation budget (initially up to two minutes, at most six polls spaced at least ten seconds apart), using cheap region statistics and targeted monitoring first. Adjacent immediate snapshots can all precede a follow-up and are not proof of finality. Stable counts are supporting evidence only; require matching completion semantics/events and account for delayed telemetry. If the budget expires, label the report partial and report ongoing/unresolved work. Do not run expensive manifest scans on every poll; reserve a same-scope summary for the final observation within a new explicit read budget.

Supply the same business-cluster summary SQL for before/after comparison, including the same time predicates, ownership and visibility rules. Record observation time and manifest version where available. Compare file counts, small-file counts, total bytes and boundary-spanning files, together with operational latency/CPU/memory and ingestion impact.

Separate **task completed** from **objective achieved**. Writes, TTL, automatic compaction, migrations and shared references can change counts independently; increasing manifest version or fewer SSTs alone does not prove this command finished. A successful task may leave substantial fragmentation. Manifest file bytes and object-store file counts can lag SST changes due to checkpoints, retention and GC; do not equate SUM(file_size) with manifest size or promise an immediate drop in manifest bytes.

Suggest the next batch only after the user returns results for the pilot. Reduce scope or pause recommendations on resource pressure, repeated failures, ambiguous completion, or concurrent DDL. Without self-monitoring, continue gathering before/after evidence but do not automatically expand batch size. Do not generate an unattended loop that submits all historical windows.

## References

Use documentation matching the user's release; current docs do not establish support in an older deployment.

- [Compaction](https://docs.greptime.com/user-guide/deployments-administration/manage-data/compaction/) — regular/SWCS, time ranges, window behavior and options.
- [ADMIN](https://docs.greptime.com/reference/sql/admin/) — table and region command signatures.
- [SSTS_MANIFEST](https://docs.greptime.com/reference/sql/information-schema/ssts-manifest/) — file ownership, time bounds and visibility.
- [REGION_STATISTICS](https://docs.greptime.com/reference/sql/information-schema/region-statistics/) — approximate owned SST counts/bytes and total manifest bytes.
- [REGION_INFO](https://docs.greptime.com/reference/sql/information-schema/region-info/) — runtime state, manifest version and compaction window.
- [CLUSTER_INFO](https://docs.greptime.com/reference/sql/information-schema/cluster-info/) — versions and topology; peer addresses are gRPC.
- [ALTER](https://docs.greptime.com/reference/sql/alter/) — table window and output-size settings.
- [SHOW](https://docs.greptime.com/reference/sql/show/) — effective table/database settings.
- [Key logs](https://docs.greptime.com/user-guide/deployments-administration/monitoring/key-logs/) — compaction evidence.
- [Self-monitoring deployment](https://docs.greptime.com/user-guide/deployments-administration/monitoring/cluster-monitoring-deployment/) — identify the monitoring instance and access paths.
