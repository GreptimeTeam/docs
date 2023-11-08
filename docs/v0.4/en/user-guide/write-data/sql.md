# SQL

We will use the `monitor` table as an example to show how to write data.
For the SQL example on how to create the `monitor` table,
please refer to [Table Management](../table-management.md#create-table).

## `INSERT` Statement

Let's insert some testing data to the `monitor` table. You can use the `INSERT INTO` SQL statements:

```sql
INSERT INTO monitor
VALUES
    ("127.0.0.1", 1667446797450, 0.1, 0.4),
    ("127.0.0.2", 1667446798450, 0.2, 0.3),
    ("127.0.0.1", 1667446798450, 0.5, 0.2);
```

```sql
Query OK, 3 rows affected (0.01 sec)
```

Through the above statement, we have inserted three rows into the `monitor` table.

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

## `DELETE` Statement

To delete a row from it by primary key `host` and timestamp index `ts`:

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
