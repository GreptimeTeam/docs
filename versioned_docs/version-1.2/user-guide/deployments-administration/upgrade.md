---
keywords: [GreptimeDB upgrade, upgrade example]
description: Introduce how to upgrade GreptimeDB to the latest version, including some incompatible changes and specific upgrade steps.
---

# Upgrade

## Overview

This guide provides upgrade instructions for GreptimeDB, including compatibility information and breaking changes for each version. Before upgrading, ensure you review the relevant breaking changes for your upgrade path.

For complete version history and feature additions, see the [Release Notes](/release-notes/).

## Upgrade Paths to v1.2

### From v1.0 or v1.1 to v1.2

If you are currently running v1.0 or v1.1, you can upgrade directly to v1.2.
Review [Upgrading from v1.0 or v1.1 to v1.2](#upgrading-from-v10-or-v11-to-v12)
and complete the related checks in the [Upgrade Checklist](#upgrade-checklist)
before the rollout.

### From v0.17 or Earlier

If you are upgrading to v1.2 from v0.17 or an earlier release, first review the
relevant v1.0 upgrade path below and then apply the
[v1.2 breaking changes](#upgrading-from-v10-or-v11-to-v12).

#### Check Metric Engine compaction settings

When upgrading from v0.17 to v1.2, check the compaction window of your Metric Engine
physical tables. v1.2 uses a one-day (`1d`) window unless you have explicitly set
one. This default helps queries over long time ranges, but switching from a
smaller window can trigger compaction of historical files and increase memory usage.
The window is not being re-inferred on each restart.

On an upgraded instance or a staging copy, use
[`information_schema.ssts_manifest`](/reference/sql/information-schema/ssts-manifest.md)
to inspect the files of your physical table. Replace the schema and table names
in these examples with your own:

```sql
SELECT s.region_id, s.table_id, s.file_id, s.level, s.file_size,
       s.index_file_size, s.num_rows, s.min_ts, s.max_ts
FROM information_schema.ssts_manifest s
JOIN information_schema.tables t ON s.table_id = t.table_id
WHERE t.table_schema = 'public'
  AND t.table_name = 'greptime_physical_table'
ORDER BY s.region_id, s.max_ts;
```

You can also summarize file sizes and counts for each region. Sizes are in bytes:

```sql
SELECT s.region_id, COUNT(*) AS file_count,
       SUM(s.file_size) AS total_bytes,
       AVG(s.file_size) AS avg_file_bytes,
       MAX(s.file_size) AS max_file_bytes
FROM information_schema.ssts_manifest s
JOIN information_schema.tables t ON s.table_id = t.table_id
WHERE t.table_schema = 'public'
  AND t.table_name = 'greptime_physical_table'
GROUP BY s.region_id;
```

Use the timestamp ranges to see how many files, and how much data, fall within a
candidate window. A larger window can help queries over longer time ranges, but
may bring more files into a compaction. Choose a window based on your existing
files and available memory, and test it with historical data before upgrading
production. `1h` is one option, not a requirement for every workload.

#### Keep the original compaction window

If you want to keep the original window, check the physical table's data-region
manifest **before upgrading**. For Metric Engine, the checkpoint path relative
to the configured storage root is:

```text
data/<catalog>/<schema>/<table_id>/<table_id>_<region_sequence:010>/data/manifest/<version:020>.checkpoint
```

The directory suffix is the region sequence padded to 10 digits, not the full
region ID. The checkpoint filename uses a manifest version padded to 20 digits.
For example, table `1024`, region sequence `0`, and checkpoint version `7` give:

```text
data/greptime/public/1024/1024_0000000000/data/manifest/00000000000000000007.checkpoint
```

Read `_last_checkpoint` in the same manifest directory to find the checkpoint
version. Download that checkpoint and read `checkpoint.compaction_time_window`:

```shell
jq -r '.checkpoint.compaction_time_window' 00000000000000000007.checkpoint
```

A checkpoint is a snapshot, so also check
later manifest entries for updates to `compaction_time_window`. A missing or null
value does not tell you which window to preserve.

Check each physical data region. If the regions use different windows, choose a
table-level window based on the SST distribution. Set your chosen window
explicitly on the physical table before upgrading. For example, to keep a
one-hour window:

```sql
ALTER TABLE public.greptime_physical_table
SET 'compaction.twcs.time_window' = '1h';
```

Replace the table name and duration with your own. Inspect the manifest to find
the value; use `ALTER TABLE` to change the setting.

#### Handle large files and compaction memory

The `experimental_compaction_memory_limit` setting relies on file metadata that
v0.17 SSTs do not contain. It cannot reliably account for those older files,
even after you upgrade. Do not rely on this setting alone to prevent compaction
from running out of memory while historical files remain.

If compaction runs out of memory while merging files that are several hundred MB
each, try a smaller compaction output file size, such as `128MB`. We recommend
keeping it above `50MB` to avoid producing too many small files:

```sql
ALTER TABLE public.greptime_physical_table
SET 'compaction.twcs.max_output_file_size' = '128MB';
```

This setting controls the size of files produced by compaction. It does not
immediately split existing files or limit the memory needed to merge them.

Metric Engine intentionally selects the Flat SST format even when
`default_flat_format = false`. Changing the format to `primary_key` is not the
recommended fix for this compaction memory issue.

If queries fail with `Too many files to read concurrently`, consider
[manual SWCS compaction](/user-guide/deployments-administration/manage-data/compaction.md#strict-window-compaction-strategy-swcs-and-manual-compaction)
to reorganize the files. For example, this uses a one-hour window and parallelism
of one:

```sql
ADMIN COMPACT_TABLE('public.greptime_physical_table', 'swcs', 'window=3600,parallelism=1');
```

SWCS adds compaction work and can read the same input file for multiple windows.
Test it with your data and allow enough memory and time for it to finish.

See the [maintainer's explanation in issue #9172](https://github.com/GreptimeTeam/greptimedb/issues/9172#issuecomment-5693460752)
for more background.

## Upgrade Paths to v1.0

### From v0.16 to v1.0

If you are currently running v0.16, you can upgrade directly to v1.0. See [Upgrading from v0.16 to v1.0](#upgrading-from-v016-to-v10) for all relevant breaking changes.

### From v0.17 to v1.0

If you are currently running v0.17, you can upgrade directly to v1.0. See [Upgrading from v0.17 to v1.0](#upgrading-from-v017-to-v10) for breaking changes.

### From Earlier Versions

**Important:** This guide only covers upgrades from v0.16 and later versions.

If you are running a version earlier than v0.16, you must first upgrade to v0.16 by following the upgrade documentation for your current version. Once you have successfully upgraded to v0.16, you can then use this guide to upgrade to v1.0.

## Breaking Changes by Version

### Upgrading from v1.0 or v1.1 to v1.2

#### Removed PromQL `holt_winters`

**Impact:** PromQL query parsing

The `holt_winters` name has been removed. It was an alias kept for backward
compatibility; the function itself is unchanged and remains available as
`double_exponential_smoothing`, which GreptimeDB supported before v1.2 as well.

**Action Required:**

- Search dashboards, recording rules, alert rules, and API callers for
  `holt_winters(`
- Rename each call to `double_exponential_smoothing(...)`. The arguments and
  the results are identical:

  ```promql
  # Before v1.2
  holt_winters(prom_series[10s], 0.5, 0.1)

  # v1.2 and later
  double_exponential_smoothing(prom_series[10s], 0.5, 0.1)
  ```

- Re-run the affected queries in a staging environment after the change

#### Rejected `fill`, `fill_left`, and `fill_right` PromQL Modifiers

**Impact:** PromQL compatibility tightening to avoid incorrect query plans

v1.2 upgrades the PromQL parser, which makes the binary-operator modifiers
`fill`, `fill_left`, and `fill_right` syntactically valid for the first time,
as in `metric_a + fill(0) metric_b`. GreptimeDB does not implement the
outer-join semantics they require, so it rejects them, whether used directly or
nested, rather than planning them as ordinary inner joins.

Earlier releases could not parse these modifiers at all, so no query that
worked before v1.2 is affected. This is also unrelated to the SQL
`RANGE ... FILL` clause, which is unchanged.

**Action Required:**

- Search PromQL expressions for `fill(`, `fill_left(`, and `fill_right(`
- Rewrite any affected query so it does not depend on these modifiers

#### Pipeline Integer Narrowing Now Uses `on_failure`

**Impact:** Pipeline type coercion correctness

When a pipeline converts an integral input or a numeric string into a declared
integer type that cannot represent it, the value no longer wraps with modulo
semantics. It now follows the transform's `on_failure` policy. Previously `-1`
written to `uint8` was stored as `255`, and `256` written to `int8` was stored
as `0`.

This applies to `int8`, `int16`, `int32`, `uint8`, `uint16`, and `uint32`, and
to cross-sign conversions into `int64` and `uint64`. Float-to-integer behavior
is unchanged in this release.

**Action Required:**

- Review pipelines that write into narrow integer targets, or that may write
  negative values into unsigned targets
- If those pipelines relied on wraparound behavior, widen the target type or
  configure an explicit `on_failure` policy before upgrading
- Use `POST /v1/pipelines/_dryrun` or representative staging data to verify
  that boundary values now produce the expected error, default, or null outcome

#### Local SQL File Access Is Now Sandboxed

**Impact:** `COPY` and external-table workflows that read or write local files

Standalone deployments now resolve local SQL file paths inside
`storage.copy_root` (default `<data_home>/copy`). Distributed deployments reject
local-file SQL access entirely.

**Action Required:**

- Identify `COPY` statements and external tables that reference local paths
- If you run standalone, move those files under the sandbox, set
  `storage.copy_root` to a dedicated directory, or switch the workflow to
  object storage
- If you run distributed services, migrate local-file workflows to S3, OSS,
  GCS, or AzBlob before upgrading
- Follow [Migrate Local SQL File Access](/user-guide/deployments-administration/migrate-local-sql-file-access.md)
  for the detailed migration procedure

#### Removed `sparse_primary_key_encoding` Configuration

**Impact:** Metric engine configuration cleanup

GreptimeDB now always uses sparse primary key encoding for metric tables, and
the `sparse_primary_key_encoding` option has been removed. A configuration file
that still sets the key loads without error; the key is ignored.

**Action Required:**

- Remove `sparse_primary_key_encoding` from the `[region_engine.metric]` block
  in your configuration files, Helm values, and automation templates. Drop the
  older `experimental_sparse_primary_key_encoding` key as well if it is still
  present.
- If you previously set `sparse_primary_key_encoding = false`, note that v1.2
  no longer provides an opt-out
- Restart a staging environment with the cleaned configuration to confirm your
  deployment no longer depends on the removed setting

### Upgrading from v0.17 to v1.0

#### Compact Metric Engine tables before upgrading

If your Metric Engine physical tables have many overlapping SST files or files
that span long time ranges, we recommend running
[SWCS compaction](/user-guide/deployments-administration/manage-data/compaction.md#strict-window-compaction-strategy-swcs-and-manual-compaction)
on v0.17 before upgrading to v1.0. This reorganizes historical files into the
chosen time windows and can reduce the number of files that queries need to read.

For example, to compact a physical table into one-hour windows on v0.17:

```sql
ADMIN COMPACT_TABLE('public.greptime_physical_table', 'swcs', '3600');
```

Replace the table name and window with your own. The third argument is the window
size in seconds; v0.17 does not support the newer `window=...,parallelism=...`
syntax. Run this on the physical table, not its logical tables.

SWCS can read the same file for multiple windows and consume substantial memory
and I/O. Schedule it when the instance has enough resources, monitor its progress,
and wait for it to finish before upgrading. It does not replace explicitly setting
`compaction.twcs.time_window` if you want to keep the same window after upgrading.
Files produced on v0.17 still lack the metadata used by the newer compaction memory
limit.

#### Jaeger HTTP Header Removal

**Impact:** HTTP header deprecation

The HTTP header `x-greptime-jaeger-time-range-for-operations` has been deprecated and removed.

**Action Required:**

- If you configured this header in your Jaeger data source or proxy, remove it from your configuration
- The header will no longer have any effect

#### Metric Engine Default Sparse Primary Key Encoding

**Impact:** Default configuration change with performance improvements

Metric Engine now enables **sparse primary key encoding** by default to improve storage efficiency and query performance for metric scenarios.

**Configuration Changes:**

- **NEW default:** `sparse_primary_key_encoding = true`
- **DEPRECATED:** `experimental_sparse_primary_key_encoding` (use `sparse_primary_key_encoding` instead)

**Action Required:**

- This change does not cause data format compatibility issues
- All metric tables will automatically use sparse encoding by default
- If you want to continue using the old encoding method, explicitly set:
  ```toml
  [[region_engine]]
  [region_engine.metric]
  sparse_primary_key_encoding = false
  ```

#### `greptime_identity` Pipeline JSON Behavior Change

**Impact:** JSON processing logic change

The JSON processing logic in `greptime_identity` pipeline has changed significantly:

**New Behavior:**

- Nested JSON objects are automatically flattened into separate columns using dot notation (e.g., `object.a`, `object.b`)
- Arrays are stored as JSON strings instead of JSON objects
- The `flatten_json_object` parameter has been removed
- A new `max_nested_levels` parameter controls flattening depth (default: 10 levels)
- When the depth limit is exceeded, remaining nested structures are serialized as JSON strings

**Action Required:**

1. Review your pipeline configurations that use `greptime_identity`
2. Remove any usage of the deprecated `flatten_json_object` parameter
3. Adjust queries that reference nested JSON fields to use the new dot notation
4. If you have deeply nested JSON (>10 levels), consider setting `max_nested_levels` appropriately

**Example:**

Before (v0.17):

```json
{ "user": { "name": "Alice", "age": 30 } }
```

Stored as a single JSON column.

After (v1.0):

```
user.name = "Alice"
user.age = 30
```

Stored as separate columns.

#### Metric Engine TSID Generation Algorithm Change

**Impact:** Time Series ID generation optimization with query implications

The TSID (Time Series ID) generation algorithm has been optimized by replacing `mur3::Hasher128` with the higher-performance `fxhash::FxHasher`, including a fast-path for series without NULL labels.

**Performance Improvements:**

- Regular scenarios: 5-6x faster
- Scenarios with NULL labels: ~2.5x faster

**Breaking Change Impact:**

This is a **breaking change** that affects time series identification:

- **Before upgrade (time < t):** Data uses the old algorithm to generate TSIDs
- **After upgrade (time > t):** Data uses the new algorithm to generate TSIDs

**Query Behavior:**

- Queries with time ranges that **span the upgrade time `t`** may experience slight discrepancies in time series matching near time `t`
- Queries with time ranges that **do not include `t`** are not affected

**Action Required:**

Choose one of the following upgrade strategies:

1. **Direct Upgrade (Recommended for most users):**
   - Accept minor query discrepancies near the upgrade time
   - Suitable if approximate results near the upgrade time are acceptable

2. **Export-Upgrade-Import (For zero tolerance):**
   - If you cannot accept any discrepancies, use this fully compatible upgrade method:
     1. Export all data before upgrading
     2. Upgrade to v1.0
     3. Import data back into the new version
   - Refer to [Backup & Restore Documentation](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-data/)

### Upgrading from v0.16 to v1.0

If you are upgrading from v0.16, you need to review:

1. **All breaking changes from v0.17 to v1.0** (listed above)
2. **v0.17.0 breaking changes** (listed below)

This ensures you're aware of all changes that occurred between v0.16 and v1.0.

### v0.17.0 Breaking Changes

#### Ordered-Set Aggregate Functions

**Impact:** SQL syntax change

Ordered-set aggregate functions now require a `WITHIN GROUP (ORDER BY …)` clause.

**Before:**

```sql
SELECT approx_percentile_cont(latency, 0.95) FROM metrics;
```

**After:**

```sql
SELECT approx_percentile_cont(0.95) WITHIN GROUP (ORDER BY latency) FROM metrics;
```

**Action Required:** Update all queries using ordered-set aggregate functions (`approx_percentile_cont`, `approx_percentile_cont_weight`, etc.) to include the `WITHIN GROUP (ORDER BY …)` clause.

#### MySQL Protocol Comment Styling

**Impact:** Comment syntax strictness

Incorrect comment styling is no longer allowed in MySQL protocol. Comments must start with `--` instead of `---`.

**Before:**

```sql
--- This is a comment
SELECT * FROM table;
```

**After:**

```sql
-- This is a comment
SELECT * FROM table;
```

**Action Required:** Update any SQL scripts or queries that use `---` style comments to use the standard `--` format.

## Additional v1.0 Changes (Non-Breaking)

### v1.0.0-beta.3

#### Cache Configuration Improvements

The cache architecture has been refactored for better performance:

**New Configuration:**

- `region_engine.mito.manifest_cache_size` (default: 256MB) - specialized manifest file cache

**Removed Configuration:**

- `storage.cache_path`
- `storage.enable_read_cache`
- `storage.cache_capacity`

**Action Required:** Update your configuration files to use the new `manifest_cache_size` setting and remove the deprecated storage cache options.

### v1.0.0-beta.2

#### Improved Database Compatibility

- Numeric type aliases aligned with PostgreSQL and MySQL standards
- Better PostgreSQL extended query support
- Improved MySQL binary protocol handling

**Action Required:** Test your applications to ensure compatibility with the improved behavior.

## Minimizing Business Impact During Upgrade

Before upgrading GreptimeDB, it is essential to perform a comprehensive backup of your data to safeguard against potential data loss. This backup acts as a safety measure in the event of any issues during the upgrade process.

### Best Practices

#### Rolling Upgrade

Utilize [rolling upgrades](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/) on Kubernetes to update GreptimeDB instances incrementally. This approach replaces old instances with new ones while maintaining service availability and minimizing downtime.

#### Automatic Retries

Configure client applications to enable automatic retries with exponential backoff. This helps handle temporary service interruptions gracefully.

#### Temporary Pause of Write Operations

For applications that can tolerate brief maintenance windows, consider pausing write operations during the upgrade to ensure data consistency.

#### Double Writing

Implement double writing to both the old and new versions of GreptimeDB, then switch to the new version once you have verified that it is functioning correctly. This allows you to verify data consistency and gradually redirect read traffic to the upgraded version.

## Upgrade Checklist

Before upgrading to your target version, complete the following checklist:

### Pre-Upgrade

- [ ] Review all breaking changes relevant to your upgrade path
- [ ] **Backup all data and configurations**
- [ ] If upgrading to v1.2, search PromQL assets for `holt_winters(`, `fill(`, `fill_left(`, and `fill_right(`
- [ ] If upgrading to v1.2, identify `COPY` workflows and external tables that reference local file paths
- [ ] If upgrading to v1.2, review pipelines that narrow values into `int8`/`int16`/`int32`/`uint8`/`uint16`/`uint32`, or that write negative values into unsigned targets
- [ ] Identify queries using ordered-set aggregate functions (if upgrading from v0.16 or earlier)
- [ ] Identify pipelines using `greptime_identity` with JSON data
- [ ] Check for usage of deprecated Jaeger HTTP header (if upgrading from v0.17 or earlier)
- [ ] Review metric tables if using Metric Engine
- [ ] Before upgrading from v0.17 to v1.0, consider SWCS compaction for physical tables with overlapping or long-span SST files, and wait for it to finish
- [ ] If upgrading from v0.17 to v1.2 with Metric Engine, record the original compaction windows and explicitly set the window you want to use

### Configuration Updates

- [ ] Update configuration files (remove deprecated cache settings)
- [ ] If upgrading to v1.0, update metric engine configuration if needed (`sparse_primary_key_encoding`)
- [ ] If upgrading to v1.2, remove the now-ignored `sparse_primary_key_encoding` and `experimental_sparse_primary_key_encoding` overrides
- [ ] Update pipeline configurations (remove `flatten_json_object`, add `max_nested_levels` if needed)
- [ ] If upgrading to v1.2 standalone deployments, set `storage.copy_root` if the default sandbox path does not fit your workflow

### Code Updates

- [ ] If upgrading to v1.2, rename PromQL `holt_winters(...)` calls to `double_exponential_smoothing(...)`
- [ ] If upgrading to v1.2, rewrite PromQL queries that use `fill`, `fill_left`, or `fill_right`
- [ ] If upgrading to v1.2, update pipelines that relied on integer wraparound and set an explicit `on_failure` policy when needed
- [ ] Update SQL queries with ordered-set aggregates to use `WITHIN GROUP (ORDER BY ...)`
- [ ] Update SQL scripts using `---` comments to use `--`
- [ ] Update queries that access nested JSON fields to use dot notation
- [ ] Remove Jaeger header configuration if present

### Testing & Deployment

- [ ] Test the upgrade in a non-production environment
- [ ] If upgrading from v0.17 to v1.2, test with historical SSTs and monitor memory usage, compaction progress, and query failures
- [ ] If upgrading to v1.2, dry-run representative pipeline inputs that hit integer boundaries and verify the expected `on_failure` result
- [ ] If upgrading to v1.2, validate the updated PromQL queries in staging
- [ ] If upgrading to v1.2, verify local-file `COPY` and external-table workflows after moving them into the sandbox or object storage
- [ ] Verify query results, especially for:
  - Ordered-set aggregate functions
  - Nested JSON data access
  - Metric queries (if affected by TSID change)
- [ ] Plan for rolling upgrade or maintenance window
- [ ] Prepare rollback plan in case of issues
- [ ] Monitor system behavior after upgrade

### Special Considerations for Metric Engine Users

If you cannot accept query discrepancies near the upgrade time due to TSID algorithm change:

- [ ] Plan for export-upgrade-import process
- [ ] Allocate sufficient time for data export and import
- [ ] Refer to [Backup & Restore Documentation](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-data/)
