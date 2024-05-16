# Overview

## Introduction


`Flownode` provide simple streaming process(known as `flow`) ability to the database. 
`Flownode` manage `flows` which are tasks that actively receive data from the `source` and send data to the `sink`.

In current version, `Flownode` only support standalone mode. In the future, we will support distributed mode.

## Components

A `Flownode` contains all the components needed for flow's streaming process, here we list vital parts:

- A `FlownodeManager` for receiving inserts being forward from `Frontend` and send back results for flow's sink table
- Certain number of `FlowWorker` each running in a separate thread, currently for standalone the number of flow worker is one, but prone to change in the future
- A `Flow` is a task that actively receive data from the `source` and send data to the `sink`, it is managed by `FlownodeManager` and run by `FlowWorker`.