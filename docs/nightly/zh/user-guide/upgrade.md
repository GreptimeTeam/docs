# Upgrade

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

          Possible values:
          - create-table:  Corresponding to `SHOW CREATE TABLE`
          - table-data:    Corresponding to `EXPORT TABLE`
          - database-data: Corresponding to `EXPORT DATABASE`

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

- `-addr`：Frontend 节点或者 Standalone 进程的 gRPC 地址。
- `-output-dir`：要放置导出数据的目录。需要是当前机器上的路径。导出的 SQL 文件将放在该目录中。
- `-target`：要导出的内容。`create-table` 可以导出每个表的 `CREATE TABLE` 语句。`database-data` 可以导出每个表的数据以及对应 DB 的 `COPY FROM` 语句。

对于完整的升级，您需要使用每个目标选项两次执行此工具。

## 从 0.7.x 升级

这一节将演示如何从 `v0.7.x` 升级到 `v0.8.0`。

在下面的文本中，我们假设您的数据库的 HTTP 端口为 `127.0.0.1:4000`。

### 导出 `CREATE TABLE`

```shell
greptime cli export --addr '127.0.0.1:4000' --output-dir /tmp/greptimedb-export --target create-table
```

如果成功，您将看到类似于以下内容的输出

```log
2023-10-20T09:41:06.500390Z INFO cmd::cli::export: Finished exporting greptime.public with 434 table schemas to path: /tmp/greptimedb-export/greptime/public
2023-10-20T09:41:06.500482Z  INFO cmd::cli::export: success 1/1 jobs
```

此时输出目录的结构如下

```plaintext
/tmp/greptimedb-export/
 └── greptime/public/
      └── create_tables.sql
```

### 处理 Breaking Changes
:::warning 注意
从版本 0.7.x 升级时存在已知的 Breaking Changes。您需要手动编辑导出的 SQL 文件（即 /tmp/greptimedb-export/greptime/public/create_tables.sql）
:::

#### 删除 `WITH` 从句中的 `regions` 选项

修改前:
```sql
CREATE TABLE foo (
    host string,
    ts timestamp DEFAULT '2023-04-29 00:00:00+00:00',
    TIME INDEX (ts),
    PRIMARY KEY(host)
) ENGINE=mito 
WITH( # 删除
    regions=1
);
```

修改后:
```sql
CREATE TABLE foo (
    host string,
    ts timestamp DEFAULT '2023-04-29 00:00:00+00:00',
    TIME INDEX (ts),
    PRIMARY KEY(host)
) ENGINE=mito;
```

#### 重写分区规则

修改前:
```sql
PARTITION BY RANGE COLUMNS (n) (
     PARTITION r0 VALUES LESS THAN (1),
     PARTITION r1 VALUES LESS THAN (10),
     PARTITION r2 VALUES LESS THAN (100),
     PARTITION r3 VALUES LESS THAN (MAXVALUE),
)
```

修改后:
```sql
PARTITION ON COLUMNS (n) (
     n < 1,
     n >= 1 AND n < 10,
     n >= 10 AND n < 100,
     n >= 100
)
```

#### 删除内部列

修改前:
```sql
CREATE TABLE IF NOT EXISTS "phy" (
  "ts" TIMESTAMP(3) NOT NULL,
  "val" DOUBLE NULL,
  "__table_id" INT UNSIGNED NOT NULL,
  "__tsid" BIGINT UNSIGNED NOT NULL,
  "host" STRING NULL,
  "job" STRING NULL,
  PRIMARY KEY ("__table_id", "__tsid", "host", "job") # 修改此处
)
ENGINE=metric
WITH(
  physical_metric_table = '',
  regions = 1
);
```

修改后:
```sql
CREATE TABLE IF NOT EXISTS "phy" (
  "ts" TIMESTAMP(3) NOT NULL,
  "val" DOUBLE NULL,
  "host" STRING NULL,
  "job" STRING NULL,
  PRIMARY KEY ("host", "job")
)
ENGINE=metric
WITH(
  physical_metric_table = ''
);
```


