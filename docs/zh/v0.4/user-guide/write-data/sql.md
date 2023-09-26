# SQL

## 写入新数据

让我们向之前在[管理表](./../table-management.md)中创建的 `monitor` 表中插入一些测试数据。您可以使用 `INSERT INTO` 语句：

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

通过上面的语句，我们成功的向 `monitor` 表中插入了三条数据。请参考 [`INSERT`](/v0.4/reference/sql/insert.md) 获得更多写入数据的相关信息。

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

请参考 [API document](/v0.4/reference/sql/http-api.md) 获取更多信息。

## 删除数据

通过主键 `host` 和时间戳索引 `ts` 删除一行数据：

```sql
DELETE FROM monitor WHERE host='127.0.0.2' and ts=1667446798450;
```

```sql
Query OK, 1 row affected (0.00 sec)
```

请参考 [SQL DELETE](/v0.4/reference/sql/delete.md) 获取更多信息。

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

请参考 [API 文档](/v0.4/reference/sql/http-api.md)获取更多信息。
