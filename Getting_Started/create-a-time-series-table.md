# Create a Time-Series Table

To get started, create a time-series table to save the data collected from hosts.

Let's start by creating the `system_metrics` table:

``` sql
CREATE TABLE system_metrics (
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

You can execute this statement via MySQL or PostgreSQL command line.

For more information about how to create tables, please refer to the SQL reference document.

## Table details

`system_metrics`: contains system resource metrics, including CPU/memory/disk usage
scraped every 5 seconds.

| Field        | Type      | Description                            |
|:-------------|:----------|:---------------------------------------|
| host         | string    | The hostname                           |
| idc          | string    | The idc name where the host belongs to |
| cpu\_util    | double    | The percent use of CPU                 |
| memory\_util | double    | The percent use of memory              |
| disk\_util   | double    | The percent use of disks               |
| ts           | timestamp | Timestamp column incrementing          |

## TODO

- Link to sql reference and time-series table concept
