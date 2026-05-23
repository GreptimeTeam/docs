# Signal Index

Use this index before generic `ERROR` / `WARN` aggregation. The index maps user-observed GreptimeDB Cluster symptoms to likely components, source modules, log keywords, metrics, and SQL filter hints.

Priority:

1. Match the user's incident description to this index.
2. If there is no direct match, inspect GreptimeDB source code first. Do not assume a user-local repository; follow [`../references.md`](../references.md), clone <https://github.com/GreptimeTeam/greptimedb> into a temporary source checkout, prefer the investigated GreptimeDB version, fall back to main when no matching version is available, or use remote source search when cloning is unavailable.
3. Use source findings such as error strings, tracing targets, source module names, and metric names to extend the query keywords.
4. Use generic `ERROR` / `WARN` aggregation only as a fallback or sanity check.

## How to use

For each user symptom:

- Identify likely component roles.
- Search `_gt_logs` fields such as `target`, `role`, `message`, and `err`.
- Check listed metrics if the corresponding tables exist in `public`.
- If still unclear, search listed source modules and exact strings in the GreptimeDB source.
- Use matched signals to rank candidate windows: symptom onset, buildup, failure peak, recovery, and post-recovery confirmation.

When source lookup is needed, search literal strings and metric names rather than broad natural-language phrases.

## Write / ingest failure

User descriptions:

- write failed
- insert timeout
- data cannot be written
- bulk insert failed
- Prometheus remote write failed
- region write rejected
- retry later
- leader not writable

Likely roles:

- `frontend`
- `datanode`
- `mito`
- `region worker`
- `operator`
- `servers`

Log keywords:

- `Failed to handle request`
- `Failed to insert data`
- `Retry later`
- `RegionId`
- `Leader(Writable)`
- `Partition expr version mismatch`
- `write reject`
- `handle write`
- `bulk insert`
- `Failed to open region`
- `Failed to catchup region`
- `Region not found, ignore it`
- `Failed to set region to ready`
- `Failed to insert data into flownode`
- `Failed to create table`
- `Failed to freeze the mutable memtable`
- `Failed to schedule flush job`
- `Failed to flush region`
- `Flush semaphore closed, flushing inline`
- `Failed to trigger flush`
- `Failed to flush regions in topic`

Metrics:

- `greptime_table_operator_ingest_rows`
- `greptime_table_operator_bulk_insert_message_rows`
- `greptime_datanode_handle_region_request_elapsed`
- `greptime_datanode_region_changed_row_count`
- `greptime_datanode_region_request_fail_count`
- `greptime_datanode_region_failed_insert_count`
- `greptime_mito_write_buffer_bytes`
- `greptime_mito_write_reject_total`
- `greptime_mito_write_rows_total`
- `greptime_mito_write_stage_elapsed_*`
- `greptime_mito_write_stall_total`
- `greptime_region_worker_handle_write_*`
- `greptime_grpc_region_request_*`
- `greptime_servers_bulk_insert_elapsed`
- `greptime_servers_http_prometheus_write_elapsed`
- `greptime_servers_prometheus_remote_write_samples`

Source modules:

- `src/operator/`
- `src/operator/src/insert.rs`
- `src/operator/src/bulk_insert.rs`
- `src/servers/src/grpc/`
- `src/servers/src/pending_rows_batcher.rs`
- `src/datanode/`
- `src/datanode/src/region_server.rs`
- `src/mito2/`
- `src/mito2/src/flush.rs`
- `src/meta-srv/src/region/flush_trigger.rs`
- `src/store-api/`
- `src/common/error/`

SQL filter hints:

```sql
WHERE (
  lower(message) LIKE '%failed to handle request%'
  OR lower(message) LIKE '%failed to insert data%'
  OR lower(message) LIKE '%bulk insert%'
  OR lower(message) LIKE '%handle write%'
  OR lower(err) LIKE '%retry later%'
  OR lower(err) LIKE '%leader%'
  OR lower(err) LIKE '%partition expr version mismatch%'
  OR lower(target) LIKE '%operator%'
  OR lower(target) LIKE '%region%'
  OR lower(target) LIKE '%mito%'
)
```

## Query failure or latency

User descriptions:

