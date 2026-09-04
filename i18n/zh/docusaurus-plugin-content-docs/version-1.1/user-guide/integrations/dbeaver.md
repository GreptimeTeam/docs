---
keywords: [DBeaver, GreptimeDB 驱动, MySQL Driver, 数据库工具, 连接 GreptimeDB, 配置连接, 数据库管理]
description: 介绍如何使用 DBeaver 内置的 GreptimeDB 驱动连接 GreptimeDB，包括连接配置、数据浏览以及使用 MySQL Driver 的方式。
---

# DBeaver

[DBeaver](https://dbeaver.io/) 是一个免费、开源、跨平台的数据库工具。
DBeaver 26.1.5 及以上版本内置了 GreptimeDB 驱动，通过 MySQL 协议连接。

## 创建连接

点击 DBeaver 工具栏中的“New Database Connection”按钮，在数据库列表中选择 GreptimeDB，然后点击“Next”。

连接配置页面已经填入 GreptimeDB 的默认值：

- Connect by：Host
- Host：如果 GreptimeDB 运行在本机，则为 `localhost`
- Port：如果使用默认的 GreptimeDB 配置，则为 `4002`
- Database/Schema：`public`，你也可以使用你创建的其他数据库名称
- 如果你的 GreptimeDB 启用了身份验证，请输入 username 和 password，否则留空

![DBeaver 中的 GreptimeDB 连接配置](/dbeaver/connection-settings.png)

点击“Test Connection”以验证连接设置，然后点击“Finish”以保存连接。

## 浏览数据

数据库导航器中会列出 `public`、`information_schema`、`greptime_private` 以及各自的表。
打开一张表，可以在“Data”标签页浏览数据，也可以在 SQL 编辑器中执行查询。
“Properties”标签页显示每一列的列名、数据类型，以及 GreptimeDB 的 semantic type：`TIMESTAMP`、`TAG` 或 `FIELD`。

![在 DBeaver 中浏览表数据](/dbeaver/browse-data.png)

## 使用 MySQL Driver

在 26.1.5 之前的 DBeaver 版本中，请选择 MySQL 而不是 GreptimeDB，并在未安装 MySQL Driver 时先安装。连接信息相同，只是 host、port 和数据库名需要自行填写。

两种驱动都只覆盖 MySQL 协议提供的能力。有关 MySQL 与 GreptimeDB 交互的更多信息，请参阅 [MySQL 协议文档](/user-guide/protocols/mysql.md)。
