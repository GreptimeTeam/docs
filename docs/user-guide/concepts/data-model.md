---
keywords: [data model, time-series tables, tags, timestamps, fields, schema management]
description: Describes the data model of GreptimeDB, focusing on time-series tables. It explains the organization of data into tables with tags, timestamps, and fields, and provides examples of metric and log tables. Design considerations and schema management are also discussed.
---

# Data Model

## Model

GreptimeDB uses the [time-series](https://en.wikipedia.org/wiki/Time_series) table to guide the organization, compression, and expiration management of data.
The data model is mainly based on the table model in relational databases while considering the characteristics of metrics, logs, and traces data.

All data in GreptimeDB is organized into tables with names. Each data item in a table consists of three semantic types of columns: `Tag`, `Timestamp`, and `Field`.

- Table names are often the same as the indicator names, log source names, or metric names.
- `Tag` columns uniquely identify the time-series.
  Rows with the same `Tag` values belong to the same time-series.
  Some TSDBs may also call them labels.
- `Timestamp` is the root of a metrics, logs, and traces database.
  It represents the date and time when the data was generated.
  A table can only have one column with the `Timestamp` semantic type, which is also called the `time index`.
- The other columns are `Field` columns.
  Fields contain the data indicators or log contents that are collected.
  These fields are generally numerical values or string values,
  but may also be other types of data, such as geographic locations or timestamps.

A table clusters rows of the same time-series and sorts rows of the same time-series by `Timestamp`.
The table can also deduplicate rows with the same `Tag` and `Timestamp` values, depending on the requirements of the application.
GreptimeDB stores and processes data by time-series.
Choosing the right schema is crucial for efficient data storage and retrieval; please refer to the [schema design guide](/user-guide/deployments-administration/design-table.md) for more details.

### Metrics

Suppose we have a table called `system_metrics` that monitors the resource usage of machines in data centers:

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

This is very similar to the table model everyone is familiar with. The difference lies in the `TIME INDEX` constraint, which is used to specify the `ts` column as the time index column of this table.

- The table name here is `system_metrics`.
- The `PRIMARY KEY` constraint specifies the `Tag` columns of the table.
  The `host` column represents the hostname of the collected standalone machine.
  The `idc` column shows the data center where the machine is located.
- The `Timestamp` column `ts` represents the time when the data is collected.
- The `cpu_util`, `memory_util`, `disk_util`, and `load` columns in the `Field` columns represent
  the CPU utilization, memory utilization, disk utilization, and load of the machine, respectively.
  These columns contain the actual data.
- The table sorts and deduplicates rows by `host`, `idc`, `ts`. So `select count(*) from system_metrics` will scan all rows.

### Logs

Another example is creating a table for logs like web server access logs:

```sql
CREATE TABLE access_logs (
  access_time TIMESTAMP TIME INDEX,
  remote_addr STRING,
  http_status STRING,
  http_method STRING,
  http_refer STRING,
  user_agent STRING,
  request STRING,
) with ('append_mode'='true');
```

- The time index column is `access_time`.
- There are no tags.
- `http_status`, `http_method`, `remote_addr`, `http_refer`, `user_agent` and `request` are fields.
- The table sorts rows by `access_time`.
- The table is an [append-only table](/reference/sql/create.md#create-an-append-only-table) for storing logs that do not support deletion or deduplication.
- Querying an append-only table is usually faster. For example, `select count(*) from access_logs` can use the statistics for result without considering deduplication.


To learn how to indicate `Tag`, `Timestamp`, and `Field` columns, please refer to [table management](/user-guide/deployments-administration/manage-data/basic-table-operations.md#create-a-table) and [CREATE statement](/reference/sql/create.md).

### Traces

GreptimeDB supports writing OpenTelemetry traces data directly via the OTLP/HTTP protocol, refer to the [OLTP traces data model](/user-guide/ingest-data/for-observability/opentelemetry.md#data-model-2) for detail.

## Design Considerations

GreptimeDB is designed on top of the table model for the following reasons:

- The table model has a broad group of users and it's easy to learn; we have simply introduced the concept of time index to metrics, logs, and traces.
- Schema is metadata that describes data characteristics, and it's more convenient for users to manage and maintain.
- Schema brings enormous benefits for optimizing storage and computing with its information like types, lengths, etc., on which we can conduct targeted optimizations.
- When we have the table model, it's natural for us to introduce SQL and use it to process association analysis and aggregation queries between various tables, reducing the learning and usage costs for users.
- We use a multi-value model where a row of data can have multiple field columns,
  instead of the single-value model adopted by OpenTSDB and Prometheus.
  The multi-value model is used to model data sources where a metric can have multiple values represented by fields.
  The advantage of the multi-value model is that it can write or read multiple values to the database at once, reducing transfer traffic and simplifying queries. In contrast, the single-value model requires splitting the data into multiple records. Read the [blog](https://greptime.com/blogs/2024-05-09-prometheus) for more detailed benefits of the multi-value mode.


GreptimeDB uses SQL to manage table schema. Please refer to [table management](/user-guide/deployments-administration/manage-data/basic-table-operations.md) for more information.
However, our definition of schema is not mandatory and leans towards a **schemaless** approach, similar to MongoDB.
For more details, see [Automatic Schema Generation](/user-guide/ingest-data/overview.md#automatic-schema-generation).
