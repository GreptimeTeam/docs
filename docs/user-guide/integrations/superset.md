---
keywords: [Apache Superset, BI tool, database configuration, installation steps, connection settings]
description: Guide to configuring GreptimeDB as a database in Apache Superset, including installation steps and connection settings.
---

# Superset

[Apache Superset](https://superset.apache.org) is an open source BI tool that
written in Python. To configure GreptimeDB as a database in Superset, you can
follow this guide.

## Installation

### Running Superset with Docker Compose

[Docker compose](https://superset.apache.org/docs/installation/docker-compose)
is the quickest way to try Superset locally. Upstream states it does not support
or recommend the `docker compose` constructs for production use, so treat this
path as evaluation only. To add GreptimeDB extension, create a
`requirements-local.txt` file in `docker/` of Superset codebase.

Add GreptimeDB dependency in `requirements-local.txt`:

```txt
greptimedb-sqlalchemy
```

Start Superset services:

```bash
docker compose -f docker-compose-non-dev.yml up
```

### Running Superset Locally

If you are [running Superset from
pypi](https://superset.apache.org/docs/installation/pypi), install our extension
to the same environment.

```bash
pip install greptimedb-sqlalchemy
```

:::note SQLAlchemy version
`greptimedb-sqlalchemy` currently requires SQLAlchemy 1.x. Superset 6.1.0 and
earlier pin SQLAlchemy 1.4, so the two are compatible today. Superset's main
branch has moved to SQLAlchemy 2.0, so a later Superset release will need a
dialect that supports 2.0 first.
:::

## Add GreptimeDB as database

To add GreptimeDB database, select *Settings* / *Database Connections*.

Add database and select *GreptimeDB* from list of supported databases.

Follow the SQLAlchemy URI pattern to provide your connection information:

```
greptimedb://<username>:<password>@<host>:<port>/<database>
```

- Ignore `<username>:<password>@` if you don't have
  [authentication](/user-guide/deployments-administration/authentication/overview.md) enabled.
- Use `4003` for default port (this extension uses Postgres protocol).
- Use `public` as default `database`. When using GreptimeCloud instance, use the
  database name from your instance.