- query failed
- SQL timeout
- PromQL timeout
- MySQL/PostgreSQL query slow
- merge scan error
- high query latency
- memory rejected during query

Likely roles:

- `frontend`
- `query`
- `datanode`
- `mito`
- `servers`

Log keywords:

- `Failed to execute query`
- `Failed to parse SQL`
- `query`
- `scan`
- `merge scan`
- `timeout`
- `memory`
- `rejected`
- `push down`
- `Panic while creating physical plan`
- `Create physical plan, input plan`
- `Failed to push down plan, using fallback plan rewriter`
- `Merge scan one region`
- `Merge scan finish one region`
- `MergeScan partition`
- `Conflicting proved watermarks`
- `Table not found`
- `Missing timestamp column`
- `Invalid range`

Metrics:

- `greptime_frontend_grpc_handle_query_elapsed`
- `greptime_frontend_promql_query_metrics_elapsed`
- `greptime_servers_http_sql_elapsed`
- `greptime_servers_http_promql_elapsed`
- `greptime_servers_mysql_query_elapsed`
- `greptime_servers_postgres_query_elapsed`
- `greptime_servers_grpc_db_request_elapsed`
- `greptime_servers_http_requests_elapsed`
- `greptime_query_stage_elapsed`
- `greptime_query_merge_scan_regions`
- `greptime_query_merge_scan_errors_total`
- `greptime_push_down_fallback_errors_total`
- `greptime_query_memory_pool_usage_bytes`
- `greptime_query_memory_pool_rejected_total`
- `greptime_mito_read_stage_elapsed`
- `greptime_mito_scan_memory_exhausted_total`
- `greptime_mito_scan_requests_rejected_total`

Source modules:

- `src/frontend/`
- `src/query/`
- `src/query/src/datafusion.rs`
- `src/query/src/dist_plan/analyzer.rs`
- `src/query/src/dist_plan/merge_scan.rs`
- `src/query/src/metrics.rs`
- `src/servers/`
- `src/servers/src/http/prometheus.rs`
- `src/mito2/`
- `src/sql/`

SQL filter hints:

```sql
WHERE (
  lower(message) LIKE '%failed to execute query%'
  OR lower(message) LIKE '%failed to parse sql%'
  OR lower(message) LIKE '%merge scan%'
  OR lower(message) LIKE '%timeout%'
  OR lower(err) LIKE '%query%'
  OR lower(err) LIKE '%scan%'
  OR lower(err) LIKE '%memory%'
  OR lower(target) LIKE '%frontend%'
  OR lower(target) LIKE '%query%'
)
```

## Meta, heartbeat, election, and region migration

User descriptions:

- meta unavailable
- heartbeat lost
- no leader
- election issue
- region migration stuck
- region movement failed
- repartition failed
- procedure stuck

Likely roles:

- `metasrv`
- `datanode`
- `frontend`
- `flownode`
- `procedure`

Log keywords:

- `heartbeat`
- `Pusher not found`
- `election`
- `no leader`
- `step down`
- `region migration`
- `repartition`
- `procedure`
- `Failed to execute procedure`
- `Failed to wait region migration procedure`
- `Denied to renew region lease`
- `Starting region migration procedure`
- `Apply staging regions`
- `sync regions`
- `remap manifests`
- `Exit on malformed request: MissingRequestHeader`
- `Client disconnected: broken pipe`
- `Failed to handle heartbeat request`
- `Quit because it is no longer the leader`
- `Metasrv has no leader at this moment`
- `Leader lease expired`
- `Leader lease changed during election`
- `Metasrv election error`
- `RegionSupervisor has stop receiving heartbeat`
- `Failed to check maintenance mode`
- `Failed to downgrade region leader`
- `Failed to upgrade region`
- `Failed to submit region migration procedure`
- `Failed to execute region failover`
- `Deallocating regions for repartition`
- `Failed to persist region checkpoints`

Metrics:

