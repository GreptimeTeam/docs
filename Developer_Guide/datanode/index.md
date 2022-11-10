# Datanode

## Introduction

`Datanode` is mainly responsible for storing the actual data for GreptimeDB. `Datanode` itself is a
nstand-alone database service. Meanwhile, it could cooperate with `Frontend` and `Meta` to form a
distributed database service, as the following picture shows:

![Datanode](../../public/datanode.pnd)

## Components

A `Datanode` contains many components needed to build up a database system. Here we list most of
these components, though some may not be implemented yet:

- A gRPC service provides read/write access to the data managed by this node. `Frontend` also uses
the RPC service to interact with `Datanode`s.
- A HTTP service implements HTTP protocol of other TSDBs or databases, and for debugging purposes.
- `Meta` client interacts with the `Meta` service.
- Handlers contain the actual processing logics for RPC/HTTP requests.
- Catalog manages the metadata of the database objects such as tables, views in this node.
- Resource manage controls the usage of memory, CPU, disk.
- Physical planner, optimizer, executor for executing queries from `Frontend`. `Datanode` also
contains components not shown in the picture, such as logical planner, logical optimizer, which can
only be invoked in stand-alone mode.
- Table engine implements the table model based on the storage engine. Note that `Datanode` is
designed to support multiple table engines, though currently only one table engine has been
implemented.
- [Storage engine][1] consists of many sub-components:
  - [WAL][2]
  - Memtable
  - Cache
  - SST
  - ...
- Abstraction layer for log service and object store service. We use the log service to implement
WAL.

## Details

- [Storage engine][1]
- [Query engine][3]
- [Write-Ahead Logging][2]
- [Data persistence and indexing][4]

[1]: </storage_engine.md>
[2]: </wal.md>
[3]: </query_engine.md>
[4]: </data_persisitence_indexing.md>
