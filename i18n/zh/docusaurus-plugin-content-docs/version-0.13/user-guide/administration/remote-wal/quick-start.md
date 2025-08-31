---
keywords: [快速开始, Remote WAL, Docker, Kafka 服务, Standalone GreptimeDB, 数据写入, 数据查询, Kafka Topics]
description: 介绍如何使用 Docker 快速启动带有 Remote WAL 的 Standalone GreptimeDB，包括创建自定义 Docker bridge、启动 Kafka 服务和 GreptimeDB。
---

# 快速开始

## 什么是 Remote WAL

[WAL](/contributor-guide/datanode/wal.md#introduction)(Write-Ahead Logging) 是 GreptimeDB 中的一个关键组件，它持久记录每一次数据修改，以确保不会丢失缓存在内存中的数据。我们在  [Datanode](/user-guide/concepts/why-greptimedb.md)  服务中用持久的嵌入式存储引擎 [raft-engine](https://github.com/tikv/raft-engine) 将 WAL 实现为一个模块。在公共云中部署 GreptimeDB 时，我们可以在云存储（AWS EBS、GCP 持久盘等）中持久存储 WAL 数据，以实现 0 RPO。然而，由于 WAL 与 Datanode 紧密耦合，导致部署过程中的 RTO（Recovery Time Objective）较长。此外，由于 raft-engine 无法支持多日志订阅，这使得实现 region 热备份和 region 迁移变得困难。

为了解决上述问题，我们决定设计并实现一个远程 WAL。远程 WAL 将 WAL 从 Datanode 分离到远程服务，我们选择了 Apache Kafka 作为远程服务。Apache Kafka 在流处理中被广泛采用，展现出卓越的分布式容错能力和基于主题的订阅机制。在发布 v0.5.0 版本时，我们引入了 Apache Kafka 作为 WAL 的可选存储引擎。


## 运行带有 Remote WAL 的 Standalone GreptimeDB

通过以下步骤使用 Docker 体验远程 WAL 非常简单。在这个快速开始中，我们将创建一个采用 KRaft 模式的 Kafka 集群，并将其作为独立 GreptimeDB 的远程 WAL。

### Step 1:  创建一个自定义的 Docker bridge

自定义的 Docker bridge 可以帮助我们创建用于连接多个容器的桥接网络：

```
docker network create greptimedb-remote-wal
```

### Step 2: 启动 Kafka 服务

使用 KRaft 模式来启动单节点 Kafka：

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
  public.ecr.aws/i8k6a5e1/public.ecr.aws/i8k6a5e1/bitnami/kafka:3.6.0
```

:::tip NOTE
为了防止不小心退出 Docker 容器，你可能想以“detached”模式运行它：在 `docker run` 命令中添加 `-d` 参数即可。
:::

数据将保存在 `$(pwd)/kafka-data`.

### Step 3: 用 Remote WAL 模式启动 standalone 模式 GreptimeDB

使用 Kafka wal provider 来启动 standalone 模式的 GreptimeDB：

```
docker run \
  --network greptimedb-remote-wal \
  -p 4000-4003:4000-4003 \
  -v "$(pwd)/greptimedb:/tmp/greptimedb" \
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
为了防止不小心退出 Docker 容器，你可能想以“detached”模式运行它：在 `docker run` 命令中添加 `-d` 参数即可。
:::

我们使用环境变量来指定 provider：

- `GREPTIMEDB_STANDALONE__WAL__PROVIDER`: 设置为 `kafka` 以此来使用 kafka remote wal；
- `GREPTIMEDB_STANDALONE__WAL__BROKER_ENDPOINTS`: 指定 Kafka 集群中所有 brokers 的地址。在此示例中，我们将使用 Kafka 容器的名称，桥接网络将其解析为 IPv4 地址；

### Step 4: 写入和查询数据

有很多方式来连接 GreptimeDB，这里我们选择使用 `mysql` 命令行工具。

1. **用 MySQL 协议连接 GrepimeDB**

   ```
   mysql -h 127.0.0.1 -P 4002 
   ```


2. **写入测试数据**

   - 创建 `system_metrics` 表
   
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
   
   - 写入测试数据
   
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

3. **查询数据**

   ```sql
   SELECT * FROM system_metrics;
   ```

4. **查询 Kafka Topics**

   ```
   # List the Kafka topics.
   docker exec kafka /opt/bitnami/kafka/bin/kafka-topics.sh --list --bootstrap-server localhost:9092
   ```

   默认所有 topic 都以 `greptimedb_wal_topic`  开头，例如：

   ```
   docker exec kafka /opt/bitnami/kafka/bin/kafka-topics.sh --list --bootstrap-server localhost:9092
   greptimedb_wal_topic_0
   greptimedb_wal_topic_1
   greptimedb_wal_topic_10
   ...

### Step 5: 清理

- 停止 GreptimeDB 和 Kafka

  ```
  docker stop greptimedb
  docker stop kafka
  ```

- 移除 Docker bridge

  ```
  docker network rm greptimedb-remote-wal 
  ```

- 删除数据

  ```
  rm -r <working-dir>/greptimedb
  rm -r <working-dir>/kafka-data
  ```
