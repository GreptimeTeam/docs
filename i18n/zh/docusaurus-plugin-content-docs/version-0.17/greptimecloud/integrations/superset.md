---
keywords: [Superset, 数据源, 连接信息, URL 格式, GreptimeCloud]
description: 介绍如何在 Apache Superset 中将 GreptimeCloud 作为数据源，包括连接信息和 URL 格式。
---

# Superset

[Apache Superset](https://superset.apache.org) 是开源的 BI 工具，用 Python 编写。
以下内容可以帮助你把 GreptimeDB 作为 Superset 的数据源。

关于插件的安装，请[查看文
档](https://docs.greptime.cn/user-guide/integrations/superset).

## 连接信息

从数据库列表中选择 `GreptimeDB`。

填写以下 URL

```
greptimedb://<username>:<password>@<host>:4003/<dbname>
```
