# Data Model

## Model

GreptimeDB uses the time-series table to guide the organization, compression, and expiration management of data.
The data model mainly based on the table model in relational databases while considering the characteristics of time-series data.

All data in GreptimeDB is organized into tables with names. Each data item in a table consists of three types of columns: `Tag`, `Timestamp`, and `Field`.

- Table names are often the same as the indicator names or metric names.
- `Tag` columns store metadata that is commonly queried.
  The values in `Tag` columns are labels attached to the collected indicators,
  generally used to describe a particular characteristic of these indicators.
  `Tag` columns are indexed, making queries on tags performant.
- `Timestamp` is the root of a time-series database.
  It represents the date and time when the data was generated.
  Timestamps are indexed, making queries on timestamps performant.
  A table can only have one timestamp column.
- The other columns are `Field` columns.
  Fields contain the data indicators that are collected.
  These indicators are generally numerical values
  but may also be other types of data, such as strings or geographic locations.
  Fields are not indexed,
  and queries on field values scan all data in the table.
  This can be resource-intensive and unperformant.

Suppose we have a time-series table called `system_metrics` that monitors the resource usage of a standalone device. The data model for this table is as follows:

![time-series-table-model](/time-series-table-model.png)

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
  which is highly resource-intensive and unperformant.

To learn how to indicate `Tag`, `Timestamp`, and `Field` columns, please refer to [Table Management](../table-management.md#create-table) and [CREATE statement](/en/v0.4/reference/sql/create.md).

## Design Considerations

GreptimeDB is designed on top of Table for the following reasons:

- The Table model has a broad group of users and it's easy to learn, that we just introduced the concept of time index to the time series.
- Schema is meta-data to describe data characteristics, and it's more convenient for users to manage and maintain. By introducing the concept of schema version, we can better manage data compatibility.
- Schema brings enormous benefits for optimizing storage and computing with its information like types, lengths, etc., on which we could conduct targeted optimizations.
- When we have the Table model, it's natural for us to introduce SQL and use it to process association analysis and aggregation queries between various index tables, offsetting the learning and use costs for users.
- Use a multi-value model where a row of data can have multiple metric columns,
  instead of the single-value model adopted by OpenTSDB and Prometheus.
  The multi-value model is used to model data sources, where a metric can have multiple values represented by fields.
  The advantage of the multi-value model is that it can write multiple values to the database at once,
  while the single-value model requires splitting the data into multiple records.

GreptimeDB uses SQL to manage table schema. Please refer to [Table Management](../table-management.md) for more information. However, our definition of schema is not mandatory and leans towards a **schemaless** approach, similar to MongoDB. For more details, see [Automatic Schema Generation](../write-data/overview.md#automatic-schema-generation).

