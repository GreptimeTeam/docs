# Design Your Table Schema

The design of your table schema significantly impacts both write and query performance.
Before writing data,
it is crucial to understand the data types, scale, and common queries relevant to your business,
then model the data accordingly.
This document provides a comprehensive guide on GreptimeDB's data model and table schema design for various scenarios.

## Understanding GreptimeDB's Data Model

Before proceeding, please review the GreptimeDB [Data Model Documentation](/user-guide/concepts/data-model.md).

## Basic Concepts

**Cardinality**: Refers to the number of unique values in a dataset. It can be classified as "high cardinality" or "low cardinality":

- **Low Cardinality Example**: Order statuses like "Pending Payment/Completed Payment/Shipped/Completed"
  have about 4-5 unique values.
  Days of the week are fixed at 7,
  and the number of cities and provinces is also limited.
- **High Cardinality Example**: User IDs can range from millions to tens of millions.
  Device IP addresses and product SKUs are other examples of high cardinality data.

## Column Types and Selection

In GreptimeDB, columns are categorized into three types: Tag, Field, and Time Index.
The timestamp usually represents the time of data sampling or the occurrence time of logs/events and is used as the Time Index column.
GreptimeDB optimizes data organization based on the Time Index to enhance query performance.

### Tag Columns

Tag columns, also known as label columns,
generally carry metadata of the measured data or logs/events.
For example, when collecting nationwide weather temperature data,
the city (e.g., `city="New York"`) is a typical tag column.
In monitoring, system metrics like CPU and memory usually involve a `host` tag to represent the hostname.

The main purposes of Tag columns in GreptimeDB include:

1. Storing low-cardinality metadata.
2. Filtering data, such as using the `city` column to view the average temperature in New York City over the past week. This is similar to the `WHERE` clause in SQL.
3. Grouping and aggregating data. For instance, if the temperature data includes a `state` label in addition to `city`, you can group the data by `state` and calculate the average temperature for each `state` over the past week. This is similar to the `GROUP BY` clause in SQL.

Recommendations for Tag columns:

- Typically strings, avoiding `FLOAT` or `DOUBLE`.
- The number of Tag columns in a table should be moderate, usually not exceeding 20.
- Control the number of unique values in Tag columns to prevent high cardinality issues, which can negatively impact write performance and lead to index expansion.
- Ensure that Tag column values remain relatively stable and do not change frequently. For instance, avoid using dynamic values such as serverless container host names as Tag columns.

### Field Columns

Field columns generally carry the actual measured values. For example, the temperature value in weather data should be set as a Field column. In monitoring systems, CPU utilization, memory utilization, etc., are typical Field columns.

Characteristics of Field columns:

1. Usually numerical types (integers, floating-point numbers), logs, and event messages are generally strings.
2. Used for calculations and aggregations.
3. Can change frequently, meaning they can have any cardinality.

Recommendations for Field columns:

1. Avoid applying filter conditions on Field columns.
2. Suitable for data that needs to be calculated and aggregated.
3. Suitable for storing high-frequency changing data.

### Tag Columns vs. Field Columns

|       | Tag Columns | Field Columns |
| ----- | ----------- | ------------- |
| Usage Scenarios | - Data classification and filtering <br/> - Create indexes to speed up queries <br/>- Data grouping and recording contextual metadata | - Store actual measurement values and metrics <br/>- Used for calculations and aggregations<br/>- Target data for analysis|
| Data Characteristics | - Usually string type <br/> - Relatively stable, low change frequency <br/>- Automatically indexed <br/>- Usually low cardinality <br/> - Indexes occupy additional storage space | - Usually numerical types (integers, floating-point numbers), logs/events may be strings <br/>- High-frequency changes <br/>- Not indexed<br/>- Can be high cardinality<br/>- Relatively low storage overhead |
| Usage Recommendations | - Used for frequent query filter conditions <br/> - Control cardinality to avoid index expansion <br/>- Choose meaningful classification tags, avoid storing measurement values leading to high cardinality | - Store metrics that need to be calculated and aggregated <br/>- Avoid using as query filter conditions <br/>- Suitable for storing high-frequency changing data<br/>- Used with timestamps for time series analysis | 
| Practical Examples | - Data center: `dc-01` <br/> - Environment: `prod/dev` <br/> - Service name: `api-server`<br/>- Hostname: `host-01`<br/>- City, e.g., `"New York"` | - CPU usage: `75.5` <br/>- Memory usage: `4096MB`<br/>- Request response time: `156ms`<br/>- Temperature: `25.6°C`<br/>- Queue length: `1000`| 

## Timeline

The timeline is crucial in GreptimeDB's data model, closely related to Tag and Field columns, and is the foundation for efficient data storage and querying. A timeline is a collection of data points arranged in chronological order, identified by a unique set of Tags and a Time Index.

Timelines enable GreptimeDB to efficiently process and store time series data. Unique tag sets can be used to quickly locate and retrieve data within a specific time range, and storage can be optimized to reduce redundancy.
Understanding the concept of the timeline is key to designing table structures and optimizing query performance. Properly organizing Tag columns, Field columns, and the Time Index can create an efficient data model that meets business needs.

