# 概述

`INFORMATION_SCHEMA` 提供了对系统元数据的访问，例如数据库或表的名称、列的数据类型等。GreptimeDB 还提供了一些自定义的 `INFORMATION_SCHEMA` 表，用于查询有关 GreptimeDB 系统本身、集群信息和运行时指标等元数据。很多 `INFORMATION_SCHEMA` 表都有对应的 `SHOW` 命令，查询 `INFORMATION_SCHEMA` 的好处是可以在表之间进行连接。

`INFORMATION_SCHEMA` 依然有很多工作要做，请跟踪 `INFORMATION_SCHEMA` 的 [issue](https://github.com/GreptimeTeam/greptimedb/issues/2931)。

## MySQL 兼容性

|表名|描述|
| --- | --- |
| [`CHARACTER_SETS`](./character-sets.md) | 提供了可用字符集的信息。 |
| `CHECK_CONSTRAINTS`| 未实现。返回零行。 |
| [`COLLATIONS`](./collations.md) | 提供了服务器支持的排序规则列表。 |
| [`COLLATION_CHARACTER_SET_APPLICABILITY`](./collation-character-set-applicability.md) | 解释了哪些排序规则适用于哪些字符集。 |
| [`COLUMNS`](./columns.md) | 提供了所有表的列列表。 |
| `COLUMN_PRIVILEGES` | 未实现。返回零行。 |
| `COLUMN_STATISTICS` | 不支持。 |
| [`ENGINES`](./engines.md) | 提供了支持的存储引擎列表。 |
| `EVENTS` | 未实现。返回零行。 |
| `FILES` | 未实现。返回零行。 |
| `GLOBAL_STATUS` | 未实现。返回零行。 |
| `GLOBAL_VARIABLES` | 不支持。 |
| [`KEY_COLUMN_USAGE`](./key-column-usage.md) | 描述了列的关键约束，例如主键和时间索引约束。 |
| `OPTIMIZER_TRACE` | 未实现。返回零行。 |
| `PARAMETERS` | 未实现。返回零行。 |
| [`PARTITIONS`](./partitions.md) | 提供了表分区的列表。 |
| `PLUGINS` | 不支持。|
| `PROCESSLIST` | 不支持。 |
| `PROFILING` | 未实现。返回零行。 |
| `REFERENTIAL_CONSTRAINTS` | 未实现。返回零行。 |
| `ROUTINES` | 未实现。返回零行。 |
| [`SCHEMATA`](./schemata.md) | 提供了类似于 `SHOW DATABASES` 的信息。 |
| `SCHEMA_PRIVILEGES` | 未实现。返回零行。 |
| `SESSION_STATUS` | 未实现。返回零行。 |
| `SESSION_VARIABLES` | 不支持。 |
| `STATISTICS` | 不支持。 |
| [`TABLES`](./tables.md) | 提供了当前用户可见的表列表。类似于 `SHOW TABLES`。 |
| `TABLESPACES` | 不支持。 |
| `TABLE_PRIVILEGES` | 未实现。返回零行。 |
| `TRIGGERS` | 未实现。返回零行。 |
| `USER_ATTRIBUTES` | 不支持。 |
| `USER_PRIVILEGES` | 不支持。|
| `VARIABLES_INFO` | 不支持。 |
| `VIEWS`| 不支持。 |
<!-- | [`TABLE_CONSTRAINTS`](./table-constraints.md) | 提供了主键、唯一索引和外键的信息。 | -->

## GreptimeDB 提供的表

|表名|描述|
| --- | --- |
| [`BUILD_INFO`](./build-info.md) | 提供了系统构建的信息。 |
| [`GREPTIME_REGION_PEERS`](./greptime-region-peers.md) | 提供了区域存储的详细信息。 |
| [`RUNTIME_METRICS`](./runtime-metrics.md)| 提供了系统运行时指标。|

  