---
keywords: [GreptimeDB upgrade, upgrade example]
description: Introduce how to upgrade GreptimeDB to the latest version, including some incompatible changes and specific upgrade steps.
---

# Upgrade

Before upgrading to the latest version, it's recommended to upgrade your GreptimeDB deployment to `v0.11` first. You can refer to the upgrade guide for `v0.11` for more details.
This guide only covers the upgrade process from `v0.11` to the latest version.


## Upgrade from v0.11.x

The data format of the latest version is compatible with `v0.11.x`. You don't need to export and import data.
However, there are some breaking changes between `v0.11.x` and the latest version. You may need some manual operations to upgrade your GreptimeDB deployment.

### Update cache configuration

The cache configuration and default cache path changed in `v0.12`. The default read cache is under the `${data_home}/cache/object/read` and the default write cache is under the `${data_home}/cache/object/write` now.

The `cache_path` configuration only sets the home directory of the read cache.
GreptimeDB always uses the `cache/object/read` subdirectory under the cache home.
The default `cache_path` is the `${data_home}`.
It's recommended not to set the `cache_path` manually and let GreptimeDB manage the cache path.
You can remove the `cache_path` when you upgrade to `v0.12`.

```toml
[storage]
type = "S3"
bucket = "your-bucket-name"
root = "your-root"
access_key_id = "****"
secret_access_key = "****"
endpoint = "https://s3.amazonaws.com/"
region = "your-region"
# No need to set cache_path manually.
# cache_path = "/path/to/cache/home"
cache_capacity = "10G"
```

Since `v0.12`, you don't need to add `experimental` to the write cache configuration. If you have the following configuration in `v0.11`:

```toml
[[region_engine]]
[region_engine.mito]
enable_experimental_write_cache = true
experimental_write_cache_size = "10G"
experimental_write_cache_ttl = "8h"
experimental_write_cache_path = "/path/to/write/cache"
```

You need to change it to:

```toml
[[region_engine]]
[region_engine.mito]
write_cache_size = "10G"
write_cache_ttl = "8h"
# No need to set write_cache_path manually.
# write_cache_path = "${data_home}"
```

The `write_cache_path` configuration only sets the home directory of the write cache.
GreptimeDB always uses the `cache/object/write` subdirectory under the cache home.
The default `write_cache_path` is the `${data_home}`.
It's recommended not to set the `write_cache_path` manually and let GreptimeDB manage the cache path.


You can also remove the legacy cache directory of your `cache_path` and `experimental_write_cache_path` to release disk space.
The legacy cache directory may be located at `${data_home}/object_cache/read`, `${data_home}/object_cache/write`, `${data_home}/write_cache`.

## Update gRPC configuration

Before `v0.12`, the gRPC configuration item is as follows:

```toml
[grpc]
## The address to bind the gRPC server.
addr = "127.0.0.1:3001"
## The hostname advertised to the metasrv,
## and used for connections from outside the host
hostname = "127.0.0.1:3001"
``` 

Since `v0.12`, the gRPC configuration item is as follows:

```toml
[grpc]
## The address to bind the gRPC server.
bind_addr = "127.0.0.1:3001"
## The address advertised to the metasrv, and used for connections from outside the host.
## If left empty or unset, the server will automatically use the IP address of the first network interface
## on the host, with the same port number as the one specified in `grpc.bind_addr`.
server_addr = "127.0.0.1:3001"
``` 

The changes involve two configuration item modifications:
- `addr` is now `bind_addr`, representing the gRPC server's binding address.
- `hostname` is now `server_addr`, which is the communication address broadcasted to other nodes outside the host for connecting with this node.

These modifications aim to ensure clear and precise semantics of configuration items.

### Create index manually

Before `v0.12`, GreptimeDB automatically creates inverted index for tags (columns in the primary key).
You can use `SHOW INDEX` to view the index information.
The `greptime-inverted-index-v1` is the index type for the inverted index.

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

Since `v0.12`, GreptimeDB decouples the inverted index from the primary key and does not create inverted index automatically for a table that uses mito engine.

```sql
SHOW INDEX FROM `cpu`;
```

The default index type for a primary key column is `greptime-primary-key-v1`.

```bash
+-------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+-------------------------+---------+---------------+---------+------------+
| Table | Non_unique | Key_name   | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type              | Comment | Index_comment | Visible | Expression |
+-------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+-------------------------+---------+---------------+---------+------------+
| cpu   |          1 | PRIMARY    |            1 | hostname    | A         |        NULL |     NULL |   NULL | YES  | greptime-primary-key-v1 |         |               | YES     |       NULL |
| cpu   |          1 | PRIMARY    |            2 | region      | A         |        NULL |     NULL |   NULL | YES  | greptime-primary-key-v1 |         |               | YES     |       NULL |
| cpu   |          1 | TIME INDEX |            1 | ts          | A         |        NULL |     NULL |   NULL | NO   |                         |         |               | YES     |       NULL |
+-------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+-------------------------+---------+---------------+---------+------------+
```

When GreptimeDB opens a table created before `v0.12`, it can use the generated index file before `v0.12`, but won't automatically index new data.
You can use the `ALTER TABLE` statement to create a new index for a column on demand.

For example, you can create an inverted index for the `region` column:
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

However, if you already created the index for a table manually before upgrading, you can skip this step. You can always use `SHOW INDEXES` to check the index status.
For example, if a table already has a full-text index, you don't need to create the index again after upgrading.

```bash
+---------------+------------+----------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
| Table         | Non_unique | Key_name       | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type                 | Comment | Index_comment | Visible | Expression |
+---------------+------------+----------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
| test_fulltext |          1 | FULLTEXT INDEX |            1 | message     | A         |        NULL |     NULL |   NULL | YES  | greptime-fulltext-index-v1 |         |               | YES     |       NULL |
| test_fulltext |          1 | TIME INDEX     |            1 | timestamp   | A         |        NULL |     NULL |   NULL | NO   |                            |         |               | YES     |       NULL |
+---------------+------------+----------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
```


### Update CREATE TABLE statement

GreptimeDB changed the `CREATE TABLE` statement in `v0.12`. You can only use column constraints to create inverted, skipping and fulltext index.
You must specify the `INDEX` keyword after the index type when creating an index.

The following SQL statement creates a full-text index no longer supported in GreptimeDB v0.12.

```sql
CREATE TABLE IF NOT EXISTS `logs` (
  message STRING NULL FULLTEXT WITH(analyzer = 'English', case_sensitive = 'false'),
  ts TIMESTAMP(9) NOT NULL,
  TIME INDEX (ts),
);
```

You have to change the SQL to:

```sql
CREATE TABLE IF NOT EXISTS `logs` (
  message STRING NULL FULLTEXT INDEX WITH(analyzer = 'English', case_sensitive = 'false'),
  ts TIMESTAMP(9) NOT NULL,
  TIME INDEX (ts),
);
```
