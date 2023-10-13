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
	// Create one row of data
	series := greptime.Series{}
	// add index column, for query efficiency
	series.AddStringTag("host", "localhost")
	// add value column
	series.AddFloatField("cpu", 0.90)
	// add value column
	series.AddIntField("memory", 1024)
	// required
	series.SetTimestamp(time.Now())
	// Create a Metric and add the Series
	metric := greptime.Metric{}
	metric.AddSeries(series)
	// metric.SetTimePrecision(time.Second)  // default is Millisecond
	// metric.SetTimestampAlias("timestamp") // default is 'ts'

	// Create an InsertRequest using fluent style
	// the specified table will be created automatically if it's not exist
	insertRequest1 := greptime.InsertRequest{}
	insertRequest1.WithTable("monitor").WithMetric(metric)

	insertRequest2 := greptime.InsertRequest{}
	insertRequest2.WithTable("temperature").WithMetric(metric)

	// You can insert data of different tables into GreptimeDB in one InsertsRequest.
	// This insertsRequest includes two InsertRequest of two different tables
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
