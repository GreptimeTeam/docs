---
keywords: [Superset, BI tool, data source, SQLAlchemy, connection information]
description: Guide for configuring GreptimeCloud as a data source in Superset, including connection information and SQLAlchemy URL format.
---

# Superset

[Superset](https://superset.apache.org) is an open source BI tool that written
in Python. You can configure GreptimeDB as a metabase data source from python
package.

See [our docs](https://docs.greptime.com/user-guide/integrations/superset) for
the instructions of plugin installation.

## Connection information

Select `GreptimeDB` from database list.

Use following SQlAlchemy URL for connection:

```
greptimedb://<username>:<password>@<host>:4003/<dbname>
```
