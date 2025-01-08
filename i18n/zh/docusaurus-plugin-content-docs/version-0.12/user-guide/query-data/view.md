---
keywords: [视图, SQL 视图, 创建视图, 更新视图, 删除视图, 显示视图定义, 列出视图]
description: 介绍了视图的定义、使用示例、更新、显示定义、列出视图和删除视图的方法。
---

# 视图

在 SQL 中，视图（View）是基于 SQL 语句的结果集的虚拟表。
它包含与真实的表一样的行和列。
每次查询视图时，都会运行该视图的查询。

在以下情况下，我们可以使用视图：
* 简化复杂查询，避免每次查询都重复编写和发送复杂语句。
* 对特定用户开放读取权限，限制一些列和行的读取，保证数据安全和隔离。

可以使用 `CREATE VIEW` 语句创建视图。

## 视图示例

```sql
CREATE VIEW cpu_monitor AS
    SELECT cpu, host, ts FROM monitor;
```

这个视图的名称是 `cpu_monitor`，在 `AS` 之后的查询语句是用于呈现数据的 SQL 语句。查询视图：

```sql
SELECT * FROM cpu_monitor;
```

结果示例：

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

通过 `WHERE` 查询视图：

```sql
SELECT * FROM cpu_monitor WHERE host = '127.0.0.2';
```

结果示例：

```sql
+------+-----------+---------------------+
| cpu  | host      | ts                  |
+------+-----------+---------------------+
|  0.3 | 127.0.0.2 | 2023-12-13 02:05:41 |
|  0.2 | 127.0.0.2 | 2023-12-13 02:05:46 |
|  0.2 | 127.0.0.2 | 2023-12-13 02:05:51 |
+------+-----------+---------------------+
```

创建一个从两个表联合查询数据的视图：

```sql
CREATE VIEW app_cpu_monitor AS
    SELECT cpu, latency, host, ts FROM monitor LEFT JOIN app_monitor
    ON monitor.host = app_monitor.host AND monitor.ts = app_monitor.ts
```

然后可以像查询一个单表数据一样查询这个视图：

```sql
SELECT * FROM app_cpu_monitor WHERE host = 'host1'
```

## 更新视图

使用 `CREATE OR REPLACE VIEW` 来更新视图，如果视图不存在，则会创建：

```sql
CREATE OR REPLACE VIEW memory_monitor AS
    SELECT memory, host, ts FROM monitor;
```

## 显示视图定义

通过 `SHOW CREATE VIEW view_name` 语句来显示创建视图的 `CREATE VIEW` 语句：

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

## 列出视图

使用 `SHOW VIEWS` 语句查找所有视图：

```sql
> SHOW VIEWS;

+----------------+
| Views          |
+----------------+
| cpu_monitor    |
| memory_monitor |
+----------------+
```

当然，像 `SHOW TABLES` 一样，它也支持 `LIKE` 和 `WHERE`：

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

## 删除视图

使用 `DROP VIEW` 语句删除视图：

```sql
DROP VIEW cpu_monitor;
```  

如果希望在视图不存在时不报错，可以使用：

```sql
DROP VIEW IF EXISTS test;
```
