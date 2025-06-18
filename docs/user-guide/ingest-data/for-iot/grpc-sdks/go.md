---
keywords: [Go SDK, gRPC, data ingestion, installation, connection, low-level API, high-level API]
description: Guide on using the Go ingester SDK for GreptimeDB, including installation, connection, data model, and examples of low-level and high-level APIs.
---

import DocTemplate from './template.md' 

# Go

<DocTemplate>

<div id="ingester-lib-introduction">
## Introduction
The Go ingester SDK provided by GreptimeDB is a lightweight,
concurrent-safe library that is easy to use with the metric struct.
</div>

<div id="quick-start-demos">
## Quick start demos
To quickly get started, you can explore the [quick start demos](https://github.com/GreptimeTeam/greptimedb-ingester-go/tree/main/examples) to understand how to use the GreptimeDB Go ingester SDK.
</div>

<div id="ingester-lib-installation">
## Installation
Use the following command to install the GreptimeDB client library for Go:

```shell
go get -u github.com/GreptimeTeam/greptimedb-ingester-go@VAR::goSdkVersion
```

Import the library in your code:

```go
import (
    greptime "github.com/GreptimeTeam/greptimedb-ingester-go"
    ingesterContext "github.com/GreptimeTeam/greptimedb-ingester-go/context"
    "github.com/GreptimeTeam/greptimedb-ingester-go/table"
    "github.com/GreptimeTeam/greptimedb-ingester-go/table/types"
)
```
</div>

<div id="ingester-lib-connect">
## Connect to database
```go
cfg := greptime.NewConfig("127.0.0.1").
    // change the database name to your database name
    WithDatabase("public").
    // Default port 4001
    // WithPort(4001).
    // Enable secure connection if your server is secured by TLS
    // WithInsecure(false).
    // set authentication information
    // If the database doesn't require authentication, just remove the WithAuth method
    WithAuth("username", "password")

cli, _ := greptime.NewClient(cfg)
```
</div>

<div id="set-table-options">
## Set table options
You can set table options using the `ingesterContext` context.
For example, to set the `ttl` option, use the following code:

```go
hints := []*ingesterContext.Hint{
    {
        Key:   "ttl",
        Value: "3d",
    },
}

ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
ctx = ingesterContext.New(ctx, ingesterContext.WithHint(hints))
// Use the ingesterContext when writing data to GreptimeDB.
// The `data` object is described in the following sections.
resp, err := c.client.Write(ctx, data)
if err != nil {
    return err
}
```
</div>

<div id="low-level-object">
## Low-level API
### Create row objects
```go
// Construct the table schema for CPU metrics
cpuMetric, err := table.New("cpu_metric")
if err != nil {
    // Handle error appropriately
}

// Add a 'Tag' column for host identifiers
cpuMetric.AddTagColumn("host", types.STRING)
// Add a 'Timestamp' column for recording the time of data collection
cpuMetric.AddTimestampColumn("ts", types.TIMESTAMP_MILLISECOND)
// Add 'Field' columns for user and system CPU usage measurements
cpuMetric.AddFieldColumn("cpu_user", types.FLOAT)
cpuMetric.AddFieldColumn("cpu_sys", types.FLOAT)

// Insert example data
// NOTE: The arguments must be in the same order as the columns in the defined schema: host, ts, cpu_user, cpu_sys
err = cpuMetric.AddRow("127.0.0.1", time.Now(), 0.1, 0.12)
err = cpuMetric.AddRow("127.0.0.1", time.Now(), 0.11, 0.13)
if err != nil {
    // Handle error appropriately
}

```
</div>

<div id="create-rows">
### Create multiple rows
```go
cpuMetric, err := table.New("cpu_metric")
if err != nil {
    // Handle error appropriately
}
cpuMetric.AddTagColumn("host", types.STRING)
cpuMetric.AddTimestampColumn("ts", types.TIMESTAMP_MILLISECOND)
cpuMetric.AddFieldColumn("cpu_user", types.FLOAT)
cpuMetric.AddFieldColumn("cpu_sys", types.FLOAT)
err = cpuMetric.AddRow("127.0.0.1", time.Now(), 0.1, 0.12)
if err != nil {
    // Handle error appropriately
}

memMetric, err := table.New("mem_metric")
if err != nil {
    // Handle error appropriately
}
memMetric.AddTagColumn("host", types.STRING)
memMetric.AddTimestampColumn("ts", types.TIMESTAMP_MILLISECOND)
memMetric.AddFieldColumn("mem_usage", types.FLOAT)
err = memMetric.AddRow("127.0.0.1", time.Now(), 112)
if err != nil {
    // Handle error appropriately
}
```
</div>

<div id="insert-rows">
### Insert data
```go
resp, err := cli.Write(ctx, cpuMetric, memMetric)
if err != nil {
    // Handle error appropriately
}
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```
</div>

<div id="streaming-insert">
### Streaming insert
```go
err := cli.StreamWrite(ctx, cpuMetric, memMetric)
if err != nil {
    // Handle error appropriately
}
```
Close the stream writing after all data has been written.
In general, you do not need to close the stream writing when continuously writing data.

```go
affected, err := cli.CloseStream(ctx)
```
</div>

<div id="high-level-style-object">
## High-level API
### Create row objects
```go
type CpuMetric struct {
    Host            string    `greptime:"tag;column:host;type:string"`
    CpuUser         float64   `greptime:"field;column:cpu_user;type:float64"`
    CpuSys          float64   `greptime:"field;column:cpu_sys;type:float64"`
    Ts              time.Time `greptime:"timestamp;column:ts;type:timestamp;precision:millisecond"`
}

func (CpuMetric) TableName() string {
	return "cpu_metric"
}

cpuMetrics := []CpuMetric{
    {
        Host:        "127.0.0.1",
        CpuUser:     0.10,
        CpuSys:      0.12,
        Ts:          time.Now(),
    }
}
```

<!-- SDK TODO -->
<!-- ```go
type MemMetric struct {
    Host        string    `greptime:"tag;column:host;type:string"`
	Memory      float64   `greptime:"field;column:mem_usage;type:float64"`
	Ts          time.Time `greptime:"timestamp;column:ts;type:timestamp;precision:millisecond"`
}

func (MemoryMetric) TableName() string {
	return "mem_metric"
}

memMetrics := []MemMetric{
    {
        Host:        "127.0.0.1",
        Memory:      112,
        Ts:          time.Now(),
    }
}
``` -->

</div>

<div id="high-level-style-insert-data">
### Insert data
```go
resp, err := cli.WriteObject(ctx, cpuMetrics)
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```
</div>

<div id="high-level-style-streaming-insert">
### Streaming insert
```go
err := cli.StreamWriteObject(ctx, cpuMetrics)
```
Close the stream writing after all data has been written.
In general, you do not need to close the stream writing when continuously writing data.

```go
affected, err := cli.CloseStream(ctx)
```
</div>

<div id="ingester-json-type">
## Insert data in JSON type
In the [low-level API](#low-level-api),
you can specify the column type as `types.JSON` using the `AddFieldColumn` method to add a JSON column.
Then, use a `struct` or `map` to insert JSON data.

```go
sensorReadings, err := table.New("sensor_readings")
// The code for creating other columns is omitted
// ...
// specify the column type as JSON
sensorReadings.AddFieldColumn("attributes", types.JSON)

// Use struct to insert JSON data
type Attributes struct {
    Location string `json:"location"`
    Action   string `json:"action"`
}
attributes := Attributes{ Location: "factory-1" }
sensorReadings.AddRow(<other-column-values>... , attributes)

// The following code for writing data is omitted
// ...
```

In the [high-level API](#high-level-api), you can specify the column type as JSON using the `greptime:"field;column:details;type:json"` tag.

```go
type SensorReadings struct {
    // The code for creating other columns is omitted
    // ...
    // specify the column type as JSON
    Attributes string `greptime:"field;column:details;type:json"`
    // ...
}

// Use struct to insert JSON data
type Attributes struct {
    Location string `json:"location"`
    Action   string `json:"action"`
}
attributes := Attributes{ Action: "running" }
sensor := SensorReadings{
    // ...
    Attributes: attributes,
}

// The following code for writing data is omitted
// ...
```

For the executable code for inserting JSON data, please refer to the [example](https://github.com/GreptimeTeam/greptimedb-ingester-go/tree/main/examples/jsondata) in the SDK repository.
</div>

<div id="ingester-lib-debug-logs">
## Debug logs
</div>

<div id="ingester-lib-reference">
## Ingester library reference
- [API Documentation](https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-ingester-go)
</div>

<div id="faq">
## FAQ
</div>

</DocTemplate>