- `greptime_meta_heartbeat_connection_num`
- `greptime_meta_heartbeat_rate`
- `greptime_meta_heartbeat_recv`
- `greptime_meta_handler_execute`
- `greptime_meta_kv_request_elapsed`
- `greptime_meta_txn_request_*`
- `greptime_meta_inactive_regions`
- `greptime_meta_region_migration_execute`
- `greptime_meta_region_migration_error`
- `greptime_meta_region_migration_fail`
- `greptime_meta_region_migration_stage_elapsed`
- `greptime_datanode_heartbeat_send_count`
- `greptime_datanode_heartbeat_recv_count`
- `greptime_last_received_heartbeat_lease_elapsed`
- `greptime_last_sent_heartbeat_lease_elapsed`
- `greptime_lease_expired_region`
- `greptime_heartbeat_region_leases`

Source modules:

- `src/meta-srv/`
- `src/meta-srv/src/service/heartbeat.rs`
- `src/meta-srv/src/error.rs`
- `src/meta-srv/src/metasrv.rs`
- `src/meta-srv/src/region/supervisor.rs`
- `src/meta-srv/src/handler/keep_lease_handler.rs`
- `src/meta-srv/src/handler/check_leader_handler.rs`
- `src/meta-srv/src/procedure/region_migration.rs`
- `src/meta-srv/src/procedure/region_migration/downgrade_leader_region.rs`
- `src/meta-srv/src/procedure/region_migration/upgrade_candidate_region.rs`
- `src/meta-srv/src/procedure/repartition.rs`
- `src/meta-srv/src/procedure/repartition/group.rs`
- `src/meta-srv/src/procedure/repartition/deallocate_region.rs`
- `src/common/meta/`
- `src/meta-client/`
- `src/datanode/`
- `src/store-api/`
- `src/flow/src/heartbeat.rs`

SQL filter hints:

```sql
WHERE (
  lower(message) LIKE '%heartbeat%'
  OR lower(message) LIKE '%pusher not found%'
  OR lower(message) LIKE '%region migration%'
  OR lower(message) LIKE '%repartition%'
  OR lower(message) LIKE '%procedure%'
  OR lower(message) LIKE '%step down%'
  OR lower(message) LIKE '%staging region%'
  OR lower(message) LIKE '%remap manifest%'
  OR lower(err) LIKE '%no leader%'
  OR lower(target) LIKE '%meta%'
  OR lower(target) LIKE '%procedure%'
)
```

## Object storage, WAL, and log store

User descriptions:

- S3 or object storage timeout
- file not found
- WAL or log store error
- Kafka remote WAL issue
- upload/download slow
- persistent storage failure

Likely roles:

- `datanode`
- `mito`
- `logstore`
- `opendal`
- `metasrv` for remote WAL metadata

Log keywords:

- `opendal`
- `TimedOut`
- `NotFound`
- `write close failed`
- `send http request`
- `Persistent`
- `logstore`
- `remote wal`
- `kafka`
- `manifest`
- `upload`
- `download`
- `OpenDAL operator failed`
- `Failed to init backend`
- `Failed to build http client`
- `Failed to create directory`
- `Failed to remove directory`
- `Skipping SSL validation`
- `Retry after`

Metrics:

- `opendal_operation_errors_total`
- `opendal_operation_duration_seconds_*`
- `opendal_http_connection_errors_total`
- `opendal_http_status_errors_total`
- `greptime_logstore_op_elapsed`
- `greptime_logstore_op_bytes_total`
- `greptime_logstore_kafka_client_bytes_total`
- `greptime_logstore_kafka_client_traffic_total`
- `greptime_logstore_kafka_client_produce_elapsed`
- `greptime_manifest_op_elapsed`
- `greptime_meta_remote_wal_prune_execute`

Source modules:

- `src/log-store/`
- `src/object-store/src/factory.rs`
- `src/object-store/src/util.rs`
- `src/object-store/src/error.rs`
- `src/object-store/src/layers.rs`
- `src/mito2/`
- `src/meta-srv/`
- `src/common/meta/`
- `src/store-api/`

SQL filter hints:

```sql
WHERE (
  lower(message) LIKE '%opendal%'
  OR lower(message) LIKE '%logstore%'
  OR lower(message) LIKE '%remote wal%'
  OR lower(message) LIKE '%kafka%'
  OR lower(message) LIKE '%manifest%'
  OR lower(message) LIKE '%upload%'
  OR lower(message) LIKE '%download%'
  OR lower(err) LIKE '%timedout%'
  OR lower(err) LIKE '%notfound%'
  OR lower(err) LIKE '%send http request%'
  OR lower(target) LIKE '%opendal%'
  OR lower(target) LIKE '%logstore%'
)
```

