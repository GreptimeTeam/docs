---
keywords: [企业版, 集群, 读副本, leader region, follower region]
description: GreptimeDB 企业版的读副本功能的概述, 原理, 和"如何".
---

# 读副本

读副本（Read Replica）是 GreptimeDB 企业集群版中的一项重要功能，旨在提高数据库系统的整体读写性能和可扩展性。在读副本功能中，客户端将数据写入 “Leader” Region。Leader Region 再将数据同步到 “Follower” Region。Follower Region 只提供读功能，是为 Leader Region 的读副本。Leader Region 和 Follower Region 分别部署在不同的 Datanode 节点上，可有效分隔读写请求对于系统资源的互相抢占，带来更平滑的整体读写体验：

<p align="center">
    <img src="/read-replica-overview.png" alt="read-replica-overview" width="600"/>
</p>

:::tip NOTE
读副本功能仅在企业集群版中存在。
:::

## 原理

GreptimeDB 企业集群版基于自身架构的特点，可以使数据在副本之间以近乎零成本地同步。另外，读副本也可以无延迟地读取到最新写入的数据。下面简单介绍读副本的数据同步和数据读取的原理。

### 数据同步

在存算分离的 GreptimeDB 企业集群版中，所有的数据都以一个个 SST 文件存放在对象存储里。那么 Leader Region 和 Follower Region 之间的数据同步，就不需要在两个 Region 之间复制 SST 文件了，而只需要同步 SST 文件的元信息即可。元信息相比 SST 文件小多了，Leader Region 可以很容易地将其同步到 Follower Region 上。一旦元信息同步完成，读副本就“拥有”了一样的 SST 文件，从而读到数据。如下图：

![read-replica-data-sync](/read-replica-data-sync.png)

在实际的实现中，SST 文件元信息持久化在一个特殊的 manifest 文件中。manifest 文件和 SST 文件一样，也保存在对象存储中。每个 manifest 文件有一个唯一的版本号。在 Leader Region 和 Follower Region 之间同步 SST 文件元信息实际就是同步这个 manifest 文件的版本号。这个版本号只是一个整形数字，所以同步的成本非常低。Follower Region 在得到 manifest 文件版本号后，就可以去对象存储获取 manifest 文件了，从而就获取了 Leader Region 生成的 SST 文件元信息。

manifest 文件版本号是通过 Region 与 Metasrv 之间的心跳进行同步的。Leader Region 在向 Metasrv 的心跳中带上这个版本号。Metasrv 再在回复 Follower Region 的心跳时，将这个版本号返回。如下图：

![read-replica-heartbeat](/read-replica-heartbeat.png)

容易看出，如果只有 SST 文件的同步，读副本读到写入数据的延迟是 Leader Region 和 Follower Region 与 Metasrv 之间的心跳间隔之和。假如两个 Region 的心跳间隔都是默认的 3 秒，那么读副本只能读到 3 到 6 秒前写入 SST 文件并 flush 到对象存储的数据。如果客户端对读副本能读到的写入数据的新鲜度要求不高，那么这种数据同步方法就足够了。但如果要求读副本能及时读到最新写入的数据，读副本还需要下面的功能：

### 数据读取

最新写入 GreptimeDB 的数据会保存在 Leader Region 的 memtable 里。所以读副本要想读到最新写入的数据，Follower Region 只要能向 Leader Region 发起请求，获取 memtable 中的数据即可。

Follower Region 将 Leader Region 的 memtable 中的数据，和自己通过上面数据同步的方式获得的 SST 文件中的数据相结合，就得到了客户端想要的完整的包含了最新写入的数据：

<p align="center">
    <img src="/read-replica-data-read.png" alt="read-replica-data-read" width="600"/>
</p>

Follower Region 通过我们内部的 GRPC 接口请求 Leader Region。读副本功能会对 Leader Region 造成一定的读负载。但在通常情况下，Leader Region 只需要读取自己 memtable 中的数据，都在内存当中；而且 memtable 大小有限，读的压力不大。

## 增加读副本

增加读副本很简单，一条 SQL 即可：

```sql
ADMIN ADD_TABLE_FOLLOWER(<table_name>, <follower_datanodes>)
```

