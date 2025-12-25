---
keywords: [GreptimeDB upgrade, upgrade example]
description: Introduce how to upgrade GreptimeDB to the latest version, including some incompatible changes and specific upgrade steps.
---

# Upgrade

## Overview

This guide provides upgrade instructions for GreptimeDB, including compatibility information and breaking changes for each version. Before upgrading, ensure you review the relevant breaking changes for your upgrade path.

For complete version history and feature additions, see the [Release Notes](/release-notes/).

## Upgrade Paths to v1.0

### From v0.16 to v1.0

If you are currently running v0.16, you can upgrade directly to v1.0. See [Upgrading from v0.16 to v1.0](#upgrading-from-v016-to-v10) for all relevant breaking changes.

### From v0.17 to v1.0

If you are currently running v0.17, you can upgrade directly to v1.0. See [Upgrading from v0.17 to v1.0](#upgrading-from-v017-to-v10) for breaking changes.

### From Earlier Versions

**Important:** This guide only covers upgrades from v0.16 and later versions.

If you are running a version earlier than v0.16, you must first upgrade to v0.16 by following the upgrade documentation for your current version. Once you have successfully upgraded to v0.16, you can then use this guide to upgrade to v1.0.

## Breaking Changes by Version

### Upgrading from v0.17 to v1.0

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
  [metric_engine]
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

Before upgrading to v1.0, complete the following checklist:

### Pre-Upgrade

- [ ] Review all breaking changes relevant to your upgrade path
- [ ] **Backup all data and configurations**
- [ ] Identify queries using ordered-set aggregate functions (if upgrading from v0.16 or earlier)
- [ ] Identify pipelines using `greptime_identity` with JSON data
- [ ] Check for usage of deprecated Jaeger HTTP header (if upgrading from v0.17 or earlier)
- [ ] Review metric tables if using Metric Engine

### Configuration Updates

- [ ] Update configuration files (remove deprecated cache settings)
- [ ] Update metric engine configuration if needed (`sparse_primary_key_encoding`)
- [ ] Update pipeline configurations (remove `flatten_json_object`, add `max_nested_levels` if needed)

### Code Updates

- [ ] Update SQL queries with ordered-set aggregates to use `WITHIN GROUP (ORDER BY ...)`
- [ ] Update SQL scripts using `---` comments to use `--`
- [ ] Update queries that access nested JSON fields to use dot notation
- [ ] Remove Jaeger header configuration if present

### Testing & Deployment

- [ ] Test the upgrade in a non-production environment
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
