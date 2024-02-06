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

Use the following command to install the GreptimeDB ingester library for Go:

```shell
go get -u github.com/GreptimeTeam/greptimedb-ingester-go
```

Import the library in your code:

```go
import (
    "github.com/GreptimeTeam/greptimedb-ingester-go/client"
    "github.com/GreptimeTeam/greptimedb-ingester-go/config"
)
```

%}

{template ingester-lib-connect%

```go
// To connect a database that needs authentication, for example, those on Greptime Cloud,
// `Username` and `Password` are needed when connecting to a database that requires authentication.
// Leave the two fields empty if connecting a local database.
cfg := config.New("127.0.0.1").WithDatabase("public").WithAuth("<username>", "<password>")

client, _ := client.New(cfg)
```

%}


{template row-object%

The Go ingester SDK uses `Table` to denote multiple rows in a table. We can add row data items into the `Table` object, which are then written into GreptimeDB.

On the other hand, there is an alternative approach that allows us to write struct directly into GreptimeDB. This approach requires the use of Greptime's own field tags, but they are easy to use.

%}


{template create-rows%

We can build data with `Table` struct, call `AddTagColumn`, `AddFieldColumn`, `AddTimestampColumn` at first to define the schema, then call `AddRow` to append data.


```go
tbl, err := table.New("<table_name>")

tbl.AddTagColumn("id", types.INT64)
tbl.AddFieldColumn("host", types.STRING)
tbl.AddTimestampColumn("ts", types.TIMESTAMP_MILLISECOND)

tbl.AddRow(1, "127.0.0.1", time.Now())
tbl.AddRow(2, "127.0.0.2", time.Now())

resp, err := cli.Write(context.Background(), tbl)
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```

%}


{template create-rows%

Or we can directly define data struct with `greptime` tag, and `Create` the struct(s) into GreptimeDB.

```go
type Monitor struct {
	ID          int64     `greptime:"tag;column:id;type:int64"`
	Host        string    `greptime:"field;column:host;type:string"`
	Ts          time.Time `greptime:"timestamp;column:ts;type:timestamp;precision:millisecond"`
}

func (Monitor) TableName() string {
	return "monitors"
}

monitors := []Monitor{
    {
        ID:          1,
        Host:        "127.0.0.1",
        Ts:          time.Now(),
    },
    {
        ID:          2,
        Host:        "127.0.0.2",
        Ts:          time.Now(),
    },
}

resp, err := cli.Create(context.Background(), monitors)
log.Printf("affected rows: %d\n", resp.GetAffectedRows().GetValue())
```

%}


{template more-ingestion-examples%

For fully runnable code snippets and explanations for common methods, see the [Examples](https://github.com/GreptimeTeam/greptimedb-ingester-go/tree/main/examples).

%}

{template ingester-lib-reference%

- [API Documentation](https://pkg.go.dev/github.com/GreptimeTeam/greptimedb-ingester-go)
- [Ingester Readme](https://github.com/GreptimeTeam/greptimedb-ingester-go)

%}


{template recommended-query-library%

We recommend using the [Gorm](https://gorm.io/) library, which is popular and developer-friendly.

%}

{template query-library-installation%

Use the following command to install the Gorm library and MySQL driver:

```shell
go get -u gorm.io/gorm gorm.io/driver/mysql
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
	ID        int64     `gorm:"column:host;primaryKey"`
	Ts        time.Time `gorm:"column:ts;primaryKey"`
	Host      string    `gorm:"column:host"`
}

func (Monitor) TableName() string {
	return "monitors"
}

var monitors []Monitor
result := db.Find(&monitors)
```

%}

{template query-lib-link%

[GORM](https://gorm.io/docs/index.html)

%}


</docs-template>