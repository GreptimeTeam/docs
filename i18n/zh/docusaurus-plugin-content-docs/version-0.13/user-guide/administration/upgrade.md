---
keywords: [版本升级, 升级步骤, 数据库升级]
description: 介绍如何将 GreptimeDB 升级到最新版本，包括一些不兼容的变更和升级具体步骤。
---

# 版本升级

在升级到最新版本之前，建议先将你的 GreptimeDB 部署升级到 `v0.11`。可以参考 `v0.11` 的升级指南以获取更多详细信息。本指南仅涵盖从 `v0.11` 升级到最新版本的过程。

## 从 v0.11.x 升级

最新版本的数据格式与 `v0.11.x` 兼容。所以无需导出和导入数据。
但是，`v0.11.x` 和最新版本之间存在一些不兼容变更。需要进行一些手动操作来升级你的 GreptimeDB 部署。

### 更新缓存配置

从 `v0.12` 开始，缓存配置和默认缓存路径发生了变化。默认读缓存位于 `${data_home}/cache/object/read`，默认写缓存位于 `${data_home}/cache/object/write`。

`cache_path` 配置仅设置读缓存的根目录。默认的 `cache_path` 是 `${data_home}`。
GreptimeDB 总是使用缓存根目录下的 `cache/object/read` 子目录。
默认的 `cache_path` 是 `${data_home}`。
建议不要手动设置 `cache_path`，让 GreptimeDB 管理缓存路径。当你升级到 `v0.12` 时，可以从配置文件中删除 `cache_path` 字段。

```toml
[storage]
type = "S3"
bucket = "your-bucket-name"
root = "your-root"
access_key_id = "****"
secret_access_key = "****"
endpoint = "https://s3.amazonaws.com/"
region = "your-region"
# 不需要手动设置 cache_path
# cache_path = "/path/to/cache/home"
cache_capacity = "10G"
```

从 `v0.12` 开始，你不需要在写缓存配置中添加 `experimental` 前缀。如果你在 `v0.11` 中有如下配置：

```toml
[[region_engine]]
[region_engine.mito]
enable_experimental_write_cache = true
experimental_write_cache_size = "10G"
experimental_write_cache_ttl = "8h"
experimental_write_cache_path = "/path/to/write/cache"
```

你需要将其更改为：

```toml
[[region_engine]]
[region_engine.mito]
write_cache_size = "10G"
write_cache_ttl = "8h"
# 不需要手动设置 write_cache_path
# write_cache_path = "${data_home}"
```

`write_cache_path` 配置仅设置写缓存的根目录。
GreptimeDB 始终使用缓存主目录下的 `cache/object/write` 子目录。
默认的 `write_cache_path` 是 `${data_home}`。
建议不要手动设置 `write_cache_path`，让 GreptimeDB 管理缓存路径。

你还可以删除 `cache_path` 和 `experimental_write_cache_path` 的旧缓存目录以释放磁盘空间。
旧缓存目录可能位于 `${data_home}/object_cache/read`、`${data_home}/object_cache/write` 和 `${data_home}/write_cache`。

### 更新 gRPC 配置

在 `v0.12` 之前，gRPC 配置项如下：

```toml
[grpc]
## The address to bind the gRPC server.
addr = "127.0.0.1:3001"
## The hostname advertised to the metasrv,
## and used for connections from outside the host
hostname = "127.0.0.1:3001"
``` 

```toml
[grpc]
## The address to bind the gRPC server.
bind_addr = "127.0.0.1:3001"
## The address advertised to the metasrv, and used for connections from outside the host.
## If left empty or unset, the server will automatically use the IP address of the first network interface
## on the host, with the same port number as the one specified in `grpc.bind_addr`.
server_addr = "127.0.0.1:3001"
``` 

这些更改涉及两个配置项的修改：
- `addr` 现在是 `bind_addr`，表示 gRPC 服务器的绑定地址。
- `hostname` 现在是 `server_addr`，这是广播给主机外其他节点以连接此节点的通信地址。

这些变更旨在确保配置项语义清晰准确。

### 手动创建索引

在 `v0.12` 之前，GreptimeDB 会自动为主键创建倒排索引。
你可以使用 `SHOW INDEX` 查看索引信息。  
`greptime-inverted-index-v1` 是倒排索引的索引类型。

```sql
CREATE TABLE IF NOT EXISTS `cpu` (
  `hostname` STRING NULL,
  `region` STRING NULL,
  `usage_user` BIGINT NULL,
  `usage_system` BIGINT NULL,
  `usage_idle` BIGINT NULL,
  `ts` TIMESTAMP(9) NOT NULL,
  TIME INDEX (`ts`),
  PRIMARY KEY (`hostname`, `region`)
)
ENGINE=mito;

SHOW INDEX FROM `cpu`;
```

