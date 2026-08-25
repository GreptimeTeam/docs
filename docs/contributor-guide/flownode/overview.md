---
keywords: [continuous aggregation, flow management, standalone mode, Flownode components, Flownode limitations]
description: Overview of Flownode, a component providing Flow computation capabilities to the database, including batching mode, deprecated streaming mode, and core components.
---

# Flownode

## Introduction


`Flownode` provides Flow computation capabilities to the database.
`Flownode` manages `flows` which are tasks that receive data from the `source` and send data to the `sink`.

`Flownode` support both `standalone` and `distributed` mode. In `standalone` mode, `Flownode` runs in the same process as the database. In `distributed` mode, `Flownode` runs in a separate process and communicates with the database through the network.

There are two execution modes for a flow:
- **Batching Mode**: The active mode for continuous data aggregation. It periodically executes a user-defined SQL query over small, discrete time windows. Aggregation and TQL queries use this mode. For more details, see the [Batching Mode Developer Guide](./batching_mode.md).
- **Streaming Mode (deprecated)**: The original mode where data is processed as it arrives. It is kept for legacy compatibility and is not recommended for new workloads.

## Components

A `Flownode` contains all the components needed to execute a flow. The specific components involved depend on the execution mode. At a high level, the key parts are:

- **Flow Manager**: A central component responsible for managing the lifecycle of all flows.
- **Task Executor**: The runtime environment where the flow logic is executed. In batching mode, this is a `BatchingTask`; in the deprecated streaming mode, this is typically a `FlowWorker`.
- **Flow Task**: Represents a single, independent data flow, containing the logic for transforming data from a source to a sink.