## Primary Key and Index

In GreptimeDB, data is organized sequentially based on the `PRIMARY KEY` columns and deduplicated based on the combination of `PRIMARY KEY` and `TIME INDEX` values. GreptimeDB supports data updates by inserting new rows to overwrite existing rows with the same `PRIMARY KEY` and `TIME INDEX` values.

By default, columns with the `PRIMARY KEY` clause are Tag columns, and columns that are not part of the `PRIMARY KEY` and not the `TIME INDEX` are Field columns. GreptimeDB automatically creates inverted indexes for all Tag columns to enable precise and fast querying and filtering.

Example:

```sql
CREATE TABLE IF NOT EXISTS system_metrics (
  host STRING,
  idc STRING,
  cpu_util DOUBLE,
  memory_util DOUBLE,
  disk_util DOUBLE,
  `load` DOUBLE,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(host, idc),
  TIME INDEX(ts)
);
```

Here, `host` and `idc` are primary key columns and Tag columns, and `ts` is the `TIME INDEX`. Other fields like `cpu_util` are Field columns.

However, this design has limitations. Specifically, it does not support deduplication and optimized sorting for certain columns without creating additional indexes, which can lead to data expansion and performance degradation.

For instance, in a monitoring scenario involving serverless containers,
the host names of these short-lived containers can cause high cardinality issues if added to the primary key.
Despite this, deduplication based on host names is still desired.
Similarly, in IoT scenarios, there may be tens of thousands of devices.
Adding their IP addresses to the primary key can also result in high cardinality problems,
yet deduplication based on IP addresses remains necessary.

## Separating Primary Key and Inverted Index

