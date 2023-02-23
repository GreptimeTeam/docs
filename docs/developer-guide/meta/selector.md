# Selector

## Introduction

What is the `Selector`? As the name suggests, it is a selector that selects some from the specified `namespace` and `context`. There is a related trait also named `Selector`. And the definition is [here][0].

[0]: https://github.com/GreptimeTeam/greptimedb/blob/develop/src/meta-srv/src/selector.rs

There is a typical usage scenario in meta. When a create table request is sent to meta, meta will create a routing table. (Here we do not describe the detail of creating tables)  When creating a routing table, it needs to select the appropriate `datanode` list.

## Selector Type

Currently there are two `Selector`s in meta, including `LeasebasedSelector` and `LoadBasedSelector`.

### LeasebasedSelector [not recommended]

`LeasebasedSelector` is just a simple implementation of `Selector` and **is not recommended**.

It sorts alive `datanode`s according to its lease time, and return the sorted `datanode` list.

### LoadBasedSelector

`LoadBasedSelector` is another implementation of `Selector`.

It sorts alive `datanode`s according to the load, and return the sorted `datanode` list.

## Configuration

You can configure `Selector` when starting meta. Default: `LeaseBasedSelector`.

For example:

```shell
cargo run -- metasrv start --selector LoadBased
```

```shell
cargo run -- metasrv start --selector LeaseBased
```
