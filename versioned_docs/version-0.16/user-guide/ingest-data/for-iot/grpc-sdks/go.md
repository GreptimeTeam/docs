---
keywords: [Go SDK, gRPC, data ingestion, installation, connection, low-level API, high-level API]
description: Guide on using the Go ingester SDK for GreptimeDB, including installation, connection, data model, and examples of low-level and high-level APIs.
---

# Go

GreptimeDB offers ingester libraries for high-throughput data writing.
It utilizes the gRPC protocol,
which supports schemaless writing and eliminates the need to create tables before writing data.
For more information, refer to [Automatic Schema Generation](/user-guide/ingest-data/overview.md#automatic-schema-generation).

The Go ingester SDK provided by GreptimeDB is a lightweight,
concurrent-safe library that is easy to use with the metric struct.

## Quick start demos

To quickly get started, you can explore the [quick start demos](https://github.com/GreptimeTeam/greptimedb-ingester-go/tree/main/examples) to understand how to use the GreptimeDB Go ingester SDK.

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

## Connect to database

If you have set the [`--user-provider` configuration](/user-guide/deployments-administration/authentication/overview.md) when starting GreptimeDB,
you will need to provide a username and password to connect to GreptimeDB.
The following example shows how to set the username and password when using the library to connect to GreptimeDB.

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
defer cli.Close()
```

## Data model

Each row item in a table consists of three types of columns: `Tag`, `Timestamp`, and `Field`. For more information, see [Data Model](/user-guide/concepts/data-model.md).
The types of column values could be `String`, `Float`, `Int`, `Timestamp`, `JSON` etc. For more information, see [Data Types](/reference/sql/data-types.md).

## Set table options

Although the time series table is created automatically when writing data to GreptimeDB via the SDK,
you can still configure table options.
The SDK supports the following table options:

- `auto_create_table`: Default is `True`. If set to `False`, it indicates that the table already exists and does not need automatic creation, which can improve write performance.
- `ttl`, `append_mode`, `merge_mode`: For more details, refer to the [table options](/reference/sql/create.md#table-options).

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
resp, err := cli.Write(ctx, data)
if err != nil {
    return err
}
```

For how to write data to GreptimeDB, see the following sections.

## Low-level API

The GreptimeDB low-level API provides a straightforward method to write data to GreptimeDB 
by adding rows to the table object with a predefined schema.

### Create row objects

This following code snippet begins by constructing a table named `cpu_metric`,
which includes columns `host`, `cpu_user`, `cpu_sys`, and `ts`. 
Subsequently, it inserts a single row into the table.

The table consists of three types of columns:

- `Tag`: The `host` column, with values of type `String`.
- `Field`: The `cpu_user` and `cpu_sys` columns, with values of type `Float`.
- `Timestamp`: The `ts` column, with values of type `Timestamp`.

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

To improve the efficiency of writing data, you can create multiple rows at once to write to GreptimeDB.

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

### Insert data

The following example shows how to insert rows to tables in GreptimeDB.

```go
resp, err := cli.Write(ctx, cpuMetric, memMetric)
if err != nil {
    // Handle error appropriately
}
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```

### Streaming insert

Streaming insert is useful when you want to insert a large amount of data such as importing historical data.

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

## High-level API

The high-level API uses an ORM style object to write data to GreptimeDB.
It allows you to create, insert, and update data in a more object-oriented way,
providing developers with a friendlier experience.
However, it is not as efficient as the low-level API.
This is because the ORM style object may consume more resources and time when converting the objects.

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

### Insert data

```go
resp, err := cli.WriteObject(ctx, cpuMetrics)
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```

### Streaming insert

Streaming insert is useful when you want to insert a large amount of data such as importing historical data.

```go
err := cli.StreamWriteObject(ctx, cpuMetrics)
```

Close the stream writing after all data has been written.
In general, you do not need to close the stream writing when continuously writing data.

```go
affected, err := cli.CloseStream(ctx)
```

## Insert data in JSON type

GreptimeDB supports storing complex data structures using [JSON type data](/reference/sql/data-types.md#json-type).
With this ingester library, you can insert JSON data using string values.
For instance, if you have a table named `sensor_readings` and wish to add a JSON column named `attributes`,
refer to the following code snippet.

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


## Ingester library reference

- [API Documentation](https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-ingester-go)

