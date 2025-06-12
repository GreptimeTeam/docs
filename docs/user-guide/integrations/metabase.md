---
keywords: [Metabase, BI tool, data source, driver plugin, connection settings]
description: Instructions for configuring GreptimeDB as a data source in Metabase, including installation of the driver plugin and connection settings.
---

# Metabase

[Metabase](https://github.com/metabase/metabase) is an open source BI tool that
written in Clojure. You can configure GreptimeDB as a metabase data source from
a community driver plugin.

## Installation

Download the driver plugin file `greptimedb.metabase-driver.jar` from its
[release
page](https://github.com/greptimeteam/greptimedb-metabase-driver/releases/latest/). Copy
the jar file to `plugins/` of metabase's working directory. It will be
discovered by Metabase automatically.

## Add GreptimeDB as database

To add GreptimeDB database, select *Settings* / *Admin Settings* / *Databases*,
click *Add Database* button and select GreptimeDB from *Database type*.

You will be asked to provide host, port, database name and authentication
information.

- Use Greptime's Postgres protocol port `4003` as port. If you changed the
  defaults, use you own settings.
- Username and password are optional if you didn't enable
  [authentication](/user-guide/deployments-administration/authentication/overview.md).
- Use `public` as default *Database name*. When using GreptimeCloud instance,
  use the database name from your instance.
