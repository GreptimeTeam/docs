---
keywords: [DBeaver, MySQL Driver, 数据库工具, 连接 GreptimeDB, 配置连接, 数据库管理]
description: 介绍如何使用 DBeaver 通过 MySQL Driver 连接到 GreptimeDB，包括配置连接的详细步骤。
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
- Host：如果 GreptimeDB 运行在本机，则为 `localhost`
- Port：如果使用默认的 GreptimeDB 配置，则为 `4002`
- Database：`public`，你也可以使用你创建的其他数据库名称
- 如果你的 GreptimeDB 启用了身份验证，请输入 username 和 password，否则留空

点击“Test Connection”以验证连接设置，然后点击“Finish”以保存连接。

有关 MySQL 与 GreptimeDB 交互的更多信息，请参阅 [MySQL 协议文档](/user-guide/protocols/mysql.md)。

