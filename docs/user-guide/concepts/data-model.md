# Data Model

GreptimeDB uses the time-series table to guide the organization, compression, and expiration management of data.
The data model mainly based on the table model in relational databases while considering the characteristics of time-series data.

For example, we have a time-series table `system_metrics` for monitoring the resource usage of a stand-alone device:

```sql
DESC TABLE system_metrics;
```

```sql
+-------------+----------------------+------+---------------------+---------------+
| Field       | Type                 | Null | Default             | Semantic Type |
+-------------+----------------------+------+---------------------+---------------+
| host        | String               | NO   |                     | PRIMARY KEY   |
| idc         | String               | YES  | idc0                | PRIMARY KEY   |
| cpu_util    | Float64              | YES  |                     | FIELD         |
| memory_util | Float64              | YES  |                     | FIELD         |
| disk_util   | Float64              | YES  |                     | FIELD         |
| load        | Float64              | YES  |                     | FIELD         |
| ts          | TimestampMillisecond | NO   | current_timestamp() | TIME INDEX    |
+-------------+----------------------+------+---------------------+---------------+
7 rows in set (0.02 sec)
```


`host` is the hostname of the collected stand-alone machine. The `idc` column shows the data center where the machine is located, `cpu_util`, `memory_util`, `disk_util`, and `load` are the collected stand-alone indicators, and `ts` is the time of collection (Unix timestamp).

Those are very similar to the table model everyone is familiar with. The difference lies in the `TIME INDEX(ts)` constraint, which is used to specify the `ts` column as the time index column of this table.

We call this kind of table TimeSeries Table, which consists of four parts:

- Table name: often the same as indicator name, such as `system_metric` here.
- Time index column: required and normally used to indicate the data generation time in this row. The `ts` column in the example is the time index column.
- Metric Column: data indicators collected, generally change with time, such as the four numerical columns in the example (`cpu_util` and `memory_util`, etc.). The indicators are generally numerical values but may also be other types of data, such as strings, geographic locations, etc. GreptimeDB adopts a multi-value model (a row of data can have multiple metric columns), rather than the single-value model adopted by OpenTSDB and Prometheus.
- Tag Column: labels attached to the collected indicators, such as the `host` and `idc` columns in the example, generally to describe a particular characteristic of these indicators.


![time-series-table-model](../../public/time-series-table-model.png)

GreptimeDB is designed on top of Table for the following reasons:

- The Table model has a broad group of users and it's easy to learn, that we just introduced the concept of time index to the time series.
- Schema is meta-data to describe data characteristics, and it's more convenient for users to manage and maintain. By introducing the concept of schema version, we can better manage data compatibility.
- Schema brings enormous benefits for optimizing storage and computing with its information like types, lengths, etc., on which we could conduct targeted optimizations.
- When we have the Table model, it's natural for us to introduce SQL and use it to process association analysis and aggregation queries between various index tables, offsetting the learning and use costs for users.

Nevertheless, our definition of Schema is not mandatory, but more towards the Schemaless way like MongoDB. See [Automatic Schema Generation](../write-data.md#automatic-schema-generation) for more details.
