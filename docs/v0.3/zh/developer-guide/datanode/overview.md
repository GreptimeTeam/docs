# Datanode

## Introduction

`Datanode` is mainly responsible for storing the actual data for GreptimeDB. `Datanode` itself is a
stand-alone database service. Meanwhile, it could cooperate with `Frontend` and `Metasrv` to form a
distributed database service, as the following picture shows:

![Datanode](/datanode.png)

## Components

A `Datanode` contains many components needed to build up a database system. Here we list most of
these components (some are in progress):

- A gRPC service provides read/write access to the data managed by this node. `Frontend` also uses
  the RPC service to interact with `Datanode`s.
- An HTTP service implements the HTTP protocol of other TSDBs or databases, and for debugging purposes.
- `Meta` client interacts with the `Metasrv` service.
- Handlers contain the actual processing logic for RPC/HTTP requests.
- Catalog manages the metadata of the database objects, such as tables, and views in this node.
- Resource management controls the usage of memory, CPU, and disk.
- Physical planner, optimizer, and executor are for executing queries from the `Frontend`. `Datanode` also
  contains components not shown in the picture, such as logical planner, and logical optimizer, which can
  only be invoked in stand-alone mode.
- Table engine implements the table model based on the storage engine. Note that `Datanode` is
  designed to support multiple table engines, though currently, only one table engine has been
  implemented.
- [Storage engine][1] consists of many sub-components:
  - [WAL][2]
  - Memtable
  - Cache
  - SST
  - ...
- Abstraction layer is for log and object store services. We use the log service to implement
  WAL.

## Details

- [Storage engine][1]
- [Query engine][3]
- [Write-Ahead Logging][2]
- [Data persistence and indexing][4]

[1]: ./storage-engine.md
[2]: ./wal.md
[3]: ./query-engine.md
[4]: ./data-persistence-indexing.md
