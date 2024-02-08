---
template: template.md
---
# Go

<docs-template>

{template ingester-lib-introduction%

The Go ingester SDK provided by GreptimeDB is a lightweight,
concurrent-safe library that is easy to use with the metric struct.

%}


{template ingester-lib-installation%

Use the following command to install the GreptimeDB client library for Go:

```shell
go get github.com/GreptimeTeam/greptimedb-client-go@v0.1.2 google.golang.org/grpc google.golang.org/grpc/credentials/insecure
```

Import the library in your code:

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

{template greptimedb-style-object%

When using `table` object to add rows, the arguments of `AddRow` method must be in the same order as the columns in the table.

```go
cpuTable, err := table.New("cpu_metric")
cpuTable.AddTagColumn("host", types.STRING)
cpuTable.AddFieldColumn("cpu", types.FLOAT)
cpuTable.AddTimestampColumn("ts", types.TIMESTAMP_MILLISECOND)

// the same order as the columns in the table: host, memory, ts
cpuTable.AddRow("127.0.0.1", "0.1", time.Now())

```

%}

{template create-rows%

```go
cpuTable, err := table.New("cpu_metric")
cpuTable.AddTagColumn("host", types.STRING)
cpuTable.AddFieldColumn("cpu", types.FLOAT)
cpuTable.AddTimestampColumn("ts", types.TIMESTAMP_MILLISECOND)

// the same order as the columns in the table: host, memory, ts
cpuTable.AddRow("127.0.0.1", "0.1", time.Now())

memTable, err := table.New("mem_metric")
memTable.AddTagColumn("host", types.STRING)
memTable.AddFieldColumn("memory", types.FLOAT)
memTable.AddTimestampColumn("ts", types.TIMESTAMP_MILLISECOND)
// the same order as the columns in the table: host, memory, ts
memTable.AddRow("127.0.0.1", "112", time.Now())
```

%}

{template insert-rows%

```go

resp, err := cli.Write(context.Background(), cpuTable, memTable)
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())

```

%}

{template streaming-insert%

<!-- TODO -->

%}

{template update-rows%
<!-- TODO -->
%}

{template orm-style-object%
```go
type CpuMetric struct {
    Host        string    `greptime:"tag;column:host;type:string"`
	Cpu         float64   `greptime:"field;column:cpu;type:float64"`
	Ts          time.Time `greptime:"timestamp;column:ts;type:timestamp;precision:millisecond"`
}

func (CpuMetric) TableName() string {
	return "cpu_metrics"
}

cpuMetrics := []CpuMetric{
    {
        Host:        "127.0.0.1",
        CPU:         0.1,
        Ts:          time.Now(),
    }
}


type MemMetric struct {
    Host        string    `greptime:"tag;column:host;type:string"`
	Memory      float64   `greptime:"field;column:memory;type:float64"`
	Ts          time.Time `greptime:"timestamp;column:ts;type:timestamp;precision:millisecond"`
}

func (MemoryMetric) TableName() string {
	return "mem_metrics"
}

memMetrics := []MemMetric{
    {
        Host:        "127.0.0.1",
        CPU:         0.1,
        Ts:          time.Now(),
    }
}

resp, err := cli.Create(context.Background(), cpuMetrics, memMetrics)
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```
%}

{template orm-style-insert-data%
<!-- TODO -->
%}

{template orm-style-streaming-insert%
<!-- TODO -->
%}

{template orm-style-update-data%
<!-- TODO -->
%}

{template more-ingestion-examples%

For fully runnable code snippets and explanations for common methods, see the [Examples](https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-client-go#example-package).

%}

{template ingester-lib-reference%

- [API Documentation](https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-client-go)

%}


{template recommended-query-library%

We recommend using the [Gorm](https://gorm.io/) library, which is popular and developer-friendly.

%}

{template query-library-installation%

Use the following command to install the Gorm library:

```shell
go get -u gorm.io/gorm
```

and install the MySQL driver as the example:

```shell
go get -u gorm.io/driver/mysql
```

Then import the libraries in your code:

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

[GORM](https://gorm.io/docs/index.html)

%}


</docs-template>