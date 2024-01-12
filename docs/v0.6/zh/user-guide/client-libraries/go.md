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
go get github.com/GreptimeTeam/greptimedb-client-go@v0.1.2 google.golang.org/grpc google.golang.org/grpc/credentials/insecure
```

引入到代码中：

```go
import (
    greptime "github.com/GreptimeTeam/greptimedb-client-go"
    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials/insecure"
)
```

%}

{template ingester-lib-connect%

```go
options := []grpc.DialOption{
    grpc.WithTransportCredentials(insecure.NewCredentials()),
}
// To connect a database that needs authentication, for example, those on Greptime Cloud,
// `Username` and `Password` are needed when connecting to a database that requires authentication.
// Leave the two fields empty if connecting a database without authentication.
cfg := greptime.NewCfg("127.0.0.1").
    WithDatabase("public").      // change to your real database
    WithPort(4001).              // default port
    WithAuth("username", "password").            // `Username` and `Password`
    WithDialOptions(options...). // specify your gRPC dail options
    WithCallOptions()            // specify your gRPC call options

client, _ := greptime.NewClient(cfg)
```

%}



{template row-object%

Go Ingest SDK 使用 `Series` 来表示一行数据，多个 `Series` 可以添加到 `Metric` 中，然后写入到 GreptimeDB 中。

%}


{template create-a-rows%

```go
seriesHost1 := greptime.Series{}
seriesHost1.AddStringTag("host", "host1")
seriesHost1.AddFloatField("cpu", 0.90)
seriesHost1.SetTimestamp(time.Now())
```

%}

{template create-rows%

```go
seriesHost1 := greptime.Series{}
seriesHost1.AddStringTag("host", "host1")
seriesHost1.AddFloatField("cpu", 0.90)
seriesHost1.SetTimestamp(time.Now())

seriesHost2 := greptime.Series{}
seriesHost2.AddStringTag("host", "host2")
seriesHost2.AddFloatField("cpu", 0.70)
seriesHost2.SetTimestamp(time.Now())

metric := greptime.Metric{}
metric.AddSeries(seriesHost1, seriesHost2)
```

%}


{template save-rows%

```go
seriesHost1 := greptime.Series{}
seriesHost1.AddStringTag("host", "host1")
seriesHost1.AddFloatField("cpu", 0.90)
seriesHost1.SetTimestamp(time.Now())

seriesHost2 := greptime.Series{}
seriesHost2.AddStringTag("host", "host2")
seriesHost2.AddFloatField("cpu", 0.70)
seriesHost2.SetTimestamp(time.Now())

metric := greptime.Metric{}
metric.AddSeries(seriesHost1, seriesHost2)

monitorReq := greptime.InsertRequest{}
monitorReq.WithTable("monitor").WithMetric(metric)

insertsRequest := greptime.InsertsRequest{}
insertsRequest.Append(monitorReq)

res, err := client.Insert(context.Background(), insertsRequest)
if err != nil {
    fmt.Printf("fail to insert, err: %+v\n", err)
    // error handling
    // ...
}
fmt.Printf("AffectedRows: %d\n", res.GetAffectedRows().Value)
```

%}

{template update-rows%
```go
// save a row data
series := greptime.Series{}
series.AddStringTag("host", "host1")
series.AddFloatField("cpu", 0.90)
series.SetTimestamp(1703832681000)
metric := greptime.Metric{}
metric.AddSeries(series)
monitorReq := greptime.InsertRequest{}
monitorReq.WithTable("monitor").WithMetric(metric)
insertsRequest := greptime.InsertsRequest{}
insertsRequest.Append(monitorReq)
res, _ := client.Insert(context.Background(), insertsRequest)

// update the row data
newSeries := greptime.Series{}
// The same tag `host1`
newSeries.AddStringTag("host", "host1")
// The same time index `1703832681000`
newSeries.SetTimestamp(1703832681000)
// The new field value `0.80`
newSeries.AddFloatField("cpu", 0.80)
// overwrite the existing data
metric := greptime.Metric{}
metric.AddSeries(newSeries)
monitorReq := greptime.InsertRequest{}
monitorReq.WithTable("monitor").WithMetric(metric)
insertsRequest := greptime.InsertsRequest{}
insertsRequest.Append(monitorReq)
res, _ := client.Insert(context.Background(), insertsRequest)
```
%}

{template more-ingestion-examples%

有关更多可运行的代码片段和常用方法的解释，请参阅[示例](https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-client-go#example-package)。

%}

{template ingester-lib-reference%

- [API 文档](https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-client-go)

%}


{template recommended-query-library%

我们推荐使用 [Gorm](https://gorm.io/) 库来查询数据。

%}

{template query-library-installation%

使用下方的命令安装 Gorm：

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

```go
type Monitor struct {
	Host        string    `gorm:"column:host;primaryKey"`
	Ts          time.Time `gorm:"column:ts;primaryKey"`
	Cpu         float64   `gorm:"column:cpu"`
}

func (Monitor) TableName() string {
	return "monitor"
}

var monitor Monitor
db.Raw("SELECT host, cpu, ts FROM users WHERE ts > ?", 1701360000000).Scan(&result)

```

%}

{template query-lib-link%

[Gorm](https://gorm.io/docs/index.html)

%}


</docs-template>