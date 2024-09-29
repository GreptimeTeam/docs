# Data Model

## Model

GreptimeDB uses the time-series table to guide the organization, compression, and expiration management of data.
The data model is mainly based on the table model in relational databases while considering the characteristics of metrics, logs, and events data.

All data in GreptimeDB is organized into tables with names. Each data item in a table consists of three types of columns: `Tag`, `Timestamp`, and `Field`.

- Table names are often the same as the indicator names, log source names, or metric names.
- `Tag` columns store metadata that is commonly queried.
  The values in `Tag` columns are labels attached to the collected sources,
  generally used to describe a particular characteristic of these sources.
  `Tag` columns are indexed, making queries on tags performant.
- `Timestamp` is the root of a metrics, logs, and events database.
  It represents the date and time when the data was generated.
  Timestamps are indexed, making queries on timestamps performant.
  A table can only have one timestamp column, which is called time index.
- The other columns are `Field` columns.
  Fields contain the data indicators or log contents that are collected.
  These fields are generally numerical values or string values,
  but may also be other types of data, such as geographic locations.
  Fields are not indexed by default,
  and queries on field values scan all data in the table. It can be resource-intensive and underperformant.
 However, the string field can turn on the [full-text index](/user-guide/logs/query-logs.md#full-text-index-for-accelerated-search) to speed up queries such as log searching.

### Metric Table

Suppose we have a time-series table called `system_metrics` that monitors the resource usage of a standalone device:

```sql
CREATE TABLE IF NOT EXISTS system_metrics (
    host STRING,
    idc STRING,
    cpu_util DOUBLE,
    memory_util DOUBLE,
    disk_util DOUBLE,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(host, idc),
    TIME INDEX(ts)
);
```

The data model for this table is as follows:

![time-series-table-model](/time-series-data-model.svg)

Those are very similar to the table model everyone is familiar with. The difference lies in the `Timestamp` constraint, which is used to specify the `ts` column as the time index column of this table.

- The table name here is `system_metrics`.
- For `Tag` columns, the `host` column represents the hostname of the collected standalone machine,
  while the `idc` column shows the data center where the machine is located.
  These are queried metadata and can be effectively used to filter data when querying.
- The `Timestamp` column `ts` represents the time when the data is collected.
  It can be effectively used when querying data with a time range.
- The `cpu_util`, `memory_util`, `disk_util`, and `load` columns in the `Field` columns represent
  the CPU utilization, memory utilization, disk utilization, and load of the machine, respectively.
  These columns contain the actual data and are not indexed, but they can be efficiently computed and evaluated, such as the latest value, maximum/minimum value, average, percentage, and so on. Please avoid using `Field` columns in query conditions,
  which is highly resource-intensive and underperformant.

### Log Table
Another example is creating a log table for access logs:

```sql
CREATE TABLE access_logs (
  access_time TIMESTAMP TIME INDEX,
  remote_addr STRING,
  http_status STRING,
  http_method STRING,
  http_refer STRING,
  user_agent STRING,
  request STRING FULLTEXT,
  PRIMARY KEY (remote_addr, http_status, http_method, http_refer, user_agent)
)
```

- The time index column is `access_time`.
- `remote_addr`, `http_status`, `http_method`, `http_refer` and `user_agent` are tags.
- `request` is a field that enables full-text index by the [`FULLTEXT` column option](/reference/sql/create.md#fulltext-column-option).

To learn how to indicate `Tag`, `Timestamp`, and `Field` columns, Please refer to [table management](/user-guide/administration/data-management/basic-table-operations.md#create-a-table) and [CREATE statement](/reference/sql/create.md).

Of course, you can place metrics and logs in a single table at any time, which is also a key capability provided by GreptimeDB.

## Design Considerations

GreptimeDB is designed on top of Table for the following reasons:

- The Table model has a broad group of users and it's easy to learn, that we just introduced the concept of time index to the metrics, logs, and events.
- Schema is meta-data to describe data characteristics, and it's more convenient for users to manage and maintain. By introducing the concept of schema version, we can better manage data compatibility.
- Schema brings enormous benefits for optimizing storage and computing with its information like types, lengths, etc., on which we could conduct targeted optimizations.
- When we have the Table model, it's natural for us to introduce SQL and use it to process association analysis and aggregation queries between various tables, offsetting the learning and use costs for users.
- Use a multi-value model where a row of data can have multiple field columns,
  instead of the single-value model adopted by OpenTSDB and Prometheus.
  The multi-value model is used to model data sources, where a metric can have multiple values represented by fields.
  The advantage of the multi-value model is that it can write or read multiple values to the database at once, reducing transfer traffic and simplifying queries. In contrast, the single-value model requires splitting the data into multiple records. Read the [blog](https://greptime.com/blogs/2024-05-09-prometheus) for more detailed benefits of multi-value mode.

GreptimeDB uses SQL to manage table schema. Please refer to [table management](/user-guide/administration/data-management/basic-table-operations.md) for more information. However, our definition of schema is not mandatory and leans towards a **schemaless** approach, similar to MongoDB. For more details, see [Automatic Schema Generation](/user-guide/ingest-data/overview.md#automatic-schema-generation).
