---
keywords: [selector, metasrv, datanode, leasebased, loadbased, roundrobin]
description: Describes the different types of selectors in the Metasrv service, their characteristics, and how to configure them.
---

# Selector

## Introduction

What is the `Selector`? As its name suggests, it allows users to select specific items from a given `namespace` and `context`. There is a related trait, also named `Selector`, whose definition can be found [below][0].

[0]: https://github.com/GreptimeTeam/greptimedb/blob/main/src/meta-srv/src/selector.rs

There is a specific scenario in `Metasrv` service. When a request to create a table is sent to the `Metasrv` service, it creates a routing table (the details of table creation will not be described here). The `Metasrv` service needs to select the appropriate `Datanode` list when creating a routing table.

## Selector Type

The `Metasrv` service currently offers the following types of `Selectors`:

### LeasebasedSelector

`LeasebasedSelector` randomly selects from all available (in lease) `Datanode`s, its characteristic is simplicity and fast.

### LoadBasedSelector

The `LoadBasedSelector` load value is determined by the number of regions on each `Datanode`, fewer regions indicate lower load, and `LoadBasedSelector` prioritizes selecting low-load `Datanodes`.

### RoundRobinSelector [default]
`RoundRobinSelector` selects `Datanode`s in a round-robin fashion. It is recommended and the default option in most cases. If you're unsure which to choose, it's usually the right choice.

## Configuration

You can configure the `Selector` by its name when starting the `Metasrv` service.

- LeasebasedSelector: `lease_based` or `LeaseBased`
- LoadBasedSelector: `load_based` or `LoadBased`
- RoundRobinSelector: `round_robin` or `RoundRobin`

For example:

```shell
cargo run -- metasrv start --selector round_robin
```

```shell
cargo run -- metasrv start --selector RoundRobin
```
