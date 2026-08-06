---
keywords: [disaster recovery, active-active failover, RPO, RTO, configuration]
description: Explains how to plan, deploy, and operate the active-active failover DR solution in GreptimeDB Enterprise.
---

# DR Solution Based on Active-Active Failover

GreptimeDB Enterprise can deploy two standalone nodes as peers. Both nodes accept reads and writes, keep a complete copy of the data, and asynchronously replicate data changes to each other. Neither node is a permanently designated primary.

This topology is intended for edge and small-to-medium deployments that need node-level or site-level disaster recovery without operating a distributed GreptimeDB cluster. A load balancer, client driver, or service-discovery system directs traffic to an available node.

<AnchorAlias id="architecture-and-readwrite-paths" />
<AnchorAlias id="write-path" />
<AnchorAlias id="query-path" />

## Architecture

![Two GreptimeDB nodes replicate data in both directions, with traffic managed by an external failover mechanism](/img/active-active-forwarding.svg)

The two nodes operate independently:

- A write is committed on the receiving node and then replicated to the peer. The client does not wait for the peer to acknowledge the write.
- A query runs on the node that receives it. GreptimeDB does not merge query results from both nodes.
- Continuous network connectivity between the nodes is not required. When a peer or the network is unavailable, pending changes are retained locally and sent after connectivity is restored, provided that the source node's storage remains available and has sufficient capacity.
- Replicated changes are not sent back to their source, preventing circular replication.

Because replication is asynchronous, the peer can temporarily return stale data. Applications that require read-after-write consistency should keep related reads on the node that accepted the write, or wait for replication to catch up before switching nodes.

## Capabilities and Boundaries

| Capability | Behavior |
| --- | --- |
| Node and site redundancy | Each node keeps a complete data copy and can serve application traffic. |
| Write replication | Data changes are replicated asynchronously in both directions. |
| Query execution | Queries execute locally on the node receiving the request. |
| Network interruption | A healthy node continues serving, and pending changes are replicated after the peer recovers. |
| Traffic failover | An external load balancer, client driver, or service-discovery system switches endpoints. |
| Consistency | Data on the two nodes is eventually consistent. |
| Scale-out | This topology provides two-node redundancy; it is not a replacement for a distributed cluster. |

The following limitations affect DR planning:

- A successful write does not guarantee that the peer has already received it.
- If a node and its local storage are permanently lost before pending changes reach the peer, those changes may be unavailable on the peer.
- Schema changes made while the peer is unavailable may require verification or manual reconciliation after recovery.
- The topology does not elect a traffic primary or automatically switch client connections.

If the deployment requires synchronous replication, strict zero RPO after the complete loss of one site's local storage, or horizontal scale-out, use a distributed DR architecture based on Remote WAL and cross-region object storage instead.

## Plan the Deployment

Before enabling the topology:

1. Deploy the nodes in separate failure domains. For site-level DR, use different availability zones or regions.
2. Ensure that each node has enough storage for its complete data copy and for changes accumulated during the longest expected peer outage.
3. Choose an external traffic failover mechanism and define its health checks, retry policy, and connection-draining behavior.
4. Assign non-overlapping table ID ranges so that both nodes can create tables independently without ID conflicts.
5. Define how the application handles ambiguous write results and retries. Prefer idempotent writes where possible.

## Configuration

Configure each node with the other node as a synchronization target. The following example shows the relevant settings on node A:

```toml
[[sync_nodes]]
name = "node-b"
enabled = true

[sync_nodes.metasrv]
metasrv_addrs = ["10.0.2.10:3002"]

[sync_nodes.region_server]
id = 2
addr = "10.0.2.10:4001"

[table_id_range]
start = 1024
end = 1000000
```

Configure node B with node A's endpoints and a different `table_id_range`. Each `sync_nodes.name` must be unique and may contain only ASCII letters, digits, `_`, or `-`.

The exact endpoints and table ID ranges depend on the deployment. Contact Greptime for a reviewed production configuration.

## Failure and Recovery Behavior

| Event | Expected behavior | Operator action |
| --- | --- | --- |
| Peer or inter-site network is unavailable | The healthy node continues serving. Pending changes wait for the peer to recover. | Keep traffic on the healthy node and monitor replication health and local storage capacity. |
| One node is unavailable | Traffic sent to that node fails until the external failover mechanism redirects it. | Confirm the surviving node is healthy, then switch or drain traffic. |
| The unavailable node returns | Pending changes are replicated automatically. The nodes may differ until catch-up completes. | Keep traffic stable and verify data and schema before restoring normal routing. |
| The source node's local storage is full or unavailable | New writes may be rejected to preserve recoverability. | Restore local storage capacity and retry failed writes according to application semantics. |
| A node and its storage are permanently lost | Changes not yet replicated may be missing from the surviving node. | Recover from another data copy if available and assess the actual RPO. |

