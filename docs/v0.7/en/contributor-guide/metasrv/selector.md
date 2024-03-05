# Selector

## Introduction

What is the `Selector`? As its name suggests, it allows users to select specific items from a given `namespace` and `context`. There is a related trait, also named `Selector`, whose definition can be found [below][0].

[0]: https://github.com/GreptimeTeam/greptimedb/blob/main/src/meta-srv/src/selector.rs

There is a specific scenario in `MetaSrv` service. When a request to create a table is sent to the `MetaSrv` service, it creates a routing table (the details of table creation will not be described here). The `MetaSrv` service needs to select the appropriate `Datanode` list when creating a routing table.

## Selector Type

Currently, there are two types of `Selector` available in the `MetaSrv` service: `LeasebasedSelector` and `LoadBasedSelector`.

### LeasebasedSelector [not recommended]

`LeasebasedSelector` is just a simple implementation of `Selector`, but **it is not recommended**.

It shuffles available `Datanode`s, and returns the list.

### LoadBasedSelector

`LoadBasedSelector` is another implementation of the `Selector`.

It sorts available `Datanode`s according to the load, and returns a sorted list of these `Datanode`s.

## Configuration

You can configure the `Selector` when starting the `MetaSrv` service, with the default being `LoadBasedSelector`.

For example:

```shell
cargo run -- metasrv start --selector load_based
```

```shell
cargo run -- metasrv start --selector lease_based
```
