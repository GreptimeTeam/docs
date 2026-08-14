---
keywords: [Iceberg, REST catalog, pyiceberg, Spark, parquet, data export, open table format]
description: Read GreptimeDB tables through an Apache Iceberg REST catalog with pyiceberg, Spark, Trino, DuckDB, and other engines — no connector or data copy required.
---

# Iceberg Export

GreptimeDB Enterprise can expose its tables through an [Apache Iceberg](https://iceberg.apache.org/) REST catalog,
so external query engines — pyiceberg, Spark, Trino, DuckDB, and any other Iceberg-compatible client — can read
GreptimeDB data directly from object storage using standard Iceberg APIs.

This is a **read-only export**, not a copy or a dual-write. GreptimeDB keeps writing data the way it always has;
the Iceberg integration simply publishes the metadata that lets other engines find and interpret those same files.

## How it works

The key idea is that GreptimeDB already stores its SST (sorted string table) data files as Parquet in object storage.
The Iceberg integration does **not** re-write, duplicate, or export the data. Instead it publishes Iceberg
**metadata** — manifests, manifest-lists, and table-metadata snapshots — that point at the existing Parquet files.
Any engine that speaks Iceberg can then read those files through the REST catalog.

This is split across the GreptimeDB processes you already run:

- **Datanode / standalone (the writer).** Whenever SST files are written — on flush, compaction, bulk ingestion,
  and truncate — GreptimeDB translates the live set of Parquet files into Iceberg manifest entries and commits a
  new Iceberg snapshot. The Iceberg metadata is written under a `warehouse_root` prefix inside the same
  object-storage bucket the datanode already uses.
- **Frontend (the catalog server).** It implements the [Iceberg REST Catalog API](https://iceberg.apache.org/docs/1.6.0/api/#rest-catalog-specification),
  mounted at `/v1/iceberg`, and serves each table's current metadata to clients.

Because the data files are never duplicated, there is no extra storage cost and no write-path duplication — the
export is pure metadata laid down beside the data GreptimeDB already writes.

### How GreptimeDB concepts map to Iceberg

| GreptimeDB | Iceberg |
| ---------- | ------- |
| Schema (database, e.g. `public`) | Namespace |
| Table | Table |
| Column | Field |
| Time index column | A `timestamptz` field |

Schema changes from `ALTER TABLE` (added / renamed / dropped columns) are reflected in the Iceberg schema without
any restart.

### Type mapping

GreptimeDB column types map to Iceberg types as follows:

| GreptimeDB type | Iceberg type |
| --------------- | ------------ |
| `boolean` | `boolean` |
| `int8`, `int16`, `int32`, `uint8`, `uint16` | `int` |
| `uint32`, `int64`, `uint64` | `long` |
| `float32` | `float` |
| `float64` | `double` |
| `string` | `string` |
| `binary` | `binary` |
| `date` | `date` |
| `timestamp` (any precision) | `timestamptz` |
| Prometheus native histogram (struct) | `struct` (with `list` sub-fields) |
| `list`, `dictionary`, `json`, `interval`, `duration`, `time`, arbitrary `struct` | `string` (lossy fallback) |

## Configuration

The Iceberg integration is an enterprise plugin. Enable it by adding an `iceberg_manifest` entry to the `[[plugins]]`
section of **both** the data-writing process (datanode or standalone) **and** the frontend:

- The **datanode / standalone** runs the writer hook that publishes Iceberg metadata.
- The **frontend** runs the REST catalog that serves it.

Both must reference the **same** `warehouse_root` so the catalog reads exactly the metadata the writer publishes.

```toml
## Iceberg manifest export publishes Iceberg-format metadata (snapshots,
## manifests, manifest-lists) so external engines (pyiceberg, Spark, Trino,
## DuckDB, ...) can read GreptimeDB tables through the Iceberg REST catalog.
[[plugins]]
iceberg_manifest = { warehouse_root = "iceberg_warehouse" }
```

The options are:

| Option | Default | Description |
| ------ | ------- | ----------- |
| `warehouse_root` | `"iceberg_warehouse"` | Path prefix, inside the datanode's object-storage bucket, where Iceberg metadata is stored. |
| `enable_incremental` | `true` | When `true` (the default), a new snapshot is published automatically on every flush / compaction / truncate. Set `false` to disable automatic publication and generate metadata on demand through the rebuild interface instead; drop/GC cleanup still runs. |

The `warehouse_root` is a path prefix inside the object-storage bucket GreptimeDB already uses, folded into the
store's `root` (e.g. `s3://<bucket>/<root>/<warehouse_root>/`).

The supported object-storage backends are S3, OSS, GCS, and Azure Blob.

Once enabled, the REST catalog is available at:

```
http://<frontend-http-host>:<port>/v1/iceberg
```

For example, with a frontend listening on the default HTTP port `4000`, the catalog base URI is
`http://localhost:4000/v1/iceberg` and the warehouse name is `greptime` (the default).

## Make a table readable

GreptimeDB publishes Iceberg metadata on flush, so the export of newly-written data appears after the next flush
(or compaction). To expose freshly-ingested rows immediately, flush the table manually:

```sql
-- via the MySQL or PostgreSQL protocol
admin flush_table('your_table');
```

The metadata is published asynchronously; the table becomes queryable through the REST catalog shortly after the
flush returns. Existing, already-flushed tables are exported automatically.

## Reading with pyiceberg

This example uses [pyiceberg](https://py.iceberg.apache.org/) with pyarrow to read a GreptimeDB table through the
REST catalog. You will need `pyiceberg` and `pyarrow` installed, plus credentials for the object storage that backs
your GreptimeDB deployment (S3 is shown here).

```python
from pyiceberg.catalog.rest import RestCatalog

# The REST catalog endpoint exposed by the GreptimeDB frontend.
# `warehouse` is the catalog name (the default catalog is "greptime").
catalog = RestCatalog(
    name="greptime",
    uri="http://localhost:4000/v1/iceberg",
    prefix="greptime",
    # Object-storage credentials so pyiceberg can read the Parquet data files.
    # Match the backend your GreptimeDB deployment uses.
    **{
        "s3.endpoint": "https://s3.us-east-1.amazonaws.com",
        "s3.access-key-id": "YOUR_ACCESS_KEY",
        "s3.secret-access-key": "YOUR_SECRET_KEY",
        "s3.region": "us-east-1",
    },
)

# List namespaces (= GreptimeDB schemas) and tables.
print(catalog.list_namespaces())        # e.g. [('greptime', 'public')]
print(catalog.list_tables("public"))    # e.g. [('public', 'my_table')]

# Load a table and scan it with pyarrow.
table = catalog.load_table(("public", "my_table"))
print(table.schema())                   # the Iceberg schema (GreptimeDB columns → fields)

arrow_table = table.scan().to_arrow()
print(arrow_table.num_rows, "rows")
print(arrow_table.to_pandas().head())
```

## Reading with Spark

This example configures Spark SQL to use the GreptimeDB Iceberg REST catalog and run queries over a GreptimeDB
table. You need the Iceberg Spark runtime and the AWS bundle JARs on the Spark classpath (versions must match your
Spark/Scala version — Spark 4.x with Iceberg 1.11.0 is shown).

**1. `spark-defaults.conf`**

```properties
spark.sql.extensions                        org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions
spark.sql.defaultCatalog                    greptime
spark.sql.catalog.greptime                  org.apache.iceberg.spark.SparkCatalog
spark.sql.catalog.greptime.type             rest
spark.sql.catalog.greptime.uri              http://localhost:4000/v1/iceberg
spark.sql.catalog.greptime.warehouse        greptime
# S3FileIO reads the Parquet data files from the same object storage GreptimeDB uses.
spark.sql.catalog.greptime.io-impl          org.apache.iceberg.aws.s3.S3FileIO
spark.sql.catalog.greptime.client.region    us-east-1
spark.sql.catalog.greptime.s3.endpoint      https://s3.us-east-1.amazonaws.com
spark.sql.catalog.greptime.s3.path-style-access false
spark.sql.catalog.greptime.s3.access-key-id     YOUR_ACCESS_KEY
spark.sql.catalog.greptime.s3.secret-access-key YOUR_SECRET_KEY
```

Start `spark-sql` (or a `spark-submit` job) with the two Iceberg JARs on the classpath:

```bash
spark-sql \
  --conf spark.sql.extensions=org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions \
  --jars iceberg-spark-runtime-4.1_2.13-1.11.0.jar,iceberg-aws-bundle-1.11.0.jar
```

For an S3-compatible store with a custom endpoint and path-style addressing (for example MinIO, Garage, or a local
test deployment), set `spark.sql.catalog.greptime.s3.endpoint` to the store URL and
`spark.sql.catalog.greptime.s3.path-style-access true`.

**2. Create and populate a table in GreptimeDB**

Connect to GreptimeDB over the MySQL or PostgreSQL protocol and create a table, then flush it so the Iceberg
metadata is published:

```sql
CREATE TABLE demo (
  ts      TIMESTAMP(6) NOT NULL,   -- TIME INDEX
  host    STRING,
  region  STRING,
  cpu     DOUBLE,
  mem     FLOAT,
  status  INT,
  TIME INDEX (ts)
);

INSERT INTO demo VALUES
  ('2024-01-01 00:00:00', 'h1', 'us', 12.5, 4096.0, 200),
  ('2024-01-01 01:00:00', 'h1', 'us', 88.8, 7000.5, 200),
  ('2024-01-01 02:00:00', 'h2', 'eu', 55.0, 5500.0, 503);

-- Publish Iceberg metadata for the rows just written.
admin flush_table('demo');
```

**3. Query it from Spark SQL**

```sql
-- The catalog is `greptime`, the namespace is the GreptimeDB schema `public`.
SHOW TABLES IN greptime.public;

SELECT count(*) FROM greptime.public.demo;

SELECT host, round(avg(cpu), 1) AS avg_cpu
FROM greptime.public.demo
WHERE ts >= '2024-01-01 00:00:00'
GROUP BY host
ORDER BY host;
```

The table is fully queryable: time-range filters, aggregates, joins, window functions, and ordering all work as
with any other Iceberg table in Spark.

## Limitations

### Read-only, single snapshot

- **Read-only.** You can read GreptimeDB tables through Iceberg, but you cannot write back to GreptimeDB through
  the Iceberg catalog. GreptimeDB remains the sole writer.
- **Only the latest snapshot (no time travel).** Compaction physically deletes old data files, so historical
  snapshots are not retained. The Iceberg table always reflects the current live data; you cannot query previous
  snapshots or roll back.
- **No full schema history.** The current schema is always exposed, but past schema versions are not retained, so
  you cannot reconstruct what a table looked like at an earlier point in time.

### Data types and Spark

GreptimeDB types map cleanly to Iceberg for the common cases (booleans, integers, floats, strings, binary, date,
timestamp). A few things to be aware of, especially in Spark:

- **Declare the time index as `TIMESTAMP(6)`.** GreptimeDB's default `TIMESTAMP` is millisecond precision, but the
  Iceberg schema declares the column as `timestamptz` (microsecond). With a millisecond column, Spark's Parquet
  row-group statistics filtering compares microsecond predicates against millisecond file stats and can incorrectly
  drop row groups for `>`, `=`, and range queries. Declaring the time index as `TIMESTAMP(6)` makes the on-disk
  Parquet microsecond precision match the schema, and all comparison operators work correctly. (Second/millisecond
  values are still stored correctly; the issue is purely predicate pushdown against file statistics.)
- **Lossy type fallbacks.** `list`, `dictionary`, `json`, `interval`, `duration`, `time`, and arbitrary user
  `struct` types are exported as Iceberg `string` rather than a structured type, so their internal structure is not
  queryable through Iceberg.
- **Unsigned integers.** GreptimeDB `uint32` / `uint64` map to Iceberg `long` (signed 64-bit). Values are
  non-negative and fit, so this is value-safe; Spark, Trino, and DuckDB read them correctly. Readers based on
  iceberg-rust that reject unsigned Parquet physical types outright cannot read columns whose on-disk physical type
  is unsigned 64-bit (see the metric-engine notes below).

### Metric engine tables

- **Only physical metric tables are exported.** Logical metric tables are not exposed through Iceberg; query the
  physical table directly.
- **Sparse primary-key encoding (the metric-engine default).** All tag columns are folded into a single
  `__primary_key` binary column. To recover individual tag values (the logical table id, tsid, and labels) you must
  decode that blob according to the metric-engine sparse codec — Iceberg exposes it as opaque `binary`. The
  metric-internal `__table_id` and `__tsid` columns are **not** exported, so you cannot resolve a metric name to its
  physical table id through Iceberg.
- **Prometheus native histograms** are exported as an Iceberg `struct` with list sub-fields. Two count sub-fields
  (`count_u64`, `zero_count_u64`) are physically stored as unsigned 64-bit integers; Spark, Trino, and DuckDB read
  them as signed long (value-safe), but iceberg-rust-based readers reject the unsigned physical type and fail on
  scans that include the histogram column.

### Operational notes

- **Metadata is published asynchronously.** Freshly written rows appear in Iceberg after the next flush or
  compaction; flush a table manually with `admin flush_table('<table>')` to expose them immediately.
- **Old Iceberg metadata is garbage-collected** alongside the data files by GreptimeDB's normal compaction and
  GC — no separate maintenance is required.
- **Rebuild / reconcile.** If the Iceberg export ever diverges from GreptimeDB's ground truth (a failed publish,
  corruption, or tables created before the integration was enabled), an operator can rebuild a table's Iceberg
  metadata from scratch from the authoritative live SST set:

  ```bash
  curl -X POST \
    "http://localhost:4000/v1/iceberg/v1/greptime/namespaces/public/tables/<table>/rebuild"
  ```

  The rebuild replaces (not merges) the current snapshot. Rebuilt entries carry empty column statistics (read
  correctness is unaffected; only predicate pushdown / scan planning degrades until the next flush or compaction).
