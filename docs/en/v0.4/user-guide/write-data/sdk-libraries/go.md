# Go

## Insert

To begin with, we have to prepare a `Series`, which delegates one row data. There are three kind fields in `Series` you can use:

| Kind      | Description                                                         |
|-----------|---------------------------------------------------------------------|
| Tag       | index column, helps to retrieve data more efficiently               |
| Field     | value column, helps to analysis, aggregation, calculating, etc,.    |
| Timestamp | timestamp column, each table MUST have exactly one timestamp column |

then, you can add one `Series` into `Metric`, then create an `InsertRequest` and call `client.Insert` to store the data into GreptimeDB.

`Metric` can change the `Timestamp` precision by `metric.SetTimePrecision`. The following is the supported options:

| Precision        | Description |
|------------------|-------------|
| time.Second      |             |
| time.Millisecond | default     |
| time.Microsecond |             |
| time.Nanosecond  |             |

```go
func Insert() {
	series := greptime.Series{}
	series.AddStringTag("host", "localhost")
	series.AddFloatField("cpu", 0.90)
	series.AddIntField("memory", 1024)
	series.SetTimestamp(time.Now())

	metric := greptime.Metric{}
	metric.AddSeries(series)

	insertRequest1 := greptime.InsertRequest{}
	insertRequest1.WithTable("monitor").WithMetric(metric)

	insertRequest2 := greptime.InsertRequest{}
	insertRequest2.WithTable("temperature").WithMetric(metric)

	insertsRequest := greptime.InsertsRequest{}
	insertsRequest.Append(insertRequest1).Append(insertRequest2)

	res, err := client.Insert(context.Background(), insertsRequest)
	if err != nil {
		fmt.Printf("fail to insert, err: %+v\n", err)
		return
	}

	fmt.Printf("AffectedRows: %d\n", res.GetAffectedRows().Value)
}
```
<!-- TODO: DELETE -->
