# 定义时间窗口

时间窗口是持续聚合查询的重要属性。
它定义了数据在流中的聚合方式。
这些窗口是左闭右开的区间。

时间窗口对应于时间范围。
source 表中的数据将根据时间索引列映射到相应的窗口。
时间窗口也是聚合表达式计算的范围，因此每个时间窗口将在结果表中生成一行。

GreptimeDB 提供两种时间窗口类型：`hop` 和 `tumble`，或者换句话说是滑动窗口和固定窗口。
你可以在 `GROUP BY` 子句中使用 `hop()` 函数或 `tumble()` 函数指定时间窗口。
这两个函数仅支持在持续聚合查询的 `GROUP BY` 位置使用。

下图展示了 `hop()` 和 `tumble()` 函数的工作方式：

![Time Window](/time-window.svg)

## Tumble

`tumble()` 定义固定窗口，窗口之间不重叠。

```
tumble(col, interval, start_time)
```

- `col` 指定使用哪一列计算时间窗口。提供的列必须是时间戳类型。
- `interval` 指定窗口的大小。`tumble` 函数将时间列划分为固定大小的窗口，并在每个窗口中聚合数据。
<!-- `start_time` 用于指定第一个窗口的开始时间。 -->
- `start_time` 是一个可选参数，用于指定第一个窗口的开始时间。如果未提供，开始时间将与日历对齐。

## Hop（尚未支持）

`hop` 定义滑动窗口，窗口按固定间隔向前移动。
此功能尚未支持，预计将在不久的将来提供。

<!-- `hop` defines sliding window that moves forward by a fixed interval. It signature is like the following:

```
hop(col, size_interval, hop_interval, <start_time>)
```

Where `col` specifies use which column to compute the time window. The provided column must have a timestamp type.

`size_interval` specifies the size of each window, while `hop_interval` specifies the delta between two windows' start timestamp. You can think the `tumble()` function as a special case of `hop()` function where the `size_interval` and `hop_interval` are the same.

`start_time` is an optional parameter to specify the start time of the first window. If not provided, the start time will be aligned to calender. -->
