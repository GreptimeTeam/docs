---
keywords: [MindsDB, 机器学习平台, 数据库集成, 配置示例, SQL]
description: 介绍如何使用 MindsDB 将 GreptimeCloud 实例集成到机器学习平台，并提供了配置示例。
---

# MindsDB

[MindsDB](https://mindsdb.com/) 是一个开源的机器学习平台，使开发人员能够轻松地将
先进的机器学习能力与现有数据库集成。

使用 MindsDB 扩展，你的 GreptimeDB 实例可以开箱即用。
你可以使用 MySQL 协议将 GreptimeDB 配置为 MindsDB 中的数据源：

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
