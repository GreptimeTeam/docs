# SQL

We will use the `monitor` table as an example to show how to write data.
For the SQL example on how to create the `monitor` table,
please refer to [Table Management](../table-management.md#create-table).

## Insert data

Let's insert some testing data to the `monitor` table. You can use the `INSERT INTO` SQL statements:

```sql
INSERT INTO monitor
VALUES
    ("127.0.0.1", 1702433141000, 0.5, 0.2),
    ("127.0.0.2", 1702433141000, 0.3, 0.1),
    ("127.0.0.1", 1702433146000, 0.3, 0.2),
    ("127.0.0.2", 1702433146000, 0.2, 0.4),
    ("127.0.0.1", 1702433151000, 0.4, 0.3),
    ("127.0.0.2", 1702433151000, 0.2, 0.4);
```

```sql
Query OK, 6 rows affected (0.01 sec)
```

You can also insert data by specifying the column names:

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES
    ("127.0.0.1", 1702433141000, 0.5, 0.2),
    ("127.0.0.2", 1702433141000, 0.3, 0.1),
    ("127.0.0.1", 1702433146000, 0.3, 0.2),
    ("127.0.0.2", 1702433146000, 0.2, 0.4),
    ("127.0.0.1", 1702433151000, 0.4, 0.3),
    ("127.0.0.2", 1702433151000, 0.2, 0.4);
```

Through the above statement, we have inserted six rows into the `monitor` table.

For more information about the `INSERT` statement, please refer to [`INSERT`](/reference/sql/insert.md).

### HTTP API

Using POST method to insert data:

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=INSERT INTO monitor VALUES ("127.0.0.1", 1667446797450, 0.1, 0.4), ("127.0.0.2", 1667446798450, 0.2, 0.3), ("127.0.0.1", 1667446798450, 0.5, 0.2)' \
http://localhost:4000/v1/sql?db=public
```

The result is shown below:

```json
{ "code": 0, "output": [{ "affectedrows": 3 }], "execution_time_ms": 0 }
```

For more information about SQL HTTP request, please refer to [API document](/reference/sql/http-api.md).

## Update data

You can update data by inserting data with the same tag and time index as the existing data.
For example, first, we can insert a new row into the `monitor` table:

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES
    ("127.0.0.1", 1702433141000, 0.8, 0.1);
```

As described in the [Create Table](../table-management.md#create-table) section,
the `host` column represents the tag and the `ts` column represents the time index.
To update the data, you can use the same `host` and `ts` values as the existing data
and set the new `cpu` value to `0.5`:

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES
    -- The same tag `127.0.0.1` and the same time index 1702433141000
    ("127.0.0.1", 1702433141000, 0.5, 0.1);
```

The new data is:

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2023-12-13 02:05:41 |  0.5 |    0.1 |
+-----------+---------------------+------+--------+
```

Note that you **cannot omit** the other columns in the `INSERT INTO` statement if you only want to update one column.
If you omit the other columns,
they will be overwritten with the default values. For example:

```sql
INSERT INTO monitor (host, ts, cpu)
VALUES
    ("127.0.0.1", 1702433141000, 0.5);
```

The default value of the `memory` column in the `monitor` table is `NULL`. Therefore, the new data will be:

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2023-12-13 02:05:41 |  0.5 |   NULL |
+-----------+---------------------+------+--------+
```

## Delete data

To delete a row from it by tag `host` and timestamp index `ts`:

```sql
DELETE FROM monitor WHERE host='127.0.0.2' and ts=1667446798450;
```

```sql
Query OK, 1 row affected (0.00 sec)
```

For more information about the `DELETE` statement, please refer to the [SQL DELETE](/reference/sql/delete.md).

### HTTP API

Using POST method to delete data:

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "sql=DELETE FROM monitor WHERE host = '127.0.0.2' and ts = 1667446798450" \
http://localhost:4000/v1/sql?db=public
```

The result is shown below:

```json
{ "code": 0, "output": [{ "affectedrows": 1 }], "execution_time_ms": 1 }
```

For more information about SQL HTTP request, please refer to [API document](/reference/sql/http-api.md).
