# Go

## 写入新数据

首先，我们需要准备一个 `Series`，它代表了一行数据。`Series` 中有三种字段类型可供使用：

| Kind      | Description                                                         |
|-----------|---------------------------------------------------------------------|
| Tag       | 索引列，有助于更有效率地检索数据                                         |
| Field     | 值存储列, 用于数据分析、聚合、计算等                                     |
| Timestamp | 时间戳列，每一个时序表都必须有一个时间戳列                                |

然后，您可以将一个 `Series` 添加到 `Metric` 中，然后创建一个 `InsertRequest` 对象并调用 `client.Insert` 将数据存储到 GreptimeDB 中。

`Metric` 可以通过 `metric.SetTimePrecision` 更改 `Timestamp` 精度。以下是支持的选项：

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

<!-- TODO -->
<!-- ## Delete -->
