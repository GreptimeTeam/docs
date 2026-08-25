---
keywords: [selector, metasrv, datanode, leasebased, loadbased, roundrobin]
description: Describes the different types of selectors in the Metasrv service, their characteristics, and how to configure them.
---

# Selector

## Introduction

When a table is created, Metasrv uses a `Selector` to choose Datanodes for its Regions. Selection uses the current node leases and, depending on the selector, Region statistics.

## Selector Type

The `Metasrv` service currently offers the following types of `Selectors`:

### LeaseBasedSelector

`LeaseBasedSelector` randomly selects from Datanodes with valid leases.

### LoadBasedSelector

The `LoadBasedSelector` load value is determined by the number of regions on each `Datanode`, fewer regions indicate lower load, and `LoadBasedSelector` prioritizes selecting low-load `Datanodes`.

### RoundRobinSelector [default]
`RoundRobinSelector` selects `Datanode`s in a round-robin fashion. It is the default and recommended choice for most deployments.

## Configuration

You can configure the `Selector` by its name when starting the `Metasrv` service.

- LeaseBasedSelector: `lease_based` or `LeaseBased`
- LoadBasedSelector: `load_based` or `LoadBased`
- RoundRobinSelector: `round_robin` or `RoundRobin`

For example:

```shell
cargo run -- metasrv start --selector round_robin
```

```shell
cargo run -- metasrv start --selector RoundRobin
```
