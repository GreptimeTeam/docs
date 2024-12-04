---
description: 介绍如何使用内置工具将 GreptimeDB 从 v0.4 及以上版本升级到最新版本，包括 CLI 工具的使用和具体步骤。
---

# 版本升级

从 `v0.4` 开始，我们提供了一个内置的工具来帮助您将以前的 GreptimeDB 部署升级到最新版本。
如果不同版本之间有 Breaking Change，我们都建议使用此方法在不同版本的 GreptimeDB 之间进行迁移升级。

此工具可以将 `v0.3.0` 以上的版本升级到最新版本。

## CLI

该工具在 `greptime` 二进制文件中。在开始之前，您需要准备目标版本的二进制文件。

```shell
greptime cli export --help
```

帮助文档如下：

```shell
greptime-cli-export 

USAGE:
    greptime cli export [OPTIONS] --addr <ADDR> --output-dir <OUTPUT_DIR> --target <TARGET>

OPTIONS:
      --addr <ADDR>
          Server address to connect

      --output-dir <OUTPUT_DIR>
          Directory to put the exported data. E.g.: /tmp/greptimedb-export

      --database <DATABASE>
          The name of the catalog to export
          
          [default: greptime-*]

  -j, --export-jobs <EXPORT_JOBS>
          Parallelism of the export
          
          [default: 1]

      --max-retry <MAX_RETRY>
          Max retry times for each job
          
          [default: 3]

  -t, --target <TARGET>
          Things to export
          
          [default: all]

          Possible values:
          - schema: Export all table schemas, corresponding to `SHOW CREATE TABLE`
          - data:   Export all table data, corresponding to `COPY DATABASE TO`
          - all:    Export all table schemas and data at once

      --log-dir <LOG_DIR>
          

      --start-time <START_TIME>
          A half-open time range: [start_time, end_time). The start of the time range (time-index column) for data export

      --end-time <END_TIME>
          A half-open time range: [start_time, end_time). The end of the time range (time-index column) for data export

      --log-level <LOG_LEVEL>
          

      --auth-basic <AUTH_BASIC>
          The basic authentication for connecting to the server

  -h, --help
          Print help (see a summary with '-h')

  -V, --version
          Print version
```

这里解释一些重要选项的含义：

- `-addr`：Frontend 节点或者 Standalone 进程的 http server 地址。
- `-output-dir`：要放置导出数据的目录。需要是当前机器上的路径。导出的 SQL 文件将放在该目录中。
- `-target`：指定要导出的数据。`schema` 选项会导出每个表的 `CREATE TABLE` 子句。`data` 选项会导出每个数据库的数据以及对应 DB 的 `COPY FROM` 语句。默认情况下会导出 `schema` 和 `data` 的所有数据，推荐不设定选项直接使用默认值以导出所有数据。

对于完整的升级，您需要使用每个目标选项两次执行此工具。

## 从 0.8.x 升级

这一节将演示如何从 `v0.8.x` 升级到 `v0.9.x`。

在下面的文本中，我们假设您的数据库的 HTTP 端口为 `127.0.0.1:4000`。

### 一次导出表结构和表数据

```shell
greptime cli export --addr '127.0.0.1:4000' --output-dir /tmp/greptimedb-export
```

如果成功，您将看到类似于以下内容的输出

