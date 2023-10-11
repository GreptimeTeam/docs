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
    series := greptime.Series{}              // Create one row of data
    series.AddStringTag("host", "localhost") // add index column, for query efficiency
    series.AddFloatField("cpu", 0.90)        // add value column
    series.AddIntField("memory", 1024)       // add value column
    series.SetTimestamp(time.Now())          // requird

    metric := greptime.Metric{} // Create a Metric and add the Series
    metric.AddSeries(series)
    // metric.SetTimePrecision(time.Second)  // default is Millisecond
    // metric.SetTimestampAlias("timestamp") // default is 'ts'


    // Create an InsertRequest using fluent style
    // the specified table will be created automatically if it's not exist
    insertRequest := greptime.InsertRequest{}
    // if you want to specify another database, you can specify it via: `WithDatabase(database)`
    insertRequest.WithTable("monitor").WithMetric(metric) // .WithDatabase(database)

    // Fire the real Insert request and Get the affected number of rows
    n, err := client.Insert(context.Background(), insertRequest)
    if err != nil {
        fmt.Printf("fail to insert, err: %+v\n", err)
        return
    }
    fmt.Printf("AffectedRows: %d\n", n)
}
```

<!-- TODO -->
<!-- ## Delete -->