```bash
+-------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
| Table | Non_unique | Key_name   | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type                 | Comment | Index_comment | Visible | Expression |
+-------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
| cpu   |          1 | PRIMARY    |            1 | hostname    | A         |        NULL |     NULL |   NULL | YES  | greptime-inverted-index-v1 |         |               | YES     |       NULL |
| cpu   |          1 | PRIMARY    |            2 | region      | A         |        NULL |     NULL |   NULL | YES  | greptime-inverted-index-v1 |         |               | YES     |       NULL |
| cpu   |          1 | TIME INDEX |            1 | ts          | A         |        NULL |     NULL |   NULL | NO   |                            |         |               | YES     |       NULL |
+-------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
```

从 `v0.12` 开始，GreptimeDB 将倒排索引与主键解耦，并且不会为使用 mito 引擎的表自动创建倒排索引。

```sql
SHOW INDEX FROM `cpu`;
```

主键列的默认索引类型为 `greptime-primary-key-v1`。

```bash
+-------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+-------------------------+---------+---------------+---------+------------+
| Table | Non_unique | Key_name   | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type              | Comment | Index_comment | Visible | Expression |
+-------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+-------------------------+---------+---------------+---------+------------+
| cpu   |          1 | PRIMARY    |            1 | hostname    | A         |        NULL |     NULL |   NULL | YES  | greptime-primary-key-v1 |         |               | YES     |       NULL |
| cpu   |          1 | PRIMARY    |            2 | region      | A         |        NULL |     NULL |   NULL | YES  | greptime-primary-key-v1 |         |               | YES     |       NULL |
| cpu   |          1 | TIME INDEX |            1 | ts          | A         |        NULL |     NULL |   NULL | NO   |                         |         |               | YES     |       NULL |
+-------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+-------------------------+---------+---------------+---------+------------+
```

当 GreptimeDB 打开 `v0.12` 之前创建的表时，可以继续使用 `v0.12` 之前的索引文件，但不会自动为新数据创建索引。
你可以使用 `ALTER TABLE` 语句按需为列创建新索引。

例如，你可以为 `region` 列创建倒排索引：

```sql
ALTER TABLE `cpu` MODIFY COLUMN `region` SET INVERTED INDEX;

SHOW INDEX FROM `cpu`;
```

```bash
+-------+------------+-------------------------+--------------+-------------+-----------+-------------+----------+--------+------+-----------------------------------------------------+---------+---------------+---------+------------+
| Table | Non_unique | Key_name                | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type                                          | Comment | Index_comment | Visible | Expression |
+-------+------------+-------------------------+--------------+-------------+-----------+-------------+----------+--------+------+-----------------------------------------------------+---------+---------------+---------+------------+
| cpu   |          1 | PRIMARY                 |            1 | hostname    | A         |        NULL |     NULL |   NULL | YES  | greptime-primary-key-v1                             |         |               | YES     |       NULL |
| cpu   |          1 | PRIMARY, INVERTED INDEX |            2 | region      | A         |        NULL |     NULL |   NULL | YES  | greptime-primary-key-v1, greptime-inverted-index-v1 |         |               | YES     |       NULL |
| cpu   |          1 | TIME INDEX              |            1 | ts          | A         |        NULL |     NULL |   NULL | NO   |                                                     |         |               | YES     |       NULL |
+-------+------------+-------------------------+--------------+-------------+-----------+-------------+----------+--------+------+-----------------------------------------------------+---------+---------------+---------+------------+
```

然而，如果你在升级之前已经手动为表创建了索引，你可以跳过此步骤。你可以始终使用 `SHOW INDEXES` 检查索引状态。
例如，如果一个表已经有一个全文索引，你不需要在升级后再次创建索引。

```bash
+---------------+------------+----------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
| Table         | Non_unique | Key_name       | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type                 | Comment | Index_comment | Visible | Expression |
+---------------+------------+----------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
| test_fulltext |          1 | FULLTEXT INDEX |            1 | message     | A         |        NULL |     NULL |   NULL | YES  | greptime-fulltext-index-v1 |         |               | YES     |       NULL |
| test_fulltext |          1 | TIME INDEX     |            1 | timestamp   | A         |        NULL |     NULL |   NULL | NO   |                            |         |               | YES     |       NULL |
+---------------+------------+----------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
```

### 更新 CREATE TABLE 语句

GreptimeDB 在 `v0.12` 中更改了 `CREATE TABLE` 语句的语法。你只能使用列约束来创建倒排、跳数和全文索引。
你必须在索引类型后指定 `INDEX` 关键字。

以下 SQL 语句不再支持在 GreptimeDB v0.12 中使用。

```sql
CREATE TABLE IF NOT EXISTS `logs` (
  message STRING NULL FULLTEXT WITH(analyzer = 'English', case_sensitive = 'false'),
  ts TIMESTAMP(9) NOT NULL,
  TIME INDEX (ts),
);
```

你需要将其更改为：

```sql
CREATE TABLE IF NOT EXISTS `logs` (
  message STRING NULL FULLTEXT INDEX WITH(analyzer = 'English', case_sensitive = 'false'),
  ts TIMESTAMP(9) NOT NULL,
  TIME INDEX (ts),
);
```
