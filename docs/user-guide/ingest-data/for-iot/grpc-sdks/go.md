import DocTemplate from './template.md' 

# Go

<DocTemplate>

<div id="ingester-lib-introduction">

The Go ingester SDK provided by GreptimeDB is a lightweight,
concurrent-safe library that is easy to use with the metric struct.

</div>


<div id="ingester-lib-installation">

Use the following command to install the GreptimeDB client library for Go:

```shell
go get -u github.com/GreptimeTeam/greptimedb-ingester-go@v0.5.0
```

Import the library in your code:

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
    // change the database name to your database name
    WithDatabase("public").
    // Default port 4001
    // WithPort(4001).
    // Enable secure connection if your server is secured by TLS
    // WithInsecure(false).
    // set authentication information
    WithAuth("username", "password")

cli, _ := greptime.NewClient(cfg)
```
</div>

<div id="low-level-object">

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

```go
resp, err := cli.Write(context.Background(), cpuMetric, memMetric)
if err != nil {
    // Handle error appropriately
}
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```

</div>

<div id="streaming-insert">

```go
err := cli.StreamWrite(context.Background(), cpuMetric, memMetric)
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

```go
resp, err := cli.WriteObject(context.Background(), cpuMetrics)
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```

</div>

<div id="high-level-style-streaming-insert">

```go
err := cli.StreamWriteObject(context.Background(), cpuMetrics)
```

Close the stream writing after all data has been written.
In general, you do not need to close the stream writing when continuously writing data.

```go
affected, err := cli.CloseStream(ctx)
```

</div>

<div id="more-ingestion-examples">

For fully runnable code snippets and explanations for common methods, see the [Examples](https://github.com/GreptimeTeam/greptimedb-ingester-go/tree/main/examples).

</div>

<div id="ingester-lib-reference">

- [API Documentation](https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-ingester-go)

</div>


<div id="recommended-query-library">

We recommend using the [GORM](https://gorm.io/) library, which is popular and developer-friendly.

</div>

<div id="query-library-installation">

Use the following command to install the GORM library:

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

</div>

<div id="query-library-connect">

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
</div>

<div id="query-library-raw-sql">

The following code declares a GORM object model:

```go
type CpuMetric struct {
    Host        string    `gorm:"column:host;primaryKey"`
    Ts          time.Time `gorm:"column:ts;primaryKey"`
    CpuUser     float64   `gorm:"column:cpu_user"`
    CpuSys      float64   `gorm:"column:cpu_sys"`
}
```

If you are using the [ORM API](#orm-api) to insert data, you can declare the model with both GORM and Greptime tags.

```go
type CpuMetric struct {
    Host        string    `gorm:"column:host;primaryKey" greptime:"tag;column:host;type:string"`
    Ts          time.Time `gorm:"column:ts;primaryKey"   greptime:"timestamp;column:ts;type:timestamp;precision:millisecond"`
    CpuUser     float64   `gorm:"column:cpu_user"        greptime:"field;column:cpu_user;type:float64"`
    CpuSys      float64   `gorm:"column:cpu_sys"         greptime:"field;column:cpu_sys;type:float64"`
}
```

Declare the table name as follows:

```go
func (CpuMetric) TableName() string {
	return "cpu_metric"
}
```

Use raw SQL to query data:

```go
var cpuMetric CpuMetric
db.Raw("SELECT * FROM cpu_metric LIMIT 10").Scan(&result)

```

</div>

<div id="query-lib-doc-link">

[GORM](https://gorm.io/docs/index.html)

</div>


</DocTemplate>