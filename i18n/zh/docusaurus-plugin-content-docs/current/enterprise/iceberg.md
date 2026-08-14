---
keywords: [Iceberg, REST catalog, pyiceberg, Spark, parquet, 数据导出, 开放表格式]
description: 通过 Apache Iceberg REST catalog 使用 pyiceberg、Spark、Trino、DuckDB 等引擎读取 GreptimeDB 表——无需连接器，也无需复制数据。
---

# Iceberg 导出

GreptimeDB Enterprise 可以通过 [Apache Iceberg](https://iceberg.apache.org/) REST catalog 暴露其表，使得外部查询引擎——pyiceberg、Spark、Trino、DuckDB 以及任何兼容 Iceberg 的客户端——都能使用标准的 Iceberg API 直接从对象存储读取 GreptimeDB 数据。

这是一种**只读导出**，既不是数据拷贝，也不是双写。GreptimeDB 仍按原有方式写入数据；Iceberg 集成只是发布元数据，让其他引擎能够找到并解读这些相同的文件。

## 工作原理

关键在于：GreptimeDB 本身就已将 SST（sorted string table）数据文件以 Parquet 格式存储在对象存储中。Iceberg 集成**不会**重新写入、复制或导出数据，而是发布指向现有 Parquet 文件的 Iceberg **元数据**——manifest、manifest-list 以及 table-metadata snapshot。任何支持 Iceberg 的引擎都能通过 REST catalog 读取这些文件。

这项工作分布在 GreptimeDB 已有的进程之间：

- **Datanode / standalone（写入端）。** 每当写入 SST 文件时——包括 flush、compaction、批量写入和 truncate——GreptimeDB 都会将当前存活的 Parquet 文件集合转换为 Iceberg manifest 条目，并提交一个新的 Iceberg snapshot。Iceberg 元数据写入到 datanode 已使用的同一对象存储 bucket 下的 `warehouse_root` 前缀中。
- **Frontend（catalog 服务端）。** 它实现了 [Iceberg REST Catalog API](https://iceberg.apache.org/docs/1.6.0/api/#rest-catalog-specification)，挂载在 `/v1/iceberg`，并向客户端提供每张表当前的元数据。

由于数据文件从不被复制，因此没有额外的存储开销，也没有写入路径上的重复——导出纯粹是在 GreptimeDB 已写入的数据旁附加的元数据。

### GreptimeDB 概念与 Iceberg 的对应关系

| GreptimeDB | Iceberg |
| ---------- | ------- |
| Schema（数据库，例如 `public`） | Namespace |
| Table（表） | Table |
| Column（列） | Field（字段） |
| 时间索引列 | 一个 `timestamptz` 字段 |

来自 `ALTER TABLE`（新增 / 重命名 / 删除列）的 schema 变更会反映到 Iceberg schema 中，无需重启。

### 类型映射

GreptimeDB 列类型到 Iceberg 类型的映射如下：

| GreptimeDB 类型 | Iceberg 类型 |
| --------------- | ------------ |
| `boolean` | `boolean` |
| `int8`、`int16`、`int32`、`uint8`、`uint16` | `int` |
| `uint32`、`int64`、`uint64` | `long` |
| `float32` | `float` |
| `float64` | `double` |
| `string` | `string` |
| `binary` | `binary` |
| `date` | `date` |
| `timestamp`（任意精度） | `timestamptz` |
| Prometheus native histogram（struct） | `struct`（包含 `list` 子字段） |
| `list`、`dictionary`、`json`、`interval`、`duration`、`time`、任意用户 `struct` | `string`（有损降级） |

## 配置

Iceberg 集成是一个企业版插件。在**写入进程（datanode 或 standalone）**和**frontend**的 `[[plugins]]` 配置段中都添加一个 `iceberg_manifest` 条目即可启用：

- **Datanode / standalone** 运行写入 hook，负责发布 Iceberg 元数据。
- **Frontend** 运行 REST catalog，负责提供这些元数据。

两者必须引用**相同的** `warehouse_root`，以便 catalog 读取到写入端发布的内容。

```toml
## Iceberg manifest 导出会发布 Iceberg 格式的元数据（snapshot、
## manifest、manifest-list），使外部引擎（pyiceberg、Spark、Trino、
## DuckDB 等）可以通过 Iceberg REST catalog 查询 GreptimeDB 表。
[[plugins]]
iceberg_manifest = { warehouse_root = "iceberg_warehouse" }
```

可选配置项：

| 选项 | 默认值 | 说明 |
| ---- | ------ | ---- |
| `warehouse_root` | `"iceberg_warehouse"` | Iceberg 元数据在 datanode 对象存储 bucket 内的存放路径前缀。 |
| `enable_incremental` | `true` | 为 `true`（默认）时，每次 flush / compaction / truncate 都会自动发布一个新 snapshot。设为 `false` 可关闭自动发布，改为按需通过 rebuild 接口生成元数据；drop/GC 清理仍会正常运行。 |

`warehouse_root` 是 GreptimeDB 已使用的对象存储 bucket 内的一个路径前缀，会被并入 store 的 `root`（例如 `s3://<bucket>/<root>/<warehouse_root>/`）。

支持的对象存储后端包括 S3、OSS、GCS 和 Azure Blob。

启用后，REST catalog 可通过以下地址访问：

```
http://<frontend-http-host>:<port>/v1/iceberg
```

例如，frontend 监听默认的 HTTP 端口 `4000` 时，catalog 基础 URI 为 `http://localhost:4000/v1/iceberg`，warehouse 名称为 `greptime`（默认值）。

## 让表可被读取

GreptimeDB 在 flush 时发布 Iceberg 元数据，因此新写入的数据会在下一次 flush（或 compaction）后才出现在导出中。若要立即暴露新写入的行，可手动 flush 表：

```sql
-- 通过 MySQL 或 PostgreSQL 协议执行
admin flush_table('your_table');
```

元数据是异步发布的；flush 返回后不久，该表即可通过 REST catalog 查询。已经 flush 过的现有表会被自动导出。

## 使用 pyiceberg 读取

本示例使用 [pyiceberg](https://py.iceberg.apache.org/) 配合 pyarrow，通过 REST catalog 读取一张 GreptimeDB 表。你需要安装 `pyiceberg` 和 `pyarrow`，并准备好支撑 GreptimeDB 部署的对象存储的凭据（此处以 S3 为例）。

```python
from pyiceberg.catalog.rest import RestCatalog

# GreptimeDB frontend 暴露的 REST catalog 端点。
# `warehouse` 即 catalog 名称（默认为 "greptime"）。
catalog = RestCatalog(
    name="greptime",
    uri="http://localhost:4000/v1/iceberg",
    prefix="greptime",
    # 对象存储凭据，供 pyiceberg 读取 Parquet 数据文件。
    # 请与你的 GreptimeDB 部署使用的后端保持一致。
    **{
        "s3.endpoint": "https://s3.us-east-1.amazonaws.com",
        "s3.access-key-id": "YOUR_ACCESS_KEY",
        "s3.secret-access-key": "YOUR_SECRET_KEY",
        "s3.region": "us-east-1",
    },
)

# 列出 namespace（= GreptimeDB schema）和表。
print(catalog.list_namespaces())        # 例如 [('greptime', 'public')]
print(catalog.list_tables("public"))    # 例如 [('public', 'my_table')]

# 加载表并用 pyarrow 扫描。
table = catalog.load_table(("public", "my_table"))
print(table.schema())                   # Iceberg schema（GreptimeDB 列 → 字段）

arrow_table = table.scan().to_arrow()
print(arrow_table.num_rows, "rows")
print(arrow_table.to_pandas().head())
```

## 使用 Spark 读取

本示例配置 Spark SQL 使用 GreptimeDB Iceberg REST catalog，并对一张 GreptimeDB 表执行查询。你需要将 Iceberg Spark runtime 和 AWS bundle JAR 放到 Spark classpath 上（版本需与你的 Spark/Scala 版本匹配——此处以 Spark 4.x 配 Iceberg 1.11.0 为例）。

**1. `spark-defaults.conf`**

```properties
spark.sql.extensions                        org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions
spark.sql.defaultCatalog                    greptime
spark.sql.catalog.greptime                  org.apache.iceberg.spark.SparkCatalog
spark.sql.catalog.greptime.type             rest
spark.sql.catalog.greptime.uri              http://localhost:4000/v1/iceberg
spark.sql.catalog.greptime.warehouse        greptime
# S3FileIO 从 GreptimeDB 使用的同一对象存储读取 Parquet 数据文件。
spark.sql.catalog.greptime.io-impl          org.apache.iceberg.aws.s3.S3FileIO
spark.sql.catalog.greptime.client.region    us-east-1
spark.sql.catalog.greptime.s3.endpoint      https://s3.us-east-1.amazonaws.com
spark.sql.catalog.greptime.s3.path-style-access false
spark.sql.catalog.greptime.s3.access-key-id     YOUR_ACCESS_KEY
spark.sql.catalog.greptime.s3.secret-access-key YOUR_SECRET_KEY
```

将两个 Iceberg JAR 放到 classpath 上，启动 `spark-sql`（或运行 `spark-submit` 任务）：

```bash
spark-sql \
  --conf spark.sql.extensions=org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions \
  --jars iceberg-spark-runtime-4.1_2.13-1.11.0.jar,iceberg-aws-bundle-1.11.0.jar
```

如果使用带自定义端点和 path-style 寻址的 S3 兼容存储（例如 MinIO、Garage 或本地测试部署），请把 `spark.sql.catalog.greptime.s3.endpoint` 设为该存储的 URL，并把 `spark.sql.catalog.greptime.s3.path-style-access` 设为 `true`。

**2. 在 GreptimeDB 中建表并写入数据**

通过 MySQL 或 PostgreSQL 协议连接 GreptimeDB，建表，然后 flush 以发布 Iceberg 元数据：

```sql
CREATE TABLE demo (
  ts      TIMESTAMP(6) NOT NULL,   -- TIME INDEX
  host    STRING,
  region  STRING,
  cpu     DOUBLE,
  mem     FLOAT,
  status  INT,
  TIME INDEX (ts)
);

INSERT INTO demo VALUES
  ('2024-01-01 00:00:00', 'h1', 'us', 12.5, 4096.0, 200),
  ('2024-01-01 01:00:00', 'h1', 'us', 88.8, 7000.5, 200),
  ('2024-01-01 02:00:00', 'h2', 'eu', 55.0, 5500.0, 503);

-- 为刚写入的行发布 Iceberg 元数据。
admin flush_table('demo');
```

**3. 从 Spark SQL 查询**

```sql
-- catalog 是 `greptime`，namespace 是 GreptimeDB schema `public`。
SHOW TABLES IN greptime.public;

SELECT count(*) FROM greptime.public.demo;

SELECT host, round(avg(cpu), 1) AS avg_cpu
FROM greptime.public.demo
WHERE ts >= '2024-01-01 00:00:00'
GROUP BY host
ORDER BY host;
```

该表完全可查询：时间范围过滤、聚合、join、窗口函数和排序都能像在 Spark 中使用任何其他 Iceberg 表一样正常工作。

## 限制

### 只读、单一 snapshot

- **只读。** 你可以通过 Iceberg 读取 GreptimeDB 表，但无法通过 Iceberg catalog 向 GreptimeDB 回写数据。GreptimeDB 始终是唯一的写入方。
- **仅保留最新 snapshot（不支持时间旅行）。** Compaction 会物理删除旧的数据文件，因此不会保留历史 snapshot。Iceberg 表始终反映当前存活的数据；你无法查询历史 snapshot 或回滚。
- **没有完整的 schema 历史。** 当前 schema 始终会暴露，但过去的 schema 版本不会被保留，因此你无法重建一张表在过去某个时间点的结构。

### 数据类型与 Spark

对于常见类型（boolean、整数、浮点数、string、binary、date、timestamp），GreptimeDB 类型可以干净地映射到 Iceberg。需要注意以下几点，尤其是在 Spark 中：

- **将时间索引声明为 `TIMESTAMP(6)`。** GreptimeDB 默认的 `TIMESTAMP` 是毫秒精度，但 Iceberg schema 将该列声明为 `timestamptz`（微秒）。若列是毫秒精度，Spark 的 Parquet row-group 统计信息过滤会用微秒谓词去比较毫秒的文件统计，可能错误地丢弃 row-group，导致 `>`、`=` 和范围查询出错。将时间索引声明为 `TIMESTAMP(6)` 可使磁盘上的 Parquet 微秒精度与 schema 一致，所有比较运算符即可正确工作。（秒/毫秒值本身仍被正确存储；该问题纯粹出在基于文件统计的谓词下推。）
- **有损的类型降级。** `list`、`dictionary`、`json`、`interval`、`duration`、`time` 以及任意用户 `struct` 类型会被导出为 Iceberg `string`，而非结构化类型，因此它们的内部结构无法通过 Iceberg 查询。
- **无符号整数。** GreptimeDB 的 `uint32` / `uint64` 映射到 Iceberg `long`（有符号 64 位）。值都是非负的且在范围内，因此是值安全的；Spark、Trino 和 DuckDB 都能正确读取。但基于 iceberg-rust、会拒绝无符号 Parquet 物理类型的读取器，无法读取物理类型为无符号 64 位的列（见下文 metric 引擎说明）。

### Metric 引擎表

- **仅导出物理 metric 表。** 逻辑 metric 表不会通过 Iceberg 暴露；请直接查询物理表。
- **稀疏主键编码（metric 引擎默认）。** 所有 tag 列被折叠进单一的 `__primary_key` binary 列。要还原各个 tag 值（逻辑 table id、tsid 和 label），你必须按 metric 引擎的稀疏编解码器解码该 blob——Iceberg 将其暴露为不透明的 `binary`。metric 内部的 `__table_id` 和 `__tsid` 列**不会**被导出，因此你无法通过 Iceberg 将 metric 名称解析为物理 table id。
- **Prometheus native histogram** 被导出为带 list 子字段的 Iceberg `struct`。其中两个计数子字段（`count_u64`、`zero_count_u64`）在物理上以无符号 64 位整数存储；Spark、Trino 和 DuckDB 将其作为有符号 long 读取（值安全），但基于 iceberg-rust 的读取器会拒绝这种无符号物理类型，在扫描包含该 histogram 列时会失败。

### 运维说明

- **元数据异步发布。** 新写入的行会在下一次 flush 或 compaction 之后出现在 Iceberg 中；可手动 flush 表（`admin flush_table('<table>')`）以立即暴露它们。
- **旧 Iceberg 元数据会被回收**，与数据文件一起由 GreptimeDB 正常的 compaction 和 GC 处理——无需单独维护。
- **Rebuild / 对账。** 如果 Iceberg 导出与 GreptimeDB 的真实状态出现偏差（发布失败、损坏，或在启用集成之前创建的表），运维人员可以从权威的存活 SST 集合重建一张表的 Iceberg 元数据：

  ```bash
  curl -X POST \
    "http://localhost:4000/v1/iceberg/v1/greptime/namespaces/public/tables/<table>/rebuild"
  ```

  rebuild 会替换（而非合并）当前 snapshot。重建出的条目不携带列统计信息（读取正确性不受影响；只是谓词下推 / 扫描规划会降级，直到下一次 flush 或 compaction）。
