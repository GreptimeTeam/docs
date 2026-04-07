---
keywords: [时间范围, 时间跨度, 时间单位]
description: 了解 GreptimeDB 中时间范围对象的表示方法，包括支持的时间单位和示例。
---

# 时间范围对象

GreptimeDB 使用时间范围对象来表示各种上下文中的时间跨度，
包括 SQL 查询、配置文件和 API 请求。
有关如何使用时间范围对象的信息，
请参阅：
- [ALTER](/reference/sql/alter.md) 语句中的 TTL 选项和 TWCS compaction 策略的时间窗口设置。
- [CREATE](/reference/sql/create.md) 语句中的 TTL 选项。

时间范围对象表示为由连接的时间跨度组成的字符串，
每个时间跨度由一个十进制数字序列和一个单位后缀表示。
这些后缀不区分大小写，并且支持单数和复数形式。例如，`1hour 12min 5s`。

每个时间跨度由一个整数和一个后缀组成。支持的后缀有：

- `nsec`, `ns`: 纳秒
- `usec`, `us`: 微秒
- `msec`, `ms`: 毫秒
- `seconds`, `second`, `sec`, `s`: 秒
- `minutes`, `minute`, `min`, `m`: 分钟
- `hours`, `hour`, `hr`, `h`: 小时
- `days`, `day`, `d`: 天
- `weeks`, `week`, `w`: 周
- `months`, `month`, `M`: 定义为 30.44 天
- `years`, `year`, `y`: 定义为 365.25 天

在十进制整数后附加上述单位之一，表示等值的秒数。
例如：

- `1s`: 等效于 1 秒
- `2m`: 等效于 120 秒
- `1ms`: 等效于 0.001 秒
- `2h`: 等效于 7200 秒

以下写法无效：

- `0xABm`: 不支持十六进制数字
- `1.5h`: 不支持浮点数
- `+Infd`: 不支持 `±Inf` 或 `NaN` 值

以下是一些有效的时间范围示例：

- `1h`: 一小时
- `1h30m`, `1h 30m`: 一小时三十分钟
- `1h30m10s`, `1h 30m 10s`: 一小时三十分钟十秒

