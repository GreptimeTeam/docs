# SQL

## `INSERT` 语句

向之前创建的 system_metrics 表插入一些测试数据。可以使用 INSERT INTO SQL 语句：

``` sql
INSERT INTO monitor
VALUES
    ("127.0.0.1", 1667446797450, 0.1, 0.4),
    ("127.0.0.2", 1667446798450, 0.2, 0.3),
    ("127.0.0.1", 1667446798450, 0.5, 0.2);
```
```sql
Query OK, 3 rows affected (0.01 sec)
```

通过上述语句，我们向 `system_metrics` 表插入了三条记录。

关于 `INSERT` 语句的更多信息，请参考 SQL 参考文档。

### HTTP API

使用 POST 方法来插入数据：

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=INSERT INTO monitor VALUES ("127.0.0.1", 1667446797450, 0.1, 0.4), ("127.0.0.2", 1667446798450, 0.2, 0.3), ("127.0.0.1", 1667446798450, 0.5, 0.2)' \
http://localhost:4000/v1/sql?db=public
```

结果如下：

```json
{"code":0,"output":[{"affectedrows":3}],"execution_time_ms":0}
```

请参考 API 文档获取有关 SQL HTTP 请求的更多信息。

## `DELETE` 语句

通过主键 `host` 和时间戳索引 `ts` 删除一条记录：

```sql
DELETE FROM monitor WHERE host='127.0.0.2' and ts=1667446798450;
```

```sql
Query OK, 1 row affected (0.00 sec)
```

关于 `DELETE` 语句的更多信息，请参考 SQL DELETE。

### HTTP API

使用 POST 方法来删除数据：

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "sql=DELETE FROM monitor WHERE host = '127.0.0.2' and ts = 1667446798450" \
http://localhost:4000/v1/sql?db=public
```

结果如下：

```json
{"code":0,"output":[{"affectedrows":1}],"execution_time_ms":1}
```

请参考 API 文档获取有关 SQL HTTP 请求的更多信息。

