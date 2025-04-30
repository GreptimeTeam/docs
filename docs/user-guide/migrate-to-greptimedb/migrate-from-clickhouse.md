---
keywords: [migrate from ClickHouse, ClickHouse,GreptimeDB,write data, export data, import data,migration]
description: Step-by-step guide on migrating from ClickHouse to GreptimeDB, including data model adjustments, table structure reconstruction,, exporting and importing data.
---

# Migrate from ClickHouse

This guide provides a detailed explanation on how to smoothly migrate your business from ClickHouse to GreptimeDB. It covers pre-migration preparation, data model adjustments, table structure reconstruction, dual-write assurance, and specific methods for data export and import, aiming to achieve a seamless system transition.


## Pre-Migration Notes

- **Compatibility**
  Although GreptimeDB is SQL protocol compatible, the two databases have fundamental differences in data modeling, index design, and compression mechanisms. Be sure to refer to the [SQL compatibility](/reference/sql/compatibility.md) documentation and official [modeling guidelines](/user-guide/administration/design-table.md) to refactor table structures and data flows during migration.

- **Data Model Differences**
  ClickHouse is a general-purpose big data analytics engine, while GreptimeDB is optimized for time-series, metrics, and log observability scenarios. There are differences in their data models, index systems, and compression algorithms, so it’s important to take these differences and the actual business scenario into account during model design and compatibility considerations.

---

## Refactoring Data Model and Table Structure

**1. Time Index**
- ClickHouse tables do not always have a `time index` field. During migration, you need to clearly select the primary time field for your business to serve as the time index and specify it when creating the table in GreptimeDB. For example, typical log or trace print times.
- The time precision (such as second, millisecond, microsecond, etc.) should be assessed based on real-world requirements and cannot be changed once set.

**2. Choose Between Tag and Field Columns**
- Selecting tag columns (TAG): It is recommended to use highly reused and frequently filtered fields—such as host name, service name, region, or instance ID—as tag columns.
  - Tags are suitable for low-cardinality and well-categorized fields, and can significantly accelerate filtering.
- Field (data column): Actual observations, metrics, log message fields, etc. are suitable as fields; high-cardinality fields should be avoided for use as primary keys or tags.

**3. Primary Key and Wide Table Recommendations**
- Primary Key: Combine tag columns. It’s not recommended to include high-cardinality fields such as log IDs, user IDs or UUIDs to avoid primary key bloat, excessive write amplification, and inefficient queries.
- Wide Table vs. Multiple Tables: For multiple metrics collected at the same observation point (such as on the same host), it’s better to use a wide table, which improves batch write efficiency and compression ratio.

**4. Index Planning**
- Inverted Index: Build indexes for low-cardinality tag columns to improve filter efficiency.
- Skipping/Fulltext Index: Use as needed; avoid building unnecessary indexes on high-cardinality or highly variable fields.
- Read [Data Index](/user-guide/manage-data/data-index.md) for more info.

Example ClickHouse table structure:
```sql
CREATE TABLE example (
 timestamp DateTime,
 host String,
 app String,
 metric String,
 value Float64
 ) ENGINE = MergeTree()
 ORDER BY (timestamp, host, app, metric);
```

Recommended table structure after migrating to GreptimeDB:
```sql
CREATE TABLE example (
 `timestamp` TIMESTAMP NOT NULL,
 host STRING,
 app STRING INVERTED INDEX,
 metric STRING INVERTED INDEX,
 `value` DOUBLE,
 PRIMARY KEY (app, metric),
 TIME INDEX (`timestamp`)
 );
```

> The choice of tags and the granularity of the time index should be carefully planned in light of your business’s data volume and query scenarios. If the host cardinality is not high (e.g., only a few thousand monitored hosts), you can add it to the primary key and create an inverted index.

---

### Migrating Typical Log Tables

