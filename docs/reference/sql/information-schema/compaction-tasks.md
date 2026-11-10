---
keywords: [compaction tasks, compaction progress, pending compaction, cancel compaction, INFORMATION_SCHEMA]
description: Inspect live region compaction tasks, their input files, time ranges, and options, and cancel a task by its ID.
---

# COMPACTION_TASKS

The `COMPACTION_TASKS` table shows live region-level compaction tasks, including automatic and manually requested work. Use it to identify queued or running tasks, inspect their inputs and options, and obtain the task ID for cancellation.

A region can have both an active task and a pending task. Completed, failed, and fully cancelled tasks disappear from the table; it does not retain task history. Results reflect live state and can change between queries.

```sql
DESC TABLE information_schema.compaction_tasks;
```

The output is as follows:

```sql
+-------------------+----------------------+-----+------+---------+---------------+
| Column            | Type                 | Key | Null | Default | Semantic Type |
+-------------------+----------------------+-----+------+---------+---------------+
| task_id           | String               |     | NO   |         | FIELD         |
| region_id         | UInt64               |     | NO   |         | FIELD         |
| table_id          | UInt32               |     | NO   |         | FIELD         |
| node_id           | UInt64               |     | YES  |         | FIELD         |
| trigger_type      | String               |     | NO   |         | FIELD         |
| state             | String               |     | NO   |         | FIELD         |
| phase             | String               |     | NO   |         | FIELD         |
| submitted_at      | TimestampMillisecond |     | NO   |         | FIELD         |
| elapsed_millis    | UInt64               |     | NO   |         | FIELD         |
| input_files       | UInt64               |     | YES  |         | FIELD         |
| input_bytes       | UInt64               |     | YES  |         | FIELD         |
| total_units       | UInt64               |     | YES  |         | FIELD         |
| completed_units   | UInt64               |     | YES  |         | FIELD         |
| request_options   | String               |     | NO   |         | FIELD         |
| effective_options | String               |     | YES  |         | FIELD         |
| input_time_start  | TimestampNanosecond  |     | YES  |         | FIELD         |
| input_time_end    | TimestampNanosecond  |     | YES  |         | FIELD         |
| output_time_start | TimestampNanosecond  |     | YES  |         | FIELD         |
| output_time_end   | TimestampNanosecond  |     | YES  |         | FIELD         |
+-------------------+----------------------+-----+------+---------+---------------+
Total rows: 19
Execution time: 1 ms
```

Fields in the `COMPACTION_TASKS` table are described as follows:

- `task_id`: The task UUID. It remains stable for the lifetime of the task. Use it with `region_id` to cancel that specific task.
- `region_id`: The physical region that owns the task.
- `table_id`: The physical table ID. Join with [`TABLES`](./tables.md) to find its name.
- `node_id`: The datanode reporting the task; `0` in standalone mode. For remote compaction, this is the reporting datanode, not the remote compactor.
- `trigger_type`: `automatic` or `manual`.
- `state`: `queued`, `running`, or `cancelling`. A cancellation request takes precedence when the state is aggregated across the task's work.
- `phase`: `waiting`, `planning`, `executing`, `committing`, or `remote`. If local work is in multiple phases, `committing` takes precedence over `executing`, then `waiting`.
- `submitted_at`: The time the task was accepted, with millisecond precision.
- `elapsed_millis`: Elapsed time since acceptance, including time spent waiting.
- `input_files`: The number of distinct SST files in the accepted plan, including expired files that will only be deleted. `NULL` before the plan is available.
- `input_bytes`: The total size in bytes of those input files. This is the planned input size, not bytes already processed.
- `total_units`: The number of local compaction units in the accepted plan. `NULL` when unavailable, including remote execution.
- `completed_units`: Local units that have reached a terminal result, including failures. This is not a count of successful outputs or a byte-level progress measure.
- `request_options`: A JSON string containing the request arguments, such as compaction type, requested parallelism, window size, and requested time range.
- `effective_options`: A JSON string containing resolved settings and plan information, such as TTL, merge mode, and the selected time window. `NULL` before this information is available.
- `input_time_start`: The earliest timestamp across the plan's input SSTs, inclusive. Includes expired SSTs.
- `input_time_end`: The latest timestamp across the plan's input SSTs, inclusive.
- `output_time_start`: The inclusive start of the planned output time range.
- `output_time_end`: The exclusive end of the planned output time range.

Input counts and time ranges describe the accepted plan after admission. They do not decrease as individual units complete. Time ranges are envelopes and can contain gaps. The output range is a planning constraint, not the actual bounds of the resulting SST files; regular compaction may leave it `NULL`. Use [`SSTS_MANIFEST`](./ssts-manifest.md) to inspect actual SST files.

A time endpoint is `NULL` when it is unknown, unbounded, or outside the representable nanosecond timestamp range. A `NULL` time range does not imply that the task has no input data.

## Examples

