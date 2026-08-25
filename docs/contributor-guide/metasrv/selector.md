---
keywords: [selector, metasrv, datanode, lease based, load based, round robin]
description: Region placement selectors used by Metasrv and their configuration names.
---

# Selector

## Introduction

When a table is created, Metasrv must choose Datanodes for its Regions. The [`Selector` trait](https://github.com/GreptimeTeam/greptimedb/blob/main/src/meta-srv/src/selector.rs) receives the required number of peers and a selection context, then returns candidate Datanodes from the current lease and statistics data.

## Selector Type

Metasrv provides three selector implementations:

### LeaseBasedSelector

`LeaseBasedSelector` chooses randomly from Datanodes with valid leases. It does not use Region counts to rank candidates.

### LoadBasedSelector

`LoadBasedSelector` treats the number of Regions on a Datanode as its load and prefers nodes with fewer Regions.

### RoundRobinSelector [default]

`RoundRobinSelector` rotates through available Datanodes. It is the default selector.

## Configuration

Set the selector when starting Metasrv. The accepted names are:

- `lease_based` or `LeaseBased`
- `load_based` or `LoadBased`
- `round_robin` or `RoundRobin`

For example:

```shell
cargo run -- metasrv start --selector round_robin
```
