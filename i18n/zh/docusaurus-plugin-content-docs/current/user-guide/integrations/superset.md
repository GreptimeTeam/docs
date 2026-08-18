---
keywords: [Superset, 数据源, Docker Compose, 本地运行, 添加数据库, SQLAlchemy URI, BI 工具]
description: 介绍如何将 GreptimeDB 作为 Apache Superset 的数据源，包括使用 Docker Compose 和本地运行 Superset 的安装步骤，以及添加 GreptimeDB 数据库的方法。
---

# Superset

[Apache Superset](https://superset.apache.org) 是开源的 BI 工具，用 Python 编写。
以下内容可以帮助你把 GreptimeDB 作为 Superset 的数据源。

## 安装

### 用 Docker Compose 运行 Superset

[Docker compose](https://superset.apache.org/docs/installation/docker-compose)
是本地快速试用 Superset 最简单的方式。上游明确表示不支持也不建议把 `docker compose`
用于生产环境，因此这条路径仅用于评估。在这种运行方式下，需要在 Superset 代码目录下的
`docker/` 中添加一个 `requirements-local.txt`。

并将 GreptimeDB 依赖加入到 `requirements-local.txt`:

```txt
greptimedb-sqlalchemy
```

启动 Supertset 服务：

```bash
docker compose -f docker-compose-non-dev.yml up
```

### 本地运行 Superset

假如你通过 [Pypi 包安装和运行
Superset](https://superset.apache.org/docs/installation/pypi)，需要将 GreptimeDB
的依赖安装到相同的 Python 环境。

```bash
pip install greptimedb-sqlalchemy
```

:::note SQLAlchemy 版本
`greptimedb-sqlalchemy` 要求 `sqlalchemy>=1.4,<2`。当前发行版 Superset 6.1.0 锁定
SQLAlchemy 1.4.54，可以正常配合使用。Superset 主分支已升级到 SQLAlchemy 2.0，后续
版本需要 dialect 先支持 2.0。如果你使用更老的 Superset，请自行核对它锁定的
SQLAlchemy 版本是否落在上述范围内。
:::

## 添加 GreptimeDB 数据库

准备添加，选择 *设置* / *数据库连接*.

添加数据库，并在支持的数据库列表中选择 *GreptimeDB*。

根据 SQLAlchemy URI 的规范，填写以下格式的数据库连接地址。

```
greptimedb://<username>:<password>@<host>:<port>/<database>
```

- 如果没有启动[认证](/user-guide/deployments-administration/authentication/overview.md)，可以忽略
  `<username>:<password>@` 部分。
- 默认端口 `4003` （我们用 PostgresSQL 协议通信）。
- 默认数据库 `public`。如果是使用 GreptimeCloud 实例，可以从控制台复制数据库名称。