Therefore, starting from `v0.10`, GreptimeDB supports separating the primary key and index.
When creating a table, you can specify the [inverted index](/contributor-guide/datanode/data-persistence-indexing.md#inverted-index) columns using the `INVERTED INDEX` clause.
In this case, the `PRIMARY KEY` will not be automatically indexed but will only be used for deduplication and sorting:

- If `INVERTED INDEX` is not specified, inverted indexes are created for the columns in the `PRIMARY KEY`, which is the previous behavior.
- If `INVERTED INDEX` is specified, inverted indexes are only created for the columns listed in `INVERTED INDEX`. Specifically, when `INVERTED INDEX()` is specified, it means that no inverted index will be created for any column.

Example:

```sql
CREATE TABLE IF NOT EXISTS system_metrics (
  host STRING,
  idc STRING,
  cpu_util DOUBLE,
  memory_util DOUBLE,
  disk_util DOUBLE,
  `load` DOUBLE,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(host, idc),
  INVERTED INDEX(idc),
  TIME INDEX(ts)
);
```

The `host` and `idc` columns remain as primary key columns and are used in conjunction with `ts` for data deduplication and sorting optimization.
However, they will no longer be automatically indexed by default.
By using the `INVERTED INDEX(idc)` constraint,
an inverted index is created specifically for the `idc` column.
This approach helps to avoid potential performance and storage issues that could arise from the high cardinality of the `host` column.

## Full-Text Index

For log text-type Field columns that require tokenization and inverted index-based querying, GreptimeDB provides full-text indexing.

Example:

```sql
CREATE TABLE IF NOT EXISTS `logs` (
  message STRING NULL FULLTEXT WITH(analyzer = 'English', case_sensitive = 'false'),
  ts TIMESTAMP(9) NOT NULL,
  TIME INDEX (ts),
);
```

The `message` field is full-text indexed using the `FULLTEXT` option.
See [fulltext column options](/reference/sql/create.md#fulltext-column-option) for more information.

## Skipping Index

For `trace_id` in link tracking or IP addresses and MAC addresses in server access logs,
using a [skipping index](/user-guide/manage-data/data-index.md#skipping-index) is more appropriate.
This method has lower storage overhead and resource usage,
particularly in terms of memory consumption.

Example:

```sql
CREATE TABLE sensor_data (
  domain STRING PRIMARY KEY,
  device_id STRING SKIPPING INDEX,
  temperature DOUBLE,
  timestamp TIMESTAMP TIME INDEX,
);
```

In this example, the skipping index is applied to the `device_id` column.
However, note that the query efficiency and capability of the skipping index are generally inferior to those of the full-text index and inverted index.

## Comparison and Selection of Index Types

|       | Inverted Index     |    Full-Text Index     |       Skip Index|
| ----- | ----------- | ------------- |------------- |
| Suitable Scenarios | - Data queries based on tag values <br/> - Filtering operations on string columns <br/>- Precise queries on tag columns | - Text content search <br/>- Pattern matching queries<br/>- Large-scale text filtering|- Sparse data distribution scenarios, such as MAC addresses in logs <br/> - Querying infrequent values in large datasets|
| Creation Method | - Automatically created when added to `PRIMARY KEY` <br/> - Specified using `INVERTED INDEX(column1, column2,...)` |- Specified using `FULLTEXT` in column options | - Specified using `SKIPPING INDEX` in column options |

## High Cardinality Issues

High cardinality data impacts GreptimeDB by increasing memory usage and reducing compression efficiency. The size of inverted indexes can expand dramatically with increasing cardinality.

To manage high cardinality:

1. **Modeling Adjustments**: Determine whether a column should be a Tag column.
2. **Index Optimization**: Assess if a column should be part of the inverted index based on its usage in queries. Remove columns from the inverted index if they are infrequently used as filtering conditions, do not require exact matching, or have extreme selectivity.
3. **Alternative Indexing**: For columns with high selectivity, consider using a skipping index (`SKIPPING INDEX`) to enhance filtering query performance.

## Append-Only Tables

If your business data allows duplicates, has minimal updates,
or can handle deduplication at the application layer,
consider using append-only tables.
Append-only tables have higher scan performance because the storage engine can skip merge and deduplication operations.
Additionally, if the table is an append-only table,
the query engine can use statistics to speed up certain queries.

Example:

```sql
CREATE TABLE `origin_logs` (
  `message` STRING FULLTEXT,
  `time` TIMESTAMP TIME INDEX
) WITH (
  append_mode = 'true'
);
```

Please refer to the [CREATE statement table options](/reference/sql/create.md#table-options) for more information.

## Data updating and merging

When the values of the `PRIMARY KEY` column and the timestamp `TIME INDEX` column match existing data,
new data can be inserted to overwrite the existing data.
By default, if there are multiple Field columns,
a new value must be provided for each Field column during an update.
If some values are missing,
the corresponding Field columns will lose its data after the update.
This behavior is due to the merge strategy employed by GreptimeDB when encountering multiple rows with the same primary key and time index during a query.

GreptimeDB uses an LSM Tree-based storage engine,
which does not overwrite old data in place but allows multiple versions of data to coexist.
These versions are merged during the query process.
The default merge behavior is `last_row`, meaning the most recently inserted row takes precedence.

![merge-mode-last-row](/merge-mode-last-row.png)

In `last_row` merge mode,
the latest row is returned for queries with the same primary key and time value,
requiring all Field values to be provided during updates.

For scenarios where only specific Field values need updating while others remain unchanged,
the `merge_mode` option can be set to `last_non_null`.
This mode retains the latest value for each field during queries,
allowing updates to provide only the values that need to change.

![merge-mode-last-non-null](/merge-mode-last-non-null.png)

In `last_non_null` merge mode,
the latest value of each field is merged during queries,
and only the updated values need to be provided.

The `last_non_null` merge mode is the default for tables created automatically via the InfluxDB line protocol,
aligning with InfluxDB's update behavior.

Note that `merge_mode` cannot be set for Append-Only tables, as they do not perform merges.

## Wide Table vs. Multiple Tables

In monitoring or IoT scenarios, multiple metrics are often collected simultaneously.
We recommend placing metrics collected simultaneously into a single table to improve read/write throughput and data compression efficiency.

![wide_table](/wide_table.png)

Although Prometheus traditionally uses multiple tables for storage,
GreptimeDB's Prometheus Remote Storage protocol supports wide table data sharing at the underlying layer through the [Metric Engine](/contributor-guide/datanode/metric-engine.md).

## Distributed Tables

GreptimeDB supports partitioning data tables to distribute read/write hotspots and achieve horizontal scaling.

### Two misunderstandings about distributed tables

As a time-series database, GreptimeDB automatically organizes data based on the TIME INDEX column at the storage layer,
ensuring physical continuity and order.
Therefore, it is unnecessary and not recommended for you to partition data by time
(e.g., one partition per day or one table per week).

Additionally, GreptimeDB is a columnar storage database,
so partitioning a table refers to horizontal partitioning by rows,
with each partition containing all columns.

### When to Partition and Determining the Number of Partitions

GreptimeDB releases a [benchmark report](https://github.com/GreptimeTeam/greptimedb/tree/main/docs/benchmarks/tsbs) with each major version update,
detailing the write efficiency of a single partition.
Use this report alongside your target scenario to estimate if the write volume approaches the single partition's limit.

To estimate the total number of partitions,
consider the write volume and reserve an additional 30%-50% capacity
to ensure query performance and stability. Adjust this ratio as necessary.
For instance, if the average write volume for a table is 3 million rows per second
and the single partition write limit is 500,000 rows per second,
you might plan for peak write volumes of up to 5 million rows per second with low query loads.
In this case, you would reserve 10-12 partitions.

### Partitioning Methods

GreptimeDB employs expressions to define partitioning rules.
For optimal performance,
select partition keys that are evenly distributed, stable, and align with query conditions.

Examples include:

- Partitioning by the prefix or suffix of MAC addresses.
- Partitioning by data center number.
- Partitioning by business name.

The partition key should closely match the query conditions.
For instance, if most queries target data from a specific data center,
using the data center name as a partition key is appropriate.
If the data distribution is not well understood, perform aggregate queries on existing data to gather relevant information.

For more details, refer to the [table partition guide](/user-guide/administration/manage-data/table-sharding.md#partition).