## Compaction, flush, manifest, and GC

User descriptions:

- compaction stuck
- flush failed
- manifest update failed
- too many SSTs
- write stalls during flush
- GC failed
- file cleanup issue

Likely roles:

- `datanode`
- `mito`
- `region worker`
- `metasrv` for GC or migration coordination

Log keywords:

- `compaction`
- `flush`
- `manifest`
- `does not permit manifest updates`
- `Successfully flush memtables`
- `Compacted SST files`
- `Closing staled region`
- `gc`
- `cleanup region repartition`
- `staging manifest`
- `Failed to compact memtable before flush`
- `Applying ... to region`
- `Successfully update manifest version`
- `Skipping compaction for region ... in staging mode`
- `manually compaction will be re-scheduled`
- `Failed to continue pending manual compaction`
- `Failed to schedule next compaction`
- `Failed to create RegionOptions from map`

Metrics:

- `greptime_mito_flush_requests_total`
- `greptime_mito_flush_failure_total`
- `greptime_mito_flush_elapsed`
- `greptime_mito_flush_bytes_total`
- `greptime_mito_inflight_flush_count`
- `greptime_mito_compaction_requests_total`
- `greptime_mito_compaction_failure_total`
- `greptime_mito_compaction_stage_elapsed`
- `greptime_mito_compaction_total_elapsed`
- `greptime_mito_inflight_compaction_count`
- `greptime_mito_compaction_memory_in_use_bytes`
- `greptime_mito_compaction_memory_rejected_total`
- `greptime_mito_compaction_memory_limit_bytes`
- `greptime_mito_compaction_memory_wait_seconds`
- `greptime_mito_flush_file_total`
- `greptime_manifest_op_elapsed`
- `greptime_mito_gc_errors_total`
- `greptime_mito_gc_duration_seconds`
- `greptime_metasrv_gc_failed_regions_total`

Source modules:

- `src/mito2/`
- `src/mito2/src/flush.rs`
- `src/mito2/src/compaction.rs`
- `src/mito2/src/metrics.rs`
- `src/datanode/`
- `src/meta-srv/src/gc/`
- `src/store-api/`

SQL filter hints:

```sql
WHERE (
  lower(message) LIKE '%compaction%'
  OR lower(message) LIKE '%flush%'
  OR lower(message) LIKE '%manifest%'
  OR lower(message) LIKE '%staled region%'
  OR lower(message) LIKE '%gc%'
  OR lower(message) LIKE '%cleanup region repartition%'
  OR lower(err) LIKE '%does not permit manifest updates%'
  OR lower(target) LIKE '%mito%'
  OR lower(target) LIKE '%region%'
)
```

## OpenTelemetry, logs, Loki, Elasticsearch, and Prometheus ingest

User descriptions:

- OTLP traces missing
- OTLP logs missing
- metrics remote write failed
- Loki logs ingest issue
- Elasticsearch logs ingest issue
- logs ingestion latency
- spans rejected
- chunks discarded

Likely roles:

- `frontend`
- `servers`
- `operator`
- `pipeline`
- `flow` when downstream computation is involved

Log keywords:

- `otlp`
- `trace`
- `logs ingestion`
- `prometheus`
- `remote write`
- `span_rejected`
- `discard_chunk`
- `loki`
- `elasticsearch`
- `pipeline`
- `transform`
- `UnsupportedJsonContentType`
- `Failed to decode OTLP request`
- `failed to widen trace columns before insert`
- `failed to coerce trace column`
- `Trace ingest failure message limit reached`
- `Failed to ingest metrics from otel-arrow`
- `failed to insert pipeline`
- `failed to delete pipeline`
- `stream is not an object`
- `missing lines on stream`
- `line is too short`
- `missing or invalid timestamp`
- `failed to parse loki labels`
- `Native histograms are not supported yet, data ignored`
- `Find metric name matchers`
- `Updated promql`
- `Failed to handle mysql query`
- `Failed to handle postgres query`
- `Failed to get trace`
- `Failed to find traces`

