---
keywords: [GreptimeDB remote WAL, Docker setup, Kafka setup, data writing, data querying, quick start guide]
description: Quick start guide for setting up Remote WAL using Docker and Kafka for GreptimeDB. Includes steps for creating a Docker network, starting Kafka and GreptimeDB containers, writing and querying data, and cleaning up.
---

# Quick Start

## What's Remote WAL

[WAL](/contributor-guide/datanode/wal.md#introduction)(Write-Ahead Logging) is a crucial component in GreptimeDB that persistently records every data modification to ensure no memory-cached data loss. We implement WAL as a module in the [Datanode](/user-guide/concepts/why-greptimedb.md) service using a persistent embedded storage engine, [raft-engine](https://github.com/tikv/raft-engine). When deploying GreptimeDB in the public cloud, we can persistently store WAL data in cloud storage(AWS EBS, GCP persistent disk, etc.) to achieve 0 RPO([Recovery Point Objective](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Point_Objective)). However, the deployment has a significant RTO([Recovery Time Objective](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Time_Objective)) because WAL is tightly coupled with Datanode. Additionally, the rafe-engine can't support multiple log subscriptions, which makes it difficult to implement region hot standby and region migration.

To resolve the above problems, we decided to design and implement a remote WAL. The remote WAL decouples the WAL from the Datanode to the remote service, which we chose to be [Apache Kafka](https://kafka.apache.org/). Apache Kafka is widely adopted in stream processing and exhibits excellent distributed fault tolerance and a subscription mechanism based on topics. With the release [v0.5.0](https://github.com/GreptimeTeam/greptimedb/releases/tag/v0.5.0), we introduced Apache Kafka as an optional storage engine for WAL.

##  Run Standalone GreptimeDB with Remote WAL

It's very easy to experience remote WAL by using the Docker with the following steps. In this quick start, we will create a Kafka cluster with one broker in KRaft mode and use it as remote WAL for the standalone GreptimeDB.

### Step 1:  Create a user-defined bridge of the Docker network 

The user-defined bridge can help us create a bridge network to connect multiple containers:

```
docker network create greptimedb-remote-wal
```

### Step 2: Start the Kafka Service

Use the KRaft mode to start the singleton Kafka service:

```
docker run \
  --name kafka --rm \
  --network greptimedb-remote-wal \
  -p 9092:9092 \
  -e KAFKA_CFG_NODE_ID="1" \
  -e KAFKA_CFG_PROCESS_ROLES="broker,controller" \
  -e KAFKA_CFG_CONTROLLER_QUORUM_VOTERS="1@kafka:9093" \
  -e KAFKA_CFG_ADVERTISED_LISTENERS="PLAINTEXT://kafka:9092" \
  -e KAFKA_CFG_CONTROLLER_LISTENER_NAMES="CONTROLLER" \
  -e KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP="CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT" \
  -e KAFKA_CFG_LISTENERS="PLAINTEXT://:9092,CONTROLLER://:9093" \
  -e ALLOW_PLAINTEXT_LISTENER="yes" \
  -e KAFKA_BROKER_ID="1" \
  -e KAFKA_CFG_LOG_DIRS="/bitnami/kafka/data" \
  -v $(pwd)/kafka-data:/bitnami/kafka/data \
  bitnami/kafka:3.6.0
```

:::tip NOTE
To avoid accidentally exit the Docker container, you may want to run it in the "detached" mode: add the `-d` flag to
the `docker run` command.
:::

The data will be stored in `$(pwd)/kafka-data`.

### Step 3: Start the GreptimeDB with Remote WAL Configurations

Use the Kafka wal provider to start the standalone GreptimeDB:

```
docker run \
  --network greptimedb-remote-wal \
  -p 4000-4003:4000-4003 \
  -v "$(pwd)/greptimedb_data:/greptimedb_data" \
  --name greptimedb --rm \
  -e GREPTIMEDB_STANDALONE__WAL__PROVIDER="kafka" \
  -e GREPTIMEDB_STANDALONE__WAL__BROKER_ENDPOINTS="kafka:9092" \
  greptime/greptimedb standalone start \
  --http-addr 0.0.0.0:4000 \
  --rpc-bind-addr 0.0.0.0:4001 \
  --mysql-addr 0.0.0.0:4002 \
  --postgres-addr 0.0.0.0:4003
```

:::tip NOTE
To avoid accidentally exit the Docker container, you may want to run it in the "detached" mode: add the `-d` flag to
the `docker run` command.
:::

We use the [environment variables](/user-guide/deployments/configuration.md#environment-variable) to specify the provider:

- `GREPTIMEDB_STANDALONE__WAL__PROVIDER`: Set `kafka` to use Kafka remote WAL;
- `GREPTIMEDB_STANDALONE__WAL__BROKER_ENDPOINTS`: Specify the advertised listeners for all brokers in the Kafka cluster. In this example, we will use the Kafka container name, and the bridge network will resolve it into IPv4;

### Step 4: Write and Query Data

There are many ways to connect to GreptimeDB, so let's choose `mysql`.

1. **Connect the GreptimeDB**

   ```
   mysql -h 127.0.0.1 -P 4002 
   ```


2. **Write the testing data**

   - Create the table `system_metrics`
   
     ```sql
     CREATE TABLE IF NOT EXISTS system_metrics (
         host STRING,
         idc STRING,
         cpu_util DOUBLE,
         memory_util DOUBLE,
         disk_util DOUBLE,
         ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         PRIMARY KEY(host, idc),
         TIME INDEX(ts)
     );
     ```
   
   - Write the testing data
   
     ```sql
     INSERT INTO system_metrics
     VALUES
         ("host1", "idc_a", 11.8, 10.3, 10.3, 1667446797450),
         ("host1", "idc_a", 80.1, 70.3, 90.0, 1667446797550),
         ("host1", "idc_b", 50.0, 66.7, 40.6, 1667446797650),
         ("host1", "idc_b", 51.0, 66.5, 39.6, 1667446797750),
         ("host1", "idc_b", 52.0, 66.9, 70.6, 1667446797850),
         ("host1", "idc_b", 53.0, 63.0, 50.6, 1667446797950),
         ("host1", "idc_b", 78.0, 66.7, 20.6, 1667446798050),
         ("host1", "idc_b", 68.0, 63.9, 50.6, 1667446798150),
         ("host1", "idc_b", 90.0, 39.9, 60.6, 1667446798250);
     ```

3. **Query the data**

   ```sql
   SELECT * FROM system_metrics;
   ```

4. **Query the Kafka topics**:

   ```
   # List the Kafka topics.
   docker exec kafka /opt/bitnami/kafka/bin/kafka-topics.sh --list --bootstrap-server localhost:9092
   ```

   By default, all the topics start with `greptimedb_wal_topic`, for example:

   ```
   docker exec kafka /opt/bitnami/kafka/bin/kafka-topics.sh --list --bootstrap-server localhost:9092
   greptimedb_wal_topic_0
   greptimedb_wal_topic_1
   greptimedb_wal_topic_10
   ...

### Step 5: Cleanup

- Stop the greptimedb and Kafka

  ```
  docker stop greptimedb
  docker stop kafka
  ```

- Remove the user-defined bridge

  ```
  docker network rm greptimedb-remote-wal 
  ```

- Remove the data

  The data will be stored in the working directory that runs greptimedb:

  ```
  rm -r <working-dir>/greptimedb
  rm -r <working-dir>/kafka-data
  ```
