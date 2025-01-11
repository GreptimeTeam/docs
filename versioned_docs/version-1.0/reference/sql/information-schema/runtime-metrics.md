---
keywords: [runtime metrics, system metrics, HTTP endpoint, cluster metrics]
description: Provides information about the `RUNTIME_METRICS` table, which includes system runtime metrics from the `/metrics` HTTP endpoint output in the cluster.
---

# RUNTIME_METRICS

The `RUNTIME_METRICS` table provides system runtime metrics. It includes all metrics from the `/metrics` HTTP endpoint output in the cluster.

```sql
USE INFORMATION_SCHEMA;

SELECT * FROM RUNTIME_METRICS;
```

Sample output is as follows:

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

The columns in the output:

* `metric_name`: the metric name.
* `value`: the metric value.
* `labels`: the metric labels and values, separated by `,`.
* `node:` the metric which peer it comes from
* `node_type`: the peer type, such as `datanode`, `frontend` etc.
* `timestamp`: the metric timestamp