### Fail over traffic

When a node or site fails:

1. Confirm that the alternate node is reachable and can serve critical queries.
2. Stop sending new traffic to the failed endpoint.
3. Direct traffic to the healthy node through the selected failover mechanism.
4. Verify application error rates, write success, and critical query results.
5. Keep routing stable until the failed node has recovered and caught up.

Avoid repeatedly switching write traffic while the nodes cannot communicate. Although both nodes accept writes, independent writes on disconnected nodes increase the amount of state that must converge and complicate recovery verification.

### Recover a node

After the failed node or network returns:

1. Keep application writes on the healthy node.
2. Restore the recovered node and its synchronization connectivity.
3. Wait until replication is healthy and the backlog has been processed.
4. Compare critical table schemas and recent data on both nodes.
5. Run application-level read and write probes against the recovered node.
6. Gradually restore traffic and continue monitoring both nodes.

Treat schema changes made during the outage as a separate verification item. Do not restore production traffic to the recovered node until critical schemas match.

## RPO and RTO

### RPO

RPO depends on the failure mode and the amount of data waiting to be replicated:

- If only the peer or network fails and the source node's storage remains intact, pending changes can be sent after recovery.
- If the source node and its storage are lost before replication completes, the surviving node may not contain the pending changes.

The topology does not provide a synchronous replication mode. Measure replication health under representative load and include the observed delay in the DR plan.

### RTO

RTO includes failure detection, endpoint switching, connection retry, and application recovery time. GreptimeDB does not perform traffic failover inside this two-node topology, so the external traffic layer and its configuration determine most of the RTO.

Test both planned and unplanned failover regularly. The test should cover active connections, connection pools, in-flight writes, and the time required to validate the alternate node.

<AnchorAlias id="failover-implementation-methods" />

## Choose a Traffic Failover Mechanism

- **Load balancer.** Configure active health checks and remove an unhealthy endpoint from rotation. A managed load balancer or a separate HAProxy instance keeps the failover policy outside applications.

  <img src="/DR-LoadBalancer.png" alt="Failover through a load balancer" width="600"/>

- **Client driver.** Some MySQL and PostgreSQL drivers accept multiple hosts and retry another endpoint. For example, see [MySQL Connector/J failover](https://dev.mysql.com/doc/connector-j/en/connector-j-config-failover.html) and [PostgreSQL JDBC connection failover](https://jdbc.postgresql.org/documentation/use/#connection-fail-over). Connection failover does not make retrying a non-idempotent write safe.

  <img src="/DR-SDK.png" alt="Failover through a client driver" width="600"/>

- **Service discovery or endpoint update.** Health automation can update DNS, a service registry, or the application's endpoint set. Include health-check intervals, DNS TTL, and connection-pool refresh time in the RTO estimate.

### HAProxy example

The following minimal configuration exposes the GreptimeDB HTTP API through a local TCP endpoint at `127.0.0.1:14000`. HAProxy sends traffic to node A while it is healthy and switches to node B after three consecutive failed health checks. Node A becomes eligible again after two consecutive successful checks.

Although both GreptimeDB nodes can accept writes, this example uses active-standby traffic routing to keep application writes on one node during normal operation. Replace the hostnames, ports, bind address, and timeouts for your environment.

```text title="haproxy.cfg"
global
    log /dev/log local0
    log /dev/log local1 notice
    daemon

defaults
    mode tcp
    log global
    option tcplog
    timeout connect 5s
    timeout client 30s
    timeout server 30s

frontend greptimedb_http
    bind 127.0.0.1:14000
    default_backend greptimedb_http_nodes

backend greptimedb_http_nodes
    # Preferred node
    server node-a node-a:4000 check inter 2s fall 3 rise 2

    # Failover node
    server node-b node-b:4000 check inter 2s fall 3 rise 2 backup
```

This configuration proxies only the HTTP API on port `4000`. To proxy the MySQL or PostgreSQL protocol, create separate frontend and backend pairs that target port `4002` or `4003`, respectively.

Validate the configuration before starting HAProxy:

```shell
haproxy -c -f haproxy.cfg
haproxy -f haproxy.cfg
```

## Operational Checklist

Monitor both nodes for availability, replication errors, replication delay, and storage capacity. Also use an end-to-end probe that writes to one node and verifies the result on the peer.

Before using the topology in production, verify that:

- both nodes accept reads and writes;
- changes in either direction reach the peer;
- table creation on either node does not cause ID conflicts;
- traffic switches within the target RTO;
- pending changes catch up after an extended network interruption;
- critical schemas and recent data match before a recovered node receives traffic;
- the application handles connection loss and ambiguous write results safely.

:::tip NOTE

To compare RPO, RTO, and infrastructure requirements across disaster recovery options, see [Solution Comparison](/user-guide/deployments-administration/disaster-recovery/overview.md#solution-comparison).

:::
