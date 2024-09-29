# 备份和恢复数据

定期备份数据库非常重要。在出现问题时，例如系统崩溃、硬件故障或意外删除数据，你可以使用备份的数据快速恢复服务。

本文档提供了使用 [Greptime 命令行](/reference/command-lines.md)和 SQL [`COPY` 命令](/reference/sql/copy.md)备份和恢复数据的操作步骤。

## 备份和恢复 schema

在备份恢复表或数据库的数据之前，需要备份恢复表 schema 。

### 备份 schema

下面的示例命令行连接到了位于 `127.0.0.1:4000` 的 GreptimeDB 服务器，并将每个表的 `CREATE TABLE` SQL 语句导出到文件夹`/home/backup/schema/`：

```shell
greptime cli export --addr '127.0.0.1:4000' --output-dir /home/backup/schema/ --target create-table
```

### 恢复 schema

请使用 PostgreSQL 客户端将 schema 恢复到指定的数据库。
例如，以下命令行运行了文件 `greptime-public.sql` 中的 `CREATE TABLE` 语句，
在 `public` 数据库中创建了相应的表 schema：

```shell
psql -h 127.0.0.1 -p 4003 -d public -f /home/backup/schema/greptime-public.sql
```

## 备份和恢复表

在恢复数据之前，请确保表存在于数据库中。
为了避免丢失表 schema ，你可以在备份表数据的同时[备份表 schema](#备份-schema)。在恢复数据之前[恢复 schema](#恢复-schema)。

### 备份表

以下 SQL 命令将 `monitor` 表以 `parquet` 格式备份到文件 `/home/backup/monitor/monitor.parquet` 中：

```sql
COPY monitor TO '/home/backup/monitor/monitor.parquet' WITH (FORMAT = 'parquet');
```

要备份特定时间范围内的数据，可以指定 `START_TIME` 和 `END_TIME` 选项。
例如，以下命令可以导出日期为 `2024-05-18` 的数据。

```sql
COPY monitor TO '/home/backup/monitor/monitor_20240518.parquet' WITH (FORMAT = 'parquet', START_TIME='2024-05-18 00:00:00', END_TIME='2024-05-19 00:00:00');
```

### 恢复表

恢复 `monitor` 表：

```sql
COPY monitor FROM '/home/backup/monitor/monitor.parquet' WITH (FORMAT = 'parquet');
```

如果你以增量方式导出数据，每个文件具有不同的名称但位于同一文件夹中，可以使用 `PATTERN` 选项进行恢复：

```sql
COPY monitor FROM '/home/backup/monitor/' WITH (FORMAT = 'parquet', PATTERN = '.*parquet');
```

## 备份和恢复数据库

在恢复数据之前，请确保数据库和表存在于数据库中。
如果数据库不存在，请使用以下 SQL 命令首先创建数据库：

```sql
CREATE DATABASE <dbname>;
```

为了避免丢失表 schema ，在备份数据库数据时，你可以同时[备份表 schema](#备份-schema)。在恢复数据之前[恢复 schema](#恢复-schema)。

### 备份数据库

下面的 SQL 命令将 `public` 数据库以 `parquet` 格式备份到文件夹 `/home/backup/public/` 中：

```sql
COPY DATABASE public TO '/home/backup/public/' WITH (FORMAT='parquet');
```

当你查看文件夹 `/home/backup/public/` 时，你会发现每个表都被导出为了单独的文件。

### 恢复数据库

下面的 SQL 命令从文件夹 `/home/backup/public/` 中恢复 `public` 数据库：

```sql
COPY DATABASE public FROM '/home/backup/public/' WITH (FORMAT='parquet');
```
