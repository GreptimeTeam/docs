# MySQL

## Prerequisites

<!--@include: ./prerequisites.md-->

## Try Out Basic SQL Operations

### Connect

```sql
mysql -h 127.0.0.1 -P 4002
```

Also, you can use PostgreSQL to connect the database:

```
psql -h 127.0.0.1 -p 4003 -d public
```

### Create table

**Note: GreptimeDB offers a schemaless approach to writing data that eliminates the need to manually create tables using additional protocols. See [Automatic Schema Generation](/user-guide/write-data/overview.md#automatic-schema-generation).**

Now we create a table via MySQL. Let's start by creating the `system_metrics` table which contains system resource metrics, including CPU/memory/disk usage. The data is scraped every 5 seconds.

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

Field descriptions:

| Field       | Type      | Description                            |
| :---------- | :-------- | :------------------------------------- |
| host        | string    | The hostname                           |
| idc         | string    | The idc name where the host belongs to |
| cpu_util    | double    | The percent use of CPU                 |
| memory_util | double    | The percent use of memory              |
| disk_util   | double    | The percent use of disks               |
| ts          | timestamp | Timestamp column incrementing          |

- The table can be created automatically if you are using other protocols. See [Create Table](/user-guide/table-management#create-table).
- For more information about creating table SQL, please refer to [CREATE](/reference/sql/create.md).
- For data types, please check [data types](/reference/sql/data-types.md).

### Insert data

Using the `INSERT` statement is an easy way to add data to your table. The following statement allows us to insert several rows into the `system_metrics` table.

```sql
INSERT INTO system_metrics
VALUES
    ("host1", "idc_a", 11.8, 10.3, 10.3, 1667446797450),
    ("host1", "idc_a", 80.1, 70.3, 90.0, 1667446797550),
    ("host1", "idc_b", 50.0, 66.7, 40.6, 1667446797650),
    ("host1", "idc_b", 51.0, 66.5, 39.6, 1667446797750),
    ("host1", "idc_b", 52.0, 66.9, 70.6, 1667446797850),
    ("host1", "idc_b", 53.0, 63.0, 50.6, 1667446797950),
    ("host1", "idc_b", 78.0, 66.7, 20.6, 1667446798050),
    ("host1", "idc_b", 68.0, 63.9, 50.6, 1667446798150),
    ("host1", "idc_b", 90.0, 39.9, 60.6, 1667446798250);
```

For more information about the `INSERT` statement, please refer to [INSERT](/reference/sql/insert.md).

### Query data

To select all the data from the `system_metrics` table, use the `SELECT` statement:

```sql
SELECT * FROM system_metrics;
```

The query result looks like the following:

```
+-------+-------+----------+-------------+-----------+---------------------+
| host  | idc   | cpu_util | memory_util | disk_util | ts                  |
+-------+-------+----------+-------------+-----------+---------------------+
| host1 | idc_a |     11.8 |        10.3 |      10.3 | 2022-11-03 03:39:57 |
| host1 | idc_a |     80.1 |        70.3 |        90 | 2022-11-03 03:39:57 |
| host1 | idc_b |       50 |        66.7 |      40.6 | 2022-11-03 03:39:57 |
| host1 | idc_b |       51 |        66.5 |      39.6 | 2022-11-03 03:39:57 |
| host1 | idc_b |       52 |        66.9 |      70.6 | 2022-11-03 03:39:57 |
| host1 | idc_b |       53 |          63 |      50.6 | 2022-11-03 03:39:57 |
| host1 | idc_b |       78 |        66.7 |      20.6 | 2022-11-03 03:39:58 |
| host1 | idc_b |       68 |        63.9 |      50.6 | 2022-11-03 03:39:58 |
| host1 | idc_b |       90 |        39.9 |      60.6 | 2022-11-03 03:39:58 |
+-------+-------+----------+-------------+-----------+---------------------+
9 rows in set (0.00 sec)
```

You can use the `count()` function to get the number of all rows in the table:

```sql
SELECT count(*) FROM system_metrics;
```

```
+-----------------+
| COUNT(UInt8(1)) |
+-----------------+
|               9 |
+-----------------+
```

The `avg()` function returns the average value of a certain field:

```sql
SELECT avg(cpu_util) FROM system_metrics;
```

```
+------------------------------+
| AVG(system_metrics.cpu_util) |
+------------------------------+
|            59.32222222222222 |
+------------------------------+
```

You can use the `GROUP BY` clause to group rows that have the same values into summary rows.
The average memory usage grouped by idc:

```sql
SELECT idc, avg(memory_util) FROM system_metrics GROUP BY idc;
```

```
+-------+---------------------------------+
| idc   | AVG(system_metrics.memory_util) |
+-------+---------------------------------+
| idc_a |                            40.3 |
| idc_b |              61.942857142857136 |
+-------+---------------------------------+
2 rows in set (0.03 sec)
```

For more information about the `SELECT` statement, please refer to [SELECT](/reference/sql/select.md).


## Collect Host Metrics

<!--@include: ../../db-cloud-shared/quick-start/mysql.md-->

If you have started GreptimeDB using the [Prerequisites section](#prerequisites), you can use the following command to write data:

```shell
curl -L https://raw.githubusercontent.com/GreptimeCloudStarters/quick-start-mysql/main/quick-start.sh | bash -s -- -h 127.0.0.1 -d public -s DISABLED -P 4002
```

## Visualize data

### GreptimeDB Dashboard

Visualization plays a crucial role in effectively utilizing time series data. To help users leverage the various features of GreptimeDB, Greptime offers a simple [dashboard](https://github.com/GreptimeTeam/dashboard).

The Dashboard is embedded into GreptimeDB's binary since GreptimeDB v0.2.0. After [starting GreptimeDB](#installation), the dashboard can be visited via HTTP endpoint `http://localhost:4000/dashboard`. The current version of the dashboard supports MySQL, Python and PromQL queries.

Write SQL into the command text, then click `Run All`. We'll got all data in system_metrics table.

```
SELECT * FROM system_metrics;
```

![dashboard-select](/dashboard-select.png)

We offer various chart types to choose from based on different scenarios. The content of the charts will be richer when you have enough data.

![line](/dashboard-line.png)
![scatter](/dashboard-scatter.png)

We are committed to the ongoing development and iteration of this open source project, and we plan to expand the application of time series data in monitoring, analysis, and other relevant fields in the future.

### Grafana

#### Add Data Source

You can access Grafana at `http://localhost:3000`.
Use `admin` as both the username and password to log in.

GreptimeDB can be configured as a MySQL data source in Grafana.
Click the `Add data source` button and select MySQL as the type.

![add-mysql-data-source](/add-mysql-data-source.jpg)

Fill in the following information:

* Name: `GreptimeDB`
* Host: `greptimedb:4002`. The host `greptimedb` is the name of GreptimeDB container
* Database: `public`
* SessionTimezone: `UTC`

![grafana-mysql-config](/grafana-mysql-config.jpg)

Click `Save & Test` button to test the connection.

For more information on using MySQL as a data source for GreptimeDB,
please refer to [Grafana-MySQL](/user-guide/clients/grafana.md#mysql).

#### Create a Dashboard

To create a new dashboard in Grafana, click the `Create your first dashboard` button on the home page.
Then, click `Add visualization` and select `GreptimeDB` as the data source.

In the `Query` section, ensure that you select `GreptimeDB` as the data source, choose `Time series` as the format,
switch to the `Code` tab, and write the following SQL statement. Note that we are using `ts` as the time column.

```sql
SELECT ts AS "time", idle_cpu, sys_cpu FROM public.monitor
```

![grafana-mysql-query-code](/grafana-mysql-query-code.jpg)

Click `Run query` to view the metric data.

![grafana-mysql-run-query](/grafana-mysql-run-query.jpg)

## Next Steps

<!--@include: ./next-steps.md-->
