# Go

To begin with, you have to prepare a `QueryRequest`, and you can retrieve data from GreptimeDB via:

- SQL
- PromQL (TODO)
- RangePromQL

```go
func Query() {
	// Monitor is the metrics used in this Example
	type Monitor struct {
		region string
		host   string
		cpu    float64
		memory int64
		ts     time.Time
	}

	queryRequest := greptime.QueryRequest{}
	queryRequest.WithSql("SELECT * FROM monitor") // .WithDatabase(database)

	resMetric, err := client.Query(context.Background(), queryRequest)
	if err != nil {
		fmt.Printf("fail to query, err: %+v\n", err)
		return
	}

	monitors := make([]Monitor, 0, len(resMetric.GetSeries()))
	for _, series := range resMetric.GetSeries() {
		monitor := Monitor{}
		host, exist := series.Get("host") // you can directly call Get and do the type assertion
		if exist {
			monitor.host = host.(string)
		}
		monitor.cpu, _ = series.GetFloat("cpu")
		monitor.memory, _ = series.GetInt("memory")
		monitor.ts, _ = series.GetTimestamp("ts")
		monitors = append(monitors, monitor)
	}
	fmt.Println(monitors)
}
```
