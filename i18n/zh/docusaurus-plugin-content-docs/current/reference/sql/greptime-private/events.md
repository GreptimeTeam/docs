---
keywords: [事件, greptime private, 系统表]
description: greptime_private 数据库中的 events 表。
---

# events

`events` 表保存 GreptimeDB 运行期间产生的事件。单机部署记录受支持的本地 DDL Procedure 事件；带有 Metasrv 的分布式部署还可以记录运维事件。事件会异步写入，写入失败不会影响原操作的执行结果。因此，不能以事件是否出现作为操作成功的依据。

事件记录器首次写入事件时会创建 `greptime_private.events` 系统表。此表以及 `greptime_private.slow_queries` 和 `greptime_private.region_statistics_history` 都是内部系统表；即使服务端全局配置或请求级 `auto_create_table` hint 禁用了自动建表，内部写入仍可创建这些表并以添加缺失列的方式协调表结构。白名单中的表不会使同一写入请求中的其他表获得此例外。对于 `events`，协调会补齐当前事件表结构中缺少的列。尚未记录任何事件，或已禁用事件记录时，查询会提示表不存在。配置方法请参阅[事件记录配置](/user-guide/deployments-administration/configuration.md#事件记录配置)。

```sql
USE greptime_private;

SELECT timestamp, type
FROM events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

字段定义请参阅[事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)。DDL Procedure 查询示例请参阅[DDL 事件](/user-guide/deployments-administration/monitoring/events/ddl-events.md)。
