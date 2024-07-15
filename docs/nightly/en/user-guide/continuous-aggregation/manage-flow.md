# Manage Flows

Each `flow` is a continuous aggregation query in GreptimeDB.
It continuously updates the aggregated data based on the incoming data.
This document describes how to create, update, and delete a flow.

## Create or update a flow

The grammar to create a flow is:

<!-- ```sql
CREATE [ OR REPLACE ] FLOW [ IF NOT EXISTS ] <name>
SINK TO <sink-table-name>
[ EXPIRE AFTER <expr> ]
[ COMMENT = "<string>" ]
AS 
<SQL>;
``` -->

```sql
CREATE FLOW [ IF NOT EXISTS ] <flow-name>
SINK TO <sink-table-name>
[ EXPIRE AFTER <expr> ]
[ COMMENT = "<string>" ]
AS 
<SQL>;
```

<!-- When `OR REPLACE` is specified, if a flow with the same name already exists, it will be updated to the new one. Notice that this only affects the flow task itself, and both source and sink tables will not be changed. -->

- `flow-name` is an unique identifier in the catalog level.
- `sink-table-name` is the table name where the materialized aggregated data is stored.
  It can be an existing table or a new one. `flow` will create the sink table if it doesn't exist. 
  <!-- If the table already exists, its schema must match the schema of the query result. -->
- `EXPIRE AFTER` is an optional interval to expire the data from the Flow engine.
  For more details, please refer to the [`EXPIRE AFTER`](#expire-after-clause) part.
- `COMMENT` is the description of the flow.
- `SQL` part defines the continuous aggregation query.
  It defines the source tables provide data for the flow.
  Each flow can have multiple source tables.
  Please Refer to [Write a Query](./query.md) for the details.

A simple example to create a flow:

```sql
CREATE FLOW IF NOT EXISTS my_flow
SINK TO my_sink_table
EXPIRE AFTER INTERVAL '1 hour'
COMMENT = "My first flow in GreptimeDB"
AS
SELECT date_bin(INTERVAL '5 minutes', time_index, '2024-05-20 00:00:00'), count(item) from my_source_table GROUP BY date_bin(INTERVAL '5 minutes', time_index, '2024-05-20 00:00:00');
```

The created flow will compute `count(item)` for every 5 minutes and store the result in `my_sink_table`. All data comes within 1 hour will be used in the flow. For the `date_bin()` function, refer to [define time window](./define-time-window.md) part. 

### `EXPIRE AFTER` clause

The Flow engine operates with two concepts of time: data timestamp and processing time.

The data timestamp is the time stored in the time index column of the source table,
while the processing time refers to the moment when the Flow engine executes the aggregation operation.

The `EXPIRE AFTER` clause specifies the interval after which the data will expire.
Any data with a timestamp older than the processing time minus the interval time will be expired.

For example, if the Flow engine processes the aggregation operation at 10:00:00 and the `INTERVAL '1 hour'` is set,
any data older than 1 hour from the processing time (data before 09:00:00) will be expired.
Only data timestamped from 09:00:00 onwards will be used in the aggregation.

The `EXPIRE` operation only expire data from the Flow engine, it does not affect the data in the source table.

## Delete a flow

To delete a flow, use the following `DROP FLOW` clause:

```sql
DROP FLOW [IF EXISTS] <name>
```

For example:

```sql
DROP FLOW IF EXISTS my_flow;
```