Metrics:

- `greptime_frontend_otlp_metrics_rows`
- `greptime_frontend_otlp_traces_rows`
- `greptime_frontend_otlp_traces_failure_count`
- `greptime_frontend_otlp_logs_rows`
- `greptime_servers_http_otlp_metrics_elapsed`
- `greptime_servers_http_otlp_traces_elapsed`
- `greptime_servers_http_otlp_logs_elapsed`
- `greptime_servers_http_logs_ingestion_counter`
- `greptime_servers_http_logs_ingestion_elapsed`
- `greptime_servers_loki_logs_ingestion_counter`
- `greptime_servers_loki_logs_ingestion_elapsed`
- `greptime_servers_elasticsearch_logs_ingestion_elapsed`
- `greptime_servers_elasticsearch_logs_docs_count`
- `greptime_servers_http_logs_transform_elapsed`
- `greptime_servers_http_prometheus_write_elapsed`
- `greptime_servers_http_prometheus_read_elapsed`
- `greptime_servers_http_prometheus_promql_elapsed`
- `greptime_servers_http_prometheus_codec_elapsed`
- `greptime_servers_prometheus_remote_write_samples`
- `greptime_servers_http_requests_total`
- `greptime_servers_grpc_requests_total`
- `greptime_servers_grpc_db_request_elapsed`
- `greptime_servers_error`
- `greptime_servers_http_influxdb_write_elapsed`
- `greptime_servers_jaeger_query_elapsed`
- `greptime_prom_store_pending_rows`
- `greptime_pending_rows_flush_failures`
- `greptime_pipeline_create_duration_seconds`
- `greptime_pipeline_delete_duration_seconds`
- `greptime_pipeline_retrieve_duration_seconds`
- `greptime_pipeline_table_find_count`

Source modules:

- `src/frontend/`
- `src/frontend/src/instance/otlp.rs`
- `src/servers/`
- `src/servers/src/http/otlp.rs`
- `src/servers/src/otel_arrow.rs`
- `src/servers/src/http/event.rs`
- `src/servers/src/http/loki.rs`
- `src/servers/src/http/prometheus.rs`
- `src/servers/src/http/influxdb.rs`
- `src/servers/src/http/jaeger.rs`
- `src/servers/src/prom_remote_write/`
- `src/servers/src/prom_remote_write/decode.rs`
- `src/pipeline/`
- `src/operator/`

SQL filter hints:

```sql
WHERE (
  lower(message) LIKE '%otlp%'
  OR lower(message) LIKE '%trace%'
  OR lower(message) LIKE '%logs ingestion%'
  OR lower(message) LIKE '%remote write%'
  OR lower(message) LIKE '%span_rejected%'
  OR lower(message) LIKE '%discard_chunk%'
  OR lower(message) LIKE '%loki%'
  OR lower(message) LIKE '%elasticsearch%'
  OR lower(message) LIKE '%pipeline%'
  OR lower(target) LIKE '%frontend%'
  OR lower(target) LIKE '%servers%'
)
```

## Flow creation or runtime issue

User descriptions:

- flow creation failed
- continuous aggregation stopped
- materialized view stale
- flow lag
- flow flush failed
- flownode heartbeat issue

Likely roles:

- `flownode`
- `flow`
- `metasrv`
- `frontend`

Log keywords:

- `flow`
- `CreateFlow`
- `Failed to handle flow request`
- `Failed to recover flows`
- `Failed to check flow consistent`
- `Failed to execute query for flow`
- `No frontend is available`
- `flownode heartbeat`
- `Flow missing`
- `flush flow`

Metrics:

- `greptime_flow_task_count`
- `greptime_flow_input_buf_size`
- `greptime_flow_insert_elapsed`
- `greptime_flow_batching_engine_query_time_secs`
- `greptime_flow_batching_engine_slow_query_secs`
- `greptime_flow_batching_engine_query_window_cnt`
- `greptime_flow_batching_engine_query_window_size_secs`
- `greptime_flow_batching_start_query_count`
- `greptime_flow_batching_error_count`
- `greptime_flow_processed_rows`
- `greptime_flow_processing_time`
- `greptime_flow_errors`
- `greptime_meta_procedure_create_flow`
- `greptime_meta_procedure_drop_flow`

