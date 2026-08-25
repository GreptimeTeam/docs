---
keywords: [Flownode, continuous aggregation, batching mode, streaming mode, Flow]
description: Flownode's execution modes, routing boundary, and implementation layout.
---

# Flownode

## Introduction

Flownode is the execution component behind GreptimeDB Flow, which maintains continuously computed results from source tables in a sink table. It runs in-process in standalone mode and as a separate service in distributed mode.

Flownode has two execution paths:

- **Batching mode** is the actively developed path. It tracks affected time windows and periodically runs an aggregation query through Frontend. See the [batching mode guide](./batching_mode.md).
- **Streaming mode** is the legacy incremental-dataflow path. It processes row-level changes through worker-owned compute graphs and remains for compatibility.

Users do not select an execution mode directly. `flow_type` is reserved internal metadata. `StatementExecutor::determine_flow_type` in `src/operator/src/statement/ddl.rs` chooses the mode when a Flow is created, and `FlowDualEngine` handles compatibility routing inside Flownode.

## Components

- `FlowEngine` in `src/flow/src/engine.rs` defines the create, remove, flush, and insert lifecycle shared by both paths.
- `FlowDualEngine` in `src/flow/src/adapter/flownode_impl.rs` routes each Flow to the batching or streaming engine.
- `src/flow/src/batching_mode/` contains time-window tracking, task scheduling, Frontend RPC, sink-table creation, and checkpoint logic.
- `src/flow/src/adapter/`, `compute/`, `expr/`, and `plan.rs` implement the legacy streaming path.
- `src/flow/src/server.rs` exposes the Flownode gRPC service; `heartbeat.rs` reports Flownode state to Metasrv.
- Persisted Flow metadata and DDL procedures live in `src/common/meta/`, not in the `flow` crate.

Mode-specific changes must be reviewed against `FlowDualEngine` and the shared metadata contract. Do not assume that a fix in one execution path applies to the other.
