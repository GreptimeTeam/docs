# Functions

<!--
The outling of this document is a little strange, as the content is classified by company functions and feature functions. We plan to tidy up the content in the future when out functions are more stable.
-->

## Datafusion Functions

Since GreptimeDB's query engine is built based on Apache Arrow DataFusion, GreptimeDB inherits all built-in
functions in DataFusion. These functions include:

* **Aggregate functions**: such as COUNT(), SUM(), MIN(), MAX(), etc. For a detailed list, please refer to [Aggregate Functions](./df_functions#aggregate-functions)
* **Scalar functions**: such as ABS(), COS(), FLOOR(), etc. For a detailed list, please refer to [Scalar Functions](./df_functions#scalar-functions)
* **Window functions**: performs a calculation across a set of table rows that are somehow related to the current row. For a detailed list, please refer to [Window Functions](./df_functions#window-functions)

To find all the DataFusion functions, please refer to [DataFusion Functions](./df_functions).

In summary, GreptimeDB supports all SQL aggregate functions and scalar functions in DataFusion. Users can safely
use these rich built-in functions in GreptimeDB to manipulate and analyze data.

### `arrow_cast`

`arrow_cast` function is from DataFusion's [`arrow_cast`](https://arrow.apache.org/datafusion/user-guide/sql/scalar_functions.html#arrow-cast). It's illustrated as:

```sql
arrow_cast(expression, datatype)
```

Where the `datatype` can be any valid Arrow data type in this [list](https://arrow.apache.org/datafusion/user-guide/sql/data_types.html). The four timestamp types are:

- Timestamp(Second, None)
- Timestamp(Millisecond, None)
- Timestamp(Microsecond, None)
- Timestamp(Nanosecond, None)

(Notice that the `None` means the timestamp is timezone naive)

## GreptimeDB Functions

Please refer to [API documentation](https://greptimedb.rs/common_function/function/trait.Function.html#implementors)

### Admin Functions

GreptimeDB provides some administration functions to manage the database and data:

* `flush_table(table_name)` to flush a table's memtables into SST file by table name.
* `flush_region(region_id)` to flush a region's memtables into SST file by region id. Find the region id through [PARTITIONS](./information-schema/partitions.md) table.
* `compact_table(table_name)` to schedule a compaction task for a table by table name.
* `compact_region(region_id)` to schedule a compaction task for a region by region id.
* `migrate_region(region_id, from_peer, to_peer, [timeout])` to migrate regions between datanodes, please read the [Region Migration](/user-guide/operations/region-migration).
* `procedure_state(procedure_id)` to query a procedure state by its id.

For example:
```sql
-- Flush the table test --
select flush_table("test");

-- Schedule a compaction for table test --
select compact_table("test");
```


## Time and Date

DataFusion [Time and Date Functon](./df_functions#time-and-date-functions).

### INTERVAL

The Interval data type allows you to store and manipulate a period of time in years, months, days, hours etc. It's illustrated as:

```sql
INTERVAL [fields]
```

Valid types are:

- YEAR
- MONTH
- DAY
- HOUR
- MINUTE
- SECOND
- YEAR TO MONTH
- DAY TO HOUR
- DAY TO MINUTE
- DAY TO SECOND
- HOUR TO MINUTE
- HOUR TO SECOND
- MINUTE TO SECOND

For example:

```sql
SELECT
 now(),
 now() - INTERVAL '1 year 3 hours 20 minutes'
             AS "3 hours 20 minutes ago of last year";
```

Output:

```sql
+----------------------------+-------------------------------------+
| now()                      | 3 hours 20 minutes ago of last year |
+----------------------------+-------------------------------------+
| 2023-07-05 11:43:37.861340 | 2022-07-05 08:23:37.861340          |
+----------------------------+-------------------------------------+
```

For more info about interval data type, please refer to [Data Type](./data-types#interval-type) document.

### `::timestamp`

The `::timestamp` grammar casts the string literal to the timestamp type. All the SQL types are valid to be in the position of `timestamp`.

Example:

```sql
MySQL [(none)]> select '2021-07-01 00:00:00'::timestamp;
```

Output:

```sql
+-----------------------------+
| Utf8("2021-07-01 00:00:00") |
+-----------------------------+
| 2021-07-01 08:00:00         |
+-----------------------------+
1 row in set (0.000 sec)
```


