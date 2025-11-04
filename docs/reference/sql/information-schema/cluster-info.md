---
keywords: [cluster information, cluster configuration, SQL information schema, cluster status, cluster nodes]
description: Contains information about the cluster configuration and status within the SQL information schema, including nodes, roles, and other cluster-related details.
---

# CLUSTER_INFO

The `CLUSTER_INFO` table provides the topology information of the cluster.


```sql
USE INFORMATION_SCHEMA;

DESC TABLE CLUSTER_INFO;
```

The output is as follows:

```sql
+-----------------------+----------------------+------+------+---------+---------------+
| Column                | Type                 | Key  | Null | Default | Semantic Type |
+-----------------------+----------------------+------+------+---------+---------------+
| peer_id               | Int64                |      | NO   |         | FIELD         |
| peer_type             | String               |      | NO   |         | FIELD         |
| peer_addr             | String               |      | YES  |         | FIELD         |
| peer_hostname         | String               |      | YES  |         | FIELD         |
| total_cpu_millicores  | Int64                |      | NO   |         | FIELD         |
| total_memory_bytes    | Int64                |      | NO   |         | FIELD         |
| cpu_usage_millicores  | Int64                |      | NO   |         | FIELD         |
| memory_usage_bytes    | Int64                |      | NO   |         | FIELD         |
| version               | String               |      | NO   |         | FIELD         |
| git_commit            | String               |      | NO   |         | FIELD         |
| start_time            | TimestampMillisecond |      | YES  |         | FIELD         |
| uptime                | String               |      | YES  |         | FIELD         |
| active_time           | String               |      | YES  |         | FIELD         |
| node_status           | String               |      | YES  |         | FIELD         |
+-----------------------+----------------------+------+------+---------+---------------+
```


The columns in table:

* `peer_id`: the server id of the node. It's always `0` for standalone mode and `-1` for frontends because it doesn't make sense in such cases.
* `peer_type`: the node type, `METASRV`,`FRONTEND`, or `DATANODE` for distributed clusters and `STANDALONE` for standalone deployments.
* `peer_addr`: the GRPC server address of the node. It's always empty for standalone deployments.
* `peer_hostname`: the hostname of the peer.
* `total_cpu_millicores`: the total CPU millicores of the node.
* `total_memory_bytes`: the total memory bytes of the node.
* `cpu_usage_millicores`: the CPU usage millicores of the node. This only works in a containerized environment (cgroup v2).
* `memory_usage_bytes`: the memory usage bytes of the node. This only works in a containerized environment (cgroup v2).
* `version`: The build version of the node, such as `0.7.2` etc.
* `git_commit`: The build git commit of the node.
* `start_time`: The node start time.
* `uptime`: The uptime of the node, in the format of duration string `24h 10m 59s 150ms`.
* `active_time`: The duration string in the format of `24h 10m 59s 150ms` since the node's last active time(sending the heartbeats), it's always empty for standalone deployments.
* `node_status`: the status info of the peer.

Query the table:

```sql
SELECT * FROM CLUSTER_INFO;
```

An example output in standalone deployments:

```sql
+---------+------------+-----------+---------------+----------------------+--------------------+----------------------+--------------------+---------+-----------+----------------------------+--------+-------------+-------------+
| peer_id | peer_type  | peer_addr | peer_hostname | total_cpu_millicores | total_memory_bytes | cpu_usage_millicores | memory_usage_bytes | version | git_commit| start_time                 | uptime | active_time | node_status |
+---------+------------+-----------+---------------+----------------------+--------------------+----------------------+--------------------+---------+-----------+----------------------------+--------+-------------+-------------+
| 0       | STANDALONE |           |               | 16000                | 17179869184        | 0                    | 0                  | 0.7.2   | 86ab3d9   | 2024-04-30T06:40:02.074    | 18ms   |             | NULL        |
+---------+------------+-----------+---------------+----------------------+--------------------+----------------------+--------------------+---------+-----------+----------------------------+--------+-------------+-------------+
```

Another example is from a distributed cluster that has three Datanodes, one Frontend, and one Metasrv.

```sql
+---------+-----------+----------------+-------------------------------------+----------------------+--------------------+----------------------+--------------------+---------+-----------+----------------------------+----------+-------------+-------------------------------------------------------------------+
| peer_id | peer_type | peer_addr      | peer_hostname                       | total_cpu_millicores | total_memory_bytes | cpu_usage_millicores | memory_usage_bytes | version | git_commit| start_time                 | uptime   | active_time | node_status                                                       |
+---------+-----------+----------------+-------------------------------------+----------------------+--------------------+----------------------+--------------------+---------+-----------+----------------------------+----------+-------------+-------------------------------------------------------------------+
| 1       | DATANODE  | 127.0.0.1:4101 | mycluster-datanode-0                | 1000                 | 1073741824         | 1                    | 34570240           | 0.7.2   | 86ab3d9   | 2024-04-30T06:40:04.791    | 4s 478ms | 1s 467ms    | {"workloads":["hybrid"],"leader_regions":46,"follower_regions":0} |
| 2       | DATANODE  | 127.0.0.1:4102 | mycluster-datanode-1                | 1000                 | 1073741824         | 1                    | 38170624           | 0.7.2   | 86ab3d9   | 2024-04-30T06:40:06.098    | 3s 171ms | 162ms       | {"workloads":["hybrid"],"leader_regions":46,"follower_regions":0} |
| 3       | DATANODE  | 127.0.0.1:4103 | mycluster-datanode-2                | 1000                 | 1073741824         | 1                    | 37085184           | 0.7.2   | 86ab3d9   | 2024-04-30T06:40:07.425    | 1s 844ms | 1s 839ms    | {"workloads":["hybrid"],"leader_regions":46,"follower_regions":0} |
| -1      | FRONTEND  | 127.0.0.1:4001 | mycluster-frontend-6c5d4bcf78-m7jtx | 1000                 | 1073741824         | 1                    | 45465600           | 0.7.2   | 86ab3d9   | 2024-04-30T06:40:08.815    | 454ms    | 47ms        | NULL                                                              |
| 0       | METASRV   | 127.0.0.1:3002 | mycluster-meta-54bd44bd94-g8dzm     | 1000                 | 1073741824         | 0                    | 28368896           | unknown | unknown   |                            |          |             | {"is_leader":true}                                                |
+---------+-----------+----------------+-------------------------------------+----------------------+--------------------+----------------------+--------------------+---------+-----------+----------------------------+----------+-------------+-------------------------------------------------------------------+
```


