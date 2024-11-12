import DocTemplate from './template.md' 

# Go

<DocTemplate>

<div id="ingester-lib-introduction">

GreptimeDB 提供的 Go Ingest SDK 是一个轻量级、并发安全的库，使用起来非常简单。

</div>

<div id="quick-start-demos">

你可以通过[快速开始 Demo](https://github.com/GreptimeTeam/greptimedb-ingester-go/tree/main/examples) 来了解如何使用 GreptimeDB Go SDK。

</div>

<div id="ingester-lib-installation">

使用下方的命令安装 Go Ingest SDK：

```shell
go get -u github.com/GreptimeTeam/greptimedb-ingester-go@VAR::goSdkVersion
```

引入到代码中：

```go
import (
    greptime "github.com/GreptimeTeam/greptimedb-ingester-go"
    "github.com/GreptimeTeam/greptimedb-ingester-go/table"
    "github.com/GreptimeTeam/greptimedb-ingester-go/table/types"
)
```

</div>

<div id="ingester-lib-connect">

```go
cfg := greptime.NewConfig("127.0.0.1").
    // 将数据库名称更改为你的数据库名称
    WithDatabase("public").
    // 默认端口 4001
    // WithPort(4001).
    // 如果服务配置了 TLS ，设置 TLS 选项来启用安全连接
    // WithInsecure(false).
    // 设置鉴权信息
    // 如果数据库不需要鉴权，移除 WithAuth 方法即可
    WithAuth("username", "password")

cli, _ := greptime.NewClient(cfg)
```
</div>

<div id="low-level-object">

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

</div>

<div id="create-rows">

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

</div>

<div id="insert-rows">

```go
resp, err := cli.Write(context.Background(), cpuMetric, memMetric)
if err != nil {
    // 处理错误
}
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```

</div>

<div id="streaming-insert">

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

</div>

<div id="high-level-style-object">

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

</div>

<div id="high-level-style-insert-data">

```go
resp, err := cli.WriteObject(context.Background(), cpuMetrics)
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```

</div>

<div id="high-level-style-streaming-insert">

```go
err := streamClient.StreamWriteObject(context.Background(), cpuMetrics, memMetrics)
```

在所有数据写入完毕后关闭流式写入。
一般情况下，连续写入数据时不需要关闭流式写入。

```go
affected, err := cli.CloseStream(ctx)
```

</div>

<div id="ingester-json-type">

在[低层级 API](#低层级-api) 中，
你可以使用 `AddFieldColumn` 方法将列类型指定为 `types.JSON` 来添加 JSON 列。
然后将 JSON 数据作为字符串值插入。

```go
sensorReadings, err := table.New("sensor_readings")
// 此处省略了创建其他列的代码
// ...
// 将列类型指定为 JSON
sensorReadings.AddFieldColumn("attributes", types.JSON)

// 使用字符串值插入 JSON 数据
type Attributes struct {
    Location string `json:"location"`,
    Action string `json:"action"`,
}
attributes := Attributes{ Location: "factory-1" }
jsonData, err := json.Marshal(attributes)
sensorReadings.AddRow(<other-column-values>... , string(jsonData))

// 写入数据
// ...
```

在[高层级 API](#高层级-api) 中，你可以使用 `greptime:"field;column:details;type:json"` 标签将列类型指定为 JSON。

```go
type SensorReadings struct {
    // 此处省略了创建其他列的代码
    // ...
    // 将列类型指定为 JSON
    Attributes string `greptime:"field;column:details;type:json"`
    // ...
}

type Attributes struct {
    Location string `json:"location"`,
    Action string `json:"action"`,
}
attributes := Attributes{ Action: "running" }
jsonData, err := json.Marshal(attributes)
sensor := SensorReadings{
    // ...
    // 使用字符串值插入 JSON 数据
    Attributes: string(jsonData),
}

// 写入数据
// ...
```

</div>

<div id="ingester-lib-reference">

- [API 文档](https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-ingester-go)

</div>

</DocTemplate>
