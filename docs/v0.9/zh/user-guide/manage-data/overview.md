# 概述

## 更新数据

### 使用相同的 tag 和 time index 更新数据

更新操作可以通过插入操作来实现。
默认情况下，如果某行数据具备相同的 tag 和 time index，旧数据将被新数据替换。
有关列类型的更多信息，请参阅[数据模型](../concepts/data-model.md)。

:::warning 注意
尽管更新操作的性能与插入数据相同，过多的更新可能会对查询性能产生负面影响。
:::

要更新数据，你可以插入与现有数据具有相同的 tag 和 time index 的新数据。
[数据插入文档](/user-guide/ingest-data/overview.md)中 GreptimeDB 支持的所有协议均支持该更新机制。
以下示例使用 SQL。

假设你有一个名为 `monitor` 的表，具有以下 schema。
`host` 列表示 tag，`ts` 列表示 time index。

```sql
CREATE TABLE monitor (
    host STRING,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
    cpu FLOAT64 DEFAULT 0,
    memory FLOAT64,
    PRIMARY KEY(host)
);
```

向 `monitor` 表中插入一行新数据：

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES ("127.0.0.1", "2024-07-11 20:00:00", 0.8, 0.1);
```

检查表中的数据：

```sql
SELECT * FROM monitor;
```

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-07-11 20:00:00 | 0.8  | 0.1    |
+-----------+---------------------+------+--------+
1 row in set (0.00 sec)
```

要更新数据，你可以使用与现有数据相同的 `host` 和 `ts` 值，并将新的 `cpu` 值设置为 `0.5`：

```sql
INSERT INTO monitor (host, ts, cpu, memory)
-- 与现有数据相同的标签 `127.0.0.1` 和相同的时间索引 2024-07-11 20:00:00
VALUES ("127.0.0.1", "2024-07-11 20:00:00", 0.5, 0.1);
```

新数据将为：

```sql
SELECT * FROM monitor;
```

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-07-11 20:00:00 | 0.5  | 0.1    |
+-----------+---------------------+------+--------+
1 row in set (0.01 sec)
```

请注意，如果你只想更新某一列的值，`INSERT INTO` 语句中的其他列的值夜**不能被省略**。
如果省略其他列，它们将被默认值覆盖。
例如：

```sql
INSERT INTO monitor (host, ts, cpu)
VALUES ("127.0.0.1", "2024-07-11 20:00:00", 0.5);
```

`monitor` 表中 `memory` 列的默认值为 `NULL`。因此，新数据将为：

```sql
SELECT * FROM monitor;
```

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-07-11 20:00:00 | 0.5  | NULL   |
+-----------+---------------------+------+--------+
1 row in set (0.01 sec)
```

### 通过创建带有 `append_mode` 选项的表来避免更新数据

在创建表时，GreptimeDB 支持 `append_mode` 选项，该选项始终将新数据插入表中。
当你想要保留所有历史数据（例如日志）时十分有用。

你只能使用 SQL 创建带有 `append_mode` 选项的表。
成功创建表后，所有[写入数据的协议](/user-guide/ingest-data/overview.md)都将在表中始终插入新数据。

例如，你可以创建一个带有 `append_mode` 选项的 `app_logs` 表，如下所示。
`host` 和 `log_level` 列表示 tag，`ts` 列表示 time index。

```sql
CREATE TABLE app_logs (
    ts TIMESTAMP TIME INDEX,
    host STRING,
    api_path STRING FULLTEXT,
    log_level STRING,
    log STRING FULLTEXT,
    PRIMARY KEY (host, log_level)
) WITH ('append_mode'='true');
```

向 `app_logs` 表中插入一行新数据：

```sql
INSERT INTO app_logs (ts, host, api_path, log_level, log)
VALUES ('2024-07-11 20:00:10', 'host1', '/api/v1/resource', 'ERROR', '连接超时');
```

检查表中的数据：

```sql
SELECT * FROM app_logs;
```

输出将为：

```sql
+---------------------+-------+------------------+-----------+--------------------+
| ts                  | host  | api_path         | log_level | log                |
+---------------------+-------+------------------+-----------+--------------------+
| 2024-07-11 20:00:10 | host1 | /api/v1/resource | ERROR     | Connection timeout |
+---------------------+-------+------------------+-----------+--------------------+
1 row in set (0.01 sec)
```

你可以插入具有相同 tag 和 time index 的新数据：

```sql
INSERT INTO app_logs (ts, host, api_path, log_level, log)
-- 与现有数据相同的标签 `host1` 和 `ERROR`，相同的时间索引 2024-07-11 20:00:10
VALUES ('2024-07-11 20:00:10', 'host1', '/api/v1/resource', 'ERROR', '连接重置');
```

然后，你将在表中找到两行数据：

```sql
SELECT * FROM app_logs;
```

```sql
+---------------------+-------+------------------+-----------+--------------------+
| ts                  | host  | api_path         | log_level | log                |
+---------------------+-------+------------------+-----------+--------------------+
| 2024-07-11 20:00:10 | host1 | /api/v1/resource | ERROR     | Connection reset   |
| 2024-07-11 20:00:10 | host1 | /api/v1/resource | ERROR     | Connection timeout |
+---------------------+-------+------------------+-----------+--------------------+
2 rows in set (0.01 sec)
```

## 删除数据

你可以通过指定 tag 和 time index 来有效地删除数据。
未指定 tag 和 time index 进行删除数据不高效，因为它需要两个步骤：查询数据，然后按 tag 和 time index 进行删除。
有关列类型的更多信息，请参阅[数据模型](../concepts/data-model.md)。

:::warning 警告
过多的删除可能会对查询性能产生负面影响。
:::

只能使用 SQL 删除数据。
例如，要从 `monitor` 表中删除具有标签 `host` 和时间戳索引 `ts` 的行：

```sql
DELETE FROM monitor WHERE host='127.0.0.2' AND ts=1667446798450;
```

输出将为：

```sql
Query OK, 1 row affected (0.00 sec)
```

有关 `DELETE` 语句的更多信息，请参阅[SQL DELETE](/reference/sql/delete.md)。


