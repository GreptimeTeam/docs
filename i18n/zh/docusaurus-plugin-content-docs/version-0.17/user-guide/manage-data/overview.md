---
keywords: [数据管理, 数据更新, 数据删除, TTL 策略, 数据保留]
description: 介绍如何在 GreptimeDB 中更新和删除数据，包括使用相同的 tag 和 time index 更新数据、删除数据、使用 TTL 策略保留数据等。
---

# 管理数据

## 更新数据

### 使用相同的 tag 和 time index 更新数据

更新操作可以通过插入操作来实现。
如果某行数据具有相同的 tag 和 time index，旧数据将被新数据替换，这意味着你只能更新 field 类型的列。
想要更新数据，只需使用与现有数据相同的 tag 和 time index 插入新数据即可。

有关列类型的更多信息，请参阅[数据模型](/user-guide/concepts/data-model.md)。

:::warning 注意
尽管更新操作的性能与插入数据相同，过多的更新可能会对查询性能产生负面影响。
:::

#### 更新表中的所有字段

在更新数据时，默认情况下所有字段都将被新值覆盖，
而 [InfluxDB 行协议](/user-guide/protocols/influxdb-line-protocol.md) 除外，它只会[更新表中的部分字段](#更新表中的部分字段)。
以下示例使用 SQL 演示了更新表中所有字段的行为。

假设你有一个名为 `monitor` 的表，具有以下 schema。
`host` 列表示 tag，`ts` 列表示 time index。

```sql
CREATE TABLE monitor (
    host STRING,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
    cpu FLOAT64,
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

当使用默认的合并策略时，
如果在 `INSERT INTO` 语句中省略了某列，
它们将被默认值覆盖。

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

### 更新表中的部分字段

默认情况下， [InfluxDB 行协议](/user-guide/protocols/influxdb-line-protocol.md) 支持此种更新策略。
你还可以使用 SQL 在创建表时通过指定 `merge_mode` 选项为 `last_non_null` 来启用此行为。
示例如下：

```sql
CREATE TABLE monitor (
    host STRING,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
    cpu FLOAT64,
    memory FLOAT64,
    PRIMARY KEY(host)
) WITH ('merge_mode'='last_non_null');
```

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES ("127.0.0.1", "2024-07-11 20:00:00", 0.8, 0.1);
```

要更新 `monitor` 表中的特定字段，
你可以只插入带有要更新的字段的新数据。
例如：

```sql
INSERT INTO monitor (host, ts, cpu)
VALUES ("127.0.0.1", "2024-07-11 20:00:00", 0.5);
```

这将更新 `cpu` 字段，同时保持 `memory` 字段不变。
结果将为：

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-07-11 20:00:00 |  0.5 |    0.1 |
+-----------+---------------------+------+--------+
```


请注意， `last_non_null` 无法将旧值更新为 `NULL`。
例如：

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES ("127.0.0.1", "2024-07-11 20:00:01", 0.8, 0.1);
```

```sql
INSERT INTO monitor (host, ts, cpu)
VALUES ("127.0.0.1", "2024-07-11 20:00:01", NULL);
```

不会更新任何内容：

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-07-11 20:00:01 |  0.8 |    0.1 |
+-----------+---------------------+------+--------+
```

有关 `merge_mode` 选项的更多信息，请参阅 [CREATE TABLE](/reference/sql/create.md##创建带有-merge-模式的表) 语句。

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
    api_path STRING FULLTEXT INDEX,
    log_level STRING,
    log STRING FULLTEXT INDEX,
    PRIMARY KEY (host, log_level)
) WITH ('append_mode'='true');
```

向 `app_logs` 表中插入一行新数据：

```sql
INSERT INTO app_logs (ts, host, api_path, log_level, log)
VALUES ('2024-07-11 20:00:10', 'host1', '/api/v1/resource', 'ERROR', 'Connection timeout');
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
VALUES ('2024-07-11 20:00:10', 'host1', '/api/v1/resource', 'ERROR', 'Connection reset');
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
有关列类型的更多信息，请参阅[数据模型](/user-guide/concepts/data-model.md)。

:::warning 警告
过多的删除可能会对查询性能产生负面影响。
:::

只能使用 SQL 删除数据。
例如，要从 `monitor` 表中删除具有 tag `host` 和 time index `ts` 的行：

```sql
DELETE FROM monitor WHERE host='127.0.0.2' AND ts=1667446798450;
```

输出将为：

```sql
Query OK, 1 row affected (0.00 sec)
```

有关 `DELETE` 语句的更多信息，请参阅 [SQL DELETE](/reference/sql/delete.md)。

## 删除表中的所有数据

要删除表中的所有数据，可以使用 SQL 中的 `TRUNCATE TABLE` 语句。
例如，要清空 `monitor` 表：

```sql
TRUNCATE TABLE monitor;
```

有关 `TRUNCATE TABLE` 语句的更多信息，请参阅 [SQL TRUNCATE TABLE](/reference/sql/truncate.md) 文档。

## 使用 TTL 策略保留数据

Time to Live (TTL) 允许你设置定期删除表中数据的策略，
你可以使用 TTL 自动删除数据库中的过期数据。
设置 TTL 策略具有以下好处：

- 通过清理过期数据来降低存储成本。
- 减少数据库在某些查询中需要扫描的行数，从而提高查询性能。

你可以在创建每个表时设置 TTL。
例如，以下 SQL 语句创建了一个名为 `monitor` 的表，并设置了 7 天的 TTL 策略：

```sql
CREATE TABLE monitor (
    host STRING,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
    cpu FLOAT64,
    memory FLOAT64,
    PRIMARY KEY(host)
) WITH ('ttl'='7d');
```

你还可以创建数据库级别的 TTL 策略。
例如，以下 SQL 语句创建了一个名为 `test` 的数据库，并设置了 7 天的 TTL 策略：

```sql
CREATE DATABASE test WITH ('ttl'='7d');
```

你可以同时为 table 和 database 设置 TTL 策略。
如果 table 有自己的 TTL 策略，则该策略将优先于 database 的 TTL 策略，
否则 database 的 TTL 策略将被应用于 table。

`'ttl'` 参数的值可以是持续时间（例如 `1hour 12min 5s`）、`instant` 或 `forever`。有关详细信息，请参阅 [CREATE](/reference/sql/create.md#create-a-table-with-ttl) 语句的文档。

如果你想移除 TTL 策略，可以使用如下 SQL 语句：

```sql
-- 针对表移除 'ttl' 设置
ALTER TABLE monitor UNSET 'ttl';
-- 针对数据库移除 'ttl' 设置
ALTER DATABASE test UNSET 'ttl';
```

有关 TTL 策略的更多信息，请参阅 [CREATE](/reference/sql/create.md) 语句。

## 更多数据管理操作

有关更高级的数据管理操作，例如基本表操作、表分片和 Region 迁移，请参阅 Administration 部分的[数据管理](/user-guide/deployments-administration/manage-data/overview.md)。