> GreptimeDB already provides built-in modeling for otel log ingestion, so please refer to the [official documentation](/user-guide/ingest-data/for-observability/opentelemetry.md#logs).

Common ClickHouse log table structure:
```sql
CREATE TABLE logs
 (
 timestamp      DateTime,
 host           String,
 service        String,
 log_level      String,
 log_message    String,
 trace_id       String,
 span_id        String,
 INDEX inv_idx(log_message)  TYPE ngrambf_v1(4, 1024, 1, 0) GRANULARITY 1
 ) ENGINE = MergeTree
 ORDER BY (timestamp, host, service);
```

Recommended GreptimeDB table structure:
- Time index: `timestamp` (precision set based on logging frequency)
- Tag columns: `host`, `service` (fields often used in queries/aggregations)
- Field columns: `log_message`, `trace_id`, `span_id` (high-cardinality, unique identifiers, or raw content)

```sql
CREATE TABLE logs (
 `timestamp` TIMESTAMP NOT NULL,
 host STRING,
 service STRING,
 log_level STRING,
 log_message STRING FULLTEXT INDEX WITH (
        backend = 'bloom',
        analyzer = 'English',
        case_sensitive = 'false'
    ),
 trace_id STRING SKIPPING INDEX,
 span_id STRING SKIPPING INDEX,
 PRIMARY KEY (host, service),
 TIME INDEX (`timestamp`)
 );
```

**Notes:**
- `host` and `service` serve as common query filters and are included in the primary key to optimize filtering. If there are very many hosts, you might not want to include `host` in the primary key but instead create a skip index.
- `log_message` is treated as raw content with a full-text index created. If you want the full-text index to take effect during queries, you also need to adjust your SQL query syntax. Please refer to [the log query documentation](/user-guide/logs/query-logs.md) for details
- Since `trace_id` and `span_id` are mostly high-cardinality fields, it is not recommended to use them as tags or in the primary key, but skip indexes have been added.

---

### Migrating Typical Traces Tables

> GreptimeDB also provides built-in modeling for otel trace ingestion, please read the [official documentation](/user-guide/ingest-data/for-observability/opentelemetry.md#traces).

Common ClickHouse trace table structure design:
```sql
CREATE TABLE traces (
 timestamp DateTime,
 trace_id String,
 span_id String,
 parent_span_id String,
 service String,
 operation String,
 duration UInt64,
 status String,
 tags Map(String, String)
 ) ENGINE = MergeTree()
 ORDER BY (timestamp, trace_id, span_id);
```

Recommended GreptimeDB table structure:
- Time index: `timestamp` (e.g., collection/start time)
- Tag columns: `service`, `operation` (commonly filtered/aggregated properties)
- Field columns: `trace_id`, `span_id`, `parent_span_id`, `duration`, `tags` (high-cardinality or Map type)

```sql
CREATE TABLE traces (
 `timestamp` TIMESTAMP NOT NULL,
 service STRING,
 operation STRING,
 `status` STRING,
 trace_id STRING SKIPPING INDEX,
 span_id STRING SKIPPING INDEX,
 parent_span_id STRING SKIPPING INDEX,
 duration DOUBLE,
 tags STRING,    -- If this is structured JSON, either store it as-is or use the pipeline to parse fields
 PRIMARY KEY (service, operation),
 TIME INDEX (`timestamp`)
 );
```

**Notes:**
- `service` and `operation` serve as tags, supporting trace scheduling and aggregate queries by service or operations.
- `trace_id`, `span_id`, and `parent_span_id` use skip indexes but are not part of the primary key.
- High-cardinality fields are set as fields for efficient writes. For complex properties like `tags`, JSON storage is recommended, and they can be expanded using GreptimeDB’s ETL - [Pipeline](/user-guide/logs/quick-start.md#write-logs-by-pipeline) if necessary.
- Depending on overall business volume, consider whether to partition traces into multiple tables (such as in massive multi-service environments).

---

## Dual-write Strategy for Safe Migration

During the migration process, to avoid data loss or inconsistent writes, adopt a dual-write approach:
- The application should write to both ClickHouse and GreptimeDB simultaneously, running the two systems in parallel.
- Validate and compare data using logs and checks to ensure data consistency. Once the data has been fully validated, you can switch fully over.

---

## Exporting and Importing Historical Data

1. **Enable dual-write before migration**
The application should write to both ClickHouse and GreptimeDB. Check for data consistency to reduce the risk of missing data.

2. **Data export from ClickHouse**
Use ClickHouse’s native command to export data as CSV, TSV, Parquet, or other formats. For example:
```sh
clickhouse client --query="SELECT * FROM example INTO OUTFILE 'example.csv' FORMAT CSVWithNames"
```
The exported CSV will look like:
```csv
"timestamp","host","app","metric","value"
"2024-04-25 10:00:00","host01","nginx","cpu_usage",12.7
"2024-04-25 10:00:00","host02","redis","cpu_usage",8.4
"2024-04-25 10:00:00","host03","postgres","cpu_usage",15.3
"2024-04-25 10:01:00","host01","nginx","cpu_usage",12.5
"2024-04-25 10:01:00","host01","nginx","mem_usage",1034.5
"2024-04-25 10:01:00","host02","redis","mem_usage",876.2
"2024-04-25 10:01:00","host03","postgres","mem_usage",1145.2
"2024-04-25 10:02:00","host01","nginx","disk_io",120.3
"2024-04-25 10:02:00","host02","redis","disk_io",95.1
"2024-04-25 10:02:00","host03","postgres","disk_io",134.7
"2024-04-25 10:03:00","host02","redis","mem_usage",874
"2024-04-25 10:04:00","host03","postgres","cpu_usage",15.1
```

3. **Data import into GreptimeDB**
GreptimeDB currently supports batch data import via SQL commands or [REST API](/reference/http-endpoints.md#protocol-endpoints). For large datasets, import in batches.
Use the [`COPY FROM` command](/reference/sql/copy.md#copy-from) to import:
```sql
  COPY example FROM "/path/to/example.csv" WITH (FORMAT = 'CSV');
```
Alternatively, you can convert the CSV to standard INSERT statements for batch import.

---

## Validation and Cutover

- Once the import is complete, use GreptimeDB’s query interface to compare data with ClickHouse for consistency.
- After data verification and monitoring meet requirements, you can officially switch business writes to GreptimeDB and disable dual-write mode.

---

## Frequently Asked Questions and Optimization Tips

- **What if SQL/types are incompatible?**
  Before migration, audit all query SQL and rewrite or translate as necessary, referring to the [official documentation](/user-guide/query-data/sql.md) (especially for [log query](/user-guide/logs/query-logs.md)) for any incompatible syntax or data types.

- **How do I efficiently import very large datasets in batches?**
  For large tables or full historical data, export and import by partition or shard as appropriate. Monitor write speed and import progress closely.

- **How should high-cardinality fields be handled?**
  Avoid using high-cardinality fields as primary key or tags. Store them as fields instead, and split into multiple tables if necessary.

- **How should wide tables be planned?**
  For each monitoring entity or collection endpoint, consolidate all metrics into a single table. For example, use a `host_metrics` table to store all server statistics.

---

If you need a more detailed migration plan or example scripts, please provide the specific table structure and data volume. The [GreptimeDB official community](https://github.com/orgs/GreptimeTeam/discussions) will offer further support. Welcome to join the [Greptime Slack](http://greptime.com/slack).
