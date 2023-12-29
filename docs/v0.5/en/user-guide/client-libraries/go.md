---
template: template.md
---
# Go

<docs-template>
{template ingester-lib-installation%

Use the following command to install the GreptimeDB client library for Go:

```shell
go get github.com/GreptimeTeam/greptimedb-client-go@v0.1.2 google.golang.org/grpc google.golang.org/grpc/credentials/insecure
```

Import the library in your code:

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

The Go ingester SDK uses `Series` to represent a row data item. Multiple `Series` can be added to a `Metric` object and then written to GreptimeDB.

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


{template recommended-query-library%

We recommend using the [Gorm](https://gorm.io/) library, which is popular and developer-friendly.

%}

{template query-library-installation%

Use the following command to install the Gorm library:

```shell
go get -u gorm.io/gorm
```

and install the driver you want to use:

```shell
# MySQL
go get -u gorm.io/driver/mysql
# PostgreSQL
go get -u gorm.io/driver/postgres
```

Then import the libraries in your code, for example, use MySQL:

```go
import (
    "gorm.io/gorm"
    "gorm.io/driver/mysql"
)
```

use PostgreSQL:

```go
import (
    "gorm.io/gorm"
    "gorm.io/driver/postgres"
)
```

%}

{template query-library-connect%

#### MySQL

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

#### PostgreSQL

```go
type Postgres struct {
	Host     string
	Port     string
	User     string
	Password string
	Database string

	DB *gorm.DB
}

pg := &Postgres{
    Host:     "127.0.0.1",
    Port:     "4003", // default port for PostgreSQL
    User:     "username",
    Password: "password",
    Database: "public",
}

dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=<your-local-time-zone>",
    p.Host, p.User, p.Password, p.Database, p.Port)
db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
if err != nil {
    //error handling 
}

pg.DB = db

```

%}

{template query-library-raw-sql%

```go
type Monitor struct {
	ID          int64     `gorm:"primaryKey"`
	Host        string    `gorm:"column:host"`
	Cpu         float64   `gorm:"column:cpu"`
	Ts          time.Time `gorm:"column:ts"`
}

func (Monitor) TableName() string {
	return "monitor"
}

var monitor Monitor
db.Raw("SELECT host, cpu, ts FROM users WHERE ts > ?", 1701360000000).Scan(&result)

```

%}

{template query-lib-link%

[GORM](https://gorm.io/docs/index.html)

%}


</docs-template>