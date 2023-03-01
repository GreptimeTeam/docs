# Selector

## Introduction

What is the `Selector`? As its name suggests, it allows users to select specific items from a given `namespace` and `context`. There is a related trait, also named `Selector`, whose definition can be found [below][0].

[0]: https://github.com/GreptimeTeam/greptimedb/blob/develop/src/meta-srv/src/selector.rs

There is a specific scenario in `meta` service. When a request to create a table is sent to the `meta` service, it creates a routing table (the details of table creation will not be described here). The `meta` service needs to select the appropriate `datanode` list when creating a routing table.

## Selector Type

Currently, there are two types of `Selector` available in the `meta` service: `LeasebasedSelector` and `LoadBasedSelector`.

### LeasebasedSelector [not recommended]

`LeasebasedSelector` is just a simple implementation of `Selector`, but **it is not recommended**.

It sorts available `datanode`s according to their lease time, and returns a sorted list of these `datanode`s.

### LoadBasedSelector

`LoadBasedSelector` is another implementation of the `Selector`.

It sorts available `datanode`s according to the load, and returns a sorted list of these `datanode`s.

## Configuration

You can configure the `Selector` when starting the `meta` service, with the default being `LeaseBasedSelector`.

For example:

```shell
cargo run -- metasrv start --selector LoadBased
```

```shell
cargo run -- metasrv start --selector LeaseBased
```
