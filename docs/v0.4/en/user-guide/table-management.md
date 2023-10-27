# Table Management

GreptimeDB provides table management functionalities via SQL. The following guide
uses [MySQL Command-Line Client](https://dev.mysql.com/doc/refman/8.0/en/mysql.html) to demonstrate it.

## Create Database

The default database is `public`. You can create a database manully.

```sql
CREATE DATABASE test;
```

Query OK, 1 row affected (0.05 sec)

````

You can list all the existing databases.

```sql
SHOW DATABASES;
````

```sql
+---------+
| Schemas |
+---------+
| test    |
| public  |
+---------+
2 rows in set (0.00 sec)
```

Using `like` syntax:

```sql
SHOW DATABASES LIKE 'p%';
```

```sql
+---------+
| Schemas |
+---------+
| public  |
+---------+
1 row in set (0.00 sec)
```

Then change the database:

```sql
USE test;
```

Change back to `public` database:

```sql
USE public;
```

## Create Table

You can still create a table manually via SQL if you have specific requirements.
Suppose we want to create a table named monitor with the following data model:

- `host` is the hostname of the collected standalone machine, which should be a `Tag` that used to filter data when querying.
- `ts` is the time when the data is collected, which should be the `Timestamp`. It can also used as a filter when querying data with a time range.
- `cpu` and `memory` are the CPU utilization and memory utilization of the machine, which should be `Field` columns that contain the actual data and are not indexed.