调用 GreptimeDB 的增加读副本的函数，需要两个参数：

- table_name：表名；
- follower_datanodes：要放置 Follower Region 的 Datanode Id 列表，用逗号分隔。

下面用一个例子说明如何配置读副本。

首先启动一个有 3 个 Datanode 节点的 GreptimeDB 企业集群版，然后建表：

```sql
CREATE TABLE foo (
  ts TIMESTAMP TIME INDEX,
  i INT PRIMARY KEY,
  s STRING,
) PARTITION ON COLUMNS ('i') (
  i <= 0,
  i > 0,
);
```

通过 `information_schema`，我们可以看到这张表的 Region 相关信息：

```sql
SELECT table_name, region_id, peer_id, is_leader FROM information_schema.region_peers WHERE table_name = 'foo';

+------------+---------------+---------+-----------+
| table_name | region_id     | peer_id | is_leader |
+------------+---------------+---------+-----------+
| foo        | 4402341478400 |       1 | Yes       |
| foo        | 4402341478401 |       2 | Yes       |
+------------+---------------+---------+-----------+
```

可以看到，这张表有 2 个 Region，分别在 Datanode 1 和 2 上。

接下来就可以给这张表创建读副本了：

```sql
ADMIN ADD_TABLE_FOLLOWER('foo', '0,1,2');
```

读副本创建完，通过 `information_schema`，我们看到这张表已有 Follower Region 了：

```sql
SELECT table_name, region_id, peer_id, is_leader FROM information_schema.region_peers WHERE table_name = 'foo';

+------------+---------------+---------+-----------+
| table_name | region_id     | peer_id | is_leader |
+------------+---------------+---------+-----------+
| foo        | 4402341478400 |       1 | Yes       |
| foo        | 4402341478400 |       0 | No        |
| foo        | 4402341478401 |       2 | Yes       |
| foo        | 4402341478401 |       1 | No        |
+------------+---------------+---------+-----------+
```

两个 Follower Region 分别在 Datanode 1 和 2 上。

## 使用读副本

客户端如何选择是否读 Follower Region 呢？对于 JDBC 连接（MySQL 和 PostgreSQL 协议），可以执行以下 SQL：

```sql
-- 当前连接的读请求指向 Follower Region
-- 如果没有 Follower Region，会报错给客户端：
SET READ_PREFERENCE='follower'

-- 当前连接的读请求优先使用 Follower Region
-- 如果没有 Follower Region，则读请求 fallback 到 Leader Region（客户端不报错）：
SET READ_PREFERENCE='follower_preferred'

-- 当前连接的读请求指向 Leader Region：
SET READ_PREFERENCE='leader'
```

还是以上面创建的表为例。首先插入一些数据：

```sql
INSERT INTO foo (ts, i, s) VALUES (1, -1, 's1'), (2, 0, 's2'), (3, 1, 's3');
```

设置从 Follower Region 读取数据：

```sql
SET READ_PREFERENCE='follower';
```

查数据：

```sql
SELECT * FROM foo ORDER BY ts;

+----------------------------+------+------+
| ts                         | i    | s    |
+----------------------------+------+------+
| 1970-01-01 00:00:00.001000 |   -1 | s1   |
| 1970-01-01 00:00:00.002000 |    0 | s2   |
| 1970-01-01 00:00:00.003000 |    1 | s3   |
+----------------------------+------+------+
```

如何确定确实读到了 Follower Region 呢？可以使用 `EXPLAIN ANALYZE`：

```sql
EXPLAIN ANALYZE SELECT * FROM foo ORDER BY ts;
```

可以看到输出的结果中 "`other_ranges`" 大于 0。

若使用 `VERBOSE`：

```sql
EXPLAIN ANALYZE VERBOSE SELECT * FROM foo ORDER BY ts;
```

还有类似如下的输出：

```plaintext
extension_ranges: [LeaderMemtableRange{leader: Peer { id: 1, addr: "192.168.50.189:14101" }, num_rows: 2, time_range: (1::Millisecond, 2::Millisecond)
```

这在从 Leader Region 读时是没有的。

