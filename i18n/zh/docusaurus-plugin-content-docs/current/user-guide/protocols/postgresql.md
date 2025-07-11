---
keywords: [pg, pgsql, PostgreSQL 协议, 连接数据库, 管理表, 写入数据, 读取数据, 时区, 外部数据]
description: 介绍如何通过 PostgreSQL 协议连接和使用 GreptimeDB。
---

# PostgreSQL

## 连接数据库

你可以通过端口 `4003` 使用 PostgreSQL 连接到 GreptimeDB。
只需在命令中添加 `-U` 参数，后跟你的用户名和密码。以下是一个示例：

```shell
psql -h <host> -p 4003 -U <username> -d public
```

- 请参考[鉴权认证](/user-guide/deployments-administration/authentication/overview.md) 来设置 GreptimeDB 的用户名和密码。
- 如果你想使用其他端口连接 PostgreSQL，请参考配置文档中的[协议选项](/user-guide/deployments-administration/configuration.md#协议选项)。

## 管理表

请参考[管理表](/user-guide/deployments-administration/manage-data/basic-table-operations.md)。

## 写入数据

请参考[写入数据](/user-guide/ingest-data/for-iot/sql.md).

## 读取数据

请参考 [读取数据](../query-data/sql.md).

## 时区

GreptimeDB 的 PostgreSQL 协议遵循原始 PostgreSQL 的 [时区处理方式](https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-TIMEZONES)。

默认情况下，PostgreSQL 使用服务器的时区来处理时间戳。
你可以使用 SQL 语句 `SET TIMEZONE TO '<value>';` 为当前会话设置 `time_zone` 变量来覆盖服务器时区。
`time_zone` 的值可以是：

- 时区的全称，例如 `America/New_York`。
- 时区的缩写，例如 `PST`。
- UTC 的偏移量，例如 `+08:00`。

你可以使用 `SHOW` 来查看当前的时区设置。例如：

```sql
SHOW VARIABLES time_zone;
```

```sql
 TIME_ZONE
-----------
 UTC
```

将会话时区更改为 `+1:00`：

```SQL
SET TIMEZONE TO '+1:00'
```

有关时区如何影响数据的插入和查询，请参考[写入数据](/user-guide/ingest-data/for-iot/sql.md#时区)和[查询数据](/user-guide/query-data/sql.md#时区)中的 SQL 文档。

## 外部数据

利用 Postgres 的 [FDW 扩
展](https://www.postgresql.org/docs/current/postgres-fdw.html)，GreptimeDB 可以
被配置为 Postgres 的外部数据服务。这使得我们可以用 Postgres 服务器上无缝地查询
GreptimeDB 里的时序数据，并且可以利用 join 查询同时关联两边的数据。

举个例子，类似设备信息类的物联网元数据，通常存储在 Postgres 这样的关系型数据库中。
现在我们可以利用这个功能，先在 Postgres 利用关系查询过滤出满足条件的设备 ID，然
后直接关联的 GreptimeDB 承载的外部表上查询设备的时序数据。

### 配置

首先要确保 GreptimeDB 打开了 Postgres 协议，并且她可以被 Postgres 服务器访问到。

在 Postgres 上开启 fdw 扩展。

```sql
CREATE EXTENSION postgres_fdw;
```

将 GreptimeDB 添加为远程服务器。

```sql
CREATE SERVER greptimedb
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host 'greptimedb_host', dbname 'public', port '4003');
```

把 Postgres 用户映射到 GreptimeDB 上。这一步是必须步骤。如果你没有在 GreptimeDB
开源版本上启用认证，这里可以填写任意的认证信息。

```sql
CREATE USER MAPPING FOR postgres
SERVER greptimedb
OPTIONS (user 'greptime', password '...');
```

在 Postgres 创建与 GreptimeDB 映射的外部表。这一步是为了告知 Postgres 相应表的数
据结构。注意需要将 GreptimeDB 的数据类型映射到 Postgres 类型上。

对于这样的 GreptimeDB 表：

```sql
CREATE TABLE grpc_latencies (
  ts TIMESTAMP TIME INDEX,
  host STRING,
  method_name STRING,
  latency DOUBLE,
  PRIMARY KEY (host, method_name)
) with('append_mode'='true');

CREATE TABLE app_logs (
  ts TIMESTAMP TIME INDEX,
  host STRING,
  api_path STRING FULLTEXT INDEX,
  log_level STRING,
  log STRING FULLTEXT INDEX,
  PRIMARY KEY (host, log_level)
) with('append_mode'='true');
```

其 Postgres 外部表定义如下：

```sql
CREATE FOREIGN TABLE ft_grpc_latencies (
  ts TIMESTAMP,
  host VARCHAR,
  method_name VARCHAR,
  latency DOUBLE precision
)
SERVER greptimedb
OPTIONS (table_name 'grpc_latencies');

CREATE FOREIGN TABLE ft_app_logs (
  ts TIMESTAMP,
  host VARCHAR,
  api_path VARCHAR,
  log_level VARCHAR,
  log VARCHAR
)
SERVER greptimedb
OPTIONS (table_name 'app_logs');
```

为了帮助用户生成这些语句，我们在 GreptimeDB 里增强了 `SHOW CREATE TABLE` 来直接
输出可执行的语句。

```sql
SHOW CREATE TABLE grpc_latencies FOR postgres_foreign_table;
```

注意在输出的语句中你需要把服务器名 `greptimedb` 替换为之前在 `CREATE SERVER` 语句
里使用的名字。

### 执行查询

至此你可以通过 Postgres 发起查询。并且可以使用一些同时存在在 GreptimeDB 和
Postgres 上的函数，如 `date_trunc` 等。

```sql
SELECT * FROM ft_app_logs ORDER BY ts DESC LIMIT 100;

SELECT
    date_trunc('MINUTE', ts) as t,
    host,
    avg(latency),
    count(latency)
FROM ft_grpc_latencies GROUP BY host, t;
```

## 语句执行超时

您可以通过 SQL 语句 `SET statement_timeout = <value>` 或 `SET STATEMENT_TIMEOUT = <value>` 为当前会话设置 `statement_timeout` 变量，该变量指定语句执行的最大时间（以毫秒为单位）。如果语句的执行时间超过指定时间，服务器将终止该语句。

例如，将最大执行时间设置为 10 秒：

```SQL
SET statement_timeout=10000;
```
