---
keywords: [Metabase, 数据源, 安装 Driver, 添加数据库, BI 工具, 数据分析]
description: 介绍如何将 GreptimeDB 添加到 Metabase 作为数据源，包括安装 Driver 和添加 GreptimeDB 数据库的方法。
---

# Metabase

[Metabase](https://github.com/metabase/metabase) 是一个用 Clojure 编写的开源 BI
工具，可以通过社区维护的数据库驱动将 GreptimeDB 添加到 Metabase。

## 安装

从 [发布
页](https://github.com/greptimeteam/greptimedb-metabase-driver/releases/latest/)
下载最新的驱动插件文件 `greptimedb.metabase-driver.jar`，并将文件拷贝到 Metabase
的工作目录下 `plugins/` 目录中（如果不存在需要创建 `plugins/`）。当 Metabase 启
动时，会自动检测到插件。

## 添加 GreptimeDB 数据库

选择 *设置* / *管理员设置* / *数据库*, 点击  *添加数据库* 按钮并选择 GreptimeDB
作为 *数据库类型*.

进一步添加其他数据库信息：

- 端口请填写 GreptimeDB 的 Postgres 协议端口 `4003`。
- 如果没有开启[认证](/user-guide/deployments-administration/authentication/overview.md)，用户名和密码字段
  是可选的。
- 默认填写 `public` 作为 *数据库名*。如果是使用 GreptimeCloud 的实例，可以从控制
  台复制数据库名称。
