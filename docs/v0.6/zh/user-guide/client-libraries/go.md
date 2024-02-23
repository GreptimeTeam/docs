---
template: template.md
---
# Go

<docs-template>

{template ingester-lib-introduction%

GreptimeDB 提供的 Go Ingest SDK 是一个轻量级、并发安全的库，使用起来非常简单。

%}


{template ingester-lib-installation%

使用下方的命令安装 Go Ingest SDK：

```shell
go get -u github.com/GreptimeTeam/greptimedb-ingester-go
```

引入到代码中：

```go
import (
    "github.com/GreptimeTeam/greptimedb-ingester-go/client"
    "github.com/GreptimeTeam/greptimedb-ingester-go/config"
    "github.com/GreptimeTeam/greptimedb-ingester-go/table"
    "github.com/GreptimeTeam/greptimedb-ingester-go/table/types"
)
```

%}

{template ingester-lib-connect%

```go
cfg := greptime.NewCfg("127.0.0.1").
    // change the database name to your database name
    WithDatabase("public").
    // default port
    WithPort(4001).
    // set authentication information
    WithAuth("username", "password")

client, _ := client.New(cfg)
```
%}

{template low-level-object%

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
if err != nil {
    // Handle error appropriately
}

```

%}

{template create-rows%

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

%}

{template insert-rows%

```go
resp, err := cli.Write(context.Background(), cpuMetric, memMetric)
if err != nil {
    // Handle error appropriately
}
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```

%}

{template streaming-insert%

想要使用流式 API 插入数据，你需要首先创建一个流客户端。

```go
cfg := config.New("<host>").
    WithAuth("<username>", "<password>").
    WithDatabase(database)
streamClient, err := client.NewStreamClient(cfg)
```

然后将数据发送给数据库：

```go
err := streamClient.Send(context.Background(), cpuMetric, memMetric)
if err != nil {
    // Handle error appropriately
}
```

%}

{template update-rows%

```go
ts := time.Now()
_ = cpuMetric.AddRow("127.0.0.1", ts, 0.1, 0.12)
// insert a row data
resp, _ := cli.Write(context.Background(), cpuMetric)

// update the row data
// The same tag `127.0.0.1`
// The same time index `ts`
// The new value: cpu_user = `0.80`, cpu_sys = `0.11`
_ = cpuMetric.AddRow("127.0.0.1", ts, 0.80, 0.11)
// overwrite the existing data
resp, _ = cli.Write(context.Background(), cpuMetric)
```

%}


{template orm-style-object%

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
```
%}

{template orm-style-insert-data%

```go
resp, err := cli.Create(context.Background(), cpuMetrics, memMetrics)
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```

%}

{template orm-style-streaming-insert%

要使用流式 API 插入数据，你需要首先创建一个流客户端。

```go
cfg := config.New("<host>").
    WithAuth("<username>", "<password>").
    WithDatabase(database)
streamClient, err := client.NewStreamClient(cfg)
```

然后发送数据到数据库。

```go
err := streamClient.Create(context.Background(), cpuMetrics, memMetrics)
```

%}

{template orm-style-update-data%

```go
ts = time.Now()
cpuMetrics := []CpuMetric{
    {
        Host:        "127.0.0.1",
        CpuUser:     0.10,
        CpuSys:      0.12,
        Ts:          ts,
    }
}
// insert a row data
resp, err := cli.Create(context.Background(), cpuMetrics)

// update the row data
newCpuMetrics := []CpuMetric{
    {
        Host:        "127.0.0.1",    // The same tag `127.0.0.1`
        CpuUser:     0.80,       // The new value: cpu_user = `0.80`
        CpuSys:      0.11,    // The new value: cpu_sys = `0.11`
        Ts:          ts,     // The same time index `ts`
    }
}
// overwrite the existing data
resp, err := cli.Create(context.Background(), newCpuMetrics)

```

%}

{template more-ingestion-examples%

有关更多可运行的代码片段和常用方法的解释，请参阅[示例](https://github.com/GreptimeTeam/greptimedb-ingester-go/tree/main/examples)。

%}

{template ingester-lib-reference%

- [API 文档](https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-ingester-go)

%}


{template recommended-query-library%

我们推荐使用 [GORM](https://gorm.io/) 库来查询数据。

%}

{template query-library-installation%

使用下方的命令安装 GORM：

```shell
go get -u gorm.io/gorm
```

以 MySQL 为例安装 driver：

```shell
go get -u gorm.io/driver/mysql
```

引入到代码中：

```go
import (
    "gorm.io/gorm"
    "gorm.io/driver/mysql"
)
```

%}


{template query-library-connect%

```go
type Mysql struct {
	Host     string
	Port     string
	User     string
	Password string
	Database string

	DB *gorm.DB
}

m := &Mysql{
    Host:     "127.0.0.1",
    Port:     "4002", // default port for MySQL
    User:     "username",
    Password: "password",
    Database: "public",
}

dsn := fmt.Sprintf("tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
    m.Host, m.Port, m.Database)
dsn = fmt.Sprintf("%s:%s@%s", m.User, m.Password, dsn)
db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
if err != nil {
    //error handling 
}
m.DB = db
```
%}

{template query-library-raw-sql%

下方的代码声明了一个 GORM 对象模型：

```go
type CpuMetric struct {
    Host        string    `gorm:"column:host;primaryKey"`
    Ts          time.Time `gorm:"column:ts;primaryKey"`
    CpuUser     float64   `gorm:"column:cpu_user"`
    CpuSys      float64   `gorm:"column:cpu_sys"`
}
```

如果你正在使用 [ORM API](#orm-api) 来插入数据，你可以在模型中同时声明 GORM 和 Greptime 标签。

```go
type CpuMetric struct {
    Host        string    `gorm:"column:host;primaryKey" greptime:"tag;column:host;type:string"`
    Ts          time.Time `gorm:"column:ts;primaryKey"   greptime:"timestamp;column:ts;type:timestamp;precision:millisecond"`
    CpuUser     float64   `gorm:"column:cpu_user"        greptime:"field;column:cpu_user;type:float64"`
    CpuSys      float64   `gorm:"column:cpu_sys"         greptime:"field;column:cpu_sys;type:float64"`
}
```

声明表名：

```go
func (CpuMetric) TableName() string {
	return "cpu_metric"
}
```

使用原始 SQL 查询数据：

```go
var cpuMetric CpuMetric
db.Raw("SELECT * FROM cpu_metric WHERE ts > ?", 1701360000000).Scan(&result)

```

%}

{template query-lib-doc-link%

[GORM](https://gorm.io/docs/index.html)

%}


</docs-template>