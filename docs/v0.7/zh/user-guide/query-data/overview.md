# 概述

## 查询语言

- [SQL](./sql.md)
- [PromQL](promql.md)

## 客户端库

客户端库提供了一种方便的方式来连接 GreptimeDB 并与数据交互。
它们提供了写入和查询数据的功能，使得将 GreptimeDB 集成到你的应用程序中变得更加容易。
请参考[客户端库](/user-guide/client-libraries/overview.md)文档获取更多信息。

## 时区设置

作为一个时序数据库，GreptimeDB 在大部分查询协议上都支持了指定时区。通过指定时区，我们可以影响数据插入查询时的默认行为。

怎么在 GreptimeDB 中设置时区，设置时区对查询和插入产生哪些行为，请参考 [设置时区](./timezone.md)。