#### 添加缺失的 Time Index 约束

修改前:
```sql
CREATE TABLE IF NOT EXISTS "phy" (
  "ts" TIMESTAMP(3) NOT NULL,
  "val" DOUBLE NULL,
  "host" STRING NULL,
  "job" STRING NULL,
  PRIMARY KEY ("host", "job")
)
ENGINE=metric
WITH(
  physical_metric_table = ''
);
```

修改后:
```sql
CREATE TABLE IF NOT EXISTS "phy" (
  "ts" TIMESTAMP(3) NOT NULL,
  "val" DOUBLE NULL,
  "host" STRING NULL,
  "job" STRING NULL,
  PRIMARY KEY ("host", "job")
  TIME INDEX ("ts") # 添加在此处
)
ENGINE=metric
WITH(
  physical_metric_table = ''
);
```

#### 为 InfluxDB 协议的表更新建表语句

相关 [issue](https://github.com/GreptimeTeam/greptimedb/pull/3794)

修改前:
```sql
CREATE TABLE IF NOT EXISTS "phy" (
  "ts" TIMESTAMP(6) NOT NULL, # 修改此处
  "val" DOUBLE NULL,
  "host" STRING NULL,
  "job" STRING NULL,
  PRIMARY KEY ("host", "job"),
  TIME INDEX ("ts")
)
ENGINE=mito;
```

修改后:
```sql
CREATE TABLE IF NOT EXISTS "phy" (
  "ts" TIMESTAMP(9) NOT NULL,
  "val" DOUBLE NULL,
  "host" STRING NULL,
  "job" STRING NULL,
  PRIMARY KEY ("host", "job"),
  TIME INDEX ("ts")
)
ENGINE=mito;
```

### 导出表数据

```shell
greptime cli export --addr '127.0.0.1:4000' --database greptime-public --output-dir /tmp/greptimedb-export --target database-data
```

日志输出与上面类似。输出目录的结构如下

```plaintext
/tmp/greptimedb-export/
├── greptime/public
│   ├── copy_from.sql
│   ├── create_tables.sql
│   ├── up.parquet
│   └── other-tables.parquet
```

新的内容是 `copy_from.sql` 和 DB `greptime-public` 的每个表的 parquet 文件。前者包含每个表的 `COPY FROM` 语句。后者包含每个表的数据。

### 导入表结构和数据

然后您需要执行上一步生成的 SQL 文件。首先是 `create_tables.sql`。在之前的步骤中导出的 SQL 语句使用的是 PostgreSQL 方言，接下来的操作都将通过 [PG 协议](/user-guide/clients/postgresql.md)来进行。本文档假设客户端为 `psql`。

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

### 已知问题

#### 升级工具依然会导出 0.7.0 中的物理表数据
在将 v0.7.0 的数据导入至 v0.8.0 时，数据库可能会出现以下错误。可直接忽略，该错误并不会影响数据的完整性。
```
psql:/tmp/greptimedb-export/greptime-public_copy_from.sql:2: ERROR:  Alter request to physical region is forbidden
```

### 清理

到这一步，所有的数据都已经迁移完毕。您可以在新集群中检查数据。

在确认数据正确后，您可以清理旧集群和临时的 `--output-dir`。在本例中是 `/tmp/greptimedb-export`。

## 推荐流程

该部分给出了一个推荐的整体流程，以便平滑升级 GreptimeDB。如果您的环境可以在升级过程中离线，可以跳过此部分。

1. 创建一个全新的 v0.8.0 集群 
2. 使用 v0.8.0 版本的 cli 工具导出并导入 `create-table`
3. 将工作负载切换到新集群
4. 使用 v0.8.0 版本的 cli 工具导出并导入 `database-data`

注意

- 在步骤 2 和 3 之间对表结构的更改将丢失
- 在第四部完成之前，老数据在新集群上是不可见的。
