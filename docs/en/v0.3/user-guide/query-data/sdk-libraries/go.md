# Go

To begin with, you have to prepare a `QueryRequest`, and you can retrieve data from GreptimeDB via:

- SQL
- PromQL (TODO)
- RangePromQL

```go
func Query() {
    // Query with metric via Sql, you can do it via PromQL
    queryRequest := greptime.QueryRequest{}
    // if you want to specify another database, you can specify it via: `WithDatabase(database)`
    queryRequest.WithSql("SELECT * FROM monitor") // .WithDatabase(database)

    resMetric, err := client.Query(context.Background(), queryRequest)
    if err != nil {
        fmt.Printf("fail to query, err: %+v\n", err)
        return
    }

    type Monitor struct {
        host   string
        cpu    float64
        memory int64
        ts     time.Time
    }

    monitors := []Monitor{}
    for _, series := range resMetric.GetSeries() {
        monitor := Monitor{}
        host, exist := series.Get("host") // you can directly call Get and do the type assertion
        if exist {
            monitor.host = host.(string)
        }
        monitor.cpu, _ = series.GetFloat("cpu")     // also, you can directly GetFloat
        monitor.memory, _ = series.GetInt("memory") // also, you can directly GetInt
        monitor.ts = series.GetTimestamp()          // GetTimestamp
        monitors = append(monitors, monitor)
    }
    fmt.Println(monitors)
}
```
