# SQL

我们将使用 `monitor` 表作为示例来展示如何写入数据。有关如何创建 `monitor` 表的 SQL 示例，请参见[表管理](./../table-management.md#创建表)。

## 插入数据

让我们向 `monitor` 表中插入一些测试数据。你可以使用 `INSERT INTO` 语句：

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

你还可以插入数据时指定列名：

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

通过上面的语句，我们成功的向 `monitor` 表中插入了六条数据。请参考 [`INSERT`](/reference/sql/insert.md) 获得更多写入数据的相关信息。

### HTTP API

使用 `POST` 方法来写入新数据：

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=INSERT INTO monitor VALUES ("127.0.0.1", 1667446797450, 0.1, 0.4), ("127.0.0.2", 1667446798450, 0.2, 0.3), ("127.0.0.1", 1667446798450, 0.5, 0.2)' \
http://localhost:4000/v1/sql?db=public
```

结果如下：

```json
{ "code": 0, "output": [{ "affectedrows": 3 }], "execution_time_ms": 0 }
```

请参考 [API document](/reference/sql/http-api.md) 获取更多信息。


## 更新数据

你可以通过插入和已存在的数据具有相同的标签和时间戳索引的数据来更新已有数据。
例如，我们首先向 `monitor` 表中插入一行新数据：

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES
    ("127.0.0.1", 1702433141000, 0.8, 0.1);
```

在[创建表](../table-management.md#创建表)一节中，我们已经介绍了 `host` 是标签，`ts` 是时间索引。
你可以使用相同的 `host` 和 `ts` 值来更新数据，并将新的 `cpu` 值设置为 `0.5`：

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES
    -- The same tag `127.0.0.1` and the same time index 1702433141000
    ("127.0.0.1", 1702433141000, 0.5, 0.1);
```

新的数据如下：

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2023-12-13 02:05:41 |  0.5 |    0.1 |
+-----------+---------------------+------+--------+
```

注意，如果你只想更新一列，`INSERT INTO` 语句中的其他列**不能被省略** 。
如果你省略了其他列，它们将被默认值覆盖。例如：

```sql
INSERT INTO monitor (host, ts, cpu)
VALUES
    ("127.0.0.1", 1702433141000, 0.5);
```

`memory` 列的默认值是 `NULL`。因此，新的数据如下：

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2023-12-13 02:05:41 |  0.5 |   NULL |
+-----------+---------------------+------+--------+
```

## 删除数据

通过标签 `host` 和时间戳索引 `ts` 删除一行数据：

```sql
DELETE FROM monitor WHERE host='127.0.0.2' and ts=1667446798450;
```

```sql
Query OK, 1 row affected (0.00 sec)
```

请参考 [SQL DELETE](/reference/sql/delete.md) 获取更多信息。

### HTTP API

使用 `POST` 方法来写入一条新数据：

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "sql=DELETE FROM monitor WHERE host = '127.0.0.2' and ts = 1667446798450" \
http://localhost:4000/v1/sql?db=public
```

结果如下：

```json
{ "code": 0, "output": [{ "affectedrows": 1 }], "execution_time_ms": 1 }
```

请参考 [API 文档](/reference/sql/http-api.md)获取更多信息。
