---
keywords: [Go SDK, 数据写入, 安装 SDK, 连接数据库, 插入数据, 调试日志, 并发安全]
description: 介绍如何使用 GreptimeDB 提供的 Go Ingest SDK 写入数据，包括安装、连接、插入数据和调试日志等内容。
---

# Go

GreptimeDB 提供了用于高吞吐量数据写入的 ingester 库。
它使用 gRPC 协议，支持自动生成表结构，无需在写入数据前创建表。
更多信息请参考 [自动生成表结构](/user-guide/ingest-data/overview.md#自动生成表结构)。

GreptimeDB 提供的 Go Ingest SDK 是一个轻量级、并发安全的库，使用起来非常简单。

## 快速开始 Demo

你可以通过 [快速开始 Demo](https://github.com/GreptimeTeam/greptimedb-ingester-go/tree/main/examples) 来了解如何使用 GreptimeDB Go SDK。

## 安装

使用下方的命令安装 Go Ingest SDK：

```shell
go get -u github.com/GreptimeTeam/greptimedb-ingester-go@VAR::goSdkVersion
```

引入到代码中：

```go
import (
    greptime "github.com/GreptimeTeam/greptimedb-ingester-go"
    ingesterContext "github.com/GreptimeTeam/greptimedb-ingester-go/context"
    "github.com/GreptimeTeam/greptimedb-ingester-go/table"
    "github.com/GreptimeTeam/greptimedb-ingester-go/table/types"
)
```

## 连接数据库

如果你在启动 GreptimeDB 时设置了 [`--user-provider`](/user-guide/deployments-administration/authentication/overview.md)，
则需要提供用户名和密码才能连接到 GreptimeDB。
以下示例显示了使用 SDK 连接到 GreptimeDB 时如何设置用户名和密码。

```go
cfg := greptime.NewConfig("127.0.0.1").
    // 将数据库名称更改为你的数据库名称
    WithDatabase("public").
    // 默认端口 4001
    // WithPort(4001).
    // 如果服务配置了 TLS，设置 TLS 选项来启用安全连接
    // WithInsecure(false).
    // 设置鉴权信息
    // 如果数据库不需要鉴权，移除 WithAuth 方法即可
    WithAuth("username", "password")

cli, _ := greptime.NewClient(cfg)
defer cli.Close()
```

## 数据模型

表中的每条行数据包含三种类型的列：`Tag`、`Timestamp` 和 `Field`。更多信息请参考 [数据模型](/user-guide/concepts/data-model.md)。
列值的类型可以是 `String`、`Float`、`Int`、`JSON`, `Timestamp` 等。更多信息请参考 [数据类型](/reference/sql/data-types.md)。

## 设置表选项

虽然在通过 SDK 向 GreptimeDB 写入数据时会自动创建时间序列表，但你仍然可以配置表选项。
SDK 支持以下表选项：

- `auto_create_table`：默认值为 `True`。如果设置为 `False`，则表示表已经存在且不需要自动创建，这可以提高写入性能。
- `ttl`、`append_mode`、`merge_mode`：更多详情请参考[表选项](/reference/sql/create.md#table-options)。

你可以使用 `ingesterContext` 设置表选项。
例如设置 `ttl` 选项：

```go
hints := []*ingesterContext.Hint{
    {
        Key:   "ttl",
        Value: "3d",
    },
}

ctx, cancel := context.WithTimeout(context.Background(), time.Second*3)
ctx = ingesterContext.New(ctx, ingesterContext.WithHint(hints))
// 使用 ingesterContext 写入数据到 GreptimeDB 
// `data` 对象在之后的章节中描述
resp, err := cli.Write(ctx, data)
if err != nil {
    return err
}
```

关于如何向 GreptimeDB 写入数据，请参考以下各节。

## 低级 API

GreptimeDB 的低级 API 通过向具有预定义模式的 `table` 对象添加 `row` 来写入数据。

### 创建行数据

以下代码片段首先构建了一个名为 `cpu_metric` 的表，其中包括 `host`、`cpu_user`、`cpu_sys` 和 `ts` 列。
随后，它向表中插入了一行数据。

该表包含三种类型的列：

- `Tag`：`host` 列，值类型为 `String`。
- `Field`：`cpu_user` 和 `cpu_sys` 列，值类型为 `Float`。
- `Timestamp`：`ts` 列，值类型为 `Timestamp`。

```go
// 为 CPU 指标构建表结构
cpuMetric, err := table.New("cpu_metric")
if err != nil {
    // 处理错误
}

// 添加一个 'Tag' 列，用于主机标识符
cpuMetric.AddTagColumn("host", types.STRING)
// 添加一个 'Timestamp' 列，用于记录数据收集的时间
cpuMetric.AddTimestampColumn("ts", types.TIMESTAMP_MILLISECOND)
// 添加 'Field' 列，用于测量用户和系统 CPU 使用率
cpuMetric.AddFieldColumn("cpu_user", types.FLOAT)
cpuMetric.AddFieldColumn("cpu_sys", types.FLOAT)

// 插入示例数据
// 注意：参数必须按照定义的表结构中的列的顺序排列：host, ts, cpu_user, cpu_sys
err = cpuMetric.AddRow("127.0.0.1", time.Now(), 0.1, 0.12)
err = cpuMetric.AddRow("127.0.0.1", time.Now(), 0.11, 0.13)
if err != nil {
    // 处理错误
}

```

为了提高写入数据的效率，你可以一次创建多行数据以便写入到 GreptimeDB。

```go
cpuMetric, err := table.New("cpu_metric")
if err != nil {
    // 处理错误
}
cpuMetric.AddTagColumn("host", types.STRING)
cpuMetric.AddTimestampColumn("ts", types.TIMESTAMP_MILLISECOND)
cpuMetric.AddFieldColumn("cpu_user", types.FLOAT)
cpuMetric.AddFieldColumn("cpu_sys", types.FLOAT)
err = cpuMetric.AddRow("127.0.0.1", time.Now(), 0.1, 0.12)
if err != nil {
    // 处理错误
}

memMetric, err := table.New("mem_metric")
if err != nil {
    // 处理错误
}
memMetric.AddTagColumn("host", types.STRING)
memMetric.AddTimestampColumn("ts", types.TIMESTAMP_MILLISECOND)
memMetric.AddFieldColumn("mem_usage", types.FLOAT)
err = memMetric.AddRow("127.0.0.1", time.Now(), 112)
if err != nil {
    // 处理错误
}
```

### 插入数据

下方示例展示了如何向 GreptimeDB 的表中插入行数据。

```go
resp, err := cli.Write(context.Background(), cpuMetric, memMetric)
if err != nil {
    // 处理错误
}
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```

### 流式插入

当你需要插入大量数据时，例如导入历史数据，流式插入是非常有用的。

```go
err := cli.StreamWrite(context.Background(), cpuMetric, memMetric)
if err != nil {
    // 处理错误
}
```

在所有数据写入完毕后关闭流式写入。
一般情况下，连续写入数据时不需要关闭流式写入。

```go
affected, err := cli.CloseStream(ctx)
```

## 高级 API

SDK 的高级 API 使用 ORM 风格的对象写入数据，
它允许你以更面向对象的方式创建、插入和更新数据，为开发者提供了更友好的体验。
然而，高级 API 不如低级 API 高效。
这是因为 ORM 风格的对象在转换对象时可能会消耗更多的资源和时间。

### 创建行数据

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

### 插入数据


```go
resp, err := cli.WriteObject(context.Background(), cpuMetrics)
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```

### 流式插入

当你需要插入大量数据时，例如导入历史数据，流式插入是非常有用的。

```go
err := streamClient.StreamWriteObject(context.Background(), cpuMetrics, memMetrics)
```

在所有数据写入完毕后关闭流式写入。
一般情况下，连续写入数据时不需要关闭流式写入。

```go
affected, err := cli.CloseStream(ctx)
```

## 插入 JSON 类型的数据

GreptimeDB 支持使用 [JSON 类型数据](/reference/sql/data-types.md#json-类型) 存储复杂的数据结构。
使用此 ingester 库，你可以通过字符串值插入 JSON 数据。
假如你有一个名为 `sensor_readings` 的表，并希望添加一个名为 `attributes` 的 JSON 列，
请参考以下代码片段。

在 [低级 API](#低级-api) 中，
你可以使用 `AddFieldColumn` 方法将列类型指定为 `types.JSON` 来添加 JSON 列。
然后使用 `struct` 或 `map` 插入 JSON 数据。

```go
sensorReadings, err := table.New("sensor_readings")
// 此处省略了创建其他列的代码
// ...
// 将列类型指定为 JSON
sensorReadings.AddFieldColumn("attributes", types.JSON)

// 使用 struct 插入 JSON 数据
type Attributes struct {
    Location string `json:"location"`
    Action   string `json:"action"`
}
attributes := Attributes{ Location: "factory-1" }
sensorReadings.AddRow(<other-column-values>... , attributes)

// 以下省略了写入数据的代码
// ...
```

在 [高级 API](#高级-api) 中，你可以使用 `greptime:"field;column:details;type:json"` 标签将列类型指定为 JSON。

```go
type SensorReadings struct {
    // 此处省略了创建其他列的代码
    // ...
    // 将列类型指定为 JSON
    Attributes string `greptime:"field;column:details;type:json"`
    // ...
}

// 使用 struct 插入 JSON 数据
type Attributes struct {
    Location string `json:"location"`
    Action   string `json:"action"`
}
attributes := Attributes{ Action: "running" }
sensor := SensorReadings{
    // ...
    Attributes: attributes,
}

// 以下省略了写入数据的代码
// ...
```

请参考 SDK 仓库中的 [示例](https://github.com/GreptimeTeam/greptimedb-ingester-go/tree/main/examples/jsondata) 获取插入 JSON 数据的可执行代码。

## Ingester 库参考

- [API 文档](https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-ingester-go)


