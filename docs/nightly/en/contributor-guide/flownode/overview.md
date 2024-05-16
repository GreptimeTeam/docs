# Overview

## Introduction


`Flownode` provides a simple streaming process(known as `flow`) ability to the database. 
`Flownode` manages `flows` which are tasks that actively receive data from the `source` and send data to the `sink`.

In current version, `Flownode` only supports standalone mode. In the future, we will support distributed mode.

## Components

A `Flownode` contains all the components needed for the streaming process of a flow. Here we list the vital parts:

- A `FlownodeManager` for receiving inserts forwarded from the `Frontend` and sending back results for the flow's sink table.
- A certain number of `FlowWorker` instances, each running in a separate thread. Currently for standalone mode, there is only one flow worker, but this may change in the future.
- A `Flow` is a task that actively receives data from the `source` and sends data to the `sink`. It is managed by the `FlownodeManager` and run by a `FlowWorker`.