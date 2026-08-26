---
keywords: [MindsDB, machine learning, data source, configuration, SQL]
description: Guide on configuring GreptimeDB as a data source in MindsDB for machine learning capabilities.
---

# MindsDB

[MindsDB](https://mindsdb.com/) is an open-source machine learning platform that
enables developers to easily incorporate advanced machine learning capabilities
with existing databases.

MindsDB reaches GreptimeDB through the MySQL protocol using its GreptimeDB handler.

The handler ships as a [community handler](https://github.com/mindsdb/community-handlers/tree/main/community_handlers/greptimedb_handler), and community handlers are disabled by default. Enable them before creating the data source, then restart MindsDB:

```bash
export MINDSDB_COMMUNITY_HANDLERS=true
```

Once enabled, configure GreptimeDB as a data source:

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

- `<host>` is the hostname or IP address of your GreptimeDB instance.
- `<dbname>` is the name of the database you want to connect to.
- `<username>` and `<password>` are your [GreptimeDB credentials](/user-guide/deployments-administration/authentication/static.md).

MindsDB is a great gateway for many machine learning features, including
time-series forecasting, for your time series data stored in our instance. See
[MindsDB docs](https://docs.mindsdb.com/what-is-mindsdb) for more information.