Source modules:

- `src/flow/`
- `src/meta-srv/`
- `src/common/meta/`
- `src/frontend/`

SQL filter hints:

```sql
WHERE (
  lower(message) LIKE '%flow%'
  OR lower(message) LIKE '%createflow%'
  OR lower(message) LIKE '%failed to handle flow request%'
  OR lower(message) LIKE '%failed to recover flows%'
  OR lower(message) LIKE '%failed to check flow consistent%'
  OR lower(message) LIKE '%no frontend is available%'
  OR lower(target) LIKE '%flow%'
  OR lower(target) LIKE '%flownode%'
)
```

## Panic, crash, restart, or process health issue

User descriptions:

- pod restarted
- component crashed
- panic
- OOM
- process killed
- memory limit hit
- startup failed

Likely roles:

- all roles; prioritize the role mentioned by the user or pod name

Log keywords:

- `panicked at`
- `panic`
- `oom`
- `out of memory`
- `memory limit`
- `Receiver dropped`
- `shutdown`
- `started`
- `stopped`
- `Failed to start`

Metrics:

- `greptime_panic_counter`
- `greptime_memory_limit_in_bytes`
- `greptime_cgroups_memory_usage_bytes`
- `greptime_servers_request_memory_in_use_bytes`
- `greptime_servers_request_memory_limit_bytes`
- `greptime_servers_request_memory_rejected_total`
- `greptime_query_memory_pool_usage_bytes`
- `greptime_query_memory_pool_rejected_total`
- `process_*`

Source modules:

- `src/common/telemetry/`
- `src/cmd/`
- `src/common/stat/`
- component source directory matching the affected role

SQL filter hints:

```sql
WHERE (
  lower(message) LIKE '%panic%'
  OR lower(message) LIKE '%panicked at%'
  OR lower(message) LIKE '%oom%'
  OR lower(message) LIKE '%out of memory%'
  OR lower(message) LIKE '%memory limit%'
  OR lower(message) LIKE '%shutdown%'
  OR lower(message) LIKE '%failed to start%'
  OR lower(err) LIKE '%panic%'
  OR lower(err) LIKE '%memory%'
)
```

## Metric label hints

When metric tables exist in `public`, group by these labels to separate the affected operation or failure mode. Always inspect the table schema first because label columns can vary by version and deployment.

| Metric table | Useful labels |
|---|---|
| `greptime_meta_kv_request_elapsed` | `target`, `op` |
| `greptime_meta_handler_execute` | `name` |
| `greptime_meta_region_migration_error` | `state`, `error_type` |
| `greptime_meta_region_migration_stage_elapsed` | `stage` |
| `greptime_meta_heartbeat_recv` | `pusher_key` |
| `greptime_mito_flush_requests_total` | `reason` |
| `greptime_mito_flush_elapsed` | `type` |
| `greptime_mito_compaction_stage_elapsed` | `stage` |
| `greptime_mito_compaction_memory_rejected_total` | `type` |
| `greptime_query_stage_elapsed` | `stage` |
| `greptime_table_operator_handle_bulk_insert` | `stage` |
| `greptime_servers_http_requests_total` | `method`, `path`, `code`, `db` |
| `greptime_servers_grpc_requests_total` | `path`, `code` |
| `greptime_servers_grpc_db_request_elapsed` | `db`, `type`, `code` |
| `greptime_servers_http_logs_ingestion_elapsed` | `result` |
| `greptime_servers_loki_logs_ingestion_elapsed` | `result` |
| `greptime_servers_http_prometheus_codec_elapsed` | `type` |
| `greptime_servers_error` | `protocol` |
| `greptime_frontend_otlp_traces_failure_count` | `label` |

Template:

```sql
SELECT
  date_trunc('minute', greptime_timestamp) AS minute,
  <label_columns>,
  count(*) AS samples
FROM <metric_table>
WHERE greptime_timestamp >= '<start_utc>'
  AND greptime_timestamp < '<end_utc>'
GROUP BY minute, <label_columns>
ORDER BY minute, samples DESC;
```
