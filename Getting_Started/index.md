# Getting Started

After you've installed GreptimeDB and started an instance or cluster, let's
explore it's features. In this tutorial, you will learn how to:
[[toc]]
As an example, we will create a time-series table to store system metrics from
hosts in IDC.

TODO:

1. Link to installation guide
2. Link to time-series table concept

## Create a time-series table

First of all, we should create a time-series table to save the data collected
from hosts.
Let's start by creating the system_metrics table:

```SQL
CREATE TABLE system_metrics (
    host STRING,
    idc STRING,
    cpu_util DOUBLE,
    memory_util DOUBLE,
    disk_util DOUBLE,
    ts TIMESTAMP,
    PRIMARY KEY(host, idc),
    TIME INDEX(ts)
);
```

You can execute this statement via MySQL or PostgreSQL command line.
For more information about creating tables, please refer to the SQL reference document.

### Table details

`system_metrics`:  contains system resource metrics, includes CPU/memory/disks
usage scraped at every 5 seconds.

Field | Type | Description
| --- | :---: | -------- |
host | string | The host name
idc | string | The idc name where the host belongs to
cpu_util | double| The percent use of CPU
memory_util | double | The percent use of memory
disk_util | double | The percent use of disks
ts | timestamp | Timestamp column incrementing

### TODO

- Link to sql reference and time-series table concept

## Add time-series data

After creating the table, you can populate it in several ways:

- By INSERT statement
- By InfluxDB line protocol

### INSERT statement

It's so easy to add data by `INSERT` statement:

```SQL
INSERT INTO system_metrics
VALUES
    ("host1", "idc_a", 11.8, 10.3, 10.3, 1667446797450),
    ("host2", "idc_a", 80.1, 70.3, 90.0, 1667446797450),
    ("host1", "idc_b", 50.0, 66.7, 40.6, 1667446797450);
```

We inserted 3 rows into the table.
For more information about `INSERT` statement, please refer to the SQL reference
document.

::: tip
you should start the frontend instance to use InfluxDB protocol to write data.
:::

### InfluxDB write

GreptimeDB supports HTTP InfluxDB  line protocol. For more information, please
refer to the Configuration reference.

Write data via `/influxdb/write` API:

```bash
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&precision=ms" \
--data-binary \
'system_metrics,host=host1,idc=idc_a cpu_util=11.8,memory_util=10.3,disk_util=10.3 1667446797450
 system_metrics,host=host2,idc=idc_a cpu_util=80.1,memory_util=70.3,disk_util=90.0 1667446797450
 system_metrics,host=host1,idc=idc_b cpu_util=50.0,memory_util=66.7,disk_util=40.6 1667446797450'

 ```

## Query Data with SQL

Let's select all records from the `system_metrics` table:

```SQL
SELECT * FROM system_metrics;
```

The query result will look like the following:

```text
+-------+-------+----------+-------------+-----------+---------------------+
| host  | idc   | cpu_util | memory_util | disk_util | ts                  |
+-------+-------+----------+-------------+-----------+---------------------+
| host1 | idc_a |     11.8 |        10.3 |      10.3 | 2022-11-03 03:39:57 |
| host1 | idc_b |       50 |        66.7 |      40.6 | 2022-11-03 03:39:57 |
| host2 | idc_a |     80.1 |        70.3 |        90 | 2022-11-03 03:39:57 |
+-------+-------+----------+-------------+-----------+---------------------+
```

Select the `count` of records from `system_metrics`:

```SQL
SELECT count(*) FROM system_metrics;
```

```text
+-----------------+
| COUNT(UInt8(1)) |
+-----------------+
|               3 |
+-----------------+
```

And the average CPU usage:

```SQL
SELECT avg(cpu_util) FROM system_metrics;
```

```text
+------------------------------+
| AVG(system_metrics.cpu_util) |
+------------------------------+
|            47.29999999999999 |
+------------------------------+
```

The average memory usage grouped by `idc`:

```SQL
SELECT idc, avg(memory_util) FROM system_metrics GROUP BY idc;
```

```text
+-------+---------------------------------+
| idc   | AVG(system_metrics.memory_util) |
+-------+---------------------------------+
| idc_a |                            40.3 |
| idc_b |                            66.7 |
+-------+---------------------------------+
```

For more information about SELECT statement, please refer to the SQL reference
document.

## Process Data with Python

GreptimeDB supports running a Python script inside the database. If the business
logic is complex to express via SQL, you can use python.

Save the following code into a file named `system_status.py`:

```python
@coprocessor(args=["host", "idc", "cpu_util", "memory_util", "disk_util"],
             returns = ["host", "idc", "status"],
             sql = "SELECT * FROM system_metrics")
def system_status(hosts, idcs, cpus, memories, disks):
    statuses = []
    for host, cpu, memory, disk in zip(hosts, cpus, memories, disks):
        if cpu > 80 or memory > 80 or disk > 80:
            statuses.append("red")
            continue

        status = cpu * 0.4 + memory * 0.4 + disk * 0.2

        if status > 80:
            statuses.append("red")
        elif status > 50:
            statuses.append("yello")
        else:
            statuses.append("green")


    return hosts, idcs, statuses
```

It calculates the host status by it's  cpu/memory/disk usage. Querying data from
`system_metrics` specified by parameter `sql` in coprocessor annotation.
Submit the file to GreptimeDB:

```shell
curl  --data-binary "@system_status.py" -XPOST "http://localhost:3000/v1/scripts?name=system_status"
```

Run the script

```shell
curl  -XPOST "http://localhost:3000/v1/run-script?name=system_status"
```

```json
{
   "code":0,
   "output":{
      "records":{
         "schema":{
            "column_schemas":[
               {
                  "name":"host",
                  "data_type":"String"
               },
               {
                  "name":"idc",
                  "data_type":"String"
               },
               {
                  "name":"status",
                  "data_type":"String"
               }
            ]
         },
         "rows":[
            [
               "host1",
               "idc_a",
               "green"
            ],
            [
               "host1",
               "idc_b",
               "yello"
            ],
            [
               "host2",
               "idc_a",
               "red"
            ]
         ]
      }
   }
}
```

## Visualize data
