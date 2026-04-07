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
is the recommended way to run Superset. To add GreptimeDB extension, create a
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
