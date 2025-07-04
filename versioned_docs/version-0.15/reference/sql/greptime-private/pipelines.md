---
keywords: [pipelines, greptime private]
description: The pipelines table in the `greptime_private` database.
---

# pipelines

The `pipelines` table contains GreptimeDB Pipeline information.

```sql
USE greptime_private;

SELECT * FROM pipelines;
```

The output is as follows:

```sql
+----------------+--------+--------------+----------------------------------------------------------------------------------------------------------------------------------+----------------------------+
| name           | schema | content_type | pipeline                                                                                                                         | created_at                 |
+----------------+--------+--------------+----------------------------------------------------------------------------------------------------------------------------------+----------------------------+
| nginx_pipeline |        | yaml         | transform:                                                                                                                       | 2025-07-03 07:23:15.227539 |
                                            - fields:
                                                - response_size
                                                type: int32
                                            - fields:
                                                - timestamp
                                                type: time
                                                index: timestamp 
+----------------+--------+--------------+----------------------------------------------------------------------------------------------------------------------------------+----------------------------+
```

- `name`: The name of the pipeline;
- `schema`: The schema of the pipeline;
- `content_type`: The type of the pipeline;
- `pipeline`: The content of the pipeline;
- `created_at`: The creation time of the pipeline;

For more details, please refer to the [Manage Pipelines](/user-guide/logs/manage-pipelines.md) documentation. 