```log
2024-08-01T06:32:26.547809Z  INFO cmd: Starting app: greptime-cli
2024-08-01T06:32:27.239639Z  INFO cmd::cli::export: Finished exporting greptime.greptime_private with 0 table schemas to path: /tmp/greptimedb-export/greptime/greptime_private/
2024-08-01T06:32:27.540696Z  INFO cmd::cli::export: Finished exporting greptime.pg_catalog with 0 table schemas to path: /tmp/greptimedb-export/greptime/pg_catalog/
2024-08-01T06:32:27.832018Z  INFO cmd::cli::export: Finished exporting greptime.public with 0 table schemas to path: /tmp/greptimedb-export/greptime/public/
2024-08-01T06:32:28.272054Z  INFO cmd::cli::export: Finished exporting greptime.test with 1 table schemas to path: /tmp/greptimedb-export/greptime/test/
2024-08-01T06:32:28.272166Z  INFO cmd::cli::export: Success 4/4 jobs, cost: 1.724222791s
2024-08-01T06:32:28.416532Z  INFO cmd::cli::export: Executing sql: COPY DATABASE "greptime"."greptime_private" TO '/tmp/greptimedb-export/greptime/greptime_private/' WITH (FORMAT='parquet');
2024-08-01T06:32:28.556017Z  INFO cmd::cli::export: Finished exporting greptime.greptime_private data into path: /tmp/greptimedb-export/greptime/greptime_private/
2024-08-01T06:32:28.556330Z  INFO cmd::cli::export: Finished exporting greptime.greptime_private copy_from.sql
2024-08-01T06:32:28.556424Z  INFO cmd::cli::export: Executing sql: COPY DATABASE "greptime"."pg_catalog" TO '/tmp/greptimedb-export/greptime/pg_catalog/' WITH (FORMAT='parquet');
2024-08-01T06:32:28.738719Z  INFO cmd::cli::export: Finished exporting greptime.pg_catalog data into path: /tmp/greptimedb-export/greptime/pg_catalog/
2024-08-01T06:32:28.738998Z  INFO cmd::cli::export: Finished exporting greptime.pg_catalog copy_from.sql
2024-08-01T06:32:28.739098Z  INFO cmd::cli::export: Executing sql: COPY DATABASE "greptime"."public" TO '/tmp/greptimedb-export/greptime/public/' WITH (FORMAT='parquet');
2024-08-01T06:32:28.875600Z  INFO cmd::cli::export: Finished exporting greptime.public data into path: /tmp/greptimedb-export/greptime/public/
2024-08-01T06:32:28.875888Z  INFO cmd::cli::export: Finished exporting greptime.public copy_from.sql
2024-08-01T06:32:28.876005Z  INFO cmd::cli::export: Executing sql: COPY DATABASE "greptime"."test" TO '/tmp/greptimedb-export/greptime/test/' WITH (FORMAT='parquet');
2024-08-01T06:32:29.053681Z  INFO cmd::cli::export: Finished exporting greptime.test data into path: /tmp/greptimedb-export/greptime/test/
2024-08-01T06:32:29.054104Z  INFO cmd::cli::export: Finished exporting greptime.test copy_from.sql
2024-08-01T06:32:29.054162Z  INFO cmd::cli::export: Success 4/4 jobs, costs: 781.98875ms
2024-08-01T06:32:29.054181Z  INFO cmd: Goodbye!

```

此时输出目录的结构如下

```plaintext
/tmp/greptimedb-export/
├── greptime/public
│   ├── copy_from.sql
│   ├── create_tables.sql
│   ├── up.parquet
│   └── other-tables.parquet
```

内容包括 `create_tables.sql`, `copy_from.sql` 和 DB `greptime-public` 的每个表的 parquet 文件。`create_tables.sql` 包含当前 DB 所有表的建表语句，`copy_from.sql` 则包含一条 `COPY DATABASE FROM` 的语句，用于将数据文件 COPY 到目标 DB。剩下的 parquet 个数的文件就是每个表的数据文件。

### 导入表结构和数据

然后您需要执行上一步生成的 SQL 文件。首先是 `create_tables.sql`。在之前的步骤中导出的 SQL 语句使用的是 PostgreSQL 方言，接下来的操作都将通过 [PostgreSQL 协议](/user-guide/protocols/postgresql.md)来进行。本文档假设客户端为 `psql`。

:::tip NOTICE
从这一步开始，所有的操作都是在新版本的 GreptimeDB 中完成的。

PostgreSQL 协议的默认端口是 `4003`。
:::

在执行以下命令之前，您需要在新部署中首先创建相应的数据库（但在本例中，数据库 `greptime-public` 是默认的）。

此命令将在新版本的 GreptimeDB 中创建所有表。

```shell
psql -h 127.0.0.1 -p 4003 -d public -f /tmp/greptimedb-export/greptime/public/create_tables.sql
```

接下来导入数据

```shell
psql -h 127.0.0.1 -p 4003 -d public -f /tmp/greptimedb-export/greptime/public/copy_from.sql
```

### 清理

到这一步，所有的数据都已经迁移完毕。您可以在新集群中检查数据。

在确认数据正确后，您可以清理旧集群和临时的 `--output-dir`。在本例中是 `/tmp/greptimedb-export`。

## 推荐流程

该部分给出了一个推荐的整体流程，以便平滑升级 GreptimeDB。如果您的环境可以在升级过程中离线，可以跳过此部分。

1. 创建一个全新的 v0.9.x 集群 
2. 使用 v0.9.x 版本的 cli 工具导出并导入 `create-table`
3. 将工作负载切换到新集群
4. 使用 v0.9.x 版本的 cli 工具导出并导入 `database-data`

注意

- 在步骤 2 和 3 之间对表结构的更改将丢失
- 在第四部完成之前，老数据在新集群上是不可见的。
