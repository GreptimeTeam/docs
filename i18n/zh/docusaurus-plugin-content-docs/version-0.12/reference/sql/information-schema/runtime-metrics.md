---
keywords: [运行时指标, RUNTIME_METRICS 表, 系统指标, 集群指标, HTTP 端点]
description: RUNTIME_METRICS 表提供系统运行时指标，包括集群中 `/metrics` HTTP 端点输出的所有指标。
---

# RUNTIME_METRICS

`RUNTIME_METRICS`表提供系统运行时指标。它包括集群中`/metrics` HTTP 端点输出的所有指标。

```sql
USE INFORMATION_SCHEMA;

SELECT * FROM RUNTIME_METRICS;
```

结果如下：

```sql
+------------------------------------------------------+------------------------+--------------------------------------------------------+---------+-----------+----------------------------+
| metric_name                                          | value                  | labels                                                 | node    | node_type | timestamp                  |
+------------------------------------------------------+------------------------+--------------------------------------------------------+---------+-----------+----------------------------+
| greptime_app_version                                 |                      1 | short_version=0.7.1, version=greptimedb-main-92a8e86   | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_catalog_catalog_count                       |                      1 |                                                        | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_catalog_schema_count                        |                      2 |                                                        | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_bucket                  |                      1 | le=0.005                                               | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_bucket                  |                      1 | le=0.01                                                | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_bucket                  |                      1 | le=0.025                                               | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_bucket                  |                      1 | le=0.05                                                | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_bucket                  |                      1 | le=0.1                                                 | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_bucket                  |                      1 | le=0.25                                                | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_bucket                  |                      1 | le=0.5                                                 | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_bucket                  |                      1 | le=1                                                   | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_bucket                  |                      1 | le=2.5                                                 | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_bucket                  |                      1 | le=5                                                   | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_bucket                  |                      1 | le=10                                                  | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_bucket                  |                      1 | le=+Inf                                                | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_sum                     |            0.000290333 |                                                        | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_count                   |                      1 |                                                        | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_catalog_counter                 |                      1 |                                                        | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_schema_bucket                   |                      3 | le=0.005                                               | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_schema_bucket                   |                      3 | le=0.01                                                | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_schema_bucket                   |                      3 | le=0.025                                               | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_schema_bucket                   |                      3 | le=0.05                                                | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_schema_bucket                   |                      3 | le=0.1                                                 | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_schema_bucket                   |                      3 | le=0.25                                                | unknown | unknown   | 2024-03-27 22:43:12.898000 |
| greptime_meta_create_schema_bucket                   |                      3 | le=0.5                                                 | unknown | unknown   | 2024-03-27 22:43:12.898000 |

...
```

结果中的列：

* `metric_name`：指标名称。
* `value`：指标值。
* `labels`：指标标签和值，用`,`分隔。
* `node:` 指标来自哪个节点
* `node_type`：节点类型，如`datanode`、`frontend`等。
* `timestamp`：指标时间戳
