---
keywords: [DBeaver, 数据库工具, MySQL Driver, 数据库连接, 配置步骤]
description: 介绍如何使用 DBeaver 通过 MySQL Driver 连接到 GreptimeCloud，并提供了连接信息和配置步骤。
---

# DBeaver

[DBeaver](https://dbeaver.io/) 是一个免费、开源且跨平台的数据库工具，支持所有流行的数据库。
由于其易用性和丰富的功能集，它在开发人员和数据库管理员中非常受欢迎。
你可以使用 DBeaver 通过 MySQL Driver 连接到 GreptimeDB。

点击 DBeaver 工具栏中的“New Database Connection”按钮，以创建 GreptimeDB 的新连接。

选择 MySQL 并点击“下一步”以配置连接。
如果你还没有安装 MySQL Driver，请先安装。
接下来输入以下连接信息：

- Connect by Host
- Host: `<host>`
- Port: `4002`
- Database: `<dbname>`
- 输入用户名 `<username>` 和密码 `<password>`

点击“Test Connection”以验证连接设置，然后点击“Finish”以保存连接。

有关 MySQL 与 GreptimeDB 交互的更多信息，请参阅 [MySQL 协议文档](https://docs.greptime.cn/user-guide/protocols/mysql)。
