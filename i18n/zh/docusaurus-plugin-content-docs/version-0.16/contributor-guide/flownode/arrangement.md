---
keywords: [Arrangement, 状态存储, 键值对]
description: 描述了 Arrangement 在数据流进程中的状态存储功能，包括键值对存储、查询和删除操作的实现。
---

# Arrangement

Arrangement 存储数据流进程中的状态，存储 flow 的更新流（stream）以供进一步查询和更新。

Arrangement 本质上存储的是带有时间戳的键值对。
在内部，Arrangement 接收类似 `((Key Row, Value Row), timestamp, diff)` 的 tuple，并将其存储在内存中。
你可以使用 `get(now: Timestamp, key: Row)` 查询某个时间的键值对。
Arrangement 假定早于某个时间（也称为 Low Watermark）的所有内容都已被写入到 sink 表中，不会为其保留历史记录。

:::tip 注意
Arrangement 允许通过将传入 tuple 的 `diff` 设置为 -1 来删除键。
此外，如果已将行数据添加到 Arrangement 并且使用不同的值插入相同的键，则原始值将被新值覆盖。
:::
