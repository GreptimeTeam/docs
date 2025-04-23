---
keywords: [Datanode, region server, data storage, gRPC service, heartbeat task, region manager]
description: Overview of Datanode in GreptimeDB, its responsibilities, components, and interaction with other parts of the system.
---

# Datanode

## Introduction

`Datanode` is mainly responsible for storing the actual data for GreptimeDB. As we know, in GreptimeDB,
a `table` can have one or more `Region`s, and `Datanode` is responsible for managing the reading and writing
of these `Region`s. `Datanode` is not aware of `table` and can be considered as a `region server`. Therefore,
`Frontend` and `Metasrv` operate `Datanode` at the granularity of `Region`.

![Datanode](/datanode.png)

## Components

A `Datanode` contains all the components needed for a `region server`. Here we list some of the vital parts:

- A gRPC service is provided for reading and writing region data, and `Frontend` uses this service
  to read and write data from `Datanode`s.
- An HTTP service, through which you can obtain metrics, configuration information, etc., of the current node.
- `Heartbeat Task` is used to send heartbeat to the `Metasrv`. The heartbeat plays a crucial role in the
  distributed architecture of GreptimeDB and serves as a basic communication channel for distributed coordination.
  The upstream heartbeat messages contain important information such as the workload of a `Region`. If the
  `Metasrv `has made scheduling(such as `Region` migration) decisions, it will send instructions to the
  `Datanode` via downstream heartbeat messages.
- The `Datanode` does not include components like the `Physical Planner`, `Optimizer`, etc. (these are placed in
  the `Frontend`). The user's query requests for one or more `Table`s will be transformed into `Region` query
  requests in the `Frontend`. The `Datanode` is responsible for handling these `Region` query requests.
- A `Region Manager` is used to manage all `Region`s on a `Datanode`.
- GreptimeDB supports a pluggable multi-engine architecture, with existing engines including `File Engine` and
  `Mito Engine`.
