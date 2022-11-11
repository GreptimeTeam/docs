![meta](../../public/meta.png)

## What's in MetaSrv

- Responsible for storing metadata (Catalog, Schema, Table, Region, etc.)
- Request-Router, so the Frontend knows where the data should be written to and read.
- Load balancing for Datanode, such as who should handle new table creation requests, or more precisely, resource allocation decisions.
- Election & High Availability, GreptimeDB is designed as a Leader-Follower architecture, only Leader nodes can write, Follower nodes can provide read, the number of Follower nodes is usually >= 1, Follower nodes need to be able to switch to Leader quickly when Leader is not available.
- Statistical data collection (reported via Heartbeats on each node), such as CPU, Load, number of Tables on the node, average/peak data read/write size, etc., can be used as the basis for distributed scheduling.

## How the Frontend interacts with MetaSrv

First, the routing table in Request-Router will be roughly the following structure (note that this is only the logical structure, the actual storage structure will vary, for example, endpoints may have dictionary compression).

### Create Table

1. The Frontend sends `CREATE TABLE` requests to MetaSrv.
2. Plan the number of Regions according to the partition rules contained in the request.
3. Check the global view of resources available to Datanodes (collected by Heartbeats) and assign one node  to each region.
4. The Frontend is responsible for creating the table and storing the `Schema` to MetaSrv after successful creation.

### Insert

1. Frontend fetches the routes of the specified table from MetaSrv. Note that the smallest routing unit is the route of the table (several regions), i.e. it contains the addresses of all regions of this table.
2. A best practice is that Frontend first fetches from its own local cache, follows the route request to the Datanode, and if the route is no longer valid then Datanode is obliged to return an `Invalid Route` error, and Frontend re-fetches the latest data from MetaSrv and updates its own cache. Route information does not change frequently, so Frontend uses the Lazy policy to maintain the cache is sufficient.
3. Frontend processes a batch of writes that may contain multiple tables and multiple regions, so Frontend needs to split user requests based on `route table`.

### Select

1. As with `Insert`, Frontend first fetches the route table from the local cache.
2. Unlike `Insert`, for `Select`, Frontend needs to extract the read-only node (follower) from the route table. Then dispatch the request to the leader or follower node depending on the priority.
3. The distributed query engine in Frontend distributes multiple sub-query tasks based on the routing information and aggregates the query results.

## MetaSrv Architecture

![metasrv-architecture](../../public/metasrv-architecture.png)

## Distributed Consensus

As can be seen from the above figure, MetaSrv has a dependency on distributed consensus because:

1. First of all, MetaSrv has to elect a leader, Datanode only sends heartbeats to the leader, and we only use a single meta node to receive heartbeats, which makes it easy to do some calculations or scheduling based on global information accurately and quickly. As for how the Datanode connects to the leader, this is the responsibility of MetaClient (using redirect, Heartbeat requests will be a gRPC stream and using redirect will be less error-prone than forward), which is transparent to the Datanode.
2. Second, MetaSrv must provide an election API for Datanode to elect "write" and "read-only" nodes and help Datanode achieve high availability.
3. Finally, `Metadata`, `Schema` and other data are also stored on MetaSrv, which needs to be highly reliable and strongly consistent, and consensus-based algorithms are a better way to store them.

For the first version of MetaSrv, we chose Etcd as the consensus algorithm  component(MetaSrv was designed consider adapting different implementations and even creating a new wheel ) for the following main reasons:

1. Etcd provides exactly the API we need, `Watch`, `Election`, `KV`, etc., which fits the needs perfectly.
2. We only do two things with distributed consensus, elections (using the `Watch` mechanism) and storing a small amount of metadata, neither of which essentially requires us to customize our own state machine, nor do we need to customize our own state machine based on raft; the small amount of data also does not require multi-raft-group support.
3. The initial version of MetaSrv uses Etcd, which allows us to focus on the capabilities of MetaSrv and not consume extra effort on distributed consensus algorithms, which facilitates better design of the system (avoiding coupling with consensus algorithms) and rapid development in the beginning, and allows easy access to good consensus algorithm implementations in the future through good architectural design.

## Heartbeat Management

The main means of communication between Datanode and MetaSrv is Heartbeat Request/Response Stream, and I even want this to be the only way to communicate, this idea is inspired by the design of [TiKV PD](https://github.com/tikv/pd) and my practical experience in [RheaKV](https://github.com/sofastack/sofa-jraft/tree/master/jraft-rheakv/rheakv-pd). Request sends its state, while MetaSrv sends different types of scheduling instructions via Heartbeat Response.

A heartbeat will probably carry the data listed below, but this is not the final design, and we are still discussing and exploring exactly which data should be collected most.

```
service Heartbeat {
  // Heartbeat, there may be many contents of the heartbeat, such as:
  // 1. Metadata to be registered to meta server and discoverable by other nodes.
  // 2. Some performance metrics, such as Load, CPU usage, etc.
  // 3. The number of computing tasks being executed.
  rpc Heartbeat(stream HeartbeatRequest) returns (stream HeartbeatResponse) {}
}

message HeartbeatRequest {
  RequestHeader header = 1;

  // Self peer
  Peer peer = 2;
  // Leader node
  bool is_leader = 3;
  // Actually reported time interval
  TimeInterval report_interval = 4;
  // Node stat
  NodeStat node_stat = 5;
  // Region stats in this node
  repeated RegionStat region_stats = 6;
  // Follower nodes and stats, empty on follower nodes
  repeated ReplicaStat replica_stats = 7;
}

message NodeStat {
  // The read capacity units during this period
  uint64 rcus = 1;
  // The write capacity units during this period
  uint64 wcus = 2;
  // Table number in this node
  uint64 table_num = 3;
  // Regon number in this node
  uint64 region_num = 4;

  double cpu_usage = 5;
  double load = 6;
  // Read disk I/O in the node
  double read_io_rate = 7;
  // Write disk I/O in the node
  double write_io_rate = 8;

  // Others
  map<string, string> attrs = 100;
}

message RegionStat {
  uint64 region_id = 1;
  TableName table_name = 2;
  // The read capacity units during this period
  uint64 rcus = 3;
  // The write capacity units during this period
  uint64 wcus = 4;
  // Approximate region size
  uint64 approximate_size = 5;
  // Approximate number of rows
  uint64 approximate_rows = 6;

  // Others
  map<string, string> attrs = 100;
}

message ReplicaStat {
  Peer peer = 1;
  bool in_sync = 2;
  bool is_learner = 3;
}
```

## Central Nervous System (CNS)

I envision it as an algorithmic system that relies on real-time and historical heartbeat data from each node to make some smarter scheduling decisions and send them to MetaSrv's Autoadmin unit, which distributes the scheduling decisions, either by the Datanode itself or more likely by the PaaS platform.

## Abstraction of Workloads

The reason why we are discussing the workload abstraction here is that whether the workload abstraction is good or not, determines whether the scheduling strategy generated by MetaSrv such as resource allocation is reasonable or not.

DynamoDB defines RCUs & WCUs (Read Capacity Units / Write Capacity Units), which is explained as: an RCU is a read request of 4KB data, and a WCU is a write request of 1KB data, when using RCUs and WCUs to describe the workload, the measurability of performance is When using RCU and WCU to describe workloads, performance measurability is relatively easier to do and resource preallocation is more informative, because different hardware capabilities can be simply abstracted as a combination of RCU and WCU.

However, GreptimeDB still faces a more complex situation than DynamoDB, especially RCU does not describe GreptimeDB's read workload well, because RCU does not contain read requests that require a lot of computation. We are exploring this part.
