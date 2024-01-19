# Kafka Remote WAL 文档 - User Guide

[Write-Ahead Logging](https://docs.greptime.com/contributor-guide/datanode/wal#introduction)（WAL）是 GreptimeDB 中的一个重要组件。每一个数据修改的操作，都会作为一个日志存储在 WAL 中，以确保数据库不会丢失缓存在内存中的数据。

在 0.5 版本之前，我们使用嵌入式的 [Raft Engine](https://www.pingcap.com/blog/raft-engine-a-log-structured-embedded-storage-engine-for-multi-raft-logs-in-tikv/) 作为 WAL 的存储引擎。虽然在实际部署时我们可以将 Raft Engine 挂载到云存储上，使得 [RPO](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Point_Objective) 为 0，但是由于重新挂载需要时间，导致 [RTO](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Time_Objective) 较大。另一方面，嵌入式的 Raft Engine 也无法满足多用户订阅日志的需求，这使得 GreptimeDB 无法实现[热备](https://en.wikipedia.org/wiki/Hot_spare)、region 迁移等特性。

随着 [0.5 版本](https://github.com/GreptimeTeam/greptimedb/releases/tag/v0.5.0)的发布，我们开始使用远程存储服务作为 WAL 的存储引擎，我们称这样的 WAL 为 Remote WAL。 [Apache Kafka](https://kafka.apache.org/) 被广泛用于流处理领域，它自身的分布式容灾能力，以及基于 [Topic](https://www.conduktor.io/kafka/kafka-topics/) 的订阅机制，能够很好地满足 GreptimeDB 现阶段对 Remote WAL 的需求，因此我们在 0.5 版本中增加 Apache Kafka 作为 WAL 的可选存储引擎。

## 如何使用 Kafka Remote WAL

### Step 1: 启动 Kafka 集群

如果您已经部署了 Kafka 集群，您可以跳过此步骤。但请您留意部署时设定的 [advertised listeners](https://www.conduktor.io/kafka/kafka-advertised-host-setting/)，您将在 Step 2 使用它。



我们推荐使用 [docker compose](https://docs.docker.com/compose/) 启动 Kafka 集群。Kafka 支持 [KRaft](https://www.conduktor.io/kafka/kafka-kraft-mode/) 和 [Zookeeper](https://www.conduktor.io/kafka/zookeeper-with-kafka/) 两种部署模式，您可以在[这里](https://github.com/confluentinc/kafka-images/blob/master/examples/confluent-server-kraft/docker-compose.yml)和[这里](https://github.com/conduktor/kafka-stack-docker-compose)分别找到 KRaft 和 Zookeeper 两种模式的 docker compose 脚本。我们建议使用 KRaft 模式部署，正如我们使用的 [docker-compose-standalone.yml](https://github.com/GreptimeTeam/greptimedb/blob/main/tests-integration/fixtures/kafka/docker-compose-standalone.yml) 脚本。为了您的方便，我们将该脚本的内容放在下方。

```toml
version: '3.8'
services:
  kafka:
    image: bitnami/kafka:3.6.0
    container_name: kafka
    ports:
      - 9092:9092
    environment:
      # KRaft settings
      KAFKA_KRAFT_CLUSTER_ID: Kmp-xkTnSf-WWXhWmiorDg
      KAFKA_ENABLE_KRAFT: "yes"
      KAFKA_CFG_NODE_ID: "1"
      KAFKA_CFG_PROCESS_ROLES: broker,controller
      KAFKA_CFG_CONTROLLER_QUORUM_VOTERS: 1@127.0.0.1:2181
      # Listeners
      KAFKA_CFG_ADVERTISED_LISTENERS: PLAINTEXT://127.0.0.1:9092
      KAFKA_CFG_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_CFG_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:2181
      ALLOW_PLAINTEXT_LISTENER: "yes"
      KAFKA_BROKER_ID: "1"
```

如需要以其他方式启动 Kafka 集群，您可以参考 [Kafka 官方文档](https://kafka.apache.org/quickstart)。



假设您已经启动了 Docker，并且正确设置了 docker compose 脚本的路径，您可以在终端中执行如下命令，启动一个包含单个 [broker](https://www.conduktor.io/kafka/kafka-brokers/) 的 Kafka 集群。

```bash
docker compose -f docker-compose-standalone.yml up
```

如果一切正常，您将看到包含如下内容的输出（日志时间戳将会不同）：

```bash
...
kafka  | [2024-01-11 07:06:55,518] INFO KafkaConfig values:
kafka  |         advertised.listeners = PLAINTEXT://127.0.0.1:9092
...
kafka  | [2024-01-11 07:06:55,554] INFO [KafkaRaftServer nodeId=1] Kafka Server started (kafka.server.KafkaRaftServer)
```

### Step 2: 配置 GreptimeDB

目前，GreptimeDB 默认使用 Raft Engine 作为 WAL 的存储引擎。当使用 Kafka Remote WAL 时，您需要通过配置文件手动指定 Kafka 为 WAL 的存储引擎。

#### Standalone 模式

我们将一些需要您特别关注的 Kafka Remote WAL 的配置项摘录如下。关于完整的配置项，您可以查看[这里](https://github.com/GreptimeTeam/greptimedb/blob/d061bf3d07897ea785924eda8b947f9b18d44646/config/standalone.example.toml#L83-L124)。

```toml
[wal]
provider = "kafka"
broker_endpoints = ["127.0.0.1:9092"]
replication_factor = 1
max_batch_size = "1MB"
```

各个配置项的含义为：

- `provider`: 指定 WAL 存储引擎。应设置为 `"kafka"` ，以指定使用 Kafka Remote WAL。
- `broker_endpoints`: 指定 Kafka 集群所有 brokers 的 advertised listeners。您需要根据 docker compose 脚本中指定的 `KAFKA_CFG_ADVERTISED_LISTENERS` 来配置该项。如您通过其他方式部署 Kafka 集群，您需要根据您在部署时设置的 advertised listeners 来配置该项。如未明确配置，则默认为 `["127.0.0.1:9092"]`。
- `replication_factor`: 每个 [partition](https://www.conduktor.io/kafka/kafka-topic-replication/) 的数据会复制到指定数量的 brokers 上。该配置项的值必须大于 0，且不大于 brokers 的数量。
- `max_batch_size`: 我们会限制一批次传输的 log batch 的总大小不超过该配置项所设定的值。需要注意的是，Kafka 默认会拒绝超过 1MB 的 log，所以我们建议您将该配置项设定为不超过 1MB。如您确实需要调大该配置项，您可以参考[这里](https://www.conduktor.io/kafka/how-to-send-large-messages-in-apache-kafka/)以了解如何配置 Kafka。

#### Distributed 模式

对于分布式模式，Kafka Remote WAL 的配置项分布在 metasrv 和 datanode 的配置文件中。与单机模式相比，配置项的名称、含义、默认值均保持一致。您可以在[这里](https://github.com/GreptimeTeam/greptimedb/blob/d061bf3d07897ea785924eda8b947f9b18d44646/config/metasrv.example.toml#L46-L78)查看 metasrv 的示例配置项，以及在[这里](https://github.com/GreptimeTeam/greptimedb/blob/d061bf3d07897ea785924eda8b947f9b18d44646/config/datanode.example.toml#L40-L60)查看 datanode 的示例配置项。

### Step 3: 启动 GreptimeDB

#### Standalone 模式

假设您正确设置了 GreptimeDB 二进制文件的路径，您可以在终端中执行如下命令，以启动一个 GreptimeDB 单例，并让其使用您在 Step 2 中所设定的配置项。

```bash
./greptime standalone start -c config/standalone.example.toml
```

如果一切正常，您将在终端中看到包含如下内容的日志（您所看到的内容可能由于 GreptimeDB 的版本变化而略有差异）：

```bash
...
INFO rskafka::connection: Establishing new connection url="127.0.0.1:9092"
INFO rskafka::connection::topology: New broker broker=1 new=127.0.0.1:9092
INFO rskafka::client::controller: Creating new controller broker connection
INFO rskafka::connection: Establishing new connection broker=1 url="127.0.0.1:9092"
INFO common_meta::wal::kafka::topic_manager: Successfully created topic greptimedb_wal_topic_0
INFO rskafka::client::partition: Creating new partition-specific broker connection topic=greptimedb_wal_topic_0 partition=0
INFO rskafka::client::partition: Detected leader topic=greptimedb_wal_topic_0 partition=0 leader=1 metadata_mode=CachedArbitrary
...
INFO frontend::instance: Starting service: MYSQL_SERVER
INFO servers::server: Starting MYSQL_SERVER at 127.0.0.1:4002
INFO servers::server: MySQL server started at 127.0.0.1:4002
...
```

注意，如您在 Kafka 集群存续的情况下，多次拉起 GreptimeDB，您看到的关于 Kafka 的日志可能有所不同。

#### Distributed 模式

我们提供了 [gtctl](https://docs.greptime.com/user-guide/operations/gtctl#gtctl) 工具以辅助您快速拉起一个 GreptimeDB 集群。为了便于演示，我们使用 gtctl 启动一个 [bare-metal](https://docs.greptime.com/user-guide/operations/gtctl#bare-metal) 集群，包含 1 个 metasrv、1 个 frontend、3 个 datanodes。为此，您需要准备好 gtctl 所需的配置文件 `cluster.yml`。一个示例配置文件的内容如下：

```toml
cluster:
  name: mycluster
  artifact:
    local: "/path/to/greptime"
  frontend:
    replicas: 1
  datanode:
    replicas: 3
    rpcAddr: 0.0.0.0:14100
    mysqlAddr: 0.0.0.0:14200
    httpAddr: 0.0.0.0:14300
    config: '/path/to/datanode.example.toml'
  meta:
    replicas: 1
    storeAddr: 127.0.0.1:2379
    serverAddr: 0.0.0.0:3002
    httpAddr: 0.0.0.0:14001
    config: '/path/to/metasrv.example.toml'
etcd:
  artifact:
    local: "/path/to/etcd"
```

其中， `metasrv.example.toml` 和 `datanode.example.toml` 分别表示 metasrv 和 datanode 的配置文件的名称。您需要根据您的实际情况修改示例文件中以 `/path/to/` 为前缀的所有配置项。



假设您已经正确安装了 gtctl，并且已经正确配置好 `cluster.yml` 文件的内容和路径，您可以在终端中执行如下命令，以启动一个名为 `mycluster` 的 GreptimeDB 集群：

```bash
gtctl cluster create mycluster --bare-metal --config cluster.yaml
```

如果一切正常，您将在终端中看到包含如下内容的日志（您所看到的内容可能由于 gtctl 的版本变化而略有差异）：

```bash
Creating GreptimeDB cluster 'mycluster' on bare-metal environment...
 ✓ Installing etcd cluster successfully 🎉
 ✓ Installing GreptimeDB cluster successfully 🎉
Now you can use the following commands to access the GreptimeDB cluster:
MySQL >
$ mysql -h 127.0.0.1 -P 4002
PostgreSQL >
$ psql -h 127.0.0.1 -p 4003 -d public
Thank you for using GreptimeDB! Check for more information on
autolinkhttps://greptime.comautolink
. 😊
Invest in Data, Harvest over Time. 🔑
The cluster(pid=33587, version=unknown) is running in bare-metal mode now...
To view dashboard by accessing: http://localhost:4000/dashboard/
```

默认配置下，您可以在 `~/.gtctl/mycluster/logs` 目录下找到 `mycluster` 集群中各个组件的日志。例如在 `~/.gtctl/mycluster/logs/metasrv.0/log` 日志文件中，您将找到与 [Standalone 模式](https://greptime.feishu.cn/wiki/FtqvwppGLi8tXJkDeslcPNcVn2f#Ko2qdSiJMoQWrzxyeSncW6ppn6e)类似的内容。

## 验证 Kafka Remote WAL 的有效性

验证流程可归结为：

- 在 GreptimeDB 集群中创建一张表，并写入一定量的数据。
- 执行 Query 以验证数据被成功写入。
- 重启 GreptimeDB 集群，再执行 Query 以验证数据被正确恢复。



我们在演示中使用 [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysqlsh.html) 作为连接 GreptimeDB 集群的客户端，您可以使用您所喜爱的其它客户端。我们在演示中使用的 SQL 均来源于或修改自 [Cluster 文档](https://docs.greptime.cn/user-guide/cluster)。



假设您已经连接上 GreptimeDB 集群，您可以在客户端内执行以下命令以创建一张表：

```sql
CREATE TABLE dist_table(
    ts TIMESTAMP DEFAULT current_timestamp(),
    n STRING,
    row_num INT,
    PRIMARY KEY(n),
    TIME INDEX (ts)
)
PARTITION BY RANGE COLUMNS (n) (
    PARTITION r0 VALUES LESS THAN ("f"),
    PARTITION r1 VALUES LESS THAN ("z"),
    PARTITION r2 VALUES LESS THAN (MAXVALUE),
)
engine=mito;
```

执行以下命令以写入一定量的数据：

```sql
INSERT INTO dist_table(n, row_num) VALUES ("a", 1);
INSERT INTO dist_table(n, row_num) VALUES ("b", 2);
INSERT INTO dist_table(n, row_num) VALUES ("c", 3);
INSERT INTO dist_table(n, row_num) VALUES ("d", 4);
INSERT INTO dist_table(n, row_num) VALUES ("e", 5);
INSERT INTO dist_table(n, row_num) VALUES ("f", 6);
INSERT INTO dist_table(n, row_num) VALUES ("g", 7);
INSERT INTO dist_table(n, row_num) VALUES ("h", 8);
INSERT INTO dist_table(n, row_num) VALUES ("i", 9);
INSERT INTO dist_table(n, row_num) VALUES ("j", 10);
INSERT INTO dist_table(n, row_num) VALUES ("k", 11);
INSERT INTO dist_table(n, row_num) VALUES ("l", 12);
```

执行以下命令以查询数据：

```sql
SELECT * FROM dist_table;
```

如果一切正常，您将看到如下输出（`ts` 列的内容将会不同）：

```sql
+----------------------------+---+---------+
| ts                         | n | row_num |
+----------------------------+---+---------+
| 2024-01-19 07:33:34.123000 | a |       1 |
| 2024-01-19 07:33:34.128000 | b |       2 |
| 2024-01-19 07:33:34.130000 | c |       3 |
| 2024-01-19 07:33:34.131000 | d |       4 |
| 2024-01-19 07:33:34.133000 | e |       5 |
| 2024-01-19 07:33:34.134000 | f |       6 |
| 2024-01-19 07:33:34.135000 | g |       7 |
| 2024-01-19 07:33:34.136000 | h |       8 |
| 2024-01-19 07:33:34.138000 | i |       9 |
| 2024-01-19 07:33:34.140000 | j |      10 |
| 2024-01-19 07:33:34.141000 | k |      11 |
| 2024-01-19 07:33:34.907000 | l |      12 |
+----------------------------+---+---------+
12 rows in set (0.0346 sec)
```

由于我们在建表时指定了 partition 规则，metasrv 会将该表的 regions 均匀分配到集群中的 datanodes 上。查看 datanode 0 的日志文件 `~/.gtctl/mycluster/logs/datanode.0/log`，您将看到类似如下内容的日志：

```bash
INFO mito2::worker::handle_create: A new region created, region: RegionMetadata { column_metadatas: [[ts TimestampMillisecond not null default=Function("current_timestamp()") Timestamp 0], [n String null Tag 1], [row_num Int32 null Field 2]], time_index: 0, primary_key: [1], region_id: 4398046511105(1024, 1), schema_version: 0 }
INFO rskafka::client::partition: Creating new partition-specific broker connection topic=greptimedb_wal_topic_22 partition=0
INFO rskafka::client::partition: Detected leader topic=greptimedb_wal_topic_22 partition=0 leader=1 metadata_mode=CachedArbitrary
INFO rskafka::connection: Establishing new connection broker=1 url="127.0.0.1:9092"
```

这些日志说明，我们所创建的 `dist_table` 表的某个 region 被分配到了 datanode 0 上，且它的日志被写入到了名为 `greptimedb_wal_topic_22` 的Kafka topic。由于 topic 分配的逻辑具有一定的随机性，您可能看到不一样的 topic 名称。



现在我们验证了数据已经成功写入，我们 kill 掉 datanode 0，再重新拉起它。

在终端中执行 `ps | grep node-id=0` 命令，您将看到类似如下内容的输出。我们需要从其中找到 datanode 0 所属的 pid，以及记录 gtctl 启动 datanode 0 时执行的具体命令。

```bash
17332 ttys002    0:01.76 /Users/sunflower/greptimedb/target/debug/greptime --log-level=info datanode start --node-id=0 --metasrv-addr=0.0.0.0:3002 --rpc-addr=0.0.0.0:14100 --http-addr=0.0.0.0:14300 --data-home=/Users/sunflower/.gtctl/mycluster/data/datanode.0/home -c=/Users/sunflower/greptimedb/config/datanode.example.toml
```

使用 `kill` 命令强制终止 datanode 0（您需要根据您的实际情况修改 datanode 0 的 pid）：

```bash
kill -9 17332
```

执行以下命令以再次查询数据：

```sql
SELECT * FROM dist_table;
```

如果一切正常，您将看到如下输出：

```sql
ERROR: 1815 (HY000): Internal error: 1003
```

这说明我们成功终止了 datanode 0，导致查询无法被 GreptimeDB 集群正常处理，以致出现错误。



现在，我们执行之前所记录的命令以重新拉起 datanode 0（您需要根据您的实际情况修改该命令）。注意，执行以下命令会让 datanode 0 运行在一个前台终端中，它的日志也会出现在该终端中。

```bash
./greptime --log-level=info datanode start --node-id=0 --metasrv-addr=0.0.0.0:3002 --rpc-addr=0.0.0.0:14100 --http-addr=0.0.0.0:14300 --data-home=/Users/sunflower/.gtctl/mycluster/data/datanode.0/home -c=/Users/sunflower/greptimedb/config/datanode.example.toml
```

执行以下命令以再次查询数据：

```sql
SELECT * FROM dist_table;
```

如果一切正常，您将看到如下输出。这说明 datanode 0 被成功拉起，且正确恢复了数据。

```sql
+----------------------------+---+---------+
| ts                         | n | row_num |
+----------------------------+---+---------+
| 2024-01-19 07:33:34.123000 | a |       1 |
| 2024-01-19 07:33:34.128000 | b |       2 |
| 2024-01-19 07:33:34.130000 | c |       3 |
| 2024-01-19 07:33:34.131000 | d |       4 |
| 2024-01-19 07:33:34.133000 | e |       5 |
| 2024-01-19 07:33:34.134000 | f |       6 |
| 2024-01-19 07:33:34.135000 | g |       7 |
| 2024-01-19 07:33:34.136000 | h |       8 |
| 2024-01-19 07:33:34.138000 | i |       9 |
| 2024-01-19 07:33:34.140000 | j |      10 |
| 2024-01-19 07:33:34.141000 | k |      11 |
| 2024-01-19 07:33:34.907000 | l |      12 |
+----------------------------+---+---------+
12 rows in set (0.0346 sec)
```

同时，在 datanode 0 的前台终端中，您将看到类似如下内容的日志：

```bash
INFO mito2::worker::handle_open: Try to open region 4398046511105(1024, 1)
INFO mito2::region::opener: Start replaying memtable at flushed_entry_id + 1 1 for region 4398046511105(1024, 1)
INFO rskafka::client::partition: Creating new partition-specific broker connection topic=greptimedb_wal_topic_22 partition=0
INFO rskafka::client::partition: Detected leader topic=greptimedb_wal_topic_22 partition=0 leader=1 metadata_mode=CachedArbitrary
INFO rskafka::connection: Establishing new connection broker=1 url="127.0.0.1:9092"
INFO mito2::region::opener: Replay WAL for region: 4398046511105(1024, 1), rows recovered: 4, last entry id: 7
INFO mito2::worker::handle_open: Region 4398046511105(1024, 1) is opened
INFO datanode::region_server: Region 4398046511105(1024, 1) is registered to engine mito
INFO datanode::datanode: all regions are opened
```

这些日志说明，datanode 0 在重启时从 Kafka 拉取了必需的 logs，以重建 `dist_table` 表的某个 region 的状态。



通过以上演示，我们基本验证了 Kafka Remote WAL 的有效性。需要说明的是，我们在演示时为了方便将所有组件运行在本地机器上。由于组件间的通信完全基于网络，即使组件分布式地运行在不同机器上，Kafka Remote WAL 的有效性也不会受到影响。
