---
keywords: [MindsDB, 机器学习平台, 数据库集成, 配置示例, SQL]
description: 介绍如何将 GreptimeDB 作为 MindsDB 的数据源，用于机器学习场景，并提供配置示例。
---

# MindsDB

[MindsDB](https://mindsdb.com/) 是一个开源的机器学习平台，使开发人员能够轻松地将
先进的机器学习能力与现有数据库集成。

MindsDB 通过其 GreptimeDB handler 使用 MySQL 协议访问 GreptimeDB。

该 handler 属于 [community handler](https://github.com/mindsdb/community-handlers/tree/main/community_handlers/greptimedb_handler)，而 community handler 默认是关闭的。创建数据源之前需要先开启，然后重启 MindsDB：

```bash
export MINDSDB_COMMUNITY_HANDLERS=true
```

开启之后，将 GreptimeDB 配置为数据源：

```sql
CREATE DATABASE greptime_datasource
WITH ENGINE = 'greptimedb',
PARAMETERS = {
  "host": "<host>",
  "port": 4002,
  "database": "<dbname>",
  "user": "<username>",
  "password": "<password>",
  "ssl": True
};

```

- `<host>` 是你的 GreptimeDB 实例的主机名或 IP 地址。
- `<dbname>` 是你想要连接的数据库名称。
- `<username>` 和 `<password>` 是你 [GreptimeDB 的鉴权信息](/user-guide/deployments-administration/authentication/static.md)。

MindsDB 是许多机器学习功能的优秀门户，包括您存储在我们实例中的时间序列数据的时间序列预测。
访问 [MindsDB docs](https://docs.mindsdb.com/what-is-mindsdb) 了解更多。
