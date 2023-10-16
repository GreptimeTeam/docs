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
	series := greptime.Series{}
	series.AddStringTag("host", "localhost")
	series.AddFloatField("cpu", 0.90)
	series.AddIntField("memory", 1024)
	series.SetTimestamp(time.Now())

	metric := greptime.Metric{}
	metric.AddSeries(series)

	monitorReq := greptime.InsertRequest{}
	monitorReq.WithTable("monitor").WithMetric(metric)

	insertsRequest := greptime.InsertsRequest{}
	insertsRequest.Append(monitorReq)

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
