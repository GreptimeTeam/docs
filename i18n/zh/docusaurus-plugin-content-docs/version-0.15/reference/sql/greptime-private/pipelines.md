---
keywords: [pipelines, greptime private]
description: greptime_private 数据库中 pipelines 表。
---

# pipelines

`pipelines` 表包含 GreptimeDB 的 Pipeline 信息。

```sql
USE greptime_private;

SELECT * FROM pipelines;
```

输出如下：

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

- `name`: pipeline 名称；
- `schema`: pipeline 对应的 schema；
- `content_type`: pipeline 的类型；
- `pipeline`: pipeline 的具体内容；
- `created_at`: pipeline 的创建时间；

更多详情可参考 [管理 Pipelines](/user-guide/logs/manage-pipelines.md) 文档。 
