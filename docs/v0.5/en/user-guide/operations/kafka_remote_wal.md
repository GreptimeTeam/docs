# Kafka Remote WAL

[Write-Ahead Logging](https://docs.greptime.com/contributor-guide/datanode/wal#introduction) (WAL) is a crucial component in GreptimeDB. Every data modification operation is logged in the WAL to ensure that the database does not lose data cached in memory.

Before version 0.5, we utilized an embedded [Raft Engine](https://www.pingcap.com/blog/raft-engine-a-log-structured-embedded-storage-engine-for-multi-raft-logs-in-tikv/) as the storage engine for WAL. While in practical deployments, we could mount the Raft Engine on cloud storage to achieve a [Recovery Point Objective](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Point_Objective) (RPO) of 0, the remounting process incurred a significant [Recovery Time Objective](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Time_Objective) (RTO). Additionally, the embedded Raft Engine couldn't meet the demands of multiple subscriptions to logs, hindering features like [hot standby](https://en.wikipedia.org/wiki/Hot_spare) and region migration in GreptimeDB.

With the release of version [0.5](https://github.com/GreptimeTeam/greptimedb/releases/tag/v0.5.0), we transitioned to using a remote storage service as the WAL storage engine, referred to as Remote WAL. [Apache Kafka](https://kafka.apache.org/), widely adopted in the field of stream processing, exhibits excellent distributed fault tolerance and a subscription mechanism based on [Topics](https://www.conduktor.io/kafka/kafka-topics/). This aligns well with GreptimeDB's current requirements for Remote WAL. Hence, in version 0.5, we introduced Apache Kafka as an optional storage engine for WAL.

# How to use Kafka Remote WAL

## Step 1: Start Kafka Cluster

If you have already deployed a Kafka cluster, you can skip this step. However, please pay attention to the [advertised listeners](https://www.conduktor.io/kafka/kafka-advertised-host-setting/) configured during deployment, as you will use them in Step 2.



We recommend using [docker compose](https://docs.docker.com/compose/) to start the Kafka cluster. Kafka supports two deployment modes: [KRaft](https://www.conduktor.io/kafka/kafka-kraft-mode/) and [Zookeeper](https://www.conduktor.io/kafka/zookeeper-with-kafka/). You can find docker compose scripts for KRaft and Zookeeper modes [here](https://github.com/confluentinc/kafka-images/blob/master/examples/confluent-server-kraft/docker-compose.yml) and [here](https://github.com/conduktor/kafka-stack-docker-compose) respectively. We advise deploying in KRaft mode, similar to the [docker-compose-standalone.yml](https://github.com/GreptimeTeam/greptimedb/blob/main/tests-integration/fixtures/kafka/docker-compose-standalone.yml) script we use, which is also pasted below for your convenience.

```yaml
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

If you need to start the Kafka cluster in a different way, you can refer to the [Kafka official documentation](https://kafka.apache.org/quickstart).



Assuming you have started Docker and configured the path to the Docker Compose script correctly, you can execute the following command in the terminal to start a Kafka cluster with a single [broker](https://www.conduktor.io/kafka/kafka-brokers/).

```bash
docker compose -f docker-compose-standalone.yml up
```

If everything is in order, you will observe output containing the following content (The timestamp in the logs will be different):

```bash
...
kafka  | [2024-01-11 07:06:55,518] INFO KafkaConfig values:
kafka  |         advertised.listeners = PLAINTEXT://127.0.0.1:9092
...
kafka  | [2024-01-11 07:06:55,554] INFO [KafkaRaftServer nodeId=1] Kafka Server started
```

## Step 2: Configure GreptimeDB

Currently, GreptimeDB defaults to using Raft Engine as the storage engine for WAL. When using Kafka Remote WAL, you need to manually specify Kafka as the WAL storage engine through the configuration file.

### Standalone Mode

We have excerpted some Kafka Remote WAL configuration options that require your special attention. For the complete set of configuration options, you can refer to this [link](https://github.com/GreptimeTeam/greptimedb/blob/d061bf3d07897ea785924eda8b947f9b18d44646/config/standalone.example.toml#L83-L124).

```toml
[wal]
provider = "kafka"
broker_endpoints = ["127.0.0.1:9092"]
replication_factor = 1
max_batch_size = "1MB"
```

The meanings of each configuration option are as follows:

- `provider`: Specifies the WAL storage engine. Set this to `"kafka"` to indicate the use of Kafka Remote WAL.
- `broker_endpoints`: Specifies the advertised listeners for all brokers in the Kafka cluster. You need to configure this based on the `KAFKA_CFG_ADVERTISED_LISTENERS` specified in the docker compose script. If you deploy the Kafka cluster through other means, configure this based on the advertised listeners set during deployment. If not explicitly configured, it defaults to `["127.0.0.1:9092"]`.
- `replication_factor`: Determines the number of brokers to which data from each [partition](https://www.conduktor.io/kafka/kafka-topic-replication/) is replicated. The value of this configuration must be greater than 0 and not exceed the number of brokers.
- `max_batch_size`: We limit the total size of log entries transmitted in a batch to the value set in this configuration. It's important to note that Kafka, by default, rejects logs exceeding 1MB. Therefore, we recommend setting this configuration to a value not exceeding 1MB. If you do need to increase this configuration, you can refer to this [link](https://www.conduktor.io/kafka/how-to-send-large-messages-in-apache-kafka/) on how to configure Kafka.

### ****Distributed Mode****

For the distributed mode, Kafka Remote WAL configuration options are distributed across the configuration files of metasrv and datanode. In comparison to the standalone mode, the names, meanings, and default values of the configuration options remain consistent. You can refer to this [link](https://github.com/GreptimeTeam/greptimedb/blob/d061bf3d07897ea785924eda8b947f9b18d44646/config/metasrv.example.toml#L46-L78) for an example of metasrv configuration options and this [link](https://github.com/GreptimeTeam/greptimedb/blob/d061bf3d07897ea785924eda8b947f9b18d44646/config/datanode.example.toml#L40-L60) for an example of datanode configuration options for the distributed mode.

## Step 3: Start GreptimeDB

### Standalone Mode

Assuming you have correctly set the path to the GreptimeDB binary, you can execute the following command in the terminal to start a GreptimeDB instance and have it use the configuration options set in Step 2.

```bash
./greptime standalone start -c config/standalone.example.toml
```

If everything is in order, you will see logs in the terminal containing content similar to the following (the exact content may vary slightly due to version differences in GreptimeDB):

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

Note that if you start GreptimeDB multiple times with the Kafka cluster already running, the Kafka-related logs you observe may vary.

### Distributed Mode

We provide the [gtctl](https://docs.greptime.com/user-guide/operations/gtctl#gtctl) tool to assist you in quickly launching a GreptimeDB cluster. For demonstration purposes, we use gtctl to start a [bare-metal](https://docs.greptime.com/user-guide/operations/gtctl#bare-metal) cluster, consisting of 1 metasrv, 1 frontend, and 3 datanodes. You need to prepare the `cluster.yml` configuration file required by gtctl. The content of an example configuration file is as follows:

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

In this context, `metasrv.example.toml` and `datanode.example.toml` respectively represent the names of the configuration files for metasrv and datanode. You need to modify all configuration items in the example files with the prefix `/path/to/` according to your actual setup.



Assuming you have correctly installed gtctl and configured the content and path of the `cluster.yml` file, you can execute the following command in the terminal to start a GreptimeDB cluster named `mycluster`:

```bash
gtctl cluster create mycluster --bare-metal --config cluster.yaml
```

If everything is in order, you will see logs in the terminal containing content similar to the following (the exact content may vary slightly due to version differences in gtctl):

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

Under the default configuration, you can find logs for each component of the `mycluster` cluster in the directory `~/.gtctl/mycluster/logs`. For example, in the log file `~/.gtctl/mycluster/logs/metasrv.0/log`, you will find content similar to that in standalone mode.

# Validate the effectiveness of Kafka Remote WAL

The validation process can be summarized as follows:

- Create a table in the GreptimeDB cluster and insert a substantial amount of data.
- Execute a query to verify the successful write of data.
- Restart the GreptimeDB cluster and then execute a query to ensure the data are correctly recovered.



In our demonstration, we use [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysqlsh.html) as the client to connect to the GreptimeDB cluster. Feel free to use your preferred client. The SQL statements used in the demo are sourced from or modified based on the [Cluster](https://docs.greptime.com/user-guide/cluster#sql) documentation.



Assuming you have successfully connected to the GreptimeDB cluster, you can execute the following command in the client to create a table:

```sql
CREATE TABLE dist_table(
    ts TIMESTAMP DEFAULT current_timestamp(),
    n INT,
    row_id INT,
    PRIMARY KEY(n),
    TIME INDEX (ts)
)
PARTITION BY RANGE COLUMNS (n) (
    PARTITION r0 VALUES LESS THAN (5),
    PARTITION r1 VALUES LESS THAN (9),
    PARTITION r2 VALUES LESS THAN (MAXVALUE),
)
engine=mito;
```

Execute the following command to insert a substantial amount of data:

```sql
INSERT INTO dist_table(n, row_id) VALUES (1, 1);
INSERT INTO dist_table(n, row_id) VALUES (2, 2);
INSERT INTO dist_table(n, row_id) VALUES (3, 3);
INSERT INTO dist_table(n, row_id) VALUES (4, 4);
INSERT INTO dist_table(n, row_id) VALUES (5, 5);
INSERT INTO dist_table(n, row_id) VALUES (6, 6);
INSERT INTO dist_table(n, row_id) VALUES (7, 7);
INSERT INTO dist_table(n, row_id) VALUES (8, 8);
INSERT INTO dist_table(n, row_id) VALUES (9, 9);
INSERT INTO dist_table(n, row_id) VALUES (10, 10);
INSERT INTO dist_table(n, row_id) VALUES (11, 11);
INSERT INTO dist_table(n, row_id) VALUES (12, 12);
```

Execute the following command to query the data:

```sql
SELECT * FROM dist_table;
```

If everything is in order, you will see the following output (the content of the `ts` column will be different):

```sql
+----------------------------+----+--------+
| ts                         | n  | row_id |
+----------------------------+----+--------+
| 2024-01-11 08:05:06.535000 |  1 |      1 |
| 2024-01-11 08:05:06.768000 |  2 |      2 |
| 2024-01-11 08:05:06.987000 |  3 |      3 |
| 2024-01-11 08:05:07.206000 |  4 |      4 |
| 2024-01-11 08:05:07.425000 |  5 |      5 |
| 2024-01-11 08:05:07.652000 |  6 |      6 |
| 2024-01-11 08:05:07.871000 |  7 |      7 |
| 2024-01-11 08:05:08.086000 |  8 |      8 |
| 2024-01-11 08:05:08.307000 |  9 |      9 |
| 2024-01-11 08:05:08.534000 | 10 |     10 |
| 2024-01-11 08:05:08.752000 | 11 |     11 |
| 2024-01-11 08:05:10.904000 | 12 |     12 |
+----------------------------+----+--------+
12 rows in set (0.0687 sec)
```

Since we specified partition rules when creating the table, metasrv will evenly distribute the regions of this table across the datanodes in the cluster. Check the log file for datanode 0 at `~/.gtctl/mycluster/logs/datanode.0/log`. You will see logs similar to the following:

```bash
INFO mito2::worker::handle_create: A new region created, region: RegionMetadata { column_metadatas: [[ts TimestampMillisecond not null default=Function("current_timestamp()") Timestamp 0], [n Int32 null Tag 1], [row_id Int32 null Field 2]], time_index: 0, primary_key: [1], region_id: 4398046511105(1024, 1), schema_version: 0 }
INFO rskafka::client::partition: Creating new partition-specific broker connection topic=greptimedb_wal_topic_22 partition=0
INFO rskafka::client::partition: Detected leader topic=greptimedb_wal_topic_22 partition=0 leader=1 metadata_mode=CachedArbitrary
INFO rskafka::connection: Establishing new connection broker=1 url="127.0.0.1:9092"
```

These logs indicate that a region of the `dist_table` table we created has been assigned to datanode 0, and its logs are being written to a Kafka topic named `greptimedb_wal_topic_22`. Due to the somewhat random logic of topic assignment, you may see a different topic name.



Now that we have confirmed data has been successfully written, let's kill datanode 0 and then restart it. 

Execute the `ps` command in the terminal, and you will see output similar to the following. We need to find the PID of the process hosting the datanode 0, and record the exact command used when starting datanode 0 with gtctl.

```bash
17255 ttys002    0:00.23 gtctl cluster create mycluster --bare-metal --config examples/bare-metal/cluster.yaml
17299 ttys002    0:11.30 /opt/homebrew/bin/etcd --data-dir /Users/sunflower/.gtctl/mycluster/data/etcd
17331 ttys002    0:11.36 /Users/sunflower/greptimedb/target/debug/greptime --log-level=info metasrv start --store-addr=127.0.0.1:2379 --server-addr=0.0.0.0:3002 --http-addr=0.0.0.0:14001 --bind-addr=127.0.0.1:3002 -c=/Users/sunflower/greptimedb/config/metasrv.example.toml
17332 ttys002    0:01.76 /Users/sunflower/greptimedb/target/debug/greptime --log-level=info datanode start --node-id=0 --metasrv-addr=0.0.0.0:3002 --rpc-addr=0.0.0.0:14100 --http-addr=0.0.0.0:14300 --data-home=/Users/sunflower/.gtctl/mycluster/data/datanode.0/home -c=/Users/sunflower/greptimedb/config/datanode.example.toml
17333 ttys002    0:01.81 /Users/sunflower/greptimedb/target/debug/greptime --log-level=info datanode start --node-id=1 --metasrv-addr=0.0.0.0:3002 --rpc-addr=0.0.0.0:14101 --http-addr=0.0.0.0:14301 --data-home=/Users/sunflower/.gtctl/mycluster/data/datanode.1/home -c=/Users/sunflower/greptimedb/config/datanode.example.toml
17334 ttys002    0:01.81 /Users/sunflower/greptimedb/target/debug/greptime --log-level=info datanode start --node-id=2 --metasrv-addr=0.0.0.0:3002 --rpc-addr=0.0.0.0:14102 --http-addr=0.0.0.0:14302 --data-home=/Users/sunflower/.gtctl/mycluster/data/datanode.2/home -c=/Users/sunflower/greptimedb/config/datanode.example.toml
17455 ttys002    0:01.50 /Users/sunflower/greptimedb/target/debug/greptime --log-level=info frontend start --metasrv-addr=0.0.0.0:3002
87056 ttys111    0:00.53 docker compose -f docker-compose-standalone.yml up
```

Use the `kill` command to forcefully terminate datanode 0 (you need to modify the PID of datanode 0 based on your actual situation):

```bash
kill -9 17332
```

Execute the following command to query the data again:

```sql
SELECT * FROM dist_table;
```

If everything is in order, you will see the following output:

```sql
ERROR: 1815 (HY000): Internal error: 1003
```

This indicates that we successfully terminated datanode 0, causing the query to be unable to be processed properly by the GreptimeDB cluster, resulting in an error.



Now, execute the previously recorded command to restart datanode 0 (you need to modify the command based on your actual situation). Note that running this command will make datanode 0 operate in the foreground within a terminal, and its logs will appear in that terminal.

```bash
./greptime --log-level=info datanode start --node-id=0 --metasrv-addr=0.0.0.0:3002 --rpc-addr=0.0.0.0:14100 --http-addr=0.0.0.0:14300 --data-home=/Users/sunflower/.gtctl/mycluster/data/datanode.0/home -c=/Users/sunflower/greptimedb/config/datanode.example.toml
```

Execute the following command to query the data again:

```sql
SELECT * FROM dist_table;
```

If everything is in order, you will see the following output. This indicates that datanode 0 has been successfully restarted and has correctly recovered the data.

```sql
+----------------------------+----+--------+
| ts                         | n  | row_id |
+----------------------------+----+--------+
| 2024-01-11 08:09:01.916000 |  1 |      1 |
| 2024-01-11 08:09:02.145000 |  2 |      2 |
| 2024-01-11 08:09:02.355000 |  3 |      3 |
| 2024-01-11 08:09:02.575000 |  4 |      4 |
| 2024-01-11 08:09:02.795000 |  5 |      5 |
| 2024-01-11 08:09:03.021000 |  6 |      6 |
| 2024-01-11 08:09:03.241000 |  7 |      7 |
| 2024-01-11 08:09:03.454000 |  8 |      8 |
| 2024-01-11 08:09:03.671000 |  9 |      9 |
| 2024-01-11 08:09:03.896000 | 10 |     10 |
| 2024-01-11 08:09:04.116000 | 11 |     11 |
| 2024-01-11 08:09:05.354000 | 12 |     12 |
+----------------------------+----+--------+
12 rows in set (0.0367 sec)
```

Simultaneously, in the foreground terminal of datanode 0, you will see logs similar to the following:

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

These logs indicate that datanode 0, during the restart, pulled the necessary logs from Kafka to reconstruct the state of a region of the `dist_table` table.



Through the above demonstration, we have essentially validated the effectiveness of Kafka Remote WAL. It's important to note that, for convenience in the demonstration, we ran all components on the local machine. Since communication between components is entirely network-based, the effectiveness of Kafka Remote WAL is not affected even if the components are distributed across different machines.
