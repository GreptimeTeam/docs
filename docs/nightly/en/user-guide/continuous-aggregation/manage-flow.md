# Manage Flows

Each `flow` is a continuous aggregation query in GreptimeDB.
It continuously updates the aggregated data based on the incoming data.
This document describes how to create, update, and delete a flow.

A `flow` have those attributes:
- `name`: the name of the flow. It's an unique identifier in the catalog level.
- `source tables`: tables provide data for the flow. Each flow can have multiple source tables.
- `sink table`: the table to store the materialized aggregated data.
<!-- - `expire after`: the interval to expire the data from the source table. Data after the expiration time will not be used in the flow. -->
- `comment`: the description of the flow.
- `SQL`: the continuous aggregation query to define the flow. Refer to [Expression](./expression.md) for the available expressions.

## Create or update a flow

The grammar to create a flow is:

<!-- ```sql
CREATE [ OR REPLACE ] FLOW [ IF NOT EXISTS ] <name>
OUTPUT TO <sink-table-name>
[ EXPIRE AFTER <expr> ]
[ COMMENT = "<string>" ]
AS 
<SQL>;
``` -->

```sql
CREATE FLOW [ IF NOT EXISTS ] <name>
OUTPUT TO <sink-table-name>
[ EXPIRE AFTER <expr> ]
[ COMMENT = "<string>" ]
AS 
<SQL>;
```

<!-- When `OR REPLACE` is specified, if a flow with the same name already exists, it will be updated to the new one. Notice that this only affects the flow task itself, and both source and sink tables will not be changed. -->

`sink-table-name` is the table name to store the materialized aggregated data. It can be an existing table or a new table, `flow` will create the sink table if it doesn't exist. But if the table already exists, the schema of the table must match the schema of the query result.

<!-- `expire after` is an optional interval to expire the data from the source table. The expiration time is a relative time from the current time (by "current time" we means the physical time of the data arrive the Flow engine). For example, `INTERVAL '1 hour'` means the data **older** than 1 hour from the current time will be expired. Expired data will be dropped directly. -->

`SQL` part defines the continuous aggregation query. Refer to [Write a Query](./query.md) for the details. Generally speaking, the `SQL` part is just like a normal `SELECT` clause with a few difference.

A simple example to create a flow:

<!-- ```sql
CREATE FLOW IF NOT EXISTS my_flow
OUTPUT TO my_sink_table
EXPIRE AFTER INTERVAL '1 hour'
COMMENT = "My first flow in GreptimeDB"
AS
SELECT count(item) from my_source_table GROUP BY tumble(time_index, INTERVAL '5 minutes');
``` -->

```sql
CREATE FLOW IF NOT EXISTS my_flow
OUTPUT TO my_sink_table
COMMENT = "My first flow in GreptimeDB"
AS
SELECT count(item) from my_source_table GROUP BY tumble(time_index, INTERVAL '5 minutes', '2024-05-20 00:00:00');
```

The created flow will compute `count(item)` for every 5 minutes and store the result in `my_sink_table`. For the `tumble()` function, refer to [define time window](./define-time-window.md) part.

<!-- The created flow will compute `count(item)` for every 5 minutes and store the result in `my_sink_table`. All data comes within 1 hour will be used in the flow. For the `tumble()` function, refer to [define time window](./define-time-window.md) part. -->

## Delete a flow

To delete a flow, use the following `DROP FLOW` clause:

```sql
DROP FLOW [IF EXISTS] <name>
```

For example:

```sql
DROP FLOW IF EXISTS my_flow;
```
