# MySQL

## Connect

You can connect to GreptimeDB using MySQL via port `4002`.

```shell
mysql -h <host> -P 4002 -u <username> -p
```

- For how to setup username and password for GreptimeDB, please refer to [Authentication](/user-guide/deployments/authentication.md).
- If you want to use other ports for MySQL, please refer to [Protocol options](/user-guide/deployments/configuration.md#protocol-options) in the configuration document.


## Table management

Please refer to [Table Management](/user-guide/table-management.md).

## Ingest data

Please refer to [SQL](/user-guide/ingest-data/for-iot/sql.md).

## Query data

Please refer to [SQL](/user-guide/query-data/sql.md).

## Time zone

GreptimeDB's MySQL protocol interface follows original MySQL on [how to
deal with time zone](https://dev.mysql.com/doc/refman/8.0/en/time-zone-support.html).

By default, MySQL uses its server time zone for timestamp. To override, you can
set `time_zone` variable for current session using SQL statement `SET time_zone = '<value>';`.
The value of `time_zone` can be any of:

- The server's time zone: `SYSTEM`.
- Offset to UTC such as `+08:00`.
- Any named time zone like `Europe/Berlin`.

Some MySQL clients, such as Grafana MySQL data source, allow you to set the time zone for the current session.
You can also use the above values when setting the time zone.

You can use `SELECT` to check the current time zone settings. For example:

```sql
SELECT @@system_time_zone, @@time_zone;
```

The result shows that both the system time zone and the session time zone are set to `UTC`:

```SQL
+--------------------+-------------+
| @@system_time_zone | @@time_zone |
+--------------------+-------------+
| UTC                | UTC         |
+--------------------+-------------+
```

Change the session time zone to `+1:00`:

```SQL
SET time_zone = '+1:00'
```

Then you can see the difference between the system time zone and the session time zone:

```SQL
SELECT @@system_time_zone, @@time_zone;

+--------------------+-------------+
| @@system_time_zone | @@time_zone |
+--------------------+-------------+
| UTC                | +01:00      |
+--------------------+-------------+
```

For information on how the time zone affects data inserts and queries, please refer to the SQL documents in the [Ingest Data](/user-guide/ingest-data/for-iot/sql.md#time-zone) and [Query Data](/user-guide/query-data/sql.md#time-zone) sections.
