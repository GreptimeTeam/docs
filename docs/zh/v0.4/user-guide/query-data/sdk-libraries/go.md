# Go

在进行查询之前，需要先构造 `QueryRequest` 对象，然后通过以下语言查询 GreptimeDB 中的数据：

- SQL
- PromQL (TODO)
- RangePromQL

例如使用 `SQL` 查询：

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

	//Query with metric via Sql, and you can also do it via PromQL
	queryRequest := greptime.QueryRequest{}
	// if you want to specify another database, you can specify it via: `WithDatabase(database)`
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
		monitor.cpu, _ = series.GetFloat("cpu")     // also, you can directly GetFloat
		monitor.memory, _ = series.GetInt("memory") // also, you can directly GetInt
		monitor.ts, _ = series.GetTimestamp("ts")   // GetTimestamp
		monitors = append(monitors, monitor)
	}
	fmt.Println(monitors)
}
```
