---
keywords: [system metadata, database names, table names, column data types, INFORMATION_SCHEMA]
description: Provides access to system metadata, such as database or table names, column data types, and INFORMATION_SCHEMA tables for querying GreptimeDB system metadata.
---

# INFORMATION_SCHEMA

`INFORMATION_SCHEMA` provides access to system metadata, such as the name of a database or table, the data type of a column, etc. GreptimeDB also provides some custom `INFORMATION_SCHEMA` tables to query metadata about the GreptimeDB system itself, cluster information, and runtime telemetry for example.

Many `INFORMATION_SCHEMA` tables have a corresponding `SHOW` command. The benefit of querying `INFORMATION_SCHEMA` is that it is possible to join between tables.

There is still lots of work to do for `INFORMATION_SCHEMA`. The tracking [issue](https://github.com/GreptimeTeam/greptimedb/issues/2931) for `INFORMATION_SCHEMA`.

## Tables for MySQL compatibility

| Table Name | Description |
| --- | --- |
| [`CHARACTER_SETS`](./character-sets.md) | provides information about available character sets. |
| `CHECK_CONSTRAINTS`| Not implemented. Returns zero rows. |
| [`COLLATIONS`](./collations.md) | Provides a list of collations that the server supports. |
| [`COLLATION_CHARACTER_SET_APPLICABILITY`](./collation-character-set-applicability.md) | Explains which collations apply to which character sets. |
| [`COLUMNS`](./columns.md) | Provides a list of columns for all tables. |
| `COLUMN_PRIVILEGES` | Not implemented. Returns zero rows. |
| `COLUMN_STATISTICS` | Not supported. |
| [`ENGINES`](./engines.md) | Provides a list of supported storage engines. |
| `EVENTS` | Not implemented. Returns zero rows. |
| `FILES` | Not implemented. Returns zero rows. |
| `GLOBAL_STATUS` | Not implemented. Returns zero rows. |
| `GLOBAL_VARIABLES` | Not supported. |
| [`KEY_COLUMN_USAGE`](./key-column-usage.md) | Describes the key constraints of the columns, such as the primary key, and time index constraint. |
| `OPTIMIZER_TRACE` | Not implemented. Returns zero rows. |
| `PARAMETERS` | Not implemented. Returns zero rows. |
| [`PARTITIONS`](./partitions.md) | Provides a list of table partitions. |
| `PLUGINS` | Not supported.|
| `PROCESSLIST` | Not supported, please use `PROCESS_LIST` instead. |
| `PROFILING` | Not implemented. Returns zero rows. |
| `REFERENTIAL_CONSTRAINTS` | Not implemented. Returns zero rows. |
| `ROUTINES` | Not implemented. Returns zero rows. |
| [`SCHEMATA`](./schemata.md) | Provides similar information to `SHOW DATABASES`. |
| `SCHEMA_PRIVILEGES` | Not implemented. Returns zero rows. |
| `SESSION_STATUS` | Not implemented. Returns zero rows. |
| `SESSION_VARIABLES` | Not supported. |
| `STATISTICS` | Not supported. |
| [`TABLES`](./tables.md) | Provides a list of tables that the current user has visibility of. Similar to `SHOW TABLES`. |
| `TABLESPACES` | Not supported. |
| `TABLE_PRIVILEGES` | Not implemented. Returns zero rows. |
| `TRIGGERS` | Not implemented. Returns zero rows. |
| `USER_ATTRIBUTES` | Not supported. |
| `USER_PRIVILEGES` | Not supported.|
| `VARIABLES_INFO` | Not supported. |
| [`VIEWS`](./views.md)| Provides a list of views that the current user has visibility of. Similar to running `SHOW FULL TABLES WHERE table_type = 'VIEW'` |
| [`TABLE_CONSTRAINTS`](./table-constraints.md) | Provides information on primary keys, unique indexes, and foreign keys. |

## Tables that GreptimeDB provides

| Table Name | Description |
| --- | --- |
| [`BUILD_INFO`](./build-info.md) | Provides the system build info. |
| [`REGION_PEERS`](./region-peers.md) | Provides details about where regions are stored. |
| [`REGION_STATISTICS`](./region-statistics.md) | Provides details about region statistics info, such as disk size, etc. |
| [`RUNTIME_METRICS`](./runtime-metrics.md)| Provides the system runtime metrics.|
| [`CLUSTER_INFO`](./cluster-info.md)| Provides the topology information of the cluster.|
| [`FLOWS`](./flows.md) | Provides the flow information.|
| [`PROCEDURE_INFO`](./procedure-info.md) | Procedure information.|
| [`PROCESS_LIST`](./process-list.md) | Running queries information.|
| [`SSTS_INDEX_META`](./ssts-index-meta.md) | Provides SST index metadata including inverted indexes, fulltext indexes, and bloom filters.|
