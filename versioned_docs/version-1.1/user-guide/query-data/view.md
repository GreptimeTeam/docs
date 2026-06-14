---
keywords: [SQL views, create view, query view, update view, manage views, data security, complex queries]
description: Explanation of SQL views in GreptimeDB, including how to create, query, update, and manage views for simplifying complex queries and ensuring data security.
---

# View

In SQL, a view is a virtual table based on the result set of an SQL statement.
It contains rows and columns just like a real table.
The query of a view is run every time the view is referenced in a query.

In the following situations, you can use views:

* Simplifying complex queries, avoiding the need to repeatedly write and send complex statements for every query.
* Granting read permissions to specific users while restricting access to certain columns and rows to ensure data security and isolation.

A view is created with the `CREATE VIEW` statement.

## View examples

```sql
CREATE VIEW cpu_monitor AS
    SELECT cpu, host, ts FROM monitor;
```

The view name is `cpu_monitor`, and the query statement after `AS` is the SQL statement to present the data. Query the view:

```sql
SELECT * FROM cpu_monitor;
```

```sql
+------+-----------+---------------------+
| cpu  | host      | ts                  |
+------+-----------+---------------------+
|  0.5 | 127.0.0.1 | 2023-12-13 02:05:41 |
|  0.3 | 127.0.0.1 | 2023-12-13 02:05:46 |
|  0.4 | 127.0.0.1 | 2023-12-13 02:05:51 |
|  0.3 | 127.0.0.2 | 2023-12-13 02:05:41 |
|  0.2 | 127.0.0.2 | 2023-12-13 02:05:46 |
|  0.2 | 127.0.0.2 | 2023-12-13 02:05:51 |
+------+-----------+---------------------+
```

Query view by `WHERE`:

```sql
SELECT * FROM cpu_monitor WHERE host = '127.0.0.2';
```

```sql
+------+-----------+---------------------+
| cpu  | host      | ts                  |
+------+-----------+---------------------+
|  0.3 | 127.0.0.2 | 2023-12-13 02:05:41 |
|  0.2 | 127.0.0.2 | 2023-12-13 02:05:46 |
|  0.2 | 127.0.0.2 | 2023-12-13 02:05:51 |
+------+-----------+---------------------+
```

Create a view that queries data from two tables:

```sql
CREATE VIEW app_cpu_monitor AS
    SELECT cpu, latency, host, ts FROM monitor LEFT JOIN app_monitor
    ON monitor.host = app_monitor.host AND monitor.ts = app_monitor.ts
```

Then query the view as if the data were coming from one single table:

```sql
SELECT * FROM app_cpu_monitor WHERE host = 'host1'
```

## Update View

`CREATE OR REPLACE VIEW` to update a view, if it doesn't exist, it will be created:

```sql
CREATE OR REPLACE VIEW memory_monitor AS
    SELECT memory, host, ts FROM monitor;
```

## Shows the view definition

Shows the `CREATE VIEW` statement that creates the named view by `SHOW CREATE VIEW view_name`:

```sql
SHOW CREATE VIEW cpu_monitor;
```

```sql
+-------------+--------------------------------------------------------------+
| View        | Create View                                                  |
+-------------+--------------------------------------------------------------+
| cpu_monitor | CREATE VIEW cpu_monitor AS SELECT cpu, host, ts FROM monitor |
+-------------+--------------------------------------------------------------+
```

## List Views

`SHOW VIEWS` statement to find all the views:

```sql
> SHOW VIEWS;

+----------------+
| Views          |
+----------------+
| cpu_monitor    |
| memory_monitor |
+----------------+
```

of course, just like `SHOW TABLES`, it supports `LIKE` and `WHERE`:

```sql
> SHOW VIEWS like 'cpu%';
+-------------+
| Views       |
+-------------+
| cpu_monitor |
+-------------+
1 row in set (0.02 sec)

> SHOW VIEWS WHERE Views = 'memory_monitor';
+----------------+
| Views          |
+----------------+
| memory_monitor |
+----------------+
```

## Drop View

Use `DROP VIEW` statement to drop a view:

```sql
DROP VIEW cpu_monitor;
```  

To be quiet if it does not exist:

```sql
DROP VIEW IF EXISTS test;
```