The following outputs were captured from a standalone instance during a manual strict-window compaction. Task IDs, region IDs, counts, and phases vary between runs. Run inspection queries from another client while compaction is active; a small task may finish before it can be observed.

### Inspect live tasks

In this example, the table `compaction_demo_lower` has ID `1026`. Use the table, region, and task IDs returned by your own instance.

```sql
SELECT task_id, region_id, node_id, state, phase
FROM information_schema.compaction_tasks
WHERE table_id = 1026
ORDER BY task_id;
```

```sql
+--------------------------------------+---------------+---------+---------+-----------+
| task_id                              | region_id     | node_id | state   | phase     |
+--------------------------------------+---------------+---------+---------+-----------+
| 627db742-f250-4883-bf97-099e77f02cf0 | 4406636445696 | 0       | running | executing |
+--------------------------------------+---------------+---------+---------+-----------+
Total rows: 1
Execution time: 14 ms
```

A `manual` task can originate from `ADMIN compact_region(...)` or `ADMIN compact_table(...)`. A table-wide request may produce tasks for multiple regions. The table also includes automatic compaction tasks.

### Inspect inputs and planned time ranges

```sql
SELECT input_files, input_bytes, total_units, completed_units
FROM information_schema.compaction_tasks
WHERE task_id = '627db742-f250-4883-bf97-099e77f02cf0';
```

```sql
+-------------+-------------+-------------+-----------------+
| input_files | input_bytes | total_units | completed_units |
+-------------+-------------+-------------+-----------------+
| 4           | 2974450     | 1           | 0               |
+-------------+-------------+-------------+-----------------+
Total rows: 1
Execution time: 9 ms
```

```sql
SELECT CAST(input_time_start AS STRING) AS input_time_start,
       CAST(input_time_end AS STRING) AS input_time_end,
       CAST(output_time_start AS STRING) AS output_time_start,
       CAST(output_time_end AS STRING) AS output_time_end
FROM information_schema.compaction_tasks
WHERE task_id = '627db742-f250-4883-bf97-099e77f02cf0';
```

```sql
+---------------------+-------------------------+---------------------+---------------------+
| input_time_start    | input_time_end          | output_time_start   | output_time_end     |
+---------------------+-------------------------+---------------------+---------------------+
| 1970-01-01T00:00:00 | 1970-01-01T00:04:09.999 | 1970-01-01T00:00:00 | 1970-01-01T01:00:00 |
+---------------------+-------------------------+---------------------+---------------------+
Total rows: 1
Execution time: 11 ms
```

The query casts timestamps to strings so the HTTP output displays readable dates. The input range includes both endpoints. The planned output range is half-open: `[output_time_start, output_time_end)`. It may extend beyond the requested range when strict-window compaction must preserve data from SSTs spanning multiple windows. See [manual compaction time ranges](/user-guide/deployments-administration/manage-data/compaction.md#limit-manual-compaction-to-a-time-range).

To inspect request arguments and resolved settings for a task, select `request_options` and `effective_options`. Both are JSON strings; they describe configuration, not continuously updated progress counters.

## Cancel a task

Use `ADMIN cancel_region_compaction(region_id, task_id)` with the IDs returned by this table. It follows the same permission checks as other [ADMIN functions](/reference/sql/admin.md).

```sql
ADMIN cancel_region_compaction(4406636445696, '627db742-f250-4883-bf97-099e77f02cf0');
```

```sql
+---------------------------------------------------------------------------------------+
| ADMIN cancel_region_compaction(4406636445696, '627db742-f250-4883-bf97-099e77f02cf0') |
+---------------------------------------------------------------------------------------+
| 1                                                                                     |
+---------------------------------------------------------------------------------------+
Total rows: 1
Execution time: 0 ms
```

The function returns:

- `1`: Cancellation was accepted, or the task is already cancelling. This does not mean it has finished exiting.
- `0`: No live task with that ID exists in the region. The region itself must exist.

A pending task can be cancelled without cancelling the active task. Cancelling an active task preserves other pending manual work unless a pending DDL operation takes precedence. A stale task ID cannot cancel a replacement task.

Cancellation is cooperative. It does not roll back committed work, and units that have already entered commit may still finish. A task that is too late to cancel returns an error. Remote compaction cancellation is not supported. Internal metric metadata-region tasks remain visible in this table, but cancelling them returns an unsupported-operation error before region routing. Cancellation does not disable subsequent automatic compaction for the region.

Query the same task ID again to check whether it has left the live task set:

```sql
SELECT COUNT(*) AS remaining_tasks
FROM information_schema.compaction_tasks
WHERE task_id = '627db742-f250-4883-bf97-099e77f02cf0';
```

```sql
+-----------------+
| remaining_tasks |
+-----------------+
| 0               |
+-----------------+
Total rows: 1
Execution time: 12 ms
```

A task can complete normally before the cancellation request arrives. Its disappearance alone does not distinguish completion from cancellation; this table contains no terminal status history.
